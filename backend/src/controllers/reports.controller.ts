import { Request, Response } from 'express';
import { query } from '../db/pool.js';

export class ReportsController {
  static async getDashboardMetrics(req: Request, res: Response) {
    try {
      const companyId = req.companyId || 12;
      const role = (req.user?.role || '').toUpperCase();
      const isVanRestricted = ['VAN_REP', 'VAN_SALES', 'SALESMAN_POS'].includes(role);
      const userFilterSql = isVanRestricted && req.user ? ' AND (user_id = $2 OR created_by_user_id = $2)' : '';
      const baseParams = isVanRestricted && req.user ? [companyId, req.user.userId] : [companyId];

      // Today sales and invoices (Van & Web transactions)
      const salesRes = await query(
        `SELECT 
           COUNT(*) as invoice_count,
           COALESCE(SUM(amount), 0) as total_sales,
           COALESCE(SUM(CASE WHEN payment_mode = 'CASH' THEN amount ELSE 0 END), 0) as cash_sales,
           COALESCE(SUM(CASE WHEN payment_mode = 'CREDIT' THEN amount ELSE 0 END), 0) as credit_sales
         FROM vouchers
         WHERE cmp_id = $1 AND voucher_type IN ('Sales', 'SALES')
           AND COALESCE(source, 'VAN') IN ('VAN', 'WEB_APP', 'MOBILE')
           AND voucher_date = CURRENT_DATE${userFilterSql}`,
        baseParams
      );

      // Today receipts
      const rctRes = await query(
        `SELECT 
           COUNT(*) as receipt_count,
           COALESCE(SUM(amount), 0) as total_receipts,
           COALESCE(SUM(CASE WHEN payment_mode = 'CASH' THEN amount ELSE 0 END), 0) as cash_receipts
         FROM vouchers
         WHERE cmp_id = $1 AND voucher_type IN ('Receipt', 'RECEIPT')
           AND COALESCE(source, 'VAN') IN ('VAN', 'WEB_APP', 'MOBILE')
           AND voucher_date = CURRENT_DATE${userFilterSql}`,
        baseParams
      );

      // Pending Tally Sync
      const syncRes = await query(
        `SELECT 
           COUNT(*) FILTER (WHERE sync_status = 'READY') as ready_count,
           COUNT(*) FILTER (WHERE sync_status = 'SYNCED') as synced_count,
           COUNT(*) FILTER (WHERE sync_status = 'FAILED_VALIDATION') as quarantined_count
         FROM vouchers
         WHERE cmp_id = $1`,
        [companyId]
      );

      // Active shifts / vans
      const activeVansRes = await query(
        `SELECT COUNT(*) as active_vans FROM van_shift WHERE cmp_id = $1 AND ended_at IS NULL`,
        [companyId]
      );

      return res.status(200).json({
        isValid: true,
        message: 'Dashboard metrics retrieved',
        errorCode: null,
        data: {
          todaySales: parseFloat(salesRes.rows[0].total_sales),
          todayCashSales: parseFloat(salesRes.rows[0].cash_sales),
          todayCreditSales: parseFloat(salesRes.rows[0].credit_sales),
          invoiceCount: parseInt(salesRes.rows[0].invoice_count, 10),
          todayReceipts: parseFloat(rctRes.rows[0].total_receipts),
          todayCashReceipts: parseFloat(rctRes.rows[0].cash_receipts),
          receiptCount: parseInt(rctRes.rows[0].receipt_count, 10),
          pendingTallySync: parseInt(syncRes.rows[0].ready_count, 10),
          syncedTallyCount: parseInt(syncRes.rows[0].synced_count, 10),
          quarantinedCount: parseInt(syncRes.rows[0].quarantined_count, 10),
          activeVans: parseInt(activeVansRes.rows[0].active_vans, 10),
        },
      });
    } catch (err: any) {
      console.error('[Dashboard Metrics Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  static async getDaybook(req: Request, res: Response) {
    try {
      const companyId = req.companyId || 12;
      const { date = new Date().toISOString().slice(0, 10), includeTally = 'false' } = req.query;
      const role = (req.user?.role || '').toUpperCase();
      const isVanRestricted = ['VAN_REP', 'VAN_SALES', 'SALESMAN_POS'].includes(role);

      let sql = `
        SELECT id, guid, voucher_number, TO_CHAR(voucher_date, 'YYYY-MM-DD') as voucher_date, voucher_type,
               party_ledger_name, amount, payment_mode, source, sync_status, created_at
        FROM vouchers
        WHERE cmp_id = $1
      `;
      const params: any[] = [companyId];

      if (date !== 'all') {
        params.push(date);
        sql += ` AND voucher_date = $${params.length}`;
      }

      if (includeTally !== 'true') {
        sql += ` AND COALESCE(source, 'VAN') IN ('VAN', 'WEB_APP', 'MOBILE')`;
      }

      if (isVanRestricted && req.user) {
        params.push(req.user.userId);
        sql += ` AND (user_id = $${params.length} OR created_by_user_id = $${params.length})`;
      }

      sql += ` ORDER BY id DESC LIMIT 200`;
      const resVouchers = await query(sql, params);

      return res.status(200).json({
        isValid: true,
        message: 'Daybook retrieved',
        errorCode: null,
        data: {
          date,
          entries: resVouchers.rows.map(r => ({
            id: r.id,
            guid: r.guid,
            voucherNumber: r.voucher_number,
            voucherDate: r.voucher_date,
            voucherType: r.voucher_type,
            partyName: r.party_ledger_name,
            amount: parseFloat(r.amount),
            paymentMode: r.payment_mode,
            source: r.source || 'VAN',
            syncStatus: r.sync_status,
            createdAt: r.created_at,
          })),
        },
      });
    } catch (err: any) {
      console.error('[Daybook Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }
}
