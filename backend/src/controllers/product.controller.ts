import { Request, Response } from 'express';
import { query } from '../db/pool.js';

export class ProductController {
  static async getProducts(req: Request, res: Response) {
    try {
      const { category_id, search, limit = 50 } = req.query;
      let sql = `
        SELECT p.*, c.name as category_name
        FROM public.products p
        LEFT JOIN public.categories c ON c.id = p.category_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (category_id) {
        params.push(Number(category_id));
        sql += ` AND p.category_id = $${params.length}`;
      }

      if (search && typeof search === 'string' && search.trim()) {
        params.push(`%${search.trim()}%`);
        sql += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
      }

      params.push(Number(limit));
      sql += ` ORDER BY p.created_at DESC LIMIT $${params.length}`;

      const result = await query(sql, params);
      res.status(200).json({
        isValid: true,
        message: 'Products retrieved successfully',
        data: result.rows,
      });
    } catch (err: any) {
      console.error('[ProductController.getProducts]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sql = `
        SELECT p.*, c.name as category_name
        FROM public.products p
        LEFT JOIN public.categories c ON c.id = p.category_id
        WHERE p.id = $1
      `;
      const result = await query(sql, [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Product not found', data: null });
      }
      res.status(200).json({ isValid: true, message: 'Product details', data: result.rows[0] });
    } catch (err: any) {
      console.error('[ProductController.getProductById]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
      const { categoryId, code = '', name, packingQty, finalPrice, mrp, purchaseCost = 0, gstRate = 18, description = '', images = [], status = true } = req.body;

      if (!name || !packingQty || finalPrice === undefined || mrp === undefined) {
        return res.status(400).json({
          isValid: false,
          message: 'name, packingQty, finalPrice, and mrp are required',
          data: null,
        });
      }

      const sql = `
        INSERT INTO public.products (category_id, code, name, packing_qty, final_price, mrp, purchase_cost, gst_rate, description, images, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      const result = await query(sql, [
        categoryId || null,
        code,
        name,
        packingQty,
        Number(finalPrice),
        Number(mrp),
        Number(purchaseCost),
        Number(gstRate),
        description,
        JSON.stringify(images || []),
        Boolean(status),
      ]);

      res.status(201).json({ isValid: true, message: 'Product created successfully', data: result.rows[0] });
    } catch (err: any) {
      console.error('[ProductController.createProduct]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { categoryId, code, name, packingQty, finalPrice, mrp, purchaseCost, gstRate, description, images, status } = req.body;

      const existing = await query('SELECT * FROM public.products WHERE id = $1', [id]);
      if (existing.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Product not found', data: null });
      }
      const cur = existing.rows[0];

      const imagesJson = images !== undefined ? JSON.stringify(images) : JSON.stringify(cur.images || []);

      const sql = `
        UPDATE public.products
        SET 
          category_id = $1,
          code = $2,
          name = $3,
          packing_qty = $4,
          final_price = $5,
          mrp = $6,
          purchase_cost = $7,
          gst_rate = $8,
          description = $9,
          images = $10::jsonb,
          status = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
        RETURNING *
      `;

      const result = await query(sql, [
        categoryId !== undefined ? categoryId : cur.category_id,
        code ?? cur.code,
        name ?? cur.name,
        packingQty ?? cur.packing_qty,
        finalPrice !== undefined ? Number(finalPrice) : cur.final_price,
        mrp !== undefined ? Number(mrp) : cur.mrp,
        purchaseCost !== undefined ? Number(purchaseCost) : cur.purchase_cost,
        gstRate !== undefined ? Number(gstRate) : cur.gst_rate,
        description ?? cur.description,
        imagesJson,
        status !== undefined ? Boolean(status) : cur.status,
        id,
      ]);

      res.status(200).json({ isValid: true, message: 'Product updated successfully', data: result.rows[0] });
    } catch (err: any) {
      console.error('[ProductController.updateProduct]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM public.products WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Product not found', data: null });
      }
      res.status(200).json({ isValid: true, message: 'Product deleted successfully', data: result.rows[0] });
    } catch (err: any) {
      console.error('[ProductController.deleteProduct]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }
}
