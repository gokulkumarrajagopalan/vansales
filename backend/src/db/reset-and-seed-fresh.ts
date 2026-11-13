import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

const CMP_ID = 12;

interface GroupSeed {
  key: string;
  name: string;
  parent: string;
  primaryGroup: string;
  nature: 'Assets' | 'Liabilities' | 'Income' | 'Expenses';
  isRevenue: boolean;
}

interface LedgerSeed {
  code: string;
  name: string;
  groupKey: string;
  openingBalance: number; // + = Debit, - = Credit
  isRevenue?: boolean;
  billwise?: boolean;
  gstApplicable?: boolean;
  gstin?: string;
  mobile?: string;
  email?: string;
  address?: string;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function resetAndSeedFresh() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Delete all dependent user records and all user accounts
    const userChildTables = [
      'user_devices',
      'notification_settings',
      'pending_sessions',
      'session_conflicts',
      'partner_extension_log',
      'user_roles',
      'user_sessions',
      'revoked_tokens',
    ];
    for (const tbl of userChildTables) {
      await client.query(`DELETE FROM public.${tbl}`);
    }
    await client.query(`UPDATE public.users SET parent_user_id = NULL`);
    await client.query(`DELETE FROM public.users`);

    // 2. Wipe transactional tables, old Demo ledgers/groups, and old godowns
    const wipeTables = [
      'van_location_ping',
      'van_shift',
      'order_items',
      'orders',
      'voucher_bill_allocations',
      'voucher_batch_allocations',
      'voucher_cost_category_allocations',
      'voucher_cost_centre_allocations',
      'voucher_inventory_entries',
      'voucher_ledger_entries',
      'vouchers',
      'invoice_line_items',
      'invoices',
      'ledgers',
      'groups',
      'godowns',
      'vendors',
    ];
    for (const tbl of wipeTables) {
      await client.query(`DELETE FROM public.${tbl}`);
    }

    // 3. Create Fresh Admin, Van Sales Rep, Accountant & Warehouse Manager Accounts
    const passwordHash = await bcrypt.hash('password123', 10);

    const userSpecs = [
      {
        username: 'admin1',
        full_name: 'System Admin Lead',
        email: 'admin1@talliffy.com',
        role: 'ADMIN',
        type_of_user: 'WEB_APP',
        van_godown_name: null,
        mobile: '+919845010001',
        licence_no: 99000101,
      },
      {
        username: 'admin2',
        full_name: 'Operations Admin',
        email: 'admin2@talliffy.com',
        role: 'ADMIN',
        type_of_user: 'WEB_APP',
        van_godown_name: null,
        mobile: '+919845010002',
        licence_no: 99000102,
      },
      {
        username: 'van1',
        full_name: 'Karthik Rao (Van 01)',
        email: 'van1@talliffy.com',
        role: 'VAN_REP',
        type_of_user: 'MOBILE_APP',
        van_godown_name: 'Van 01 Godown',
        mobile: '+919880044332',
        licence_no: 99000201,
      },
      {
        username: 'van2',
        full_name: 'Imran Shaikh (Van 02)',
        email: 'van2@talliffy.com',
        role: 'VAN_REP',
        type_of_user: 'MOBILE_APP',
        van_godown_name: 'Van 02 Godown',
        mobile: '+919988122110',
        licence_no: 99000202,
      },
      {
        username: 'van3',
        full_name: 'Prakash Nair (Van 03)',
        email: 'van3@talliffy.com',
        role: 'VAN_REP',
        type_of_user: 'MOBILE_APP',
        van_godown_name: 'Van 03 Godown',
        mobile: '+919739055110',
        licence_no: 99000203,
      },
      {
        username: 'accountant',
        full_name: 'Ramesh Accounts',
        email: 'accounts@talliffy.com',
        role: 'ACCOUNTANT',
        type_of_user: 'WEB_APP',
        van_godown_name: null,
        mobile: '+919845030001',
        licence_no: 99000301,
      },
      {
        username: 'warehouse',
        full_name: 'Suresh Warehouse',
        email: 'warehouse@talliffy.com',
        role: 'WAREHOUSE',
        type_of_user: 'WEB_APP',
        van_godown_name: 'Main Location',
        mobile: '+919845040001',
        licence_no: 99000401,
      },
    ];

