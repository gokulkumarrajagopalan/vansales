import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { query } from '../db/pool.js';
import { StockController } from '../controllers/stock.controller.js';
import { TrackingController } from '../controllers/tracking.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

// 1. Auth
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// 2. Companies & Base Currency Management
router.get('/companies', async (_req: Request, res: Response) => {
  try {
    const r = await query('SELECT cmpid as id, name, code, status, country, currency_symbol as "currencySymbol", currency_formal_name as "currencyCode" FROM public.companies ORDER BY cmpid ASC');
    const companies = r.rows.map(row => ({
      id: String(row.id),
      name: row.name,
      code: row.code,
      status: row.status || 'ACTIVE',
      country: row.country || 'United Arab Emirates',
      currencySymbol: row.currencySymbol || 'AED',
      currencyCode: row.currencyCode || 'AED',
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
    const r = await query('SELECT cmpid as id, name, code, status, country, currency_symbol as "currencySymbol", currency_formal_name as "currencyCode" FROM public.companies ORDER BY cmpid ASC');
    const companies = r.rows.map(row => ({
      id: String(row.id),
      name: row.name,
      code: row.code,
      status: row.status || 'ACTIVE',
      country: row.country || 'United Arab Emirates',
      currencySymbol: row.currencySymbol || 'AED',
      currencyCode: row.currencyCode || 'AED',
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

// Update company profile and base currency (Admin action, flows down to all subsequent van accounts)
router.put('/companies/:id', authenticateJwt, async (req: Request, res: Response) => {
  try {
    const cmpId = parseInt(req.params.id, 10);
    const { name, currency, currencySymbol, country, address, taxNumber, phone, email } = req.body;
    const r = await query(
      `UPDATE public.companies
       SET name = COALESCE($1, name),
           currency_formal_name = COALESCE($2, currency_formal_name),
           currency_symbol = COALESCE($3, currency_symbol),
           country = COALESCE($4, country),
           address_line_1 = COALESCE($5, address_line_1),
           pan_number = COALESCE($6, pan_number),
           telephone = COALESCE($7, telephone),
           email = COALESCE($8, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE cmpid = $9
       RETURNING cmpid as id, name, code, status, country, currency_symbol as "currencySymbol", currency_formal_name as "currencyCode"`,
      [name, currency, currencySymbol, country, address, taxNumber, phone, email, cmpId]
    );
    if (r.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    const updated = r.rows[0];
    return res.status(200).json({
      success: true,
      message: `Base currency updated to ${updated.currencySymbol} (${updated.currencyCode}). All van accounts will use this currency.`,
      company: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
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

    let cmpId = Number(companyId) || 12;
    const cmpCheck = await query('SELECT cmpid FROM public.companies WHERE cmpid = $1', [cmpId]);
    if (cmpCheck.rows.length === 0) {
      cmpId = 12;
    }
    const custName = (name || storeName || '').trim();
    if (!custName) {
      return res.status(400).json({ success: false, message: 'Customer or store name is required' });
    }

    const custPhone = phone || mobile || mobileNumber || '';
    const custAddress = address || address1 || '';
    const custState = state || emirate || 'Dubai';
    const custCountry = country || 'United Arab Emirates';
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

// GET /api/customers
router.get(['/customers', '/ledgers'], async (req: Request, res: Response) => {
  try {
    let cmpId = Number(req.query.companyId) || 12;
    const result = await query(
      `SELECT ledid as id, led_name as name, led_name as "storeName",
              COALESCE(led_mobile, led_phone, '') as phone,
              COALESCE(led_address_1, '') as address,
              COALESCE(led_state, 'Dubai') as city,
              COALESCE(led_country, 'United Arab Emirates') as country,
              COALESCE(vat_tin_number, '') as trn,
              COALESCE(led_closing_balance, 0.00) as balance
       FROM public.ledgers
       WHERE cmpid = $1 AND (led_parent ILIKE '%Debtor%' OR led_primary_group ILIKE '%Debtor%')
       ORDER BY ledid DESC`,
      [cmpId]
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (err: any) {
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

// Query latest next sequence number for a voucher type (e.g. Sales, Receipt, Order)
router.get('/vouchers/next-number', async (req: Request, res: Response) => {
  try {
    const vType = String(req.query.type || 'Sales');
    const customPrefix = req.query.prefix ? String(req.query.prefix) : null;
    const prefix = customPrefix || (vType.toLowerCase().includes('receipt') ? 'REC-' : (vType.toLowerCase().includes('order') ? 'ORD-' : 'INV-'));
    const defaultStart = vType.toLowerCase().includes('receipt') ? 2001 : (vType.toLowerCase().includes('order') ? 3001 : 1001);

    const allMatching = await query(
      `SELECT voucher_number FROM public.vouchers WHERE voucher_number LIKE $1`,
      [`${prefix}%`]
    );

    let maxNum = 0;
    for (const r of allMatching.rows) {
      const m = String(r.voucher_number).match(/^(.*?)(\d+)$/);
      if (m && m[1] === prefix) {
        const n = parseInt(m[2], 10);
        if (!isNaN(n) && n > maxNum) {
          maxNum = n;
        }
      }
    }

    const nextSeq = Math.max(maxNum + 1, defaultStart);
    const candidate = `${prefix}${nextSeq}`;

    return res.status(200).json({
      success: true,
      prefix,
      maxSuffix: maxNum,
      nextNumber: candidate,
      count: allMatching.rows.length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

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
      guid: clientGuid,
    } = req.body;

    let cmpId = Number(companyId) || 12;
    const cmpCheck = await query('SELECT cmpid FROM public.companies WHERE cmpid = $1', [cmpId]);
    if (cmpCheck.rows.length === 0) {
      cmpId = 12;
    }

    const vType = voucherType || 'Sales';
    const vDate = date || new Date().toISOString().slice(0, 10);
    const rawVNumber = (reference || `VCH-${Date.now()}`).trim();
    const vAmount = Number(amount) || 0;
    const party = (partyLedgerName || 'Cash in Hand').trim();
    const mode = (paymentMode || 'CASH').toUpperCase();
    const cleanClientGuid = clientGuid ? String(clientGuid).trim() : null;

    // Strict Validation: Validate invoice and voucher fields before creation
    if (!party || party.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Validation Error: Party/Customer ledger name is required.' });
    }
    if (vType === 'Sales' && vAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Validation Error: Sales invoice amount must be greater than zero.' });
    }
    if (vType === 'Sales' && (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0)) {
      return res.status(400).json({ success: false, message: 'Validation Error: Sales invoice must contain at least one stock item.' });
    }
    if (lineItems && Array.isArray(lineItems)) {
      for (const item of lineItems) {
        if (!item.itemName) {
          return res.status(400).json({ success: false, message: 'Validation Error: Line item name is required.' });
        }
        if (parseFloat(item.qty) <= 0) {
          return res.status(400).json({ success: false, message: `Validation Error: Quantity for "${item.itemName}" must be greater than zero.` });
        }
      }
    }

    let finalVNumber = rawVNumber;
    let wasRenamed = false;
    let finalGuid = cleanClientGuid || `MOB-${cmpId}-${Date.now()}`;

    // Conflict Check: Check if a voucher with rawVNumber already exists in database
    const existingVoucherRes = await query(
      `SELECT id, voucher_number, party_name, total_amount, tally_guid, reference, voucher_type
       FROM public.vouchers
       WHERE voucher_number = $1`,
      [rawVNumber]
    );

    if (existingVoucherRes.rows.length > 0) {
      const existing = existingVoucherRes.rows[0];
      // Check if this is the EXACT same voucher re-pushed by the same client
      const isSameClientVoucher = Boolean(cleanClientGuid && existing.tally_guid === cleanClientGuid);

      if (!isSameClientVoucher) {
        // Multi-Van Offline Collision Detected! (e.g. Van 2 took 5..8, now Van 1 pushing offline 5)
        // Automatically allocate next consecutive sequence number!
        const prefixMatch = rawVNumber.match(/^(.*?)(\d+)$/);
        const prefix = prefixMatch ? prefixMatch[1] : (vType === 'Receipt' ? 'REC-' : (vType === 'Sales Order' ? 'ORD-' : 'INV-'));
        const digits = prefixMatch ? prefixMatch[2].length : 4;
        const defaultStart = vType === 'Receipt' ? 2001 : (vType === 'Sales Order' ? 3001 : 1001);

        const allMatching = await query(
          `SELECT voucher_number FROM public.vouchers WHERE voucher_number LIKE $1`,
          [`${prefix}%`]
        );

        let maxNum = 0;
        for (const r of allMatching.rows) {
          const m = String(r.voucher_number).match(/^(.*?)(\d+)$/);
          if (m && m[1] === prefix) {
            const n = parseInt(m[2], 10);
            if (!isNaN(n) && n > maxNum) {
              maxNum = n;
            }
          }
        }

        let nextSeq = Math.max(maxNum + 1, defaultStart);
        let candidate = `${prefix}${String(nextSeq).padStart(digits, '0')}`;
        while (allMatching.rows.some((r: any) => r.voucher_number === candidate)) {
          nextSeq++;
          candidate = `${prefix}${String(nextSeq).padStart(digits, '0')}`;
        }

        finalVNumber = candidate;
        wasRenamed = true;
        console.log(`[Voucher Conflict Resolved] Voucher ${rawVNumber} collision detected -> auto-allocated continuous sequence ${finalVNumber}`);
      }
    }

    const desc = narration || `${vType} Voucher ${finalVNumber} for ${party}`;

    // Upsert into vouchers table
    const vRes = await query(
      `INSERT INTO public.vouchers (
         voucher_number, voucher_type, date, total_amount, narration, tally_sync_status, tally_guid,
         cmp_id, user_id, created_by_user_id, voucher_date, amount, party_ledger_name, party_name,
         payment_mode, source, sync_status, reference
       )
       VALUES ($1, $2, $3::date, $4, $5, 'synced', $6, $7, 7, 7, $3::date, $4, $8, $8, $9, 'VAN', 'READY', $10)
       ON CONFLICT (voucher_number) DO UPDATE
       SET total_amount = EXCLUDED.total_amount,
           amount = EXCLUDED.amount,
           party_ledger_name = EXCLUDED.party_ledger_name,
           party_name = EXCLUDED.party_name,
           payment_mode = EXCLUDED.payment_mode,
           narration = EXCLUDED.narration,
           voucher_date = EXCLUDED.voucher_date,
           tally_sync_status = 'synced',
           sync_status = 'READY'
       RETURNING id`,
      [finalVNumber, vType, vDate, vAmount, desc, finalGuid, cmpId, party, mode, finalVNumber]
    );

    const voucherId = vRes.rows[0]?.id ? parseInt(vRes.rows[0].id, 10) : null;

    if (voucherId && Array.isArray(lineItems) && lineItems.length > 0) {
      // Clear old entries if re-saving
      await query(`DELETE FROM public.voucher_inventory_entries WHERE voucher_id = $1`, [voucherId]);
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
          [voucherId, cmpId, iName, iQty, iRate, iAmt, finalGuid, finalVNumber, vType, vDate]
        );
      }
    }

    if (voucherId) {
      try {
        await query(`DELETE FROM public.voucher_ledger_entries WHERE voucher_id = $1`, [voucherId]);
        const debitLedger = mode === 'CASH' ? 'Cash in Hand' : party;
        const creditLedger = vType.toLowerCase().includes('order') ? 'Sales Orders Booking' : 'Direct Sales Account';
        await query(
          `INSERT INTO public.voucher_ledger_entries (
             voucher_id, cmp_id, voucher_guid, voucher_number, voucher_date, voucher_type,
             ledger_name, amount, dr_cr, entry_index, is_party_ledger, created_at
           )
           VALUES 
           ($1, $2, $3, $4, $5::date, $6, $7, $8, 'Dr', 1, $9, CURRENT_TIMESTAMP),
           ($1, $2, $3, $4, $5::date, $6, $10, $8, 'Cr', 2, false, CURRENT_TIMESTAMP)`,
          [voucherId, cmpId, finalGuid, finalVNumber, vDate, vType, debitLedger, vAmount, mode !== 'CASH', creditLedger]
        );
      } catch (ledgErr) {
        console.warn('[Voucher Ledger Insert Warning]', ledgErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: wasRenamed
        ? `Voucher sequence conflict resolved: assigned ${finalVNumber}`
        : 'Voucher saved to server successfully',
      id: voucherId || Date.now(),
      voucherNumber: finalVNumber,
      originalVoucherNumber: rawVNumber,
      wasRenamed,
      guid: finalGuid,
      syncStatus: 'synced',
      data: {
        id: voucherId || Date.now(),
        voucherNumber: finalVNumber,
        originalVoucherNumber: rawVNumber,
        wasRenamed,
        guid: finalGuid,
        syncStatus: 'synced',
      },
    });
  } catch (err: any) {
    console.error('[Voucher Entry Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/vouchers/company/:companyId/app-entries', async (req: Request, res: Response) => {
  try {
    let cmpId = Number(req.params.companyId) || 12;
    let userId = Number(req.query.userId || req.query.user_id) || 0;

    const r = userId > 0
      ? await query(
          `SELECT id, voucher_number, voucher_type, date, total_amount, party_name, narration,
                  tally_guid, reference, sync_status, created_at, guid, payment_mode
           FROM public.vouchers
           WHERE cmp_id = $1 AND (user_id = $2 OR created_by_user_id = $2)
           ORDER BY id DESC
           LIMIT 500`,
          [cmpId, userId]
        )
      : await query(
          `SELECT id, voucher_number, voucher_type, date, total_amount, party_name, narration,
                  tally_guid, reference, sync_status, created_at, guid, payment_mode
           FROM public.vouchers
           WHERE cmp_id = $1
           ORDER BY id DESC
           LIMIT 500`,
          [cmpId]
        );

    const vIds = r.rows.map((row: any) => row.id);
    const itemsByVoucher: Record<string, any[]> = {};
    if (vIds.length > 0) {
      const itemRes = await query(
        `SELECT voucher_id, stock_item_name, billed_qty, actual_qty, rate, amount
         FROM public.voucher_inventory_entries
         WHERE voucher_id = ANY($1)`,
        [vIds]
      );
      for (const item of itemRes.rows) {
        const vid = String(item.voucher_id);
        if (!itemsByVoucher[vid]) itemsByVoucher[vid] = [];
        itemsByVoucher[vid].push({
          itemName: item.stock_item_name,
          qty: parseFloat(item.billed_qty || item.actual_qty) || 1,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0,
        });
      }
    }

    const formatted = r.rows.map((row: any) => {
      let orig = row.reference;
      if (row.narration) {
        const m = String(row.narration).match(/(INV-\d+|REC-\d+|ORD-\d+|INV\d+|REC\d+|ORD\d+)/i);
        if (m) {
          orig = m[1];
        }
      }
      return {
        id: row.id,
        voucherNumber: row.voucher_number,
        originalVoucherNumber: orig,
        voucherType: row.voucher_type,
        partyName: row.party_name,
        amount: Number(row.total_amount) || 0,
        date: row.date,
        narration: row.narration,
        tallyGuid: row.tally_guid,
        guid: row.guid || row.tally_guid,
        syncStatus: row.sync_status || 'synced',
        reference: row.reference,
        paymentMode: row.payment_mode || 'CASH',
        wasRenamed: Boolean(orig && orig !== row.voucher_number),
        items: itemsByVoucher[String(row.id)] || [],
      };
    });

    return res.status(200).json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/vouchers/mine', async (req: Request, res: Response) => {
  try {
    let cmpId = Number(req.query.cmpId) || 12;
    let userId = Number(req.query.userId || req.query.user_id) || 0;

    const r = userId > 0
      ? await query(
          `SELECT id, voucher_number, voucher_type, date, total_amount, party_name, narration,
                  tally_guid, reference, sync_status, created_at, guid, payment_mode
           FROM public.vouchers
           WHERE cmp_id = $1 AND (user_id = $2 OR created_by_user_id = $2)
           ORDER BY id DESC
           LIMIT 500`,
          [cmpId, userId]
        )
      : await query(
          `SELECT id, voucher_number, voucher_type, date, total_amount, party_name, narration,
                  tally_guid, reference, sync_status, created_at, guid, payment_mode
           FROM public.vouchers
           WHERE cmp_id = $1
           ORDER BY id DESC
           LIMIT 500`,
          [cmpId]
        );

    const vIds = r.rows.map((row: any) => row.id);
    const itemsByVoucher: Record<string, any[]> = {};
    if (vIds.length > 0) {
      const itemRes = await query(
        `SELECT voucher_id, stock_item_name, billed_qty, actual_qty, rate, amount
         FROM public.voucher_inventory_entries
         WHERE voucher_id = ANY($1)`,
        [vIds]
      );
      for (const item of itemRes.rows) {
        const vid = String(item.voucher_id);
        if (!itemsByVoucher[vid]) itemsByVoucher[vid] = [];
        itemsByVoucher[vid].push({
          itemName: item.stock_item_name,
          qty: parseFloat(item.billed_qty || item.actual_qty) || 1,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0,
        });
      }
    }

    const formatted = r.rows.map((row: any) => {
      let orig = row.reference;
      if (row.narration) {
        const m = String(row.narration).match(/(INV-\d+|REC-\d+|ORD-\d+|INV\d+|REC\d+|ORD\d+)/i);
        if (m) {
          orig = m[1];
        }
      }
      return {
        id: row.id,
        voucherNumber: row.voucher_number,
        originalVoucherNumber: orig,
        voucherType: row.voucher_type,
        partyName: row.party_name,
        amount: Number(row.total_amount) || 0,
        date: row.date,
        narration: row.narration,
        tallyGuid: row.tally_guid,
        guid: row.guid || row.tally_guid,
        syncStatus: row.sync_status || 'synced',
        reference: row.reference,
        paymentMode: row.payment_mode || 'CASH',
        wasRenamed: Boolean(orig && orig !== row.voucher_number),
        items: itemsByVoucher[String(row.id)] || [],
      };
    });

    return res.status(200).json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
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

// Van Instructions / Drop Points (Admin Route Guidance)
router.get(['/van-instructions', '/native/van-instructions'], async (req: Request, res: Response) => {
  try {
    const vanId = req.query.vanId ? String(req.query.vanId) : 'van1';
    const salesmanId = req.query.salesmanId ? parseInt(String(req.query.salesmanId), 10) : 7;
    const r = await query(
      `SELECT id, van_id as "vanId", salesman_user_id as "salesmanUserId", sequence_no as "sequenceNo",
              location_name as "locationName", address, latitude, longitude,
              instruction_text as "instructionText", items_to_drop as "itemsToDrop",
              status, created_at as "createdAt", updated_at as "updatedAt"
       FROM public.van_instructions
       WHERE (van_id = $1 OR salesman_user_id = $2 OR $1 = 'all')
       ORDER BY sequence_no ASC`,
      [vanId, salesmanId]
    );
    return res.status(200).json({
      success: true,
      data: r.rows,
      instructions: r.rows,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

router.post(['/van-instructions', '/native/van-instructions'], async (req: Request, res: Response) => {
  try {
    const {
      vanId = 'van1',
      salesmanUserId = 7,
      sequenceNo = 1,
      locationName,
      address = '',
      latitude = 0.0,
      longitude = 0.0,
      instructionText = '',
      itemsToDrop = '',
    } = req.body;

    if (!locationName) {
      return res.status(400).json({ success: false, message: 'Location name is required' });
    }

    const r = await query(
      `INSERT INTO public.van_instructions (
         van_id, salesman_user_id, sequence_no, location_name, address,
         latitude, longitude, instruction_text, items_to_drop, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
       RETURNING id, sequence_no as "sequenceNo", location_name as "locationName"`,
      [vanId, salesmanUserId, sequenceNo, locationName, address, latitude, longitude, instructionText, itemsToDrop]
    );

    return res.status(201).json({
      success: true,
      message: 'Route instruction added successfully',
      data: r.rows[0],
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.patch(['/van-instructions/:id/status', '/native/van-instructions/:id/status', '/van-instructions/:id', '/native/van-instructions/:id'], async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status = 'COMPLETED' } = req.body;
    await query(
      `UPDATE public.van_instructions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, id]
    );
    return res.status(200).json({ success: true, message: 'Instruction status updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
