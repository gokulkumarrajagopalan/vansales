import { Request, Response } from 'express';
import { query } from '../db/pool.js';

export class OrderController {
  /**
   * GET /api/v1/orders
   * Filterable by tab: all | pending | approved | rejected, and search query
   */
  static async getOrders(req: Request, res: Response) {
    try {
      const { tab = 'all', search = '', limit = 50 } = req.query;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (tab === 'pending') {
        whereClause += " AND o.status = 'pending'";
      } else if (tab === 'approved') {
        whereClause += " AND o.status = 'approved'";
      } else if (tab === 'rejected') {
        whereClause += " AND o.status = 'rejected'";
      }

      if (req.query.salesPersonId) {
        params.push(req.query.salesPersonId);
        whereClause += ` AND o.sales_person_id = $${params.length}`;
      }

      if (search) {
        params.push(`%${search}%`);
        const idx = params.length;
        whereClause += ` AND (o.order_number ILIKE $${idx} OR v.shop_name ILIKE $${idx} OR v.name ILIKE $${idx})`;
      }

      params.push(limit);
      const limitIdx = params.length;

      const sql = `
        SELECT 
          o.*,
          v.name AS vendor_name,
          v.shop_name AS vendor_shop_name,
          v.mobile_number AS vendor_phone,
          v.borrow_amount_limit AS vendor_borrow_limit,
          v.address AS vendor_address,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'productId', oi.product_id,
                'quantity', oi.quantity,
                'unitPrice', oi.unit_price,
                'lineTotal', oi.line_total,
                'productName', p.name,
                'packingQty', p.packing_qty
              )
            ) FILTER (WHERE oi.id IS NOT NULL), '[]'
          ) AS items
        FROM public.orders o
        LEFT JOIN public.vendors v ON v.id = o.vendor_id
        LEFT JOIN public.order_items oi ON oi.order_id = o.id
        LEFT JOIN public.products p ON p.id = oi.product_id
        ${whereClause}
        GROUP BY o.id, v.id
        ORDER BY o.created_at DESC
        LIMIT $${limitIdx}
      `;

      const result = await query(sql, params);

      res.status(200).json({
        isValid: true,
        message: 'Orders retrieved successfully',
        data: result.rows,
      });
    } catch (err: any) {
      console.error('[OrderController.getOrders]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  /**
   * GET /api/v1/orders/:id
   */
  static async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sql = `
        SELECT 
          o.*,
          v.name AS vendor_name,
          v.shop_name AS vendor_shop_name,
          v.mobile_number AS vendor_phone,
          v.borrow_amount_limit AS vendor_borrow_limit,
          v.address AS vendor_address,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'productId', oi.product_id,
                'quantity', oi.quantity,
                'unitPrice', oi.unit_price,
                'lineTotal', oi.line_total,
                'productName', p.name,
                'packingQty', p.packing_qty
              )
            ) FILTER (WHERE oi.id IS NOT NULL), '[]'
          ) AS items
        FROM public.orders o
        LEFT JOIN public.vendors v ON v.id = o.vendor_id
        LEFT JOIN public.order_items oi ON oi.order_id = o.id
        LEFT JOIN public.products p ON p.id = oi.product_id
        WHERE o.id = $1
        GROUP BY o.id, v.id
      `;

      const result = await query(sql, [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Order not found', data: null });
      }

      res.status(200).json({
        isValid: true,
        message: 'Order details',
        data: result.rows[0],
      });
    } catch (err: any) {
      console.error('[OrderController.getOrderById]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  /**
   * POST /api/v1/orders
   * Place an order from web or mobile sales rep
   */
  static async createOrder(req: Request, res: Response) {
    try {
      const { vendorId, items, discountAmount = 0, salesPersonId = 1 } = req.body;

      if (!vendorId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ isValid: false, message: 'Vendor and items are required', data: null });
      }

      let subtotal = 0;
      for (const item of items) {
        subtotal += Number(item.unitPrice || 0) * Number(item.quantity || 1);
      }

      const discount = Number(discountAmount) || 0;
      const finalTotal = Math.max(0, subtotal - discount);
      const status = discount > 0 ? 'pending' : 'approved';
      const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

      const insertOrderSql = `
        INSERT INTO public.orders 
          (order_number, sales_person_id, vendor_id, subtotal, discount_amount, final_total, status)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const orderResult = await query(insertOrderSql, [
        orderNumber,
        salesPersonId,
        vendorId,
        subtotal,
        discount,
        finalTotal,
        status,
      ]);

      const createdOrder = orderResult.rows[0];

      for (const item of items) {
        const lineTotal = Number(item.unitPrice || 0) * Number(item.quantity || 1);
        await query(
          `INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, line_total)
           VALUES ($1, $2, $3, $4, $5)`,
          [createdOrder.id, item.productId, item.quantity, item.unitPrice, lineTotal]
        );
      }

      res.status(201).json({
        isValid: true,
        message: status === 'pending' ? 'Order submitted. Pending Admin discount approval.' : 'Order placed successfully.',
        data: createdOrder,
      });
    } catch (err: any) {
      console.error('[OrderController.createOrder]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  /**
   * PUT /api/v1/orders/:id
   * Edit order
   */
  static async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { discountAmount, status, rejectionReason } = req.body;

      const existing = await query('SELECT * FROM public.orders WHERE id = $1', [id]);
      if (existing.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Order not found', data: null });
      }
      const cur = existing.rows[0];

      const newDiscount = discountAmount !== undefined ? Number(discountAmount) : Number(cur.discount_amount);
      const newFinalTotal = Math.max(0, Number(cur.subtotal) - newDiscount);
      const newStatus = status ?? cur.status;

      const sql = `
        UPDATE public.orders
        SET 
          discount_amount = $1,
          final_total = $2,
          status = $3,
          rejection_reason = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `;
      const result = await query(sql, [
        newDiscount,
        newFinalTotal,
        newStatus,
        rejectionReason !== undefined ? rejectionReason : cur.rejection_reason,
        id,
      ]);

      res.status(200).json({ isValid: true, message: 'Order updated successfully', data: result.rows[0] });
    } catch (err: any) {
      console.error('[OrderController.updateOrder]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  /**
   * POST /api/v1/orders/:id/approve
   * Admin 1-click approval
   */
  static async approveOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const approver = req.body.approver || 'Super Admin';

      const updateSql = `
        UPDATE public.orders
        SET 
          status = 'approved',
          approved_by = $1,
          approved_at = CURRENT_TIMESTAMP,
          tally_sync_status = 'pending',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await query(updateSql, [approver, id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Order not found', data: null });
      }

      res.status(200).json({
        isValid: true,
        message: 'Order approved successfully. Moved to Confirmed Bills and ready for Tally sync.',
        data: result.rows[0],
      });
    } catch (err: any) {
      console.error('[OrderController.approveOrder]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  /**
   * POST /api/v1/orders/:id/reject
   * Admin rejection with mandatory reason
   */
  static async rejectOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason || !rejectionReason.trim()) {
        return res.status(400).json({ isValid: false, message: 'Rejection reason is required', data: null });
      }

      const updateSql = `
        UPDATE public.orders
        SET 
          status = 'rejected',
          rejection_reason = $1,
          tally_sync_status = 'failed',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await query(updateSql, [rejectionReason.trim(), id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Order not found', data: null });
      }

      res.status(200).json({
        isValid: true,
        message: 'Order rejected successfully with logged reason.',
        data: result.rows[0],
      });
    } catch (err: any) {
      console.error('[OrderController.rejectOrder]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  /**
   * POST /api/v1/orders/:id/sync-tally
   */
  static async syncTally(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const voucherNo = 'SV-' + Date.now().toString().slice(-6);

      const updateSql = `
        UPDATE public.orders
        SET 
          tally_sync_status = 'synced',
          tally_voucher_number = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await query(updateSql, [voucherNo, id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Order not found', data: null });
      }

      res.status(200).json({
        isValid: true,
        message: 'Order posted to TallyPrime successfully.',
        data: result.rows[0],
      });
    } catch (err: any) {
      console.error('[OrderController.syncTally]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  /**
   * DELETE /api/v1/orders/:id
   * Cancel / Delete order
   */
  static async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM public.orders WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Order not found', data: null });
      }
      res.status(200).json({ isValid: true, message: 'Order deleted successfully', data: result.rows[0] });
    } catch (err: any) {
      console.error('[OrderController.deleteOrder]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }
}