    const userMap: Record<string, number> = {};
    for (const u of userSpecs) {
      const uRes = await client.query(
        `INSERT INTO public.users (
           username, password, full_name, email, role, licence_no,
           isactive, enabled, type_of_user, van_godown_name, mobile,
           country, currency, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, '1', '1', $7, $8, $9, 'IN', 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING userid`,
        [
          u.username,
          passwordHash,
          u.full_name,
          u.email,
          u.role,
          u.licence_no,
          u.type_of_user,
          u.van_godown_name,
          u.mobile,
        ]
      );
      userMap[u.username] = Number(uRes.rows[0].userid);
    }

    const adminUserId = userMap['admin1'];

    // 4. Seed Warehouses & 3 Mobile Van Godowns
    const godowns = [
      { guid: 'GODOWN-MAIN-WH', name: 'Main Location', address: 'Bay 1-4, Peenya Industrial Area, Bengaluru' },
      { guid: 'GODOWN-COLD-DEPOT', name: 'Cold Storage Depot', address: 'Refrigerated Unit B, Hebbal, Bengaluru' },
      { guid: 'GODOWN-VAN-01', name: 'Van 01 Godown', address: 'KA-01-VA-1001 · North Route (Hebbal - Yelahanka)' },
      { guid: 'GODOWN-VAN-02', name: 'Van 02 Godown', address: 'KA-01-VA-2002 · East Route (Indiranagar - Whitefield)' },
      { guid: 'GODOWN-VAN-03', name: 'Van 03 Godown', address: 'KA-01-VA-3003 · South Route (Jayanagar - Electronic City)' },
    ];
    for (const g of godowns) {
      await client.query(
        `INSERT INTO public.godowns (cmpid, userid, guid, name, address, is_deleted, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [CMP_ID, adminUserId, g.guid, g.name, g.address]
      );
    }

    // 5. Seed Complete Tally Account Groups Hierarchy
    const groupSeeds: GroupSeed[] = [
      { key: 'capital', name: 'Capital Account', parent: 'Primary', primaryGroup: 'Capital Account', nature: 'Liabilities', isRevenue: false },
      { key: 'reserves', name: 'Reserves & Surplus', parent: 'Capital Account', primaryGroup: 'Capital Account', nature: 'Liabilities', isRevenue: false },
      { key: 'fixed_assets', name: 'Fixed Assets', parent: 'Primary', primaryGroup: 'Fixed Assets', nature: 'Assets', isRevenue: false },
      { key: 'current_assets', name: 'Current Assets', parent: 'Primary', primaryGroup: 'Current Assets', nature: 'Assets', isRevenue: false },
      { key: 'cash', name: 'Cash-in-Hand', parent: 'Current Assets', primaryGroup: 'Current Assets', nature: 'Assets', isRevenue: false },
      { key: 'bank', name: 'Bank Accounts', parent: 'Current Assets', primaryGroup: 'Current Assets', nature: 'Assets', isRevenue: false },
      { key: 'debtors', name: 'Sundry Debtors', parent: 'Current Assets', primaryGroup: 'Current Assets', nature: 'Assets', isRevenue: false },
      { key: 'stock', name: 'Stock-in-Hand', parent: 'Current Assets', primaryGroup: 'Current Assets', nature: 'Assets', isRevenue: false },
      { key: 'deposits', name: 'Deposits (Asset)', parent: 'Current Assets', primaryGroup: 'Current Assets', nature: 'Assets', isRevenue: false },
      { key: 'advances', name: 'Loans & Advances (Asset)', parent: 'Current Assets', primaryGroup: 'Current Assets', nature: 'Assets', isRevenue: false },
      { key: 'current_liab', name: 'Current Liabilities', parent: 'Primary', primaryGroup: 'Current Liabilities', nature: 'Liabilities', isRevenue: false },
      { key: 'creditors', name: 'Sundry Creditors', parent: 'Current Liabilities', primaryGroup: 'Current Liabilities', nature: 'Liabilities', isRevenue: false },
      { key: 'taxes', name: 'Duties & Taxes', parent: 'Current Liabilities', primaryGroup: 'Current Liabilities', nature: 'Liabilities', isRevenue: false },
      { key: 'provisions', name: 'Provisions', parent: 'Current Liabilities', primaryGroup: 'Current Liabilities', nature: 'Liabilities', isRevenue: false },
      { key: 'bank_od', name: 'Bank OD A/c', parent: 'Loans (Liability)', primaryGroup: 'Loans (Liability)', nature: 'Liabilities', isRevenue: false },
      { key: 'sales', name: 'Sales Accounts', parent: 'Primary', primaryGroup: 'Sales Accounts', nature: 'Income', isRevenue: true },
      { key: 'direct_inc', name: 'Direct Incomes', parent: 'Primary', primaryGroup: 'Direct Incomes', nature: 'Income', isRevenue: true },
      { key: 'indirect_inc', name: 'Indirect Incomes', parent: 'Primary', primaryGroup: 'Indirect Incomes', nature: 'Income', isRevenue: true },
      { key: 'purchase', name: 'Purchase Accounts', parent: 'Primary', primaryGroup: 'Purchase Accounts', nature: 'Expenses', isRevenue: true },
      { key: 'direct_exp', name: 'Direct Expenses', parent: 'Primary', primaryGroup: 'Direct Expenses', nature: 'Expenses', isRevenue: true },
      { key: 'indirect_exp', name: 'Indirect Expenses', parent: 'Primary', primaryGroup: 'Indirect Expenses', nature: 'Expenses', isRevenue: true },
    ];

    const groupIdMap: Record<string, { id: number; name: string; primaryGroup: string }> = {};
    let masterSeq = 100;
    for (const grp of groupSeeds) {
      masterSeq += 1;
      const gRes = await client.query(
        `INSERT INTO public.groups (
           cmpid, userid, masterid, guid, grp_name, grp_parent, grp_primary_group,
           grp_nature, is_active, is_deleted, is_reserved, is_revenue, level_number,
           sync_status, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, false, true, $9, 1, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING grpid`,
        [
          CMP_ID,
          adminUserId,
          masterSeq,
          `GRP-${CMP_ID}-${masterSeq}`,
          grp.name,
          grp.parent,
          grp.primaryGroup,
          grp.nature,
          grp.isRevenue,
        ]
      );
      groupIdMap[grp.key] = {
        id: Number(gRes.rows[0].grpid),
        name: grp.name,
        primaryGroup: grp.primaryGroup,
      };
    }

    // 6. Seed All Categories of Ledger Masters
    const ledgerSeeds: LedgerSeed[] = [
      // Cash & Bank
      { code: '1001', name: 'Cash in Hand', groupKey: 'cash', openingBalance: 45000 },
      { code: '1002', name: 'Petty Cash - Head Office', groupKey: 'cash', openingBalance: 15000 },
      { code: '1003', name: 'HDFC Bank - Current A/c 50100', groupKey: 'bank', openingBalance: 420000 },
      { code: '1004', name: 'ICICI Bank - POS Collection A/c 90211', groupKey: 'bank', openingBalance: 185000 },
      { code: '2001', name: 'SBI Bank - Working Capital O/D', groupKey: 'bank_od', openingBalance: -250000 },

      // Receivables Control + Sundry Debtors (Customers)
      { code: '1100', name: 'Accounts Receivable (Sundry Debtors Control)', groupKey: 'debtors', openingBalance: 0, billwise: true },
      { code: '1101', name: 'Metro Hypermarket', groupKey: 'debtors', openingBalance: 65000, billwise: true, gstApplicable: true, gstin: '29AAACM1234A1Z1', mobile: '+91 98860 11223', email: 'accounts@metrohyper.com', address: '100 Feet Ring Road, Hebbal' },
      { code: '1102', name: 'Green Basket Mart', groupKey: 'debtors', openingBalance: 42000, billwise: true, gstApplicable: true, gstin: '29AABCG5678B1Z2', mobile: '+91 97410 44556', email: 'billing@greenbasket.in', address: 'Sector 4, HSR Layout' },
      { code: '1103', name: 'Fresh Mart Supermarket', groupKey: 'debtors', openingBalance: 55000, billwise: true, gstApplicable: true, gstin: '29AAACF7788C1Z3', mobile: '+91 98860 55441', email: 'freshmart@blrretail.com', address: 'Yelahanka Main Road' },
      { code: '1104', name: 'Highway Express Retail', groupKey: 'debtors', openingBalance: 38000, billwise: true, gstApplicable: true, gstin: '29AAACH9876C1Z3', mobile: '+91 99001 77889', email: 'highway.express@gmail.com', address: 'Whitefield Main Road' },
      { code: '1105', name: 'Gopalan Wholesale Mart', groupKey: 'debtors', openingBalance: 36000, billwise: true, gstApplicable: true, gstin: '29AAACG4411D1Z4', mobile: '+91 94267 89012', email: 'ap@gopalanmart.com', address: 'Old Madras Road, Indiranagar' },
      { code: '1106', name: 'Kaveri Super Bazaar', groupKey: 'debtors', openingBalance: 24000, billwise: true, gstApplicable: true, gstin: '29AAACK3322E1Z5', mobile: '+91 98451 66778', email: 'kaveri.bazaar@outlook.com', address: '11th Main, Jayanagar' },

      // Inventory, Deposits, Advances, Input Tax & Fixed Assets
      { code: '1201', name: 'Inventory / Stock-in-Hand', groupKey: 'stock', openingBalance: 640000 },
      { code: '1301', name: 'Peenya Hub Security Deposit', groupKey: 'deposits', openingBalance: 150000 },
      { code: '1302', name: 'Driver Fuel & Route Advances', groupKey: 'advances', openingBalance: 35000 },
      { code: '1401', name: 'Input GST / VAT Credit Receivable', groupKey: 'current_assets', openingBalance: 48000 },
      { code: '1501', name: 'Delivery Van Fleet Assets', groupKey: 'fixed_assets', openingBalance: 2100000 },
      { code: '1502', name: 'Warehouse Cold Storage Equipment', groupKey: 'fixed_assets', openingBalance: 450000 },
      { code: '1503', name: 'Office IT & POS Hardware', groupKey: 'fixed_assets', openingBalance: 152000 },

      // Payables Control + Sundry Creditors (Suppliers)
      { code: '2100', name: 'Accounts Payable (Sundry Creditors Control)', groupKey: 'creditors', openingBalance: 0, billwise: true },
      { code: '2101', name: 'Hindustan Unilever Distributors', groupKey: 'creditors', openingBalance: -165000, billwise: true, gstApplicable: true, gstin: '29AAACH0001A1Z9', mobile: '+91 80 2233 4455', email: 'orders.south@hul.com', address: 'HUL Logistics Park, Bommasandra' },
      { code: '2102', name: 'Nestle India Regional Depot', groupKey: 'creditors', openingBalance: -120000, billwise: true, gstApplicable: true, gstin: '29AAACN3334D1Z6', mobile: '+91 80 5544 3322', email: 'distrib.nestle@nestle.com', address: 'Nelamangala Highway Logistics' },
      { code: '2103', name: 'ITC Consumer Wholesale', groupKey: 'creditors', openingBalance: -95000, billwise: true, gstApplicable: true, gstin: '29AAACI9012E1Z7', mobile: '+91 80 4455 6677', email: 'wholesale@itcportal.com', address: 'Jigani Industrial Estate' },

      // Duties & Taxes + Provisions + Capital & Reserves
      { code: '2201', name: 'Output VAT 5%', groupKey: 'taxes', openingBalance: -32000 },
      { code: '2202', name: 'CGST Output Payable (9%)', groupKey: 'taxes', openingBalance: -24000 },
      { code: '2203', name: 'SGST Output Payable (9%)', groupKey: 'taxes', openingBalance: -24000 },
      { code: '2204', name: 'IGST Output Payable (18%)', groupKey: 'taxes', openingBalance: -18000 },
      { code: '2301', name: 'Wages & Salaries Payable', groupKey: 'provisions', openingBalance: -95000 },
      { code: '2302', name: 'Audit & Electricity Provision', groupKey: 'provisions', openingBalance: -27000 },
      { code: '3001', name: "Owner's Equity & Capital", groupKey: 'capital', openingBalance: -3000000 },
      { code: '3002', name: 'Retained Earnings & Reserves', groupKey: 'reserves', openingBalance: -650000 },

      // Sales & Income
      { code: '4001', name: 'Direct Sales Account', groupKey: 'sales', openingBalance: 0, isRevenue: true },
      { code: '4002', name: 'Van POS Spot Sales Account', groupKey: 'sales', openingBalance: 0, isRevenue: true },
      { code: '4003', name: 'Sales Returns Account', groupKey: 'sales', openingBalance: 0, isRevenue: true },
      { code: '4101', name: 'Delivery & Freight Charges Recovered', groupKey: 'direct_inc', openingBalance: 0, isRevenue: true },
      { code: '4201', name: 'Supplier Cash Discount Received', groupKey: 'indirect_inc', openingBalance: 0, isRevenue: true },

      // Purchase & Direct/Indirect Expenses
      { code: '5001', name: 'Direct Purchase Account (COGS)', groupKey: 'purchase', openingBalance: 0, isRevenue: true },
      { code: '5002', name: 'Purchase Returns Account', groupKey: 'purchase', openingBalance: 0, isRevenue: true },
      { code: '5101', name: 'Van Fuel & Fleet Operations', groupKey: 'direct_exp', openingBalance: 0, isRevenue: true },
      { code: '5102', name: 'Salesman Commission & Incentives', groupKey: 'direct_exp', openingBalance: 0, isRevenue: true },
      { code: '5103', name: 'Loading & Unloading Freight', groupKey: 'direct_exp', openingBalance: 0, isRevenue: true },
      { code: '5201', name: 'Warehouse Rent & Electricity', groupKey: 'indirect_exp', openingBalance: 0, isRevenue: true },
      { code: '5202', name: 'Staff Salaries & Payroll', groupKey: 'indirect_exp', openingBalance: 0, isRevenue: true },
      { code: '5203', name: 'Vehicle Insurance & Maintenance', groupKey: 'indirect_exp', openingBalance: 0, isRevenue: true },
      { code: '5204', name: 'Bank & POS Card Charges', groupKey: 'indirect_exp', openingBalance: 0, isRevenue: true },
      { code: '5205', name: 'Discount Allowed', groupKey: 'indirect_exp', openingBalance: 0, isRevenue: true },
      { code: '5206', name: 'Round Off (+/-)', groupKey: 'indirect_exp', openingBalance: 0, isRevenue: true },
    ];

    for (const l of ledgerSeeds) {
      masterSeq += 1;
      const grp = groupIdMap[l.groupKey];
      await client.query(
        `INSERT INTO public.ledgers (
           cmpid, userid, grpid, masterid, guid, led_code, led_name, led_mailing_name,
           led_parent, led_primary_group, last_parent, led_opening_balance, led_closing_balance,
           is_active, is_deleted, is_revenue, led_billwise_on, gst_applicable, gst_gstin,
           led_mobile, led_email, led_address_1, led_state, led_country, led_country_isd_code,
           sync_status, created_at, updated_at
         )
         VALUES (
           $1, $2, $3, $4, $5, $6, $7, $7,
           $8, $9, $8, $10, $10,
           true, false, $11, $12, $13, $14,
           $15, $16, $17, 'Karnataka', 'India', '+91',
           'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
         )`,
        [
          CMP_ID,
          adminUserId,
          grp.id,
          masterSeq,
          `LED-${CMP_ID}-${l.code}`,
          l.code,
          l.name,
          grp.name,
          grp.primaryGroup,
          l.openingBalance,
          Boolean(l.isRevenue),
          Boolean(l.billwise),
          Boolean(l.gstApplicable),
          l.gstin || null,
          l.mobile || '',
          l.email || '',
          l.address || '',
        ]
      );
    }

    // Refresh Vendors table for B2B Suppliers
    const vendorSeeds = [
      ['Hindustan Unilever Distributors', 'HUL Regional Logistics Hub', '+918022334455', '29AAACH0001A1Z9', 250000, 'HUL Logistics Park, Bommasandra, Bengaluru'],
      ['Nestle India Regional Depot', 'Nestle South Distribution', '+918055443322', '29AAACN3334D1Z6', 200000, 'Nelamangala Highway Logistics, Bengaluru'],
      ['ITC Consumer Wholesale', 'ITC Trade Supply Depot', '+918044556677', '29AAACI9012E1Z7', 175000, 'Jigani Industrial Estate, Bengaluru'],
    ];
    for (const [name, shop, mobile, gst, limit, addr] of vendorSeeds) {
      await client.query(
        `INSERT INTO public.vendors (name, shop_name, mobile_number, gst_number, borrow_amount_limit, address, status)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [name, shop, mobile, gst, limit, addr]
      );
    }

    // 7. Update Tally Ledger Mappings to match canonical ledgers
    const mappings = [
      ['CASH', 'Cash in Hand', 'Main Van Cash settlement ledger'],
      ['CARD', 'ICICI Bank - POS Collection A/c 90211', 'Electronic POS card & UPI settlement bank'],
      ['VAT_OUTPUT', 'Output VAT 5%', 'Output GST / VAT liability ledger'],
      ['SALES', 'Direct Sales Account', 'Primary sales revenue ledger'],
      ['DISCOUNT', 'Discount Allowed', 'Trade discount expense ledger'],
      ['ROUND_OFF', 'Round Off (+/-)', 'Invoice tolerance rounding ledger'],
    ];
    for (const [key, ledgerName, desc] of mappings) {
      await client.query(
        `INSERT INTO public.tally_ledger_mappings (cmp_id, mapping_key, tally_ledger_name, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (cmp_id, mapping_key) DO UPDATE
         SET tally_ledger_name = EXCLUDED.tally_ledger_name,
             description = EXCLUDED.description,
             updated_at = CURRENT_TIMESTAMP`,
        [CMP_ID, key, ledgerName, desc]
      );
    }

    // 8. Seed Sample Balanced Invoices & Vouchers Across All Types (Sales, Purchase, Receipt, Payment, Credit Note, Debit Note)
    const today = isoDaysAgo(0);
    const yesterday = isoDaysAgo(1);
    const twoDaysAgo = isoDaysAgo(2);

    const voucherSeeds = [
      {
        userId: userMap['van1'],
        date: today,
        type: 'Sales',
        number: 'SALE-2026-001',
        party: 'Metro Hypermarket',
        godown: 'Van 01 Godown',
        paymentMode: 'CREDIT',
        source: 'VAN',
        syncStatus: 'READY',
        subtotal: 8000,
        tax: 1440,
        total: 9440,
        narration: 'Van 01 B2B Sales Invoice — Hebbal Belt (30 Days Credit)',
        items: [
          { name: 'Coca-Cola 500ml PET', qty: 100, uom: 'PCS', rate: 40, tax: 720, taxable: 4000 },
          { name: 'Red Bull Energy Drink 250ml Can', qty: 32, uom: 'PCS', rate: 125, tax: 720, taxable: 4000 },
        ],
        entries: [
          { ledger: 'Metro Hypermarket', dr_cr: 'DR', amount: 9440, isParty: true },
          { ledger: 'Direct Sales Account', dr_cr: 'CR', amount: 8000, isParty: false },
          { ledger: 'CGST Output Payable (9%)', dr_cr: 'CR', amount: 720, isParty: false },
          { ledger: 'SGST Output Payable (9%)', dr_cr: 'CR', amount: 720, isParty: false },
        ],
      },
      {
        userId: userMap['van2'],
        date: today,
        type: 'Sales',
        number: 'SALE-2026-002',
        party: 'Fresh Mart Supermarket',
        godown: 'Van 02 Godown',
        paymentMode: 'CASH',
        source: 'VAN',
        syncStatus: 'SYNCED',
        subtotal: 5100,
        tax: 612,
        total: 5712,
        narration: 'Van 02 Cash Spot Sale — Indiranagar Route',
        items: [
          { name: 'Britannia Good Day Butter 100g', qty: 120, uom: 'PCS', rate: 30, tax: 432, taxable: 3600 },
          { name: 'Maggi 2-Minute Masala Noodles 70g', qty: 100, uom: 'PCS', rate: 15, tax: 180, taxable: 1500 },
        ],
        entries: [
          { ledger: 'Cash in Hand', dr_cr: 'DR', amount: 5712, isParty: false },
          { ledger: 'Van POS Spot Sales Account', dr_cr: 'CR', amount: 5100, isParty: false },
          { ledger: 'CGST Output Payable (9%)', dr_cr: 'CR', amount: 306, isParty: false },
          { ledger: 'SGST Output Payable (9%)', dr_cr: 'CR', amount: 306, isParty: false },
        ],
      },
      {
        userId: userMap['van3'],
        date: yesterday,
        type: 'Sales',
        number: 'SALE-2026-003',
        party: 'Kaveri Super Bazaar',
        godown: 'Van 03 Godown',
        paymentMode: 'CARD',
        source: 'VAN',
        syncStatus: 'SYNCED',
        subtotal: 7200,
        tax: 1008,
        total: 8208,
        narration: 'Van 03 POS Card Sale — South Route',
        items: [
          { name: 'Amul Taaza Homogenised Toned Milk 1L', qty: 50, uom: 'PCS', rate: 72, tax: 180, taxable: 3600 },
          { name: 'Nescafe Classic Instant Coffee Jar 50g', qty: 19, uom: 'PCS', rate: 190, tax: 649.8, taxable: 3610 },
        ],
        entries: [
          { ledger: 'ICICI Bank - POS Collection A/c 90211', dr_cr: 'DR', amount: 8208, isParty: false },
          { ledger: 'Van POS Spot Sales Account', dr_cr: 'CR', amount: 7200, isParty: false },
          { ledger: 'Output VAT 5%', dr_cr: 'CR', amount: 1008, isParty: false },
        ],
      },
      {
        userId: adminUserId,
        date: twoDaysAgo,
        type: 'Purchase',
        number: 'PUR-2026-001',
        party: 'Nestle India Regional Depot',
        godown: 'Main Location',
        paymentMode: 'CREDIT',
        source: 'WEB_APP',
        syncStatus: 'SYNCED',
        subtotal: 25000,
        tax: 3000,
        total: 28000,
        narration: 'Central Warehouse Stock Replenishment from Nestle India Depot',
        items: [
          { name: 'Nescafe Classic Instant Coffee Jar 50g', qty: 100, uom: 'PCS', rate: 145, tax: 2610, taxable: 14500 },
          { name: 'Maggi 2-Minute Masala Noodles 70g', qty: 913, uom: 'PCS', rate: 11.5, tax: 1260, taxable: 10500 },
        ],
        entries: [
          { ledger: 'Direct Purchase Account (COGS)', dr_cr: 'DR', amount: 25000, isParty: false },
          { ledger: 'Input GST / VAT Credit Receivable', dr_cr: 'DR', amount: 3000, isParty: false },
          { ledger: 'Nestle India Regional Depot', dr_cr: 'CR', amount: 28000, isParty: true },
        ],
      },
      {
        userId: userMap['van1'],
        date: today,
        type: 'Receipt',
        number: 'RCT-2026-001',
        party: 'Metro Hypermarket',
        godown: 'Van 01 Godown',
        paymentMode: 'CASH',
        source: 'VAN',
        syncStatus: 'SYNCED',
        subtotal: 15000,
        tax: 0,
        total: 15000,
        narration: 'On-account collection received from Metro Hypermarket',
        items: [],
        entries: [
          { ledger: 'HDFC Bank - Current A/c 50100', dr_cr: 'DR', amount: 15000, isParty: false },
          { ledger: 'Metro Hypermarket', dr_cr: 'CR', amount: 15000, isParty: true },
        ],
      },
      {
        userId: adminUserId,
        date: yesterday,
        type: 'Payment',
        number: 'PAY-2026-001',
        party: 'Hindustan Unilever Distributors',
        godown: 'Main Location',
        paymentMode: 'BANK',
        source: 'WEB_APP',
        syncStatus: 'SYNCED',
        subtotal: 40000,
        tax: 0,
        total: 40000,
        narration: 'NEFT vendor settlement to Hindustan Unilever Distributors',
        items: [],
        entries: [
          { ledger: 'Hindustan Unilever Distributors', dr_cr: 'DR', amount: 40000, isParty: true },
          { ledger: 'HDFC Bank - Current A/c 50100', dr_cr: 'CR', amount: 40000, isParty: false },
        ],
      },
      {
        userId: userMap['van2'],
        date: yesterday,
        type: 'Credit Note',
        number: 'CN-2026-001',
        party: 'Green Basket Mart',
        godown: 'Van 02 Godown',
        paymentMode: 'CREDIT',
        source: 'WEB_APP',
        syncStatus: 'SYNCED',
        subtotal: 1000,
        tax: 120,
        total: 1120,
        narration: 'Sales return credit note for damaged carton transit boxes',
        items: [
          { name: 'Britannia Good Day Butter 100g', qty: 33, uom: 'PCS', rate: 30, tax: 120, taxable: 1000 },
        ],
        entries: [
          { ledger: 'Sales Returns Account', dr_cr: 'DR', amount: 1000, isParty: false },
          { ledger: 'Output VAT 5%', dr_cr: 'DR', amount: 120, isParty: false },
          { ledger: 'Green Basket Mart', dr_cr: 'CR', amount: 1120, isParty: true },
        ],
      },
      {
        userId: adminUserId,
        date: twoDaysAgo,
        type: 'Debit Note',
        number: 'DN-2026-001',
        party: 'ITC Consumer Wholesale',
        godown: 'Main Location',
        paymentMode: 'CREDIT',
        source: 'WEB_APP',
        syncStatus: 'SYNCED',
        subtotal: 2500,
        tax: 300,
        total: 2800,
        narration: 'Purchase return debit note for short-weight batch claim',
        items: [
          { name: "Lay's Classic Salted Potato Chips 50g", qty: 166, uom: 'PCS', rate: 15, tax: 300, taxable: 2500 },
        ],
        entries: [
          { ledger: 'ITC Consumer Wholesale', dr_cr: 'DR', amount: 2800, isParty: true },
          { ledger: 'Purchase Returns Account', dr_cr: 'CR', amount: 2500, isParty: false },
          { ledger: 'Input GST / VAT Credit Receivable', dr_cr: 'CR', amount: 300, isParty: false },
        ],
      },
    ];

    for (const v of voucherSeeds) {
      const tempGuid = `SEED-${CMP_ID}-${v.number}`;
      const vRes = await client.query(
        `INSERT INTO public.vouchers (
           cmp_id, user_id, voucher_date, voucher_type, voucher_number,
           party_ledger_name, party_name, narration, amount, tax_amount, round_off_amount,
           payment_mode, guid, sync_status, source, created_by_user_id, created_at
         )
         VALUES (
           $1, $2, $3::date, $4, $5,
           $6, $6, $7, $8, $9, 0,
           $10, $11, $12, $13, $2, CURRENT_TIMESTAMP
         )
         RETURNING id`,
        [
          CMP_ID,
          v.userId,
          v.date,
          v.type,
          v.number,
          v.party,
          v.narration,
          v.total,
          v.tax,
          v.paymentMode,
          tempGuid,
          v.syncStatus,
          v.source,
        ]
      );
      const voucherId = Number(vRes.rows[0].id);

      for (const item of v.items) {
        await client.query(
          `INSERT INTO public.voucher_inventory_entries (
             voucher_id, cmp_id, stock_item_name, godown_name, actual_qty, billed_qty,
             uom, rate, discount, amount, voucher_guid, voucher_number, voucher_type,
             voucher_date, created_at
           )
           VALUES ($1, $2, $3, $4, $5, $5, $6, $7, 0, $8, $9, $10, $11, $12::date, CURRENT_TIMESTAMP)`,
          [
            voucherId,
            CMP_ID,
            item.name,
            v.godown,
            item.qty,
            item.uom,
            item.rate,
            item.taxable,
            tempGuid,
            v.number,
            v.type,
            v.date,
          ]
        );
      }

      let idx = 0;
      for (const e of v.entries) {
        await client.query(
          `INSERT INTO public.voucher_ledger_entries (
             voucher_id, cmp_id, ledger_name, dr_cr, amount, is_party_ledger,
             voucher_guid, voucher_number, voucher_type, voucher_date, entry_index, created_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::date, $11, CURRENT_TIMESTAMP)`,
          [
            voucherId,
            CMP_ID,
            e.ledger,
            e.dr_cr,
            e.amount,
            e.isParty,
            tempGuid,
            v.number,
            v.type,
            v.date,
            idx++,
          ]
        );
      }
    }

    // 9. Seed Initial Live Telemetry Pings for Van 01, Van 02, and Van 03
    const telemetrySeeds: Array<{ username: string; points: [number, number, number][] }> = [
      {
        username: 'van1',
        points: [
          [13.0285, 77.5186, 36],
          [13.0358, 77.5970, 40],
          [13.0480, 77.6060, 28],
        ],
      },
      {
        username: 'van2',
        points: [
          [13.0285, 77.5186, 32],
          [12.9784, 77.6408, 34],
          [12.9885, 77.6650, 26],
        ],
      },
      {
        username: 'van3',
        points: [
          [13.0285, 77.5186, 30],
          [12.9352, 77.6245, 38],
          [12.9250, 77.5938, 22],
        ],
      },
    ];

    for (const van of telemetrySeeds) {
      const uid = userMap[van.username];
      for (let i = 0; i < van.points.length; i++) {
        const [lat, lng, speedKmh] = van.points[i];
        await client.query(
          `INSERT INTO public.van_location_ping (
             cmp_id, salesman_user_id, shift_id, latitude, longitude,
             accuracy_m, speed_mps, heading_deg, battery_pct, is_moving,
             recorded_at, received_at
           )
           VALUES ($1, $2, NULL, $3, $4, 4.0, $5, $6, 91, $7, NOW() - INTERVAL '${(van.points.length - i) * 4} minutes', NOW())`,
          [CMP_ID, uid, lat, lng, speedKmh / 3.6, (i * 65) % 360, speedKmh > 0]
        );
      }
    }

    await client.query('COMMIT');

    console.log('✅ Reset & Fresh Seed completed cleanly!');
    console.log('Users created:', userMap);
    console.log(`Godowns: ${godowns.length}, Groups: ${groupSeeds.length}, Ledgers: ${ledgerSeeds.length}, Vouchers: ${voucherSeeds.length}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Reset & Seed failed, rolled back:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

resetAndSeedFresh();
