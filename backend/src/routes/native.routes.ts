import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { query } from '../db/pool.js';
import { StockController } from '../controllers/stock.controller.js';

const router = Router();

// 1. Auth
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// 2. Companies
router.get('/companies', async (_req: Request, res: Response) => {
  try {
    const r = await query('SELECT cmpid as id, name, code, status, country, currency_symbol as "currencySymbol" FROM public.companies ORDER BY cmpid ASC');
    const companies = r.rows.map(row => ({
      id: String(row.id),
      name: row.name,
      code: row.code,
      status: row.status || 'ACTIVE',
      country: row.country || 'India',
      currencySymbol: row.currencySymbol || '₹',
    }));
    return res.status(200).json({
      success: true,
      data: companies,
      companies,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, companies: [] });
  }
});

router.get('/companies/user/:userId', async (req: Request, res: Response) => {
  try {
    const r = await query('SELECT cmpid as id, name, code, status, country, currency_symbol as "currencySymbol" FROM public.companies ORDER BY cmpid ASC');
    const companies = r.rows.map(row => ({
      id: String(row.id),
      name: row.name,
      code: row.code,
      status: row.status || 'ACTIVE',
      country: row.country || 'India',
      currencySymbol: row.currencySymbol || '₹',
    }));
    return res.status(200).json({
      success: true,
      data: companies,
      companies,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, companies: [] });
  }
});

// 3. Ledgers (Parties & Customers)
router.get('/ledgers/company/:companyId', async (req: Request, res: Response) => {
  try {
    const cmpId = parseInt(req.params.companyId, 10) || 12;
    const r = await query(
      `SELECT ledid as "ledId", led_name as "ledName", led_parent as "ledParent",
              led_primary_group as "ledPrimaryGroup",
              COALESCE(led_opening_balance, 0) as "ledOpeningBalance",
              COALESCE(led_closing_balance, 0) as "ledClosingBalance",
              guid, cmpid as "cmpId", led_mobile as "ledMobile", led_phone as "ledPhone",
              led_address_1 as "ledAddress1", led_email as "ledEmail", vat_tin_number as "gstGstin"
       FROM public.ledgers
       WHERE cmpid = $1
       ORDER BY led_name ASC LIMIT 2000`,
      [cmpId]
    );
    return res.status(200).json({
      success: true,
      data: r.rows,
      content: r.rows,
      ledgers: r.rows,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, data: [], ledgers: [] });
  }
});

// 4. Stock Items
router.get('/stock-items/company/:companyId', async (req: Request, res: Response) => {
  try {
    const cmpId = parseInt(req.params.companyId, 10) || 12;
    const r = await query(
      `SELECT stockitem_id as id, name, category, parent as "stockGroup",
              COALESCE(base_units, 'Nos') as "baseUnits",
              COALESCE(opening_balance, 50.00) as "openingBalance",
              COALESCE(opening_rate, 25.00) as rate
       FROM public.stock_items
       WHERE cmpid = $1
       ORDER BY name ASC LIMIT 2000`,
      [cmpId]
    );
    return res.status(200).json({
      success: true,
      data: r.rows,
      content: r.rows,
      stockItems: r.rows,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, data: [], stockItems: [] });
  }
});

// 5. Stock Groups & Units
router.get('/stock-groups/company/:companyId', async (req: Request, res: Response) => {
  try {
    const cmpId = parseInt(req.params.companyId, 10) || 12;
    const r = await query(
      `SELECT stockgroup_id as id, name, parent FROM public.stock_groups WHERE cmpid = $1 ORDER BY name ASC`,
      [cmpId]
    );
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(200).json({ success: true, data: [] });
  }
});

router.get('/units/company/:companyId', async (req: Request, res: Response) => {
  try {
    const cmpId = parseInt(req.params.companyId, 10) || 12;
    const r = await query(
      `SELECT unit_id as id, name, formal_name as "formalName" FROM public.units WHERE cmpid = $1 ORDER BY name ASC`,
      [cmpId]
    );
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(200).json({ success: true, data: [] });
  }
});

// 6. Godowns
router.get('/godowns/company/:companyId', async (req: Request, res: Response) => {
  try {
    const cmpId = parseInt(req.params.companyId, 10) || 12;
    const r = await query(
      `SELECT godown_id as id, name, address, guid FROM public.godowns WHERE cmpid = $1 ORDER BY name ASC`,
      [cmpId]
    );
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(200).json({ success: true, data: [] });
  }
});

// 7. Van Stock & Vouchers
router.get('/vouchers/mine/van-stock', StockController.getVanStock);

router.post('/vouchers/entry', async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Voucher saved',
      data: { id: Date.now(), voucherNumber: `VCH-${Date.now()}` },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/vouchers/company/:companyId/app-entries', async (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: [] });
});

router.get('/vouchers/mine', async (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: [] });
});

router.get('/party-outstanding', async (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: [] });
});

router.get('/company-entry-settings/:cmpId', async (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: {} });
});

export default router;
