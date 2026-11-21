import { query } from '../db/pool.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { DoubleEntryService, LedgerEntryItem } from './double-entry.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vansales_pro_enterprise_jwt_super_secret_key_2026!';
const TALLY_API_KEY = process.env.TALLY_API_KEY || 'VB-API-KEY-998877';
const TALLY_USER_ID = process.env.TALLY_USER_ID || 'tally_connector';
const TALLY_PASSWORD = process.env.TALLY_PASSWORD || 'StrongPassword123!';

export class TallyService {
  /**
   * Authenticates Tally TDL connector client or individual Company Admin / User.
   * Enables multi-company support: each company admin authenticates with their own credentials
   * or specifies their companyId / companyCode to sync strictly their company's data.
   */
  static async authenticate(
    userId?: string,
    password?: string,
    apiKey?: string,
    requestedCompanyId?: number | string,
    requestedCompanyCode?: string
  ) {
    if (!userId || !password) {
      return {
        isValid: false,
        message: 'Username/UserId and password are required',
        errorCode: 'INVALID_INPUT',
        data: null,
      };
    }

    const cleanUser = String(userId).trim();

    // 1. Check if authenticating via standard Company Admin / User account
    const userRes = await query(
      `SELECT userid, username, password, email, role, parent_user_id, isactive
       FROM users
       WHERE LOWER(username) = LOWER($1) 
          OR LOWER(email) = LOWER($1)
          OR (LOWER($1) IN ('admin', 'admin1') AND LOWER(username) IN ('admin', 'admin1'))
       ORDER BY userid ASC LIMIT 1`,
      [cleanUser]
    );

    let authenticatedUser: any = null;
    let effectiveCompany: any = null;

    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      let isMatch = false;

      if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = user.password === password;
      }

