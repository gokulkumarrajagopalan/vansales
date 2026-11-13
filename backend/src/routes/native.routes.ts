import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { query } from '../db/pool.js';
import { StockController } from '../controllers/stock.controller.js';
import { TrackingController } from '../controllers/tracking.controller.js';

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

// 3b. Create Customer / Ledger (Sync from Mobile & Web)
router.post(['/customers', '/ledgers'], async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      name,
      storeName,
      phone,
      mobile,
      mobileNumber,
      address,
      address1,
      city,
      state,
      emirate,
      country,
      trn,
      vatTinNumber,
      creditLimit,
    } = req.body;

    const cmpId = Number(companyId) || 12;
    const custName = (name || storeName || '').trim();
    if (!custName) {
      return res.status(400).json({ success: false, message: 'Customer or store name is required' });
    }

    const custPhone = phone || mobile || mobileNumber || '';
    const custAddress = address || address1 || '';
    const custState = state || emirate || 'Karnataka';
    const custCountry = country || 'India';
    const custTrn = trn || vatTinNumber || '';

    // Find Debtors Group
    const grpRes = await query(
      `SELECT grpid FROM public.groups WHERE cmpid = $1 AND (grp_name ILIKE '%Debtor%' OR grp_name ILIKE '%Customer%') LIMIT 1`,
      [cmpId]
    );
    const grpId = grpRes.rows.length > 0 ? grpRes.rows[0].grpid : null;

    // Get Next Master ID
    const maxMasterRes = await query(
      `SELECT COALESCE(MAX(masterid), 600) + 1 as next_id FROM public.ledgers WHERE cmpid = $1`,
      [cmpId]
    );
    const nextMasterId = parseInt(maxMasterRes.rows[0].next_id, 10);
    const guid = `LED-CMP${cmpId}-${nextMasterId}`;

    const insRes = await query(
      `INSERT INTO public.ledgers (
         userid, cmpid, masterid, guid, grpid, led_name, led_parent, led_primary_group,
         led_opening_balance, led_closing_balance, led_billwise_on, is_active, is_deleted,
         led_mobile, led_email, led_address_1, led_state, led_country, vat_tin_number, sync_status, created_at, updated_at
       )
       VALUES (
         5, $1, $2, $3, $4, $5, 'Sundry Debtors', 'Current Assets',
         0.00, 0.00, true, true, false,
         $6, '', $7, $8, $9, $10, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
       )
       ON CONFLICT (cmpid, led_name) DO UPDATE
       SET led_mobile = EXCLUDED.led_mobile,
           led_address_1 = EXCLUDED.led_address_1,
           vat_tin_number = EXCLUDED.vat_tin_number,
           updated_at = CURRENT_TIMESTAMP
       RETURNING ledid, led_name`,
      [cmpId, nextMasterId, guid, grpId, custName, custPhone, custAddress, custState, custCountry, custTrn]
    );

    const ledId = insRes.rows[0].ledid;

    return res.status(200).json({
      success: true,
      message: 'Customer saved to cloud database successfully',
      id: ledId,
      name: custName,
      data: {
        id: ledId,
        name: custName,
        phone: custPhone,
        address: custAddress,
      },
    });
  } catch (err: any) {
    console.error('[Create Customer Error]', err);
    return res.status(500).json({ success: false, message: err.message });
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
    const {
      companyId,
      voucherType,
      date,
      partyLedgerName,
      amount,
      narration,
      reference,
      lineItems,
      paymentMode,
    } = req.body;

    const cmpId = Number(companyId) || 12;
    const vType = voucherType || 'Sales';
    const vDate = date || new Date().toISOString().slice(0, 10);
    const vNumber = (reference || `VCH-${Date.now()}`).trim();
    const vAmount = Number(amount) || 0;
    const party = partyLedgerName || 'Cash in Hand';
    const desc = narration || `${vType} Voucher ${vNumber} for ${party}`;
    const guid = `MOB-${cmpId}-${Date.now()}`;

    // Upsert into vouchers table
    const vRes = await query(
      `INSERT INTO public.vouchers (
         voucher_number, voucher_type, date, total_amount, narration, tally_sync_status, tally_guid
       )
       VALUES ($1, $2, $3::date, $4, $5, 'synced', $6)
       ON CONFLICT (voucher_number) DO UPDATE
       SET total_amount = EXCLUDED.total_amount,
           narration = EXCLUDED.narration,
           tally_sync_status = 'synced'
       RETURNING id`,
      [vNumber, vType, vDate, vAmount, desc, guid]
    );

    const voucherId = vRes.rows[0]?.id ? parseInt(vRes.rows[0].id, 10) : null;

    if (voucherId && Array.isArray(lineItems) && lineItems.length > 0) {
      for (const item of lineItems) {
        const iName = item.itemName || 'Stock Item';
        const iQty = parseFloat(item.qty) || 1;
        const iRate = parseFloat(item.rate) || 0;
        const iAmt = parseFloat(item.amount) || (iQty * iRate);
        await query(
          `INSERT INTO public.voucher_inventory_entries (
             voucher_id, cmp_id, stock_item_name, godown_name, actual_qty, billed_qty,
             uom, rate, discount, amount, voucher_guid, voucher_number, voucher_type,
             voucher_date, created_at
           )
           VALUES ($1, $2, $3, 'Van 01 Godown', $4, $4, 'Nos', $5, 0, $6, $7, $8, $9, $10::date, CURRENT_TIMESTAMP)`,
          [voucherId, cmpId, iName, iQty, iRate, iAmt, guid, vNumber, vType, vDate]
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Voucher saved to server successfully',
      id: voucherId || Date.now(),
      voucherNumber: vNumber,
      guid,
      syncStatus: 'synced',
      data: {
        id: voucherId || Date.now(),
        voucherNumber: vNumber,
        guid,
        syncStatus: 'synced',
      },
    });
  } catch (err: any) {
    console.error('[Voucher Entry Error]', err);
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

// GPS / Tracking telemetry from mobile app
router.post('/tracking/ping', TrackingController.recordPing);
router.get('/tracking/live', TrackingController.getLiveFleet);

export default router;
