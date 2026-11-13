import { Request, Response } from 'express';
import { query } from '../db/pool.js';

export class CustomerController {
  static async getCustomers(req: Request, res: Response) {
    try {
      const companyId = req.companyId || 12;
      const { search, limit = 50, offset = 0 } = req.query;

      let sql = `
        SELECT ledid as id, led_name as name, guid,
               COALESCE(led_closing_balance, 0.00) as balance,
               COALESCE(led_mobile, led_phone, '') as phone,
               COALESCE(led_email, '') as email,
               COALESCE(led_address_1, '') as address,
               COALESCE(vat_tin_number, '') as trn
        FROM ledgers
        WHERE cmpid = $1 AND (led_parent ILIKE '%Debtor%' OR led_primary_group ILIKE '%Debtor%')
      `;
      const params: any[] = [companyId];

      if (search && typeof search === 'string' && search.trim().length > 0) {
        params.push(`%${search.trim()}%`);
        sql += ` AND (led_name ILIKE $${params.length} OR led_mobile ILIKE $${params.length} OR vat_tin_number ILIKE $${params.length})`;
      }

      sql += ` ORDER BY led_name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

      const countRes = await query(
        `SELECT COUNT(*) as total FROM ledgers WHERE cmpid = $1 AND (led_parent ILIKE '%Debtor%' OR led_primary_group ILIKE '%Debtor%')`,
        [companyId]
      );

      const rowsRes = await query(sql, params);

      return res.status(200).json({
        isValid: true,
        message: 'Customers retrieved',
        errorCode: null,
        data: {
          total: parseInt(countRes.rows[0].total, 10),
          customers: rowsRes.rows.map(r => ({
            id: r.id,
            name: r.name,
            guid: r.guid,
            balance: parseFloat(r.balance),
            phone: r.phone,
            email: r.email,
            address: r.address,
            trn: r.trn,
            creditLimit: 10000.00, // standard default
            creditDays: 30,
            latitude: 25.2048, // Dubai default for geo check-in
            longitude: 55.2708,
          })),
        },
      });
    } catch (err: any) {
      console.error('[Get Customers Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  static async getCustomerStatement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.companyId || 12;

      // Customer info
      const custRes = await query(
        `SELECT ledid as id, led_name as name, COALESCE(led_closing_balance, 0.00) as balance
         FROM ledgers
         WHERE ledid = $1 AND cmpid = $2`,
        [id, companyId]
      );

      if (custRes.rows.length === 0) {
        return res.status(404).json({
          isValid: false,
          message: 'Customer not found',
          errorCode: 'NOT_FOUND',
          data: null,
        });
      }

      const customer = custRes.rows[0];

      // Recent vouchers for this customer
      const vRes = await query(
        `SELECT id, voucher_number, voucher_date, voucher_type, amount, payment_mode, sync_status
         FROM vouchers
         WHERE cmp_id = $1 AND party_ledger_name = $2
         ORDER BY voucher_date DESC, id DESC
         LIMIT 30`,
        [companyId, customer.name]
      );

      return res.status(200).json({
        isValid: true,
        message: 'Statement retrieved',
        errorCode: null,
        data: {
          customer: {
            id: customer.id,
            name: customer.name,
            balance: parseFloat(customer.balance),
          },
          transactions: vRes.rows.map(v => ({
            id: v.id,
            voucherNumber: v.voucher_number,
            voucherDate: v.voucher_date,
            voucherType: v.voucher_type,
            amount: parseFloat(v.amount),
            paymentMode: v.payment_mode,
            syncStatus: v.sync_status,
          })),
        },
      });
    } catch (err: any) {
      console.error('[Customer Statement Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  static async createCustomer(req: Request, res: Response) {
    try {
      const companyId = req.companyId || 12;
      const {
        name,
        storeName,
        phone,
        mobile,
        address,
        state,
        country,
        trn,
      } = req.body;

      const custName = (name || storeName || '').trim();
      if (!custName) {
        return res.status(400).json({ isValid: false, message: 'Customer name is required', data: null });
      }

      const custPhone = phone || mobile || '';
      const custAddress = address || '';
      const custState = state || 'Karnataka';
      const custCountry = country || 'India';
      const custTrn = trn || '';

      const grpRes = await query(
        `SELECT grpid FROM public.groups WHERE cmpid = $1 AND (grp_name ILIKE '%Debtor%' OR grp_name ILIKE '%Customer%') LIMIT 1`,
        [companyId]
      );
      const grpId = grpRes.rows.length > 0 ? grpRes.rows[0].grpid : null;

      const maxMasterRes = await query(
        `SELECT COALESCE(MAX(masterid), 600) + 1 as next_id FROM public.ledgers WHERE cmpid = $1`,
        [companyId]
      );
      const nextMasterId = parseInt(maxMasterRes.rows[0].next_id, 10);
      const guid = `LED-CMP${companyId}-${nextMasterId}`;

      const insRes = await query(
        `INSERT INTO public.ledgers (
           userid, cmpid, masterid, guid, grpid, led_name, led_parent, led_primary_group,
           led_opening_balance, led_closing_balance, led_billwise_on, is_active, is_deleted,
           led_mobile, led_email, led_address_1, led_state, led_country, vat_tin_number, sync_status, created_at, updated_at
         )
         VALUES (
           $1, $2, $3, $4, $5, $6, 'Sundry Debtors', 'Current Assets',
           0.00, 0.00, true, true, false,
           $7, '', $8, $9, $10, $11, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
         )
         ON CONFLICT (cmpid, led_name) DO UPDATE
         SET led_mobile = EXCLUDED.led_mobile,
             led_address_1 = EXCLUDED.led_address_1,
             vat_tin_number = EXCLUDED.vat_tin_number,
             updated_at = CURRENT_TIMESTAMP
         RETURNING ledid, led_name`,
        [req.user?.userId || 5, companyId, nextMasterId, guid, grpId, custName, custPhone, custAddress, custState, custCountry, custTrn]
      );

      return res.status(201).json({
        isValid: true,
        message: 'Customer created successfully',
        data: {
          id: insRes.rows[0].ledid,
          name: insRes.rows[0].led_name,
        },
      });
    } catch (err: any) {
      console.error('[Create Customer Error]', err);
      return res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }
}
