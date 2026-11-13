import { Request, Response } from 'express';
import { query } from '../db/pool.js';

export class ShiftController {
  static async openShift(req: Request, res: Response) {
    try {
      const user = req.user!;
      const companyId = req.companyId || 12;
      const { openingOdometer, openingCash, godownName } = req.body;

      if (openingOdometer === undefined || openingOdometer === null) {
        return res.status(400).json({
          isValid: false,
          message: 'Opening odometer is required',
          errorCode: 'INVALID_INPUT',
          data: null,
        });
      }

      // Check if open shift already exists
      const existing = await query(
        `SELECT id, started_at, opening_odometer, opening_cash, godown_name
         FROM van_shift
         WHERE salesman_user_id = $1 AND ended_at IS NULL`,
        [user.userId]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          isValid: false,
          message: 'An active shift is already open. Please close it first.',
          errorCode: 'SHIFT_ALREADY_OPEN',
          data: existing.rows[0],
        });
      }

      const assignedGodown = godownName || user.godownName || 'Van 01 Godown';

      const insertRes = await query(
        `INSERT INTO van_shift (
           cmp_id, salesman_user_id, started_at, opening_odometer, opening_cash, godown_name, status
         )
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, 'OPEN')
         RETURNING id, cmp_id, salesman_user_id, started_at, opening_odometer, opening_cash, godown_name, status`,
        [companyId, user.userId, openingOdometer, parseFloat(openingCash) || 0.00, assignedGodown]
      );