      if (isMatch) {
        authenticatedUser = user;
        const effectiveAdminId = user.parent_user_id || user.userid;

        // Determine company for this user
        if (requestedCompanyId) {
          const cmpRes = await query(
            `SELECT cmpid, name, code, currency_symbol, currency_formal_name
             FROM companies
             WHERE cmpid = $1 AND (userid = $2 OR userid = $3)
             LIMIT 1`,
            [Number(requestedCompanyId), user.userid, effectiveAdminId]
          );
          if (cmpRes.rows.length > 0) effectiveCompany = cmpRes.rows[0];
        } else if (requestedCompanyCode) {
          const cmpRes = await query(
            `SELECT cmpid, name, code, currency_symbol, currency_formal_name
             FROM companies
             WHERE LOWER(code) = LOWER($1) AND (userid = $2 OR userid = $3)
             LIMIT 1`,
            [String(requestedCompanyCode).trim(), user.userid, effectiveAdminId]
          );
          if (cmpRes.rows.length > 0) effectiveCompany = cmpRes.rows[0];
        }

        // If not explicitly requested or found above, find the user's primary company
        if (!effectiveCompany) {
          const cmpRes = await query(
            `SELECT cmpid, name, code, currency_symbol, currency_formal_name
             FROM companies
             WHERE userid = $1 OR userid = $2
             ORDER BY cmpid ASC
             LIMIT 1`,
            [user.userid, effectiveAdminId]
          );
          if (cmpRes.rows.length > 0) effectiveCompany = cmpRes.rows[0];
        }
      }
    }

    // 2. Check if authenticating via connector credentials
    if (!authenticatedUser) {
      const isConnectorUser = cleanUser === TALLY_USER_ID && password === TALLY_PASSWORD;
      const isKeyValid = apiKey === TALLY_API_KEY;

      if (isConnectorUser && isKeyValid) {
        authenticatedUser = {
          userid: 0,
          username: TALLY_USER_ID,
          role: 'TALLY_CONNECTOR',
        };

        if (requestedCompanyId) {
          const cmpRes = await query(
            `SELECT cmpid, name, code, currency_symbol, currency_formal_name
             FROM companies WHERE cmpid = $1 LIMIT 1`,
            [Number(requestedCompanyId)]
          );
          if (cmpRes.rows.length > 0) effectiveCompany = cmpRes.rows[0];
        } else if (requestedCompanyCode) {
          const cmpRes = await query(
            `SELECT cmpid, name, code, currency_symbol, currency_formal_name
             FROM companies WHERE LOWER(code) = LOWER($1) LIMIT 1`,
            [String(requestedCompanyCode).trim()]
          );
          if (cmpRes.rows.length > 0) effectiveCompany = cmpRes.rows[0];
        }
      }
    }

    if (!authenticatedUser) {
      return {
        isValid: false,
        message: 'Invalid credentials or permissions for Tally sync',
        errorCode: 'AUTH_FAILED',
        data: null,
      };
    }

    // Fallback company if not found (e.g., initial single-company setup)
    if (!effectiveCompany) {
      const defaultCmpId = parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
      const cmpRes = await query(
        `SELECT cmpid, name, code, currency_symbol, currency_formal_name
         FROM companies WHERE cmpid = $1 LIMIT 1`,
        [defaultCmpId]
      );
      effectiveCompany = cmpRes.rows[0] || {
        cmpid: defaultCmpId,
        name: 'Talliffy Enterprise',
        code: process.env.DEFAULT_COMPANY_CODE || '30449',
      };
    }

    const companyId = Number(effectiveCompany.cmpid);
    const companyCode = effectiveCompany.code || '';
    const companyName = effectiveCompany.name || '';
    const userRole = (authenticatedUser.role || 'ADMIN').toUpperCase();

    const token = jwt.sign(
      {
        userId: Number(authenticatedUser.userid),
        username: authenticatedUser.username,
        role: userRole,
        companyId,
        companyCode,
        companyName,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      isValid: true,
      message: `Authenticated successfully for ${companyName} (Company #${companyId})`,
      errorCode: null,
      data: {
        token,
        companyId,
        companyCode,
        companyName,
        userId: Number(authenticatedUser.userid),
        username: authenticatedUser.username,
        role: userRole,
        expiresInSeconds: 3600,
        tokenType: 'Bearer',
      },
    };
  }

  /**
   * Returns Sales Vouchers conforming to contract envelope.
   */
  static async getSalesVouchers(companyId: number, fromDate?: string, toDate?: string, status?: string) {
    let sql = `
      SELECT v.id, v.cmp_id, v.guid, v.voucher_number, v.voucher_date, v.voucher_type,
             v.party_ledger_name, v.party_name, v.narration, v.amount, v.tax_amount,
             v.round_off_amount, v.sync_status, v.sync_error_message
      FROM vouchers v
      WHERE v.cmp_id = $1 AND v.voucher_type IN ('Sales', 'SALES')
    `;
    const params: any[] = [companyId];

    if (fromDate) {
      params.push(fromDate);
      sql += ` AND v.voucher_date >= $${params.length}`;
    }
    if (toDate) {
      params.push(toDate);
      sql += ` AND v.voucher_date <= $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND v.sync_status = $${params.length}`;
    }

    sql += ` ORDER BY v.voucher_date ASC, v.id ASC`;

    const vRes = await query(sql, params);
    const validVouchers: any[] = [];
    const quarantinedErrors: any[] = [];

    for (const v of vRes.rows) {
      // Fetch ledger entries
      const lRes = await query(
        `SELECT ledger_name, dr_cr, amount, is_party_ledger
         FROM voucher_ledger_entries
         WHERE voucher_id = $1
         ORDER BY id ASC`,
        [v.id]
      );

      // Fetch inventory entries
      const iRes = await query(
        `SELECT stock_item_name, godown_name, actual_qty as quantity, uom as unit, rate, amount
         FROM voucher_inventory_entries
         WHERE voucher_id = $1
         ORDER BY id ASC`,
        [v.id]
      );

      const ledgerEntries: LedgerEntryItem[] = lRes.rows.map((row) => ({
        ledgerName: row.ledger_name,
        entryType: (row.dr_cr === 'DR' ? 'DEBIT' : 'CREDIT') as 'DEBIT' | 'CREDIT',
        amount: parseFloat(row.amount),
        isParty: Boolean(row.is_party_ledger),
      }));

      // Double-entry check
      const balanceCheck = DoubleEntryService.evaluateBalance(ledgerEntries);

      if (!balanceCheck.isBalanced) {
        quarantinedErrors.push({
          guid: v.guid,
          voucherNumber: v.voucher_number,
          voucherDate: v.voucher_date,
          errorCode: 'IMBALANCE',
          errorMessage: balanceCheck.errorMessage || 'Debit and Credit totals do not balance',
          debitTotal: ledgerEntries.filter(e => e.entryType === 'DEBIT').reduce((s, e) => s + e.amount, 0),
          creditTotal: ledgerEntries.filter(e => e.entryType === 'CREDIT').reduce((s, e) => s + e.amount, 0),
        });
        continue;
      }

      validVouchers.push({
        guid: v.guid,
        voucherNumber: v.voucher_number,
        voucherDate: v.voucher_date,
        voucherType: 'Sales',
        partyLedgerName: v.party_ledger_name,
        narration: v.narration || 'Van Sales Invoice',
        grossAmount: parseFloat(v.amount) - (parseFloat(v.tax_amount) || 0),
        taxAmount: parseFloat(v.tax_amount) || 0,
        roundOffAmount: parseFloat(v.round_off_amount) || 0,
        netAmount: parseFloat(v.amount),
        ledgerEntries: balanceCheck.roundedEntries,
        inventoryEntries: iRes.rows.map((row) => ({
          stockItemName: row.stock_item_name,
          godownName: row.godown_name,
          quantity: parseFloat(row.quantity),
          unit: row.unit || 'Nos',
          rate: parseFloat(row.rate),
          amount: parseFloat(row.amount),
        })),
      });
    }

    return {
      isValid: true,
      message: 'Sales vouchers retrieved successfully',
      errorCode: null,
      data: {
        totalRecords: validVouchers.length,
        vouchers: validVouchers,
        errors: quarantinedErrors,
      },
    };
  }

  /**
   * Returns Receipt Vouchers conforming to contract envelope.
   */
  static async getReceiptVouchers(companyId: number, fromDate?: string, toDate?: string) {
    let sql = `
      SELECT v.id, v.cmp_id, v.guid, v.voucher_number, v.voucher_date, v.voucher_type,
             v.party_ledger_name, v.narration, v.amount, v.payment_mode
      FROM vouchers v
      WHERE v.cmp_id = $1 AND v.voucher_type IN ('Receipt', 'RECEIPT')
    `;
    const params: any[] = [companyId];

    if (fromDate) {
      params.push(fromDate);
      sql += ` AND v.voucher_date >= $${params.length}`;
    }
    if (toDate) {
      params.push(toDate);
      sql += ` AND v.voucher_date <= $${params.length}`;
    }

    sql += ` ORDER BY v.voucher_date ASC, v.id ASC`;

    const vRes = await query(sql, params);
    const vouchers: any[] = [];

    for (const v of vRes.rows) {
      const lRes = await query(
        `SELECT ledger_name, dr_cr, amount, is_party_ledger
         FROM voucher_ledger_entries
         WHERE voucher_id = $1
         ORDER BY id ASC`,
        [v.id]
      );

      vouchers.push({
        guid: v.guid,
        voucherNumber: v.voucher_number,
        voucherDate: v.voucher_date,
        voucherType: 'Receipt',
        partyLedgerName: v.party_ledger_name,
        paymentMode: v.payment_mode || 'CASH',
        amount: parseFloat(v.amount),
        narration: v.narration || 'Payment Collection',
        ledgerEntries: lRes.rows.map(r => ({
          ledgerName: r.ledger_name,
          entryType: r.dr_cr === 'DR' ? 'DEBIT' : 'CREDIT',
          amount: parseFloat(r.amount),
          isParty: Boolean(r.is_party_ledger)
        }))
      });
    }

    return {
      isValid: true,
      message: 'Receipt vouchers retrieved successfully',
      errorCode: null,
      data: {
        totalRecords: vouchers.length,
        vouchers,
        errors: [],
      },
    };
  }

  /**
   * Master Customer List
   */
  static async getCustomers(companyId: number) {
    const res = await query(
      `SELECT ledid as id, led_name as name, guid, led_closing_balance as balance,
              led_mobile as mobile, led_phone as phone, led_email as email,
              led_address_1 as address, vat_tin_number as trn
       FROM ledgers
       WHERE cmpid = $1 AND (led_parent ILIKE '%Debtor%' OR led_primary_group ILIKE '%Debtor%')
       ORDER BY led_name ASC`,
      [companyId]
    );

    return {
      isValid: true,
      message: 'Customer master retrieved successfully',
      errorCode: null,
      data: {
        totalRecords: res.rows.length,
        customers: res.rows.map(r => ({
          id: r.id,
          name: r.name,
          guid: r.guid,
          balance: parseFloat(r.balance) || 0.00,
          mobile: r.mobile,
          phone: r.phone,
          email: r.email,
          address: r.address,
          trn: r.trn,
        })),
      },
    };
  }

  /**
   * Master Stock Items
   */
  static async getStockItems(companyId: number) {
    const res = await query(
      `SELECT stockitem_id as id, name, guid, base_units as unit, category, hsn_code
       FROM stock_items
       WHERE cmpid = $1 AND (is_deleted IS NULL OR is_deleted = false)
       ORDER BY name ASC`,
      [companyId]
    );

    return {
      isValid: true,
      message: 'Stock items retrieved successfully',
      errorCode: null,
      data: {
        totalRecords: res.rows.length,
        stockItems: res.rows.map(r => ({
          id: r.id,
          name: r.name,
          guid: r.guid,
          unit: r.unit || 'Nos',
          category: r.category,
          hsnCode: r.hsn_code,
          taxPercent: 5.00,
        })),
      },
    };
  }

  /**
   * Master Godowns
   */
  static async getGodowns(companyId: number) {
    const res = await query(
      `SELECT godown_id as id, name, guid, address
       FROM godowns
       WHERE cmpid = $1 AND (is_deleted IS NULL OR is_deleted = false)
       ORDER BY name ASC`,
      [companyId]
    );

    return {
      isValid: true,
      message: 'Godowns retrieved successfully',
      errorCode: null,
      data: {
        totalRecords: res.rows.length,
        godowns: res.rows,
      },
    };
  }

  /**
   * Import / Upsert Godowns from Tally
   */
  static async importGodowns(companyId: number, godowns: Array<{ name: string; guid?: string; address?: string; isVan?: boolean }>) {
    if (!Array.isArray(godowns) || godowns.length === 0) {
      return { isValid: false, message: 'No godowns provided', errorCode: 'EMPTY_PAYLOAD', data: null };
    }

    let inserted = 0;
    let updated = 0;

    for (const g of godowns) {
      if (!g.name || !g.name.trim()) continue;
      const cleanName = g.name.trim();

      const existing = await query(
        `SELECT godown_id FROM godowns WHERE cmpid = $1 AND LOWER(name) = LOWER($2) LIMIT 1`,
        [companyId, cleanName]
      );

      if (existing.rows.length > 0) {
        await query(
          `UPDATE godowns 
           SET guid = COALESCE($1, guid), address = COALESCE($2, address), is_deleted = false, updated_at = CURRENT_TIMESTAMP
           WHERE godown_id = $3`,
          [g.guid || `GODOWN-${cleanName.replace(/\s+/g, '-').toUpperCase()}`, g.address || '', existing.rows[0].godown_id]
        );
        updated++;
      } else {
        await query(
          `INSERT INTO godowns (cmpid, userid, name, guid, address, is_deleted, created_at, updated_at)
           VALUES ($1, 1, $2, $3, $4, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            companyId,
            cleanName,
            g.guid || `GODOWN-${cleanName.replace(/\s+/g, '-').toUpperCase()}`,
            g.address || (g.isVan ? 'Mobile Van Distribution Godown' : 'Main Depot Storage')
          ]
        );
        inserted++;
      }
    }

    return {
      isValid: true,
      message: `Godowns synced: ${inserted} created, ${updated} updated`,
      errorCode: null,
      data: { inserted, updated, totalProcessed: godowns.length }
    };
  }

  /**
   * Import / Upsert Ledgers (Parties & Accounts) from Tally
   */
  static async importLedgers(companyId: number, ledgers: Array<{
    name: string;
    parent?: string;
    openingBalance?: number;
    closingBalance?: number;
    gstin?: string;
    mobile?: string;
    email?: string;
    address?: string;
    guid?: string;
  }>) {
    if (!Array.isArray(ledgers) || ledgers.length === 0) {
      return { isValid: false, message: 'No ledgers provided', errorCode: 'EMPTY_PAYLOAD', data: null };
    }

    let inserted = 0;
    let updated = 0;

    // Find default Debtors and Creditors group IDs for fallback
    const debtorsGrp = await query(
      `SELECT grpid FROM groups WHERE cmpid = $1 AND (grp_name ILIKE '%Debtor%' OR grp_primary_group ILIKE '%Debtor%') LIMIT 1`,
      [companyId]
    );
    const creditorsGrp = await query(
      `SELECT grpid FROM groups WHERE cmpid = $1 AND (grp_name ILIKE '%Creditor%' OR grp_primary_group ILIKE '%Creditor%') LIMIT 1`,
      [companyId]
    );

    const defaultDebtorGrpId = debtorsGrp.rows[0]?.grpid || 107;
    const defaultCreditorGrpId = creditorsGrp.rows[0]?.grpid || 112;

    for (const l of ledgers) {
      if (!l.name || !l.name.trim()) continue;
      const cleanName = l.name.trim();
      const parentName = l.parent?.trim() || 'Sundry Debtors';
      const isDebtor = parentName.toLowerCase().includes('debtor');
      const isCreditor = parentName.toLowerCase().includes('creditor');
      const grpId = isCreditor ? defaultCreditorGrpId : defaultDebtorGrpId;

      const existing = await query(
        `SELECT ledid FROM ledgers WHERE cmpid = $1 AND LOWER(led_name) = LOWER($2) LIMIT 1`,
        [companyId, cleanName]
      );

      const openBal = typeof l.openingBalance === 'number' ? l.openingBalance : 0.00;
      const closeBal = typeof l.closingBalance === 'number' ? l.closingBalance : openBal;
      const guid = l.guid || `LED-${companyId}-${cleanName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15).toUpperCase()}`;

      if (existing.rows.length > 0) {
        await query(
          `UPDATE ledgers 
           SET led_parent = $1, led_primary_group = $1, led_opening_balance = $2, led_closing_balance = $3,
               gst_gstin = COALESCE($4, gst_gstin), led_mobile = COALESCE($5, led_mobile),
               led_email = COALESCE($6, led_email), led_address_1 = COALESCE($7, led_address_1),
               guid = COALESCE($8, guid), sync_status = 'SYNCED', updated_at = CURRENT_TIMESTAMP
           WHERE ledid = $9`,
          [parentName, openBal, closeBal, l.gstin || null, l.mobile || '', l.email || '', l.address || '', guid, existing.rows[0].ledid]
        );
        updated++;
      } else {
        await query(
          `INSERT INTO ledgers (
             cmpid, userid, grpid, guid, led_code, led_name, led_mailing_name,
             led_parent, led_primary_group, last_parent, led_opening_balance, led_closing_balance,
             is_active, is_deleted, is_revenue, led_billwise_on, gst_applicable, gst_gstin,
             led_mobile, led_email, led_address_1, sync_status, created_at, updated_at
           )
           VALUES (
             $1, 1, $2, $3, $4, $5, $5,
             $6, $6, $6, $7, $8,
             true, false, false, true, true, $9,
             $10, $11, $12, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
           )`,
          [
            companyId,
            grpId,
            guid,
            `C-${Math.floor(1000 + Math.random() * 9000)}`,
            cleanName,
            parentName,
            openBal,
            closeBal,
            l.gstin || null,
            l.mobile || '',
            l.email || '',
            l.address || ''
          ]
        );
        inserted++;
      }
    }

    return {
      isValid: true,
      message: `Ledgers synced: ${inserted} created, ${updated} updated`,
      errorCode: null,
      data: { inserted, updated, totalProcessed: ledgers.length }
    };
  }

  /**
   * Import / Upsert Stock Items from Tally
   */
  static async importStockItems(companyId: number, stockItems: Array<{
    name: string;
    unit?: string;
    category?: string;
    hsnCode?: string;
    openingBalance?: number;
    openingRate?: number;
    openingValue?: number;
    guid?: string;
  }>) {
    if (!Array.isArray(stockItems) || stockItems.length === 0) {
      return { isValid: false, message: 'No stock items provided', errorCode: 'EMPTY_PAYLOAD', data: null };
    }

    let inserted = 0;
    let updated = 0;

    for (const item of stockItems) {
      if (!item.name || !item.name.trim()) continue;
      const cleanName = item.name.trim();

      const existing = await query(
        `SELECT stockitem_id FROM stock_items WHERE cmpid = $1 AND LOWER(name) = LOWER($2) LIMIT 1`,
        [companyId, cleanName]
      );

      const guid = item.guid || `ITEM-${companyId}-${cleanName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15).toUpperCase()}`;

      if (existing.rows.length > 0) {
        await query(
          `UPDATE stock_items
           SET base_units = COALESCE($1, base_units), category = COALESCE($2, category),
               hsn_code = COALESCE($3, hsn_code), opening_balance = COALESCE($4, opening_balance),
               opening_rate = COALESCE($5, opening_rate), opening_value = COALESCE($6, opening_value),
               guid = COALESCE($7, guid), is_deleted = false, updated_at = CURRENT_TIMESTAMP
           WHERE stockitem_id = $8`,
          [
            item.unit || 'Nos',
            item.category || 'General',
            item.hsnCode || null,
            item.openingBalance || 0,
            item.openingRate || 0,
            item.openingValue || 0,
            guid,
            existing.rows[0].stockitem_id
          ]
        );
        updated++;
      } else {
        await query(
          `INSERT INTO stock_items (
             cmpid, userid, name, guid, base_units, category, hsn_code,
             opening_balance, opening_rate, opening_value, is_deleted, created_at, updated_at
           )
           VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            companyId,
            cleanName,
            guid,
            item.unit || 'Nos',
            item.category || 'General',
            item.hsnCode || null,
            item.openingBalance || 0,
            item.openingRate || 0,
            item.openingValue || 0
          ]
        );
        inserted++;
      }
    }

    return {
      isValid: true,
      message: `Stock items synced: ${inserted} created, ${updated} updated`,
      errorCode: null,
      data: { inserted, updated, totalProcessed: stockItems.length }
    };
  }

  /**
   * Unified Master Import (Godowns, Parties/Ledgers, Stock Items in one batch)
   */
  static async importMasters(companyId: number, payload: {
    godowns?: any[];
    ledgers?: any[];
    stockItems?: any[];
  }) {
    const results: any = {};

    if (payload.godowns && Array.isArray(payload.godowns)) {
      results.godowns = await this.importGodowns(companyId, payload.godowns);
    }
    if (payload.ledgers && Array.isArray(payload.ledgers)) {
      results.ledgers = await this.importLedgers(companyId, payload.ledgers);
    }
    if (payload.stockItems && Array.isArray(payload.stockItems)) {
      results.stockItems = await this.importStockItems(companyId, payload.stockItems);
    }

    return {
      isValid: true,
      message: 'Tally masters import completed',
      errorCode: null,
      data: results
    };
  }

  /**
   * Acknowledge Vouchers imported into Tally
   */
  static async acknowledgeVouchers(companyId: number, vouchers: Array<{
    voucherNumber?: string;
    guid?: string;
    tallyGuid?: string;
    status?: 'SYNCED' | 'FAILED_VALIDATION' | 'READY';
    errorMessage?: string;
  }>) {
    if (!Array.isArray(vouchers) || vouchers.length === 0) {
      return { isValid: false, message: 'No vouchers provided for acknowledgement', errorCode: 'EMPTY_PAYLOAD', data: null };
    }

    let updatedCount = 0;
    for (const v of vouchers) {
      const vNum = v.voucherNumber?.trim();
      const guid = v.guid?.trim();
      const tallyGuid = v.tallyGuid?.trim() || null;
      const status = v.status || 'SYNCED';
      const errMsg = v.errorMessage || null;

      if (!vNum && !guid) continue;

      const res = await query(
        `UPDATE vouchers 
         SET sync_status = $1, 
             tally_sync_status = CASE WHEN $1 = 'SYNCED' THEN 'synced' ELSE 'failed' END,
             tally_guid = COALESCE($2, tally_guid),
             sync_error_message = COALESCE($3, sync_error_message),
             updated_at = CURRENT_TIMESTAMP
         WHERE cmp_id = $4 AND (voucher_number = $5 OR guid = $6)`,
        [status, tallyGuid, errMsg, companyId, vNum || '', guid || '']
      );
      if ((res.rowCount || 0) > 0) updatedCount += res.rowCount || 0;
    }

    return {
      isValid: true,
      message: `Successfully acknowledged ${updatedCount} voucher(s)`,
      errorCode: null,
      data: { updatedCount, totalProcessed: vouchers.length }
    };
  }

  /**
   * Generates standard Tally XML envelope for Sales & Receipt vouchers
   */
  static async exportVouchersXml(companyId: number, fromDate?: string, toDate?: string): Promise<string> {
    const salesResult = await this.getSalesVouchers(companyId, fromDate, toDate, 'READY');
    const vouchers = salesResult.data?.vouchers || [];

    let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
    xml += `<ENVELOPE>\n  <HEADER>\n    <TALLYREQUEST>Import Data</TALLYREQUEST>\n  </HEADER>\n  <BODY>\n    <IMPORTDATA>\n      <REQUESTDESC>\n        <REPORTNAME>Vouchers</REPORTNAME>\n      </REQUESTDESC>\n      <REQUESTDATA>\n`;

    for (const v of vouchers) {
      const dateFormatted = (v.voucherDate || '').replace(/-/g, '').slice(0, 8);
      xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">\n`;
      xml += `          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Invoice Voucher View">\n`;
      xml += `            <DATE>${dateFormatted || '20261113'}</DATE>\n`;
      xml += `            <GUID>${v.guid || ''}</GUID>\n`;
      xml += `            <VOUCHERNUMBER>${v.voucherNumber}</VOUCHERNUMBER>\n`;
      xml += `            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>\n`;
      xml += `            <PARTYLEDGERNAME>${v.partyLedgerName}</PARTYLEDGERNAME>\n`;
      xml += `            <NARRATION>${v.narration || 'Talliffy Van Sales'}</NARRATION>\n`;
      xml += `            <PERSISTEDVIEW>Invoice View</PERSISTEDVIEW>\n`;

      // Party Ledger Entry (Debit)
      xml += `            <ALLLEDGERENTRIES.LIST>\n`;
      xml += `              <LEDGERNAME>${v.partyLedgerName}</LEDGERNAME>\n`;
      xml += `              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>\n`;
      xml += `              <AMOUNT>-${v.netAmount.toFixed(2)}</AMOUNT>\n`;
      xml += `            </ALLLEDGERENTRIES.LIST>\n`;

      // Non-party Ledger Entries (Credit)
      for (const l of v.ledgerEntries || []) {
        if (l.isParty) continue;
        xml += `            <ALLLEDGERENTRIES.LIST>\n`;
        xml += `              <LEDGERNAME>${l.ledgerName}</LEDGERNAME>\n`;
        xml += `              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>\n`;
        xml += `              <AMOUNT>${l.amount.toFixed(2)}</AMOUNT>\n`;
        xml += `            </ALLLEDGERENTRIES.LIST>\n`;
      }

      // Inventory entries with Godowns
      for (const item of v.inventoryEntries || []) {
        xml += `            <ALLINVENTORYENTRIES.LIST>\n`;
        xml += `              <STOCKITEMNAME>${item.stockItemName}</STOCKITEMNAME>\n`;
        xml += `              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>\n`;
        xml += `              <RATE>${item.rate.toFixed(2)}/${item.unit || 'Nos'}</RATE>\n`;
        xml += `              <AMOUNT>${item.amount.toFixed(2)}</AMOUNT>\n`;
        xml += `              <ACTUALQTY>${item.quantity} ${item.unit || 'Nos'}</ACTUALQTY>\n`;
        xml += `              <BILLEDQTY>${item.quantity} ${item.unit || 'Nos'}</BILLEDQTY>\n`;
        xml += `              <BATCHALLOCATIONS.LIST>\n`;
        xml += `                <GODOWNNAME>${item.godownName || 'Van 01 Godown'}</GODOWNNAME>\n`;
        xml += `                <BATCHNAME>Primary Batch</BATCHNAME>\n`;
        xml += `                <AMOUNT>${item.amount.toFixed(2)}</AMOUNT>\n`;
        xml += `                <ACTUALQTY>${item.quantity} ${item.unit || 'Nos'}</ACTUALQTY>\n`;
        xml += `                <BILLEDQTY>${item.quantity} ${item.unit || 'Nos'}</BILLEDQTY>\n`;
        xml += `              </BATCHALLOCATIONS.LIST>\n`;
        xml += `            </ALLINVENTORYENTRIES.LIST>\n`;
      }

      xml += `          </VOUCHER>\n`;
      xml += `        </TALLYMESSAGE>\n`;
    }

    xml += `      </REQUESTDATA>\n    </IMPORTDATA>\n  </BODY>\n</ENVELOPE>`;
    return xml;
  }
}
