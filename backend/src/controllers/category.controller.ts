import { Request, Response } from 'express';
import { query } from '../db/pool.js';

export class CategoryController {
  static async getCategories(req: Request, res: Response) {
    try {
      const result = await query('SELECT * FROM public.categories ORDER BY created_at DESC');
      res.status(200).json({
        isValid: true,
        message: 'Categories retrieved successfully',
        data: result.rows,
      });
    } catch (err: any) {
      console.error('[CategoryController.getCategories]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query('SELECT * FROM public.categories WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Category not found', data: null });
      }
      res.status(200).json({ isValid: true, message: 'Category details', data: result.rows[0] });
    } catch (err: any) {
      console.error('[CategoryController.getCategoryById]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const { name, slug, imageUrl = '', status = true } = req.body;
      if (!name) {
        return res.status(400).json({ isValid: false, message: 'Category name is required', data: null });
      }

      const safeSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const sql = `
        INSERT INTO public.categories (name, slug, image_url, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const result = await query(sql, [name, safeSlug, imageUrl, Boolean(status)]);
      res.status(201).json({ isValid: true, message: 'Category created successfully', data: result.rows[0] });
    } catch (err: any) {
      console.error('[CategoryController.createCategory]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, slug, imageUrl, status } = req.body;

      const existing = await query('SELECT * FROM public.categories WHERE id = $1', [id]);
      if (existing.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Category not found', data: null });
      }
      const cur = existing.rows[0];

      const sql = `
        UPDATE public.categories
        SET 
          name = $1,
          slug = $2,
          image_url = $3,
          status = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `;
      const result = await query(sql, [
        name ?? cur.name,
        slug ?? cur.slug,
        imageUrl !== undefined ? imageUrl : cur.image_url,
        status !== undefined ? Boolean(status) : cur.status,
        id,
      ]);
      res.status(200).json({ isValid: true, message: 'Category updated successfully', data: result.rows[0] });
    } catch (err: any) {
      console.error('[CategoryController.updateCategory]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM public.categories WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Category not found', data: null });
      }
      res.status(200).json({ isValid: true, message: 'Category deleted successfully', data: result.rows[0] });
    } catch (err: any) {
      console.error('[CategoryController.deleteCategory]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }
}
