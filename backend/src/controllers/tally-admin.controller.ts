import { Request, Response } from 'express';
import { query } from '../db/pool.js';
import { DoubleEntryService } from '../services/double-entry.service.js';
import { CompanyTokenService } from '../services/company-token.service.js';

export class TallyAdminController {
  static async getSyncStatus(req: Request, res: Response) {
    try {
      const companyId = req.companyId || 12;

      // Overview counts
      const countsRes = await query(
        `SELECT 
           COUNT(*) FILTER (WHERE sync_status = 'READY') as ready,
           COUNT(*) FILTER (WHERE sync_status = 'SYNCED') as synced,
           COUNT(*) FILTER (WHERE sync_status = 'FAILED_VALIDATION') as quarantined,
           COUNT(*) FILTER (WHERE sync_status = 'PENDING' OR sync_status IS NULL) as pending
         FROM vouchers
         WHERE cmp_id = $1`,
        [companyId]
      );

      // Quarantined vouchers with details
      const quarantinedRes = await query(
        `SELECT id, guid, voucher_number, voucher_date, voucher_type, party_ledger_name,
                amount, sync_error_message, created_at
         FROM vouchers
         WHERE cmp_id = $1 AND sync_status = 'FAILED_VALIDATION'
         ORDER BY id DESC LIMIT 20`,
        [companyId]
      );

      // Recent synced vouchers
      const syncedRes = await query(
        `SELECT id, guid, voucher_number, voucher_date, voucher_type, party_ledger_name,
                amount, created_at
         FROM vouchers
         WHERE cmp_id = $1 AND sync_status = 'SYNCED'
         ORDER BY id DESC LIMIT 10`,
        [companyId]
      );

      return res.status(200).json({
        isValid: true,
        message: 'Tally sync status retrieved',
        errorCode: null,
        data: {
          summary: {
            ready: parseInt(countsRes.rows[0].ready, 10),
            synced: parseInt(countsRes.rows[0].synced, 10),
            quarantined: parseInt(countsRes.rows[0].quarantined, 10),
            pending: parseInt(countsRes.rows[0].pending, 10),
          },
          quarantinedVouchers: quarantinedRes.rows.map(r => ({
            id: r.id,
            guid: r.guid,
            voucherNumber: r.voucher_number,
            voucherDate: r.voucher_date,
            voucherType: r.voucher_type,
            partyName: r.party_ledger_name,
            amount: parseFloat(r.amount),
            errorMessage: r.sync_error_message,
            createdAt: r.created_at,
          })),
          recentSynced: syncedRes.rows.map(r => ({
            id: r.id,
            guid: r.guid,
            voucherNumber: r.voucher_number,
            voucherDate: r.voucher_date,
            voucherType: r.voucher_type,
            partyName: r.party_ledger_name,
            amount: parseFloat(r.amount),
            createdAt: r.created_at,
          })),
        },
      });
    } catch (err: any) {
      console.error('[Tally Sync Status Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  static async syncNow(req: Request, res: Response) {
    try {
      const companyId = req.companyId || 12;

      // Transition any pending vouchers to READY
      const updateRes = await query(
        `UPDATE vouchers
         SET sync_status = 'READY'
         WHERE cmp_id = $1 AND (sync_status IS NULL OR sync_status = 'PENDING')
         RETURNING id`,
        [companyId]
      );

      return res.status(200).json({
        isValid: true,
        message: `Prepared ${updateRes.rows.length} vouchers for immediate Tally pull`,
        errorCode: null,
        data: {
          queuedVoucherCount: updateRes.rows.length,
          syncTimestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[Sync Now Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  static async getMappings(req: Request, res: Response) {
    try {
      const companyId = req.companyId || 12;
      const resMappings = await query(
        `SELECT id, cmp_id, mapping_key, tally_ledger_name, description
         FROM tally_ledger_mappings
         WHERE cmp_id = $1
         ORDER BY id ASC`,
        [companyId]
      );

      return res.status(200).json({
        isValid: true,
        message: 'Ledger mappings retrieved',
        errorCode: null,
        data: {
          mappings: resMappings.rows,
        },
      });
    } catch (err: any) {
      console.error('[Get Mappings Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  static async updateMapping(req: Request, res: Response) {
    try {
      const companyId = req.companyId || 12;
      const { mappingKey, tallyLedgerName, description } = req.body;

      if (!mappingKey || !tallyLedgerName) {
        return res.status(400).json({
          isValid: false,
          message: 'mappingKey and tallyLedgerName are required',
          errorCode: 'INVALID_INPUT',
          data: null,
        });
      }

      const resUpsert = await query(
        `INSERT INTO tally_ledger_mappings (cmp_id, mapping_key, tally_ledger_name, description, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (cmp_id, mapping_key) DO UPDATE
         SET tally_ledger_name = EXCLUDED.tally_ledger_name,
             description = EXCLUDED.description,
             updated_at = CURRENT_TIMESTAMP
         RETURNING id, cmp_id, mapping_key, tally_ledger_name, description`,
        [companyId, mappingKey.trim().toUpperCase(), tallyLedgerName.trim(), description || null]
      );

      return res.status(200).json({
        isValid: true,
        message: 'Mapping updated successfully',
        errorCode: null,
        data: resUpsert.rows[0],
      });
    } catch (err: any) {
      console.error('[Update Mapping Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  static async getToken(req: Request, res: Response) {
    try {
      const companyId = req.companyId || (req.user as any)?.companyId || 12;
      const userId = (req.user as any)?.userId || 0;
      const token = await CompanyTokenService.getActiveToken(Number(companyId), Number(userId));
      return res.status(200).json({
        isValid: true,
        message: 'Active Company API Token retrieved',
        errorCode: null,
        data: token,
      });
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'FETCH_TOKEN_FAILED',
        data: null,
      });
    }
  }

  static async generateToken(req: Request, res: Response) {
    try {
      const companyId = req.companyId || (req.user as any)?.companyId || 12;
      const userId = (req.user as any)?.userId || 0;
      const { name, expiryDays } = req.body || {};
      const token = await CompanyTokenService.generateToken(
        Number(companyId),
        Number(userId),
        name || 'TallyPrime Connector Token',
        Number(expiryDays) || 365
      );
      return res.status(200).json({
        isValid: true,
        message: 'New Company API Token generated successfully',
        errorCode: null,
        data: token,
      });
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'GENERATE_TOKEN_FAILED',
        data: null,
      });
    }
  }

  static async revokeToken(req: Request, res: Response) {
    try {
      const companyId = req.companyId || (req.user as any)?.companyId || 12;
      const { tokenId } = req.body || {};
      const success = await CompanyTokenService.revokeToken(Number(companyId), tokenId ? Number(tokenId) : undefined);
      return res.status(200).json({
        isValid: true,
        message: success ? 'Token successfully revoked' : 'No active token found to revoke',
        errorCode: null,
        data: { revoked: success },
      });
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'REVOKE_TOKEN_FAILED',
        data: null,
      });
    }
  }
}