      return res.status(201).json({
        isValid: true,
        message: 'Shift opened successfully',
        errorCode: null,
        data: insertRes.rows[0],
      });
    } catch (err: any) {
      console.error('[Open Shift Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  static async getCurrentShift(req: Request, res: Response) {
    try {
      const user = req.user!;
      const shiftRes = await query(
        `SELECT id, cmp_id, salesman_user_id, started_at, opening_odometer, opening_cash, godown_name, status
         FROM van_shift
         WHERE salesman_user_id = $1 AND ended_at IS NULL
         ORDER BY id DESC LIMIT 1`,
        [user.userId]
      );

      if (shiftRes.rows.length === 0) {
        return res.status(200).json({
          isValid: true,
          message: 'No active shift found',
          errorCode: null,
          data: null,
        });
      }

      const shift = shiftRes.rows[0];

      // Calculate live sales and collections in this shift
      const salesStats = await query(
        `SELECT 
           COUNT(*) as invoice_count,
           COALESCE(SUM(amount), 0) as total_sales,
           COALESCE(SUM(CASE WHEN payment_mode = 'CASH' THEN amount ELSE 0 END), 0) as cash_sales,
           COALESCE(SUM(CASE WHEN payment_mode = 'CREDIT' THEN amount ELSE 0 END), 0) as credit_sales
         FROM vouchers
         WHERE shift_id = $1 AND voucher_type IN ('Sales', 'SALES')`,
        [shift.id]
      );

      const receiptStats = await query(
        `SELECT 
           COUNT(*) as receipt_count,
           COALESCE(SUM(amount), 0) as total_receipts,
           COALESCE(SUM(CASE WHEN payment_mode = 'CASH' THEN amount ELSE 0 END), 0) as cash_receipts
         FROM vouchers
         WHERE shift_id = $1 AND voucher_type IN ('Receipt', 'RECEIPT')`,
        [shift.id]
      );

      const openingCash = parseFloat(shift.opening_cash) || 0;
      const cashSales = parseFloat(salesStats.rows[0].cash_sales) || 0;
      const cashReceipts = parseFloat(receiptStats.rows[0].cash_receipts) || 0;
      const expectedCash = openingCash + cashSales + cashReceipts;

      return res.status(200).json({
        isValid: true,
        message: 'Active shift details retrieved',
        errorCode: null,
        data: {
          shift,
          metrics: {
            openingCash,
            cashSales,
            creditSales: parseFloat(salesStats.rows[0].credit_sales) || 0,
            totalSales: parseFloat(salesStats.rows[0].total_sales) || 0,
            invoiceCount: parseInt(salesStats.rows[0].invoice_count, 10),
            cashReceipts,
            totalReceipts: parseFloat(receiptStats.rows[0].total_receipts) || 0,
            receiptCount: parseInt(receiptStats.rows[0].receipt_count, 10),
            expectedCashInHand: expectedCash,
          },
        },
      });
    } catch (err: any) {
      console.error('[Get Current Shift Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  static async closeShift(req: Request, res: Response) {
    try {
      const user = req.user!;
      const { closingOdometer, physicalCash, handoverNotes } = req.body;

      if (closingOdometer === undefined || physicalCash === undefined) {
        return res.status(400).json({
          isValid: false,
          message: 'Closing odometer and physical cash count are required',
          errorCode: 'INVALID_INPUT',
          data: null,
        });
      }

      const shiftRes = await query(
        `SELECT id, opening_odometer, opening_cash, godown_name
         FROM van_shift
         WHERE salesman_user_id = $1 AND ended_at IS NULL
         ORDER BY id DESC LIMIT 1`,
        [user.userId]
      );

      if (shiftRes.rows.length === 0) {
        return res.status(404).json({
          isValid: false,
          message: 'No open shift found to close',
          errorCode: 'NO_OPEN_SHIFT',
          data: null,
        });
      }

      const shift = shiftRes.rows[0];

      if (closingOdometer < shift.opening_odometer) {
        return res.status(400).json({
          isValid: false,
          message: `Closing odometer (${closingOdometer}) cannot be less than opening odometer (${shift.opening_odometer})`,
          errorCode: 'INVALID_ODOMETER',
          data: null,
        });
      }

      // Calculate system cash
      const cashSalesRes = await query(
        `SELECT COALESCE(SUM(amount), 0) as cash_sales
         FROM vouchers
         WHERE shift_id = $1 AND voucher_type IN ('Sales', 'SALES') AND payment_mode = 'CASH'`,
        [shift.id]
      );
      const cashReceiptsRes = await query(
        `SELECT COALESCE(SUM(amount), 0) as cash_receipts
         FROM vouchers
         WHERE shift_id = $1 AND voucher_type IN ('Receipt', 'RECEIPT') AND payment_mode = 'CASH'`,
        [shift.id]
      );

      const openingCash = parseFloat(shift.opening_cash) || 0;
      const cashSales = parseFloat(cashSalesRes.rows[0].cash_sales) || 0;
      const cashReceipts = parseFloat(cashReceiptsRes.rows[0].cash_receipts) || 0;
      const systemCash = openingCash + cashSales + cashReceipts;
      const physical = parseFloat(physicalCash) || 0;
      const discrepancy = physical - systemCash;

      await query(
        `UPDATE van_shift
         SET ended_at = CURRENT_TIMESTAMP,
             closing_odometer = $1,
             closing_cash_physical = $2,
             closing_cash_system = $3,
             handover_notes = $4,
             status = 'CLOSED'
         WHERE id = $5`,
        [closingOdometer, physical, systemCash, handoverNotes || null, shift.id]
      );

      // Transition vouchers from this shift to READY for Tally sync
      await query(
        `UPDATE vouchers
         SET sync_status = 'READY'
         WHERE shift_id = $1 AND (sync_status IS NULL OR sync_status = 'PENDING')`,
        [shift.id]
      );

      return res.status(200).json({
        isValid: true,
        message: 'Shift closed successfully',
        errorCode: null,
        data: {
          shiftId: shift.id,
          openingOdometer: shift.opening_odometer,
          closingOdometer,
          distanceKm: closingOdometer - shift.opening_odometer,
          openingCash,
          systemCash,
          physicalCash: physical,
          discrepancy,
          status: 'CLOSED',
        },
      });
    } catch (err: any) {
      console.error('[Close Shift Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }
}
