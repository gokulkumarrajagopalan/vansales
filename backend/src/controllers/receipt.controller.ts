import { Request, Response } from 'express';
import { pool, query } from '../db/pool.js';
import { DoubleEntryService, LedgerEntryItem } from '../services/double-entry.service.js';
import { amountToWords } from '../utils/numberToWords.js';

export class ReceiptController {
  static async createReceipt(req: Request, res: Response) {
    const client = await pool.connect();
    try {
      const user = req.user!;
      const companyId = req.companyId || 12;
      const {
        customerName,
        amount,
        paymentMode = 'CASH',
        chequeNo,
        chequeDate,
        bankName,
        narration,
        voucherNumber,
        date,
        receiptDate,
        referenceNumber,
        source = 'VAN',
      } = req.body;

      const numAmount = parseFloat(amount);
      if (!customerName || isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          isValid: false,
          message: 'Valid customer name and receipt amount (> 0) are required',
          errorCode: 'INVALID_INPUT',
          data: null,
        });
      }

      const rawDateInput = typeof (receiptDate || date) === 'string' ? String(receiptDate || date).slice(0, 10) : '';
      const voucherDateStr = /^\d{4}-\d{2}-\d{2}$/.test(rawDateInput)
        ? rawDateInput
        : new Date().toISOString().slice(0, 10);
      const normalizedSource = String(source || 'VAN').toUpperCase();
      const normalizedPayMode = String(paymentMode || 'CASH').toUpperCase();

      // Idempotency check if voucherNumber supplied
      if (voucherNumber && typeof voucherNumber === 'string' && voucherNumber.trim()) {
        const dupRes = await client.query(
          `SELECT id, guid, voucher_number, TO_CHAR(voucher_date, 'YYYY-MM-DD') as voucher_date,
                  party_ledger_name, amount, payment_mode, narration, sync_status
           FROM vouchers
           WHERE cmp_id = $1 AND voucher_number = $2 AND voucher_type IN ('Receipt', 'RECEIPT')
           ORDER BY id DESC LIMIT 1`,
          [companyId, voucherNumber.trim()]
        );
        if (dupRes.rows.length > 0) {
          const ex = dupRes.rows[0];
          return res.status(200).json({
            isValid: true,
            message: 'Payment receipt already synced',
            errorCode: null,
            data: {
              id: ex.id,
              guid: ex.guid,
              receiptNumber: ex.voucher_number,
              receiptDate: ex.voucher_date,
              customerName: ex.party_ledger_name,
              amount: parseFloat(ex.amount) || 0,
              paymentMode: ex.payment_mode,
              narration: ex.narration,
              syncStatus: ex.sync_status,
              alreadySynced: true,
            },
          });
        }
      }

      // Find active shift
      const shiftRes = await client.query(
        `SELECT id FROM van_shift WHERE salesman_user_id = $1 AND ended_at IS NULL ORDER BY id DESC LIMIT 1`,
        [user.userId]
      );
      const shiftId = shiftRes.rows.length > 0 ? shiftRes.rows[0].id : null;

      // Fetch ledger mappings
      const ledgerMappings = await DoubleEntryService.getLedgerMappings(companyId);
      const debitLedger =
        normalizedPayMode === 'CASH'
          ? ledgerMappings.CASH || 'Cash'
          : ledgerMappings.CARD || 'Bank Accounts';

      // Generate receipt number or use supplied
      const dateStr = voucherDateStr.replace(/-/g, '');
      let rctNum = typeof voucherNumber === 'string' && voucherNumber.trim() ? voucherNumber.trim() : '';
      if (!rctNum) {
        const countRes = await client.query(
          `SELECT COUNT(*) as cnt FROM vouchers WHERE cmp_id = $1 AND voucher_type IN ('Receipt', 'RECEIPT')`,
          [companyId]
        );
        rctNum = `RCT-${dateStr}-${String(parseInt(countRes.rows[0].cnt, 10) + 1).padStart(4, '0')}`;
      }

      // Begin atomic transaction
      await client.query('BEGIN');

      const tempGuid = `TEMP-RCT-${Date.now()}`;
      const note =
        narration ||
        (chequeNo
          ? `Cheque #${chequeNo} (${bankName || 'Bank'})`
          : `Cash collection by ${user.fullName || user.username}`);

      const vRes = await client.query(
        `INSERT INTO vouchers (
           cmp_id, user_id, voucher_date, voucher_type, voucher_number,
           party_ledger_name, party_name, reference, narration, amount, payment_mode,
           guid, sync_status, source, created_by_user_id, shift_id, created_at
         )
         VALUES (
           $1, $2, $3::date, 'Receipt', $4,
           $5, $6, $7, $8, $9, $10,
           $11, 'READY', $12, $13, $14, CURRENT_TIMESTAMP
         )
         RETURNING id`,
        [
          companyId,
          user.userId,
          voucherDateStr,
          rctNum,
          customerName,
          customerName,
          referenceNumber || chequeNo || null,
          note,
          numAmount,
          normalizedPayMode,
          tempGuid,
          normalizedSource,
          user.userId,
          shiftId,
        ]
      );

      const voucherId = vRes.rows[0].id;
      const permanentGuid = DoubleEntryService.generateVoucherGuid('VB-RCT', companyId, shiftId || 1, voucherId);

      await client.query(`UPDATE vouchers SET guid = $1 WHERE id = $2`, [permanentGuid, voucherId]);

