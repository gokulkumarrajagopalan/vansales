import axios from 'axios';
import { apiClient, API_BASE_URL } from './api';
import { Customer, Item, LedgerAccount, UserAccount, Voucher, VoucherLineItem, JournalEntryLine } from '../types/erp';

export interface BackendSyncSummary {
  postedInvoices: number;
  postedReceipts: number;
  skipped: number;
  failed: number;
  fetchedInvoices: number;
  fetchedReceipts: number;
  errors: string[];
}

export function resolveBackendCredentials(user?: UserAccount | null): { username: string; password: string } {
  if (!user || user.role === 'admin' || user.id === 'usr_admin1' || (user.email || '').toLowerCase().includes('admin')) {
    return { username: 'admin', password: 'Pramith9632' };
  }
  const email = (user.email || '').toLowerCase();
  if (user.id === 'usr_van1' || email.includes('van1')) {
    return { username: 'van1', password: 'Pramith9632' };
  }
  if (user.id === 'usr_van2' || email.includes('van2') || email.includes('sales1')) {
    return { username: 'vansales1', password: 'Pramith9632' };
  }
  if (user.id === 'usr_van3' || email.includes('van3')) {
    return { username: 'van3', password: 'Pramith9632' };
  }
  if (user.id === 'usr_admin2' || email.includes('admin2')) {
    return { username: 'admin', password: 'Pramith9632' };
  }
  if (user.role === 'accountant') {
    return { username: 'admin', password: 'Pramith9632' };
  }
  if (user.role === 'warehouse_manager') {
    return { username: 'admin', password: 'Pramith9632' };
  }
  if (user.role === 'salesman_pos') {
    return { username: 'van1', password: 'Pramith9632' };
  }
  return { username: 'admin', password: 'Pramith9632' };
}

