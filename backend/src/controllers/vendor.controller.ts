import { Request, Response } from 'express';
import { query } from '../db/pool.js';

export class VendorController {
  static async getVendors(req: Request, res: Response) {
    try {
      const { search, limit = 50, offset = 0 } = req.query;
      let sql = 'SELECT * FROM public.vendors WHERE 1=1';
      const params: any[] = [];

      if (search && typeof search === 'string' && search.trim()) {
        params.push(`%${search.trim()}%`);
        sql += ` AND (name ILIKE $${params.length} OR shop_name ILIKE $${params.length} OR mobile_number ILIKE $${params.length})`;
      }

      params.push(Number(limit));
      sql += ` ORDER BY created_at DESC LIMIT $${params.length}`;

      params.push(Number(offset));
      sql += ` OFFSET $${params.length}`;

      const result = await query(sql, params);
      res.status(200).json({
        isValid: true,
        message: 'Vendors retrieved successfully',
        data: result.rows,
        total: result.rowCount,
      });
    } catch (err: any) {
      console.error('[VendorController.getVendors]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async getVendorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query('SELECT * FROM public.vendors WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Vendor not found', data: null });
      }
      res.status(200).json({ isValid: true, message: 'Vendor details', data: result.rows[0] });
    } catch (err: any) {
      console.error('[VendorController.getVendorById]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async createVendor(req: Request, res: Response) {
    try {
      const { name, shopName, mobileNumber, gstNumber, borrowAmountLimit = 0, address = '', status = true } = req.body;

      if (!name || !shopName || !mobileNumber) {
        return res.status(400).json({ isValid: false, message: 'Name, shopName, and mobileNumber are required', data: null });
      }

      const sql = `
        INSERT INTO public.vendors (name, shop_name, mobile_number, gst_number, borrow_amount_limit, address, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const result = await query(sql, [name, shopName, mobileNumber, gstNumber || null, Number(borrowAmountLimit) || 0, address, Boolean(status)]);
      res.status(201).json({ isValid: true, message: 'Vendor created successfully', data: result.rows[0] });
    } catch (err: any) {
      console.error('[VendorController.createVendor]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async updateVendor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, shopName, mobileNumber, gstNumber, borrowAmountLimit, address, status } = req.body;

      const existing = await query('SELECT * FROM public.vendors WHERE id = $1', [id]);
      if (existing.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Vendor not found', data: null });
      }
      const cur = existing.rows[0];

      const sql = `
        UPDATE public.vendors
        SET 
          name = $1,
          shop_name = $2,
          mobile_number = $3,
          gst_number = $4,
          borrow_amount_limit = $5,
          address = $6,
          status = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;

      const result = await query(sql, [
        name ?? cur.name,
        shopName ?? cur.shop_name,
        mobileNumber ?? cur.mobile_number,
        gstNumber !== undefined ? gstNumber : cur.gst_number,
        borrowAmountLimit !== undefined ? Number(borrowAmountLimit) : cur.borrow_amount_limit,
        address ?? cur.address,
        status !== undefined ? Boolean(status) : cur.status,
        id,
      ]);

      res.status(200).json({ isValid: true, message: 'Vendor updated successfully', data: result.rows[0] });
    } catch (err: any) {
      console.error('[VendorController.updateVendor]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async deleteVendor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM public.vendors WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Vendor not found', data: null });
      }
      res.status(200).json({ isValid: true, message: 'Vendor deleted successfully', data: result.rows[0] });
    } catch (err: any) {
      console.error('[VendorController.deleteVendor]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }
}