      // Double-Entry Ledger Entries
      // Debit Cash/Bank, Credit Customer
      const ledgerEntries: LedgerEntryItem[] = [
        {
          ledgerName: debitLedger,
          entryType: 'DEBIT',
          amount: numAmount,
          isParty: false,
        },
        {
          ledgerName: customerName,
          entryType: 'CREDIT',
          amount: numAmount,
          isParty: true,
        },
      ];

      let entryIdx = 0;
      for (const entry of ledgerEntries) {
        await client.query(
          `INSERT INTO voucher_ledger_entries (
             voucher_id, cmp_id, ledger_name, dr_cr, amount, is_party_ledger,
             voucher_guid, voucher_number, voucher_type, voucher_date, entry_index, created_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Receipt', $9::date, $10, CURRENT_TIMESTAMP)`,
          [
            voucherId,
            companyId,
            entry.ledgerName,
            entry.entryType === 'DEBIT' ? 'DR' : 'CR',
            entry.amount,
            entry.isParty,
            permanentGuid,
            rctNum,
            voucherDateStr,
            entryIdx++,
          ]
        );
      }

      await client.query('COMMIT');

      const inWords = amountToWords(numAmount, normalizedSource === 'WEB_APP' ? 'INR' : 'AED');

      return res.status(201).json({
        isValid: true,
        message: 'Payment receipt created successfully',
        errorCode: null,
        data: {
          id: voucherId,
          guid: permanentGuid,
          receiptNumber: rctNum,
          receiptDate: voucherDateStr,
          customerName,
          amount: numAmount,
          amountInWords: inWords,
          paymentMode: normalizedPayMode,
          source: normalizedSource,
          narration: note,
          syncStatus: 'READY',
        },
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('[Create Receipt Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    } finally {
      client.release();
    }
  }

  static async getReceipts(req: Request, res: Response) {
    try {
      const companyId = req.companyId || 12;
      const { limit = 100, offset = 0, shiftId, includeTally = 'false', source } = req.query;

      let sql = `
        SELECT v.id, v.guid, v.voucher_number, TO_CHAR(v.voucher_date, 'YYYY-MM-DD') as voucher_date,
               v.party_ledger_name, v.reference, v.amount, v.payment_mode, v.narration,
               COALESCE(v.source, 'VAN') as source, v.sync_status, v.created_at,
               COALESCE(v.created_by_user_id, v.user_id) as creator_id,
               u.username as creator_username, u.full_name as creator_name, u.van_godown_name as creator_godown
        FROM vouchers v
        LEFT JOIN users u ON u.userid = COALESCE(v.created_by_user_id, v.user_id)
        WHERE v.cmp_id = $1 AND v.voucher_type IN ('Receipt', 'RECEIPT')
      `;
      const params: any[] = [companyId];

      if (includeTally !== 'true') {
        if (source && typeof source === 'string' && source.trim()) {
          params.push(source.trim().toUpperCase());
          sql += ` AND UPPER(COALESCE(v.source, 'VAN')) = $${params.length}`;
        } else {
          sql += ` AND UPPER(COALESCE(v.source, 'VAN')) IN ('VAN', 'WEB_APP', 'MOBILE')`;
        }
      }

      if (shiftId) {
        params.push(parseInt(shiftId as string, 10));
        sql += ` AND v.shift_id = $${params.length}`;
      }

      // Role-based van isolation: van salesmen only see receipts they collected
      const role = (req.user?.role || '').toUpperCase();
      const isVanRestricted = ['VAN_REP', 'VAN_SALES', 'SALESMAN_POS'].includes(role);
      if (req.user && isVanRestricted) {
        params.push(req.user.userId);
        sql += ` AND (v.user_id = $${params.length} OR v.created_by_user_id = $${params.length})`;
      }

      sql += ` ORDER BY v.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

      const rRes = await query(sql, params);
      const voucherIds = rRes.rows.map(r => r.id);
      const journalsByVoucher: Record<string, any[]> = {};

      if (voucherIds.length > 0) {
        const ledRes = await query(
          `SELECT voucher_id, ledger_name, dr_cr, amount, is_party_ledger
           FROM voucher_ledger_entries
           WHERE voucher_id = ANY($1::bigint[])
           ORDER BY voucher_id, entry_index ASC, id ASC`,
          [voucherIds]
        );
        for (const row of ledRes.rows) {
          const vid = String(row.voucher_id);
          if (!journalsByVoucher[vid]) journalsByVoucher[vid] = [];
          const amt = parseFloat(row.amount) || 0;
          const isDr = String(row.dr_cr || '').toUpperCase() === 'DR';
          journalsByVoucher[vid].push({
            ledgerName: row.ledger_name,
            debit: isDr ? amt : 0,
            credit: isDr ? 0 : amt,
            isParty: Boolean(row.is_party_ledger),
          });
        }
      }

      return res.status(200).json({
        isValid: true,
        message: 'Receipts retrieved',
        errorCode: null,
        data: {
          receipts: rRes.rows.map(r => ({
            id: r.id,
            guid: r.guid,
            receiptNumber: r.voucher_number,
            date: r.voucher_date,
            customerName: r.party_ledger_name,
            referenceNumber: r.reference || undefined,
            amount: parseFloat(r.amount) || 0,
            paymentMode: r.payment_mode,
            source: r.source,
            narration: r.narration || '',
            syncStatus: r.sync_status,
            createdByUserId: r.creator_id ? Number(r.creator_id) : null,
            createdByUsername: r.creator_username || null,
            createdByName: r.creator_name || null,
            godownName: r.creator_godown || null,
            journalEntries: journalsByVoucher[String(r.id)] || [],
            createdAt: r.created_at,
          })),
        },
      });
    } catch (err: any) {
      console.error('[Get Receipts Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }
}
