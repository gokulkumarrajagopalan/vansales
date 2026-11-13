import { Request, Response } from 'express';
import { pool, query } from '../db/pool.js';

export class SettingsController {
  static async getSettings(req: Request, res: Response) {
    try {
      const result = await query('SELECT * FROM public.settings');
      const settingsMap: { [k: string]: string } = {};
      result.rows.forEach(r => { settingsMap[r.setting_key] = r.setting_value; });
      res.status(200).json({ isValid: true, message: 'Settings retrieved', data: settingsMap });
    } catch (err: any) {
      console.error('[SettingsController.getSettings]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async updateSetting(req: Request, res: Response) {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ isValid: false, message: 'key and value are required', data: null });
      }

      const sql = `
        INSERT INTO public.settings (setting_key, setting_value)
        VALUES ($1, $2)
        ON CONFLICT (setting_key)
        DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      const result = await query(sql, [key, String(value)]);
      res.status(200).json({ isValid: true, message: 'Setting saved', data: result.rows[0] });
    } catch (err: any) {
      console.error('[SettingsController.updateSetting]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async getPermissions(req: Request, res: Response) {
    try {
      const result = await query('SELECT * FROM public.permissions ORDER BY id ASC');
      res.status(200).json({ isValid: true, message: 'Permissions retrieved', data: result.rows });
    } catch (err: any) {
      console.error('[SettingsController.getPermissions]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async createPermission(req: Request, res: Response) {
    try {
      const { name, groupName = '🌱 User Operations', description = '' } = req.body;
      if (!name) {
        return res.status(400).json({ isValid: false, message: 'Permission name is required', data: null });
      }
      const sql = `
        INSERT INTO public.permissions (name, group_name, description)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await query(sql, [name, groupName, description]);
      res.status(201).json({ isValid: true, message: 'Permission registered', data: result.rows[0] });
    } catch (err: any) {
      console.error('[SettingsController.createPermission]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async deletePermission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM public.permissions WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Permission not found', data: null });
      }
      res.status(200).json({ isValid: true, message: 'Permission deleted', data: result.rows[0] });
    } catch (err: any) {
      console.error('[SettingsController.deletePermission]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async truncateTransactions(req: Request, res: Response) {
    const client = await pool.connect();
    try {
      const scope = (req.body?.scope || req.query?.scope || 'app').toString().toLowerCase();
      await client.query('BEGIN');

      const childTables = [
        'voucher_batch_allocations',
        'voucher_bill_allocations',
        'voucher_cost_category_allocations',
        'voucher_cost_centre_allocations',
        'voucher_inventory_entries',
        'voucher_ledger_entries',
      ];

      let deletedVouchers = 0;
      if (scope === 'all') {
        for (const tbl of childTables) {
          await client.query(`DELETE FROM public.${tbl}`);
        }
        const delRes = await client.query(`DELETE FROM public.vouchers`);
        deletedVouchers = delRes.rowCount || 0;
      } else {
        // Default: truncate Van, Mobile & Web App transactions while preserving historical Tally imports
        const targetFilter = `COALESCE(source, 'VAN') IN ('VAN', 'WEB_APP', 'MOBILE')`;
        for (const tbl of childTables) {
          await client.query(
            `DELETE FROM public.${tbl} WHERE voucher_id IN (SELECT id FROM public.vouchers WHERE ${targetFilter})`
          );
        }
        const delRes = await client.query(`DELETE FROM public.vouchers WHERE ${targetFilter}`);
        deletedVouchers = delRes.rowCount || 0;
      }

      const delOrderItems = await client.query('DELETE FROM public.order_items');
      const delOrders = await client.query('DELETE FROM public.orders');
      const delShifts = await client.query('DELETE FROM public.van_shift');

      await client.query('COMMIT');
      res.status(200).json({
        isValid: true,
        message: 'Backend app vouchers, lines, orders, and shifts truncated cleanly.',
        data: {
          scope,
          deletedVouchers,
          deletedOrderItems: delOrderItems.rowCount || 0,
          deletedOrders: delOrders.rowCount || 0,
          deletedShifts: delShifts.rowCount || 0,
        },
      });
    } catch (err: any) {
      await client.query('ROLLBACK').catch(() => {});
      console.error('[SettingsController.truncateTransactions]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    } finally {
      client.release();
    }
  }
}