export async function authenticateWithBackend(
  identifier: string,
  password: string
): Promise<{
  success: boolean;
  token?: string;
  backendUser?: {
    id: number;
    username: string;
    fullName?: string;
    email?: string;
    role: string;
    godownName?: string;
    companyId?: number;
    companyCode?: string;
  };
  error?: string;
}> {
  const loginId = identifier.trim();

  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/v1/auth/login`,
      { username: loginId, password },
      { timeout: 8000 }
    );
    const token: string | undefined = res.data?.data?.token;
    const backendUser = res.data?.data?.user;
    if (!res.data?.isValid || !token || !backendUser) {
      return { success: false, error: res.data?.message || 'Invalid credentials' };
    }
    localStorage.setItem('token', token);
    localStorage.setItem('backend_user', JSON.stringify(backendUser));
    return { success: true, token, backendUser };
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      (err?.code === 'ERR_NETWORK' || !err?.response
        ? 'Cannot connect to authentication server. Please verify backend API is running.'
        : err?.message) ||
      'Authentication failed';
    return { success: false, error: msg };
  }
}

export async function loginBackendUser(user?: UserAccount | null): Promise<string | null> {
  try {
    const creds = resolveBackendCredentials(user);
    const res = await axios.post(
      `${API_BASE_URL}/api/v1/auth/login`,
      { username: creds.username, password: creds.password },
      { timeout: 6000 }
    );
    const token: string | undefined = res.data?.data?.token;
    if (token) {
      localStorage.setItem('token', token);
      if (res.data?.data?.user) {
        localStorage.setItem('backend_user', JSON.stringify(res.data.data.user));
      }
      return token;
    }
    return null;
  } catch (err) {
    console.warn('[BackendAuth] Unable to obtain backend token', err);
    return null;
  }
}

export async function getTokenForCreator(user?: UserAccount | null): Promise<string | null> {
  try {
    const creds = resolveBackendCredentials(user);
    const res = await axios.post(
      `${API_BASE_URL}/api/v1/auth/login`,
      { username: creds.username, password: creds.password },
      { timeout: 6000 }
    );
    return res.data?.data?.token || null;
  } catch {
    return null;
  }
}

function inferPaymentMode(v: Voucher): string {
  if (v.paymentMode) return v.paymentMode.toUpperCase();
  const debitEntry = v.journalEntries.find(j => (j.debit || 0) > 0);
  const ledName = (debitEntry?.ledgerName || debitEntry?.ledgerId || '').toLowerCase();
  if (ledName.includes('cash') || debitEntry?.ledgerId === 'led_cash') return 'CASH';
  if (ledName.includes('bank') || ledName.includes('hdfc') || ledName.includes('icici') || ledName.includes('upi')) return 'CARD';
  return 'CREDIT';
}

export async function postVoucherToBackend(
  v: Voucher,
  tokenOverride?: string
): Promise<{ id?: number; guid?: string; syncStatus?: string; alreadySynced?: boolean }> {
  const headers = tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : undefined;

  if (v.voucherType === 'sales') {
    const payload = {
      voucherNumber: v.voucherNumber,
      invoiceDate: v.date,
      customerName: v.partyName || 'Cash Customer',
      paymentMode: inferPaymentMode(v),
      source: v.source || 'WEB_APP',
      godownName: v.locationName || 'Central Warehouse',
      referenceNumber: v.referenceNumber,
      narration: v.narration,
      skipRoundOff: true,
      subtotal: v.subtotal,
      taxTotal: v.taxTotal,
      netTotal: v.totalAmount,
      items: (v.items || []).map(it => ({
        itemId: it.itemId,
        itemName: it.itemName,
        quantity: it.quantity,
        rate: it.rate,
        unitId: it.unitId,
        discountPercent: it.discountPercent,
        taxRate: it.taxRate,
        taxAmount: it.taxAmount,
      })),
      journalEntries: v.journalEntries,
    };

    const res = await apiClient.post('/api/v1/invoices', payload, headers ? { headers } : undefined);
    const data = res.data?.data;
    return {
      id: data?.id ? Number(data.id) : undefined,
      guid: data?.guid,
      syncStatus: data?.syncStatus || 'READY',
      alreadySynced: Boolean(data?.alreadySynced),
    };
  }

  if (v.voucherType === 'receipt') {
    const payload = {
      voucherNumber: v.voucherNumber,
      receiptDate: v.date,
      customerName: v.partyName || 'Customer',
      amount: v.totalAmount,
      paymentMode: inferPaymentMode(v) === 'CREDIT' ? 'BANK' : inferPaymentMode(v),
      referenceNumber: v.referenceNumber,
      narration: v.narration,
      source: v.source || 'WEB_APP',
    };

    const res = await apiClient.post('/api/v1/receipts', payload, headers ? { headers } : undefined);
    const data = res.data?.data;
    return {
      id: data?.id ? Number(data.id) : undefined,
      guid: data?.guid,
      syncStatus: data?.syncStatus || 'READY',
      alreadySynced: Boolean(data?.alreadySynced),
    };
  }

  return {};
}

function mapCreatorIdentity(
  _createdByUserId: number | null | undefined,
  createdByUsername: string | null | undefined,
  createdByName: string | null | undefined,
  godownName: string | null | undefined
) {
  const uname = (createdByUsername || '').toLowerCase();
  const gd = (godownName || '').toLowerCase();
  if (uname === 'van1' || gd.includes('van 01') || gd.includes('van 1')) {
    return {
      createdBy: 'usr_van1',
      createdByName: 'Karthik Rao (Van 01)',
      locationId: 'loc_van1',
      locationName: 'Van 01 - Karthik Rao (KA-01-VA-1001)',
      vehicleId: 'veh_1',
      driverId: 'driver_1',
    };
  }
  if (uname === 'van2' || gd.includes('van 02') || gd.includes('van 2')) {
    return {
      createdBy: 'usr_van2',
      createdByName: 'Imran Shaikh (Van 02)',
      locationId: 'loc_van2',
      locationName: 'Van 02 - Imran Shaikh (KA-01-VA-2002)',
      vehicleId: 'veh_2',
      driverId: 'driver_2',
    };
  }
  if (uname === 'van3' || gd.includes('van 03') || gd.includes('van 3')) {
    return {
      createdBy: 'usr_van3',
      createdByName: 'Prakash Nair (Van 03)',
      locationId: 'loc_van3',
      locationName: 'Van 03 - Prakash Nair (KA-01-VA-3003)',
      vehicleId: 'veh_3',
      driverId: 'driver_3',
    };
  }
  return {
    createdBy: uname === 'admin2' ? 'usr_admin2' : 'usr_admin1',
    createdByName: createdByName || 'System Admin Lead',
    locationId: 'loc_main',
    locationName: godownName || 'Main Location (Central Warehouse)',
    vehicleId: undefined,
    driverId: undefined,
  };
}

function mapLedgerId(ledgerName: string, ledgers: LedgerAccount[]): string {
  const lower = (ledgerName || '').toLowerCase();
  const exact = ledgers.find(l => l.name.toLowerCase() === lower);
  if (exact) return exact.id;
  if (lower.includes('cash')) return 'led_cash';
  if (lower.includes('hdfc') || lower.includes('bank') || lower.includes('card')) return 'led_bank_hdfc';
  if (lower.includes('icici')) return 'led_bank_icici';
  if (lower.includes('sales')) return 'led_sales';
  if (lower.includes('vat') || lower.includes('gst') || lower.includes('tax')) return 'led_tax_payable';
  return 'led_ar';
}

export async function fetchBackendCustomers(tokenOverride?: string): Promise<Customer[]> {
  const config = tokenOverride ? { headers: { Authorization: `Bearer ${tokenOverride}` } } : undefined;
  try {
    const res = await apiClient.get('/api/customers?companyId=12', config);
    const rawList: any[] = res.data?.data || [];
    return rawList.map((c, idx) => ({
      id: `cust_be_${c.id || idx}`,
      code: `CUST-${String(c.id || idx + 1).padStart(4, '0')}`,
      name: c.name || c.storeName || 'Customer',
      companyName: c.storeName || c.name,
      phone: c.phone || '',
      email: c.email || '',
      taxNumber: c.trn || '',
      creditLimit: 50000,
      creditDays: 30,
      route: 'Live Beat Route',
      address: c.address || 'Dubai, UAE',
      city: c.city || 'Dubai',
      ledgerId: `led_${c.id}`,
      openingBalance: 0,
      currentBalance: Number(c.balance) || 0,
      createdBy: 'usr_admin1',
      createdByName: 'System Admin Lead',
      assignedSalesmanId: 'usr_van1',
      status: true
    }));
  } catch (err) {
    console.warn('[BackendAuth] Failed to fetch backend customers', err);
    return [];
  }
}

export async function fetchBackendVouchers(
  customers: Customer[],
  ledgers: LedgerAccount[],
  items: Item[],
  tokenOverride?: string
): Promise<{ invoices: Voucher[]; receipts: Voucher[]; orders: Voucher[] }> {
  const config = tokenOverride ? { headers: { Authorization: `Bearer ${tokenOverride}` } } : undefined;
  const [invRes, rctRes, ordRes] = await Promise.all([
    apiClient.get('/api/v1/invoices?limit=200', config),
    apiClient.get('/api/v1/receipts?limit=200', config),
    apiClient.get('/api/v1/invoices?type=orders&limit=200', config).catch(() => ({ data: { data: { invoices: [] } } })),
  ]);

  const rawInvoices: any[] = invRes.data?.data?.invoices || [];
  const rawReceipts: any[] = rctRes.data?.data?.receipts || [];
  const rawOrders: any[] = ordRes.data?.data?.invoices || [];

  const invoices: Voucher[] = rawInvoices.map(r => {
    const matchedCust = customers.find(
      c => c.name.toLowerCase() === String(r.customerName || '').toLowerCase()
    );
    const identity = mapCreatorIdentity(
      r.createdByUserId,
      r.createdByUsername,
      r.createdByName,
      r.godownName
    );
    const totalAmt = Number(r.amount) || 0;
    const vatAmt = Number(r.vat) || 0;
    const subtotalAmt =
      r.subtotal !== undefined && !isNaN(Number(r.subtotal))
        ? Number(r.subtotal)
        : Math.round((totalAmt - vatAmt) * 100) / 100;

    const lineItems: VoucherLineItem[] = Array.isArray(r.items)
      ? r.items.map((it: any) => {
          const matchedItem = items.find(
            x => x.name.toLowerCase() === String(it.stockItemName || '').toLowerCase()
          );
          const qty = Number(it.qty) || 1;
          const rate = Number(it.rate) || 0;
          const discountPercent = Number(it.discountPercent) || 0;
          const taxable = Number(it.taxable) || qty * rate * (1 - discountPercent / 100);
          const taxRate = matchedItem?.taxRate ?? 5;
          const taxAmount = Math.round(taxable * (taxRate / 100) * 100) / 100;
          return {
            itemId: matchedItem?.id || `be_item_${it.stockItemName}`,
            itemName: it.stockItemName || 'Item',
            unitId: matchedItem?.unitId || 'unit_pcs',
            quantity: qty,
            rate,
            discountPercent,
            taxRate,
            taxAmount,
            amount: Math.round((taxable + taxAmount) * 100) / 100,
          };
        })
      : [];

    const journalEntries: JournalEntryLine[] =
      Array.isArray(r.journalEntries) && r.journalEntries.length >= 2
        ? r.journalEntries.map((j: any) => ({
            ledgerId: mapLedgerId(j.ledgerName, ledgers),
            ledgerName: j.ledgerName,
            debit: Number(j.debit) || 0,
            credit: Number(j.credit) || 0,
          }))
        : [
            {
              ledgerId: String(r.paymentMode || '').toUpperCase() === 'CASH' ? 'led_cash' : 'led_ar',
              ledgerName:
                String(r.paymentMode || '').toUpperCase() === 'CASH'
                  ? 'Cash in Hand'
                  : 'Accounts Receivable (Sundry Debtors)',
              debit: totalAmt,
              credit: 0,
            },
            {
              ledgerId: 'led_sales',
              ledgerName: 'Direct Sales Account',
              debit: 0,
              credit: subtotalAmt,
            },
            ...(vatAmt > 0
              ? [
                  {
                    ledgerId: 'led_tax_payable',
                    ledgerName: 'GST Output Tax Payable',
                    debit: 0,
                    credit: vatAmt,
                  },
                ]
              : []),
          ];

    return {
      id: `vouch_be_sal_${r.id}`,
      backendId: Number(r.id),
      guid: r.guid,
      source: r.source || 'VAN',
      syncStatus: r.syncStatus || 'READY',
      paymentMode: r.paymentMode || 'CASH',
      voucherNumber: r.invoiceNumber,
      voucherType: 'sales',
      date: String(r.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
      partyType: 'customer',
      partyId: matchedCust?.id,
      partyName: r.customerName || 'Cash Customer',
      locationId: identity.locationId,
      locationName: identity.locationName,
      vehicleId: identity.vehicleId,
      driverId: identity.driverId,
      createdBy: identity.createdBy,
      createdByName: identity.createdByName,
      referenceNumber: r.referenceNumber || r.guid,
      narration: r.narration || `Synced from backend (${r.source || 'VAN'})`,
      items: lineItems.length > 0 ? lineItems : undefined,
      subtotal: subtotalAmt,
      taxTotal: vatAmt,
      totalAmount: totalAmt,
      journalEntries,
      status: 'posted',
    };
  });

  const receipts: Voucher[] = rawReceipts.map(r => {
    const matchedCust = customers.find(
      c => c.name.toLowerCase() === String(r.customerName || '').toLowerCase()
    );
    const identity = mapCreatorIdentity(
      r.createdByUserId,
      r.createdByUsername,
      r.createdByName,
      r.godownName
    );
    const totalAmt = Number(r.amount) || 0;
    const isCash = String(r.paymentMode || '').toUpperCase() === 'CASH';

    const journalEntries: JournalEntryLine[] =
      Array.isArray(r.journalEntries) && r.journalEntries.length >= 2
        ? r.journalEntries.map((j: any) => ({
            ledgerId: mapLedgerId(j.ledgerName, ledgers),
            ledgerName: j.ledgerName,
            debit: Number(j.debit) || 0,
            credit: Number(j.credit) || 0,
          }))
        : [
            {
              ledgerId: isCash ? 'led_cash' : 'led_bank_hdfc',
              ledgerName: isCash ? 'Cash in Hand' : 'HDFC Bank - Current A/c 50100',
              debit: totalAmt,
              credit: 0,
            },
            {
              ledgerId: 'led_ar',
              ledgerName: 'Accounts Receivable (Sundry Debtors)',
              debit: 0,
              credit: totalAmt,
            },
          ];

    return {
      id: `vouch_be_rct_${r.id}`,
      backendId: Number(r.id),
      guid: r.guid,
      source: r.source || 'VAN',
      syncStatus: r.syncStatus || 'READY',
      paymentMode: r.paymentMode || 'CASH',
      voucherNumber: r.receiptNumber,
      voucherType: 'receipt',
      date: String(r.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
      partyType: 'customer',
      partyId: matchedCust?.id,
      partyName: r.customerName || 'Customer',
      locationId: identity.locationId,
      locationName: identity.locationName,
      vehicleId: identity.vehicleId,
      driverId: identity.driverId,
      createdBy: identity.createdBy,
      createdByName: identity.createdByName,
      referenceNumber: r.referenceNumber || r.guid,
      narration: r.narration || `Synced receipt (${r.source || 'VAN'})`,
      totalAmount: totalAmt,
      journalEntries,
      status: 'posted',
    };
  });

  const orders: Voucher[] = rawOrders.map(r => {
    const matchedCust = customers.find(
      c => c.name.toLowerCase() === String(r.customerName || '').toLowerCase()
    );
    const identity = mapCreatorIdentity(
      r.createdByUserId,
      r.createdByUsername,
      r.createdByName,
      r.godownName
    );
    const totalAmt = Number(r.amount) || 0;
    const vatAmt = Number(r.vat) || 0;
    const subtotalAmt =
      r.subtotal !== undefined && !isNaN(Number(r.subtotal))
        ? Number(r.subtotal)
        : Math.round((totalAmt - vatAmt) * 100) / 100;

    const lineItems: VoucherLineItem[] = Array.isArray(r.items)
      ? r.items.map((it: any) => {
          const matchedItem = items.find(
            x => x.name.toLowerCase() === String(it.stockItemName || '').toLowerCase()
          );
          const qty = Number(it.qty) || 1;
          const rate = Number(it.rate) || 0;
          const discountPercent = Number(it.discountPercent) || 0;
          const taxable = Number(it.taxable) || qty * rate * (1 - discountPercent / 100);
          const taxRate = matchedItem?.taxRate ?? 5;
          const taxAmount = Math.round(taxable * (taxRate / 100) * 100) / 100;
          return {
            itemId: matchedItem?.id || `be_item_${it.stockItemName}`,
            itemName: it.stockItemName || 'Item',
            unitId: matchedItem?.unitId || 'unit_pcs',
            quantity: qty,
            rate,
            discountPercent,
            taxRate,
            taxAmount,
            amount: Math.round((taxable + taxAmount) * 100) / 100,
          };
        })
      : [];

    const journalEntries: JournalEntryLine[] =
      Array.isArray(r.journalEntries) && r.journalEntries.length >= 2
        ? r.journalEntries.map((j: any) => ({
            ledgerId: mapLedgerId(j.ledgerName, ledgers),
            ledgerName: j.ledgerName,
            debit: Number(j.debit) || 0,
            credit: Number(j.credit) || 0,
          }))
        : [
            {
              ledgerId: 'led_ar',
              ledgerName: r.customerName || 'Accounts Receivable (Sundry Debtors)',
              debit: totalAmt,
              credit: 0,
            },
            {
              ledgerId: 'led_sales',
              ledgerName: 'Sales Orders Booking',
              debit: 0,
              credit: subtotalAmt,
            },
          ];

    return {
      id: `vouch_be_ord_${r.id}`,
      backendId: Number(r.id),
      guid: r.guid,
      source: r.source || 'VAN',
      syncStatus: r.syncStatus || 'READY',
      paymentMode: r.paymentMode || 'CREDIT',
      voucherNumber: r.invoiceNumber,
      voucherType: 'sales_order',
      date: String(r.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
      partyType: 'customer',
      partyId: matchedCust?.id,
      partyName: r.customerName || 'Customer',
      locationId: identity.locationId,
      locationName: identity.locationName,
      vehicleId: identity.vehicleId,
      driverId: identity.driverId,
      createdBy: identity.createdBy,
      createdByName: identity.createdByName,
      referenceNumber: r.referenceNumber || r.guid,
      narration: r.narration || `Van sales order (${r.source || 'VAN'})`,
      items: lineItems.length > 0 ? lineItems : undefined,
      subtotal: subtotalAmt,
      taxTotal: vatAmt,
      totalAmount: totalAmt,
      journalEntries,
      status: 'posted',
    };
  });

  return { invoices, receipts, orders };
}
