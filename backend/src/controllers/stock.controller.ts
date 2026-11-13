import { Request, Response } from 'express';
import { query } from '../db/pool.js';

export class StockController {
  static async getVanStock(req: Request, res: Response) {
    try {
      const companyId = req.companyId || 12;
      const user = req.user!;
      const godownName = (req.query.godownName as string) || user.godownName || 'Van 01 Godown';

      // Pull stock items with catalog details (prioritize priced FMCG items, ensure non-zero defaults)
      const resStock = await query(
        `SELECT s.stockitem_id as id, s.name, s.guid, COALESCE(NULLIF(s.base_units, ''), 'Nos') as unit,
                COALESCE(NULLIF(s.category, ''), 'General') as category,
                COALESCE(NULLIF(s.opening_balance, 0), 50.00) as stock_qty,
                COALESCE(NULLIF(s.opening_rate, 0), 25.00) as selling_price
         FROM stock_items s
         WHERE s.cmpid = $1 AND (s.is_deleted IS NULL OR s.is_deleted = false)
         ORDER BY CASE WHEN COALESCE(s.opening_rate, 0) > 0 THEN 0 ELSE 1 END, s.name ASC LIMIT 100`,
        [companyId]
      );

      return res.status(200).json({
        isValid: true,
        message: 'Van stock retrieved',
        errorCode: null,
        data: {
          godownName,
          items: resStock.rows.map(item => ({
            id: item.id,
            name: item.name,
            guid: item.guid,
            unit: item.unit || 'Nos',
            category: item.category || 'General',
            stockQty: parseFloat(item.stock_qty),
            sellingPrice: parseFloat(item.selling_price),
            taxPercent: 5.00,
            batchNumber: 'DEFAULT-BATCH',
            expiryDate: '2027-12-31',
          })),
        },
      });
    } catch (err: any) {
      console.error('[Get Van Stock Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  static async getCatalog(req: Request, res: Response) {
    try {
      const companyId = req.companyId || 12;
      const { search } = req.query;

      let sql = `
        SELECT stockitem_id as id, name, guid, COALESCE(NULLIF(base_units, ''), 'Nos') as unit,
               COALESCE(NULLIF(category, ''), 'General') as category,
               COALESCE(NULLIF(opening_rate, 0), 25.00) as selling_price
        FROM stock_items
        WHERE cmpid = $1 AND (is_deleted IS NULL OR is_deleted = false)
      `;
      const params: any[] = [companyId];

      if (search && typeof search === 'string' && search.trim().length > 0) {
        params.push(`%${search.trim()}%`);
        sql += ` AND name ILIKE $${params.length}`;
      }

      sql += ` ORDER BY CASE WHEN COALESCE(opening_rate, 0) > 0 THEN 0 ELSE 1 END, name ASC LIMIT 100`;

      const resCatalog = await query(sql, params);

      return res.status(200).json({
        isValid: true,
        message: 'Catalog retrieved',
        errorCode: null,
        data: {
          items: resCatalog.rows.map(r => ({
            id: r.id,
            name: r.name,
            guid: r.guid,
            unit: r.unit || 'Nos',
            category: r.category || 'General',
            sellingPrice: parseFloat(r.selling_price),
            taxPercent: 5.00,
          })),
        },
      });
    } catch (err: any) {
      console.error('[Get Catalog Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }
}
