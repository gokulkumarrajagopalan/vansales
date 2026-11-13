import { Request, Response } from 'express';
import { pool, query } from '../db/pool.js';
import { DoubleEntryService, LedgerEntryItem } from '../services/double-entry.service.js';
import { amountToWords } from '../utils/numberToWords.js';

export class InvoiceController {
  static async createInvoice(req: Request, res: Response) {
    const client = await pool.connect();
    try {
      const user = req.user!;
      const companyId = req.companyId || 12;
      const {
        customerId,
        customerName,
        paymentMode = 'CASH',
        items = [],
        narration,
        latitude,
        longitude,
        voucherNumber,
        date,
        invoiceDate,
        referenceNumber,
        source = 'VAN',
        godownName: bodyGodownName,
        skipRoundOff = false,
        subtotal: bodySubtotal,
        taxTotal: bodyTaxTotal,
        netTotal: bodyNetTotal,
        journalEntries: bodyJournalEntries,
      } = req.body;

      const hasItems = Array.isArray(items) && items.length > 0;
      const hasJournals = Array.isArray(bodyJournalEntries) && bodyJournalEntries.length >= 2;
      if (!customerName || (!hasItems && !hasJournals)) {
        return res.status(400).json({
          isValid: false,
          message: 'Customer name and line items (or balanced journal entries) are required',
          errorCode: 'INVALID_INPUT',
          data: null,
        });
      }

      const rawDateInput = typeof (invoiceDate || date) === 'string' ? String(invoiceDate || date).slice(0, 10) : '';
      const voucherDateStr = /^\d{4}-\d{2}-\d{2}$/.test(rawDateInput)
        ? rawDateInput
        : new Date().toISOString().slice(0, 10);
      const normalizedSource = String(source || 'VAN').toUpperCase();
      const normalizedPayMode = String(paymentMode || 'CASH').toUpperCase();

      // Idempotent check if client supplied an explicit voucherNumber
      if (voucherNumber && typeof voucherNumber === 'string' && voucherNumber.trim()) {
        const dupRes = await client.query(
          `SELECT id, guid, voucher_number, TO_CHAR(voucher_date, 'YYYY-MM-DD') as voucher_date,
                  party_ledger_name, amount, tax_amount, round_off_amount, payment_mode, sync_status
           FROM vouchers
           WHERE cmp_id = $1 AND voucher_number = $2 AND voucher_type IN ('Sales', 'SALES')
           ORDER BY id DESC LIMIT 1`,
          [companyId, voucherNumber.trim()]
        );
        if (dupRes.rows.length > 0) {
          const ex = dupRes.rows[0];
          return res.status(200).json({
            isValid: true,
            message: 'Sales invoice already synced',
            errorCode: null,
            data: {
              id: ex.id,
              guid: ex.guid,
              invoiceNumber: ex.voucher_number,
              invoiceDate: ex.voucher_date,
              customerName: ex.party_ledger_name,
              paymentMode: ex.payment_mode,
              vatAmount: parseFloat(ex.tax_amount) || 0,
              roundOff: parseFloat(ex.round_off_amount) || 0,
              netTotal: parseFloat(ex.amount) || 0,
              syncStatus: ex.sync_status,
              alreadySynced: true,
            },
          });
        }
      }

      // Find active shift
      const shiftRes = await client.query(
        `SELECT id, godown_name FROM van_shift WHERE salesman_user_id = $1 AND ended_at IS NULL ORDER BY id DESC LIMIT 1`,
        [user.userId]
      );
      const shiftId = shiftRes.rows.length > 0 ? shiftRes.rows[0].id : null;
      const godownName =
        (typeof bodyGodownName === 'string' && bodyGodownName.trim()) ||
        (shiftRes.rows.length > 0 ? shiftRes.rows[0].godown_name : null) ||
        user.godownName ||
        'Van 01 Godown';

      // Fetch ledger mappings
      const ledgerMappings = await DoubleEntryService.getLedgerMappings(companyId);
      const salesLedger = ledgerMappings.SALES || 'Sales Account';
      const vatLedger = ledgerMappings.VAT_OUTPUT || 'Output VAT 5%';
      const roundOffLedger = ledgerMappings.ROUND_OFF || 'Round Off (+/-)';

      // Calculate totals
      let taxableSubtotal = 0;
      let totalVat = 0;

      const processedItems = (items || []).map((item: any) => {
        const qty = parseFloat(item.qty ?? item.quantity) || 1;
        const rate = parseFloat(item.unitPrice ?? item.rate) || 0;
        const discountPct = parseFloat(item.discountPercent) || 0;
        const gross = Math.round(qty * rate * 100) / 100;
        const discountAmt = Math.round(gross * (discountPct / 100) * 100) / 100;
        const taxable = Math.round((gross - discountAmt) * 100) / 100;
        const rawTax = item.taxPercent ?? item.taxRate;
        const parsedTax = rawTax !== undefined && rawTax !== null && rawTax !== '' ? parseFloat(rawTax) : NaN;
        const taxRate = !isNaN(parsedTax) ? parsedTax : 5.0;
        const lineVat =
          item.taxAmount !== undefined && !isNaN(Number(item.taxAmount))
            ? Math.round(Number(item.taxAmount) * 100) / 100
            : Math.round(taxable * (taxRate / 100) * 100) / 100;
        const lineNet = Math.round((taxable + lineVat) * 100) / 100;

        taxableSubtotal += taxable;
        totalVat += lineVat;

        return {
          stockItemId: item.stockItemId || item.itemId,
          stockItemName: item.stockItemName || item.itemName || 'Stock Item',
          qty,
          unit: item.unit || item.unitId || 'Nos',
          rate,
          discountPercent: discountPct,
          gross,
          discountAmt,
          taxable,
          taxRate,
          lineVat,
          lineNet,
        };
      });

      const explicitTotals =
        bodyNetTotal !== undefined && !isNaN(Number(bodyNetTotal)) && Number(bodyNetTotal) > 0;
      taxableSubtotal = explicitTotals && bodySubtotal !== undefined && !isNaN(Number(bodySubtotal))
        ? Math.round(Number(bodySubtotal) * 100) / 100
        : Math.round(taxableSubtotal * 100) / 100;
      totalVat = explicitTotals && bodyTaxTotal !== undefined && !isNaN(Number(bodyTaxTotal))
        ? Math.round(Number(bodyTaxTotal) * 100) / 100
        : Math.round(totalVat * 100) / 100;
      let netTotal = explicitTotals
        ? Math.round(Number(bodyNetTotal) * 100) / 100
        : Math.round((taxableSubtotal + totalVat) * 100) / 100;
      let roundOffAmt = 0;

      // 0.25 AED cash round-off logic for CASH mode (skipped for explicit webapp INR totals)
      if (!skipRoundOff && !explicitTotals && normalizedPayMode === 'CASH') {
        const roundedCash = Math.round(netTotal * 4) / 4;
        roundOffAmt = Math.round((roundedCash - netTotal) * 100) / 100;
        netTotal = roundedCash;
      }

      // Generate or use supplied invoice number
      const dateStr = voucherDateStr.replace(/-/g, '');
      let invNum = typeof voucherNumber === 'string' && voucherNumber.trim() ? voucherNumber.trim() : '';
      if (!invNum) {
        const countRes = await client.query(
          `SELECT COUNT(*) as cnt FROM vouchers WHERE cmp_id = $1 AND voucher_type IN ('Sales', 'SALES')`,
          [companyId]
        );
        invNum = `INV-${dateStr}-${String(parseInt(countRes.rows[0].cnt, 10) + 1).padStart(4, '0')}`;
      }

      // Begin atomic transaction
      await client.query('BEGIN');

      // Insert Voucher record
      const tempGuid = `TEMP-SAL-${Date.now()}`;
      const voucherRes = await client.query(
        `INSERT INTO vouchers (
           cmp_id, user_id, voucher_date, voucher_type, voucher_number,
           party_ledger_name, party_name, reference, narration, amount, tax_amount, round_off_amount,
           payment_mode, entry_latitude, entry_longitude, guid, sync_status,
           source, created_by_user_id, shift_id, created_at
         )
         VALUES (
           $1, $2, $3::date, 'Sales', $4,
           $5, $6, $7, $8, $9, $10, $11,
           $12, $13, $14, $15, 'READY',
           $16, $17, $18, CURRENT_TIMESTAMP
         )
         RETURNING id`,
        [
          companyId,
          user.userId,
          voucherDateStr,
          invNum,
          customerName,
          customerName,
          referenceNumber || null,
          narration || `Van Sales Invoice by ${user.fullName || user.username}`,
          netTotal,
          totalVat,
          roundOffAmt,
          normalizedPayMode,
          latitude || null,
          longitude || null,
          tempGuid,
          normalizedSource,
          user.userId,
          shiftId,
        ]
      );

      const voucherId = voucherRes.rows[0].id;
      const permanentGuid = DoubleEntryService.generateVoucherGuid('VB-SAL', companyId, shiftId || 1, voucherId);

      // Update GUID to permanent format
      await client.query(`UPDATE vouchers SET guid = $1 WHERE id = $2`, [permanentGuid, voucherId]);

      // Insert line items in voucher_inventory_entries
      for (const item of processedItems) {
        await client.query(
          `INSERT INTO voucher_inventory_entries (
             voucher_id, cmp_id, stock_item_name, godown_name, actual_qty, billed_qty,
             uom, rate, discount, amount, voucher_guid, voucher_number, voucher_type,
             voucher_date, created_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Sales', $13::date, CURRENT_TIMESTAMP)`,
          [
            voucherId,
            companyId,
            item.stockItemName,
            godownName,
            item.qty,
            item.qty,
            item.unit,
            item.rate,
            item.discountPercent,
            item.taxable,
            permanentGuid,
            invNum,
            voucherDateStr,
          ]
        );
      }

      // Build Ledger Entries (Double-Entry Engine)
      const ledgerEntries: LedgerEntryItem[] = hasJournals
        ? bodyJournalEntries
            .filter((j: any) => (Number(j.debit) || 0) > 0 || (Number(j.credit) || 0) > 0)
            .map((j: any) => ({
              ledgerName: j.ledgerName || 'General Ledger',
              entryType: (Number(j.debit) || 0) >= (Number(j.credit) || 0) ? 'DEBIT' : 'CREDIT',
              amount: Math.max(Number(j.debit) || 0, Number(j.credit) || 0),
              isParty:
                (j.ledgerName || '').toLowerCase().includes('receivable') ||
                (j.ledgerName || '').toLowerCase() === customerName.toLowerCase(),
            }))
        : [
            // Debit side: Party ledger (if credit/bank) or Cash ledger
            {
              ledgerName:
                normalizedPayMode === 'CASH' ? ledgerMappings.CASH || 'Cash' : customerName,
              entryType: 'DEBIT',
              amount: netTotal,
              isParty: true,
            },
            // Credit side: Sales Account (Taxable Gross)
            {
              ledgerName: salesLedger,
              entryType: 'CREDIT',
              amount: taxableSubtotal,
              isParty: false,
            },
            // Credit side: Output VAT
            ...(totalVat > 0
              ? [
                  {
                    ledgerName: vatLedger,
                    entryType: 'CREDIT' as const,
                    amount: totalVat,
                    isParty: false,
                  },
                ]
              : []),
          ];

      // Validate & Auto-Balance
      const balanceCheck = DoubleEntryService.evaluateBalance(ledgerEntries, roundOffLedger, 0.20);

      // Insert balanced ledger entries into voucher_ledger_entries
      let entryIdx = 0;
      for (const entry of balanceCheck.roundedEntries) {
        await client.query(
          `INSERT INTO voucher_ledger_entries (
             voucher_id, cmp_id, ledger_name, dr_cr, amount, is_party_ledger,
             voucher_guid, voucher_number, voucher_type, voucher_date, entry_index, created_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Sales', $9::date, $10, CURRENT_TIMESTAMP)`,
          [
            voucherId,
            companyId,
            entry.ledgerName,
            entry.entryType === 'DEBIT' ? 'DR' : 'CR',
            entry.amount,
            entry.isParty,
            permanentGuid,
            invNum,
            voucherDateStr,
            entryIdx++,
          ]
        );
      }

      // If imbalance exceeded tolerance, mark quarantine
      if (!balanceCheck.isBalanced) {
        await client.query(
          `UPDATE vouchers SET sync_status = 'FAILED_VALIDATION', sync_error_message = $1 WHERE id = $2`,
          [balanceCheck.errorMessage, voucherId]
        );
      }

      // Commit transaction
      await client.query('COMMIT');

      const inWords = amountToWords(netTotal, normalizedSource === 'WEB_APP' ? 'INR' : 'AED');

      return res.status(201).json({
        isValid: true,
        message: 'Sales invoice created successfully',
        errorCode: null,
        data: {
          id: voucherId,
          guid: permanentGuid,
          invoiceNumber: invNum,
          invoiceDate: voucherDateStr,
          customerName,
          paymentMode: normalizedPayMode,
          source: normalizedSource,
          godownName,
          subtotal: taxableSubtotal,
          vatAmount: totalVat,
          roundOff: roundOffAmt,
          netTotal,
          amountInWords: inWords,
          syncStatus: balanceCheck.isBalanced ? 'READY' : 'FAILED_VALIDATION',
          items: processedItems,
          journalEntries: balanceCheck.roundedEntries,
        },
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('[Create Invoice Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    } finally {
      client.release();
    }
  }

  static async getInvoices(req: Request, res: Response) {
    try {
      const companyId = req.companyId || 12;
      const { limit = 100, offset = 0, shiftId, includeTally = 'false', source } = req.query;

      let sql = `
        SELECT v.id, v.guid, v.voucher_number, TO_CHAR(v.voucher_date, 'YYYY-MM-DD') as voucher_date,
               v.party_ledger_name, v.reference, v.narration, v.amount, v.tax_amount, v.round_off_amount,
               v.payment_mode, COALESCE(v.source, 'VAN') as source, v.sync_status, v.created_at,
               COALESCE(v.created_by_user_id, v.user_id) as creator_id,
               u.username as creator_username, u.full_name as creator_name, u.van_godown_name as creator_godown
        FROM vouchers v
        LEFT JOIN users u ON u.userid = COALESCE(v.created_by_user_id, v.user_id)
        WHERE v.cmp_id = $1 AND v.voucher_type IN ('Sales', 'SALES')
      `;
      const params: any[] = [companyId];

      if (includeTally !== 'true') {
        if (source && typeof source === 'string' && source.trim()) {
          params.push(source.trim().toUpperCase());
          sql += ` AND UPPER(COALESCE(v.source, 'VAN')) = $${params.length}`;
        } else {
          sql += ` AND UPPER(COALESCE(v.source, 'VAN')) IN ('VAN', 'WEB_APP', 'MOBILE')`;
        }
      }

      if (shiftId) {
        params.push(parseInt(shiftId as string, 10));
        sql += ` AND v.shift_id = $${params.length}`;
      }

      // Role-based van isolation: van salesmen only see invoices they created
      const role = (req.user?.role || '').toUpperCase();
      const isVanRestricted = ['VAN_REP', 'VAN_SALES', 'SALESMAN_POS'].includes(role);
      if (req.user && isVanRestricted) {
        params.push(req.user.userId);
        sql += ` AND (v.user_id = $${params.length} OR v.created_by_user_id = $${params.length})`;
      }

      sql += ` ORDER BY v.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

      const resInvoices = await query(sql, params);
      const voucherIds = resInvoices.rows.map(r => r.id);

      const itemsByVoucher: Record<string, any[]> = {};
      const journalsByVoucher: Record<string, any[]> = {};
      const godownByVoucher: Record<string, string> = {};

      if (voucherIds.length > 0) {
        const invItemsRes = await query(
          `SELECT voucher_id, stock_item_name, godown_name, billed_qty, uom, rate, discount, amount
           FROM voucher_inventory_entries
           WHERE voucher_id = ANY($1::bigint[])
           ORDER BY id ASC`,
          [voucherIds]
        );
        for (const row of invItemsRes.rows) {
          const vid = String(row.voucher_id);
          if (!itemsByVoucher[vid]) itemsByVoucher[vid] = [];
          if (!godownByVoucher[vid] && row.godown_name) {
            godownByVoucher[vid] = row.godown_name;
          }
          itemsByVoucher[vid].push({
            stockItemName: row.stock_item_name,
            qty: parseFloat(row.billed_qty) || 1,
            unit: row.uom || 'Nos',
            rate: parseFloat(row.rate) || 0,
            discountPercent: parseFloat(row.discount) || 0,
            taxable: parseFloat(row.amount) || 0,
            godownName: row.godown_name,
          });
        }

        const ledRes = await query(
          `SELECT voucher_id, ledger_name, dr_cr, amount, is_party_ledger
           FROM voucher_ledger_entries
           WHERE voucher_id = ANY($1::bigint[])
           ORDER BY voucher_id, entry_index ASC, id ASC`,
          [voucherIds]
        );
        for (const row of ledRes.rows) {
          const vid = String(row.voucher_id);
          if (!journalsByVoucher[vid]) journalsByVoucher[vid] = [];
          const amt = parseFloat(row.amount) || 0;
          const isDr = String(row.dr_cr || '').toUpperCase() === 'DR';
          journalsByVoucher[vid].push({
            ledgerName: row.ledger_name,
            debit: isDr ? amt : 0,
            credit: isDr ? 0 : amt,
            isParty: Boolean(row.is_party_ledger),
          });
        }
      }

      return res.status(200).json({
        isValid: true,
        message: 'Invoices retrieved',
        errorCode: null,
        data: {
          invoices: resInvoices.rows.map(r => {
            const vid = String(r.id);
            const totalAmt = parseFloat(r.amount) || 0;
            const vatAmt = parseFloat(r.tax_amount) || 0;
            const subtotalAmt = Math.round((totalAmt - vatAmt) * 100) / 100;
            return {
              id: r.id,
              guid: r.guid,
              invoiceNumber: r.voucher_number,
              date: r.voucher_date,
              customerName: r.party_ledger_name,
              referenceNumber: r.reference || undefined,
              narration: r.narration || '',
              subtotal: subtotalAmt,
              amount: totalAmt,
              vat: vatAmt,
              roundOff: parseFloat(r.round_off_amount) || 0,
              paymentMode: r.payment_mode,
              source: r.source,
              syncStatus: r.sync_status,
              createdByUserId: r.creator_id ? Number(r.creator_id) : null,
              createdByUsername: r.creator_username || null,
              createdByName: r.creator_name || null,
              godownName: godownByVoucher[vid] || r.creator_godown || null,
              items: itemsByVoucher[vid] || [],
              journalEntries: journalsByVoucher[vid] || [],
              createdAt: r.created_at,
            };
          }),
        },
      });
    } catch (err: any) {
      console.error('[Get Invoices Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }
}
