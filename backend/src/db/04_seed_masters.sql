-- Seed Master Data for Company 12 (Talliffy Demo Company)

BEGIN;

-- 1. Units
INSERT INTO public.units (userid, cmpid, masterid, guid, unit_name, is_simple_unit, original_name, created_at, updated_at)
VALUES 
    (5, 12, 101, 'UNIT-CMP12-NOS', 'Nos', true, 'Numbers', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 102, 'UNIT-CMP12-PCS', 'Pcs', true, 'Pieces', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 103, 'UNIT-CMP12-BOX', 'Box', true, 'Boxes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 104, 'UNIT-CMP12-BTL', 'Btl', true, 'Bottles', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 105, 'UNIT-CMP12-KG',  'Kg',  true, 'Kilograms', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (cmpid, masterid) DO NOTHING;

-- 2. Stock Groups
INSERT INTO public.stock_groups (userid, cmpid, masterid, guid, name, parent, is_deleted, created_at, updated_at)
VALUES 
    (5, 12, 201, 'SG-CMP12-BEV',   'Beverages',        'Primary', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 202, 'SG-CMP12-SNK',   'Snacks & Savouries','Primary', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 203, 'SG-CMP12-DAIRY', 'Dairy & Milk',     'Primary', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 204, 'SG-CMP12-INST',  'Instant Foods',    'Primary', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 205, 'SG-CMP12-CONF',  'Confectionery',    'Primary', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (cmpid, masterid) DO NOTHING;

-- 3. Groups (Accounts)
INSERT INTO public.groups (userid, cmpid, masterid, guid, grp_name, grp_parent, grp_primary_group, grp_nature, is_revenue, is_reserved, is_active, is_deleted, sync_status, created_at, updated_at)
VALUES 
    (5, 12, 301, 'GRP-CMP12-CAP',  'Capital Account',      'Primary',         'Capital Account',      'Liabilities', false, true, true, false, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 302, 'GRP-CMP12-CURRA','Current Assets',       'Primary',         'Current Assets',       'Assets',      false, true, true, false, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 303, 'GRP-CMP12-CASH', 'Cash-in-Hand',         'Current Assets',  'Current Assets',       'Assets',      false, true, true, false, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 304, 'GRP-CMP12-BANK', 'Bank Accounts',        'Current Assets',  'Current Assets',       'Assets',      false, true, true, false, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 305, 'GRP-CMP12-DEBT', 'Sundry Debtors',       'Current Assets',  'Current Assets',       'Assets',      false, true, true, false, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 306, 'GRP-CMP12-CURRL','Current Liabilities',  'Primary',         'Current Liabilities',  'Liabilities', false, true, true, false, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 307, 'GRP-CMP12-CRED', 'Sundry Creditors',     'Current Liabilities', 'Current Liabilities', 'Liabilities', false, true, true, false, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 308, 'GRP-CMP12-TAX',  'Duties & Taxes',       'Current Liabilities', 'Current Liabilities', 'Liabilities', false, true, true, false, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 309, 'GRP-CMP12-SALES','Sales Accounts',       'Primary',         'Sales Accounts',       'Income',      true,  true, true, false, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 310, 'GRP-CMP12-PURCH','Purchase Accounts',    'Primary',         'Purchase Accounts',    'Expenses',    true,  true, true, false, 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (cmpid, masterid) DO NOTHING;

-- 4. Ledgers (Parties, Cash, Bank, Sales, Tax)
DO $$
DECLARE
    v_grpid_debtors BIGINT;
    v_grpid_cash    BIGINT;
    v_grpid_bank    BIGINT;
    v_grpid_sales   BIGINT;
    v_grpid_taxes   BIGINT;
BEGIN
    SELECT grpid INTO v_grpid_debtors FROM public.groups WHERE cmpid = 12 AND grp_name = 'Sundry Debtors' LIMIT 1;
    SELECT grpid INTO v_grpid_cash    FROM public.groups WHERE cmpid = 12 AND grp_name = 'Cash-in-Hand' LIMIT 1;
    SELECT grpid INTO v_grpid_bank    FROM public.groups WHERE cmpid = 12 AND grp_name = 'Bank Accounts' LIMIT 1;
    SELECT grpid INTO v_grpid_sales   FROM public.groups WHERE cmpid = 12 AND grp_name = 'Sales Accounts' LIMIT 1;
    SELECT grpid INTO v_grpid_taxes   FROM public.groups WHERE cmpid = 12 AND grp_name = 'Duties & Taxes' LIMIT 1;

    -- Customers (Sundry Debtors)
    INSERT INTO public.ledgers (
        userid, cmpid, masterid, guid, grpid, led_name, led_parent, led_primary_group,
        led_opening_balance, led_closing_balance, led_billwise_on, is_active, is_deleted,
        led_mobile, led_email, led_address_1, led_state, led_country, gst_gstin, sync_status, created_at, updated_at
    ) VALUES
        (5, 12, 401, 'LED-CMP12-401', v_grpid_debtors, 'Metro Hypermarket', 'Sundry Debtors', 'Current Assets', 1500.00, 1500.00, true, true, false, '+919886011223', 'accounts@metrohyper.com', '100 Feet Ring Road, Hebbal', 'Karnataka', 'India', '29AAACM1234A1Z1', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (5, 12, 402, 'LED-CMP12-402', v_grpid_debtors, 'Green Basket Mart', 'Sundry Debtors', 'Current Assets', 850.00, 850.00, true, true, false, '+919741044556', 'billing@greenbasket.in', 'Sector 4, HSR Layout', 'Karnataka', 'India', '29AABCG5678B1Z2', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (5, 12, 403, 'LED-CMP12-403', v_grpid_debtors, 'Fresh Mart Supermarket', 'Sundry Debtors', 'Current Assets', 2200.00, 2200.00, true, true, false, '+919886055441', 'freshmart@blrretail.com', 'Yelahanka Main Road', 'Karnataka', 'India', '29AAACF7788C1Z3', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (5, 12, 404, 'LED-CMP12-404', v_grpid_debtors, 'Highway Express Retail', 'Sundry Debtors', 'Current Assets', 340.00, 340.00, true, true, false, '+919900177889', 'highway.express@gmail.com', 'Whitefield Main Road', 'Karnataka', 'India', '29AAACH9876C1Z3', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (5, 12, 405, 'LED-CMP12-405', v_grpid_debtors, 'Gopalan Wholesale Mart', 'Sundry Debtors', 'Current Assets', 1100.00, 1100.00, true, true, false, '+919426789012', 'ap@gopalanmart.com', 'Old Madras Road, Indiranagar', 'Karnataka', 'India', '29AAACG4411D1Z4', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (5, 12, 406, 'LED-CMP12-406', v_grpid_debtors, 'Kaveri Super Bazaar', 'Sundry Debtors', 'Current Assets', 500.00, 500.00, true, true, false, '+919845166778', 'kaveri.bazaar@outlook.com', '11th Main, Jayanagar', 'Karnataka', 'India', '29AAACK3322E1Z5', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        -- Cash & Bank
        (5, 12, 407, 'LED-CMP12-407', v_grpid_cash, 'Cash in Hand', 'Cash-in-Hand', 'Current Assets', 45000.00, 45000.00, false, true, false, '', '', 'Central Treasury Bay', 'Karnataka', 'India', '', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (5, 12, 408, 'LED-CMP12-408', v_grpid_bank, 'ICICI Bank - POS Collection A/c 90211', 'Bank Accounts', 'Current Assets', 185000.00, 185000.00, false, true, false, '', '', 'MG Road Branch', 'Karnataka', 'India', '', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        -- Revenue & Tax
        (5, 12, 409, 'LED-CMP12-409', v_grpid_sales, 'Direct Sales Account', 'Sales Accounts', 'Sales Accounts', 0.00, 0.00, false, true, false, '', '', '', 'Karnataka', 'India', '', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (5, 12, 410, 'LED-CMP12-410', v_grpid_taxes, 'Output VAT 5%', 'Duties & Taxes', 'Current Liabilities', 0.00, 0.00, false, true, false, '', '', '', 'Karnataka', 'India', '', 'SYNCED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (cmpid, masterid) DO NOTHING;
END $$;

-- 5. Stock Items
INSERT INTO public.stock_items (
    userid, cmpid, masterid, guid, name, parent, category, base_units,
    opening_balance, opening_rate, opening_value, is_deleted, created_at, updated_at
) VALUES 
    (5, 12, 501, 'ITEM-CMP12-501', 'Coca-Cola 500ml PET',              'Beverages',         'Beverages',     'Nos', 150.00, 40.00, 6000.00, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 502, 'ITEM-CMP12-502', 'Red Bull Energy Drink 250ml Can',  'Beverages',         'Beverages',     'Nos',  80.00, 125.00, 10000.00, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 503, 'ITEM-CMP12-503', 'Britannia Good Day Butter 100g',   'Snacks & Savouries','Snacks',        'Nos', 200.00, 30.00, 6000.00, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 504, 'ITEM-CMP12-504', 'Maggi 2-Minute Masala Noodles 70g','Instant Foods',    'Instant Foods', 'Nos', 250.00, 15.00, 3750.00, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 505, 'ITEM-CMP12-505', 'Amul Taaza Homogenised Milk 1L',   'Dairy & Milk',      'Dairy',         'Nos',  60.00, 72.00, 4320.00, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 506, 'ITEM-CMP12-506', 'Nescafe Classic Instant Coffee 50g','Beverages',        'Beverages',     'Nos',  90.00, 190.00, 17100.00, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 507, 'ITEM-CMP12-507', 'Lay''s Classic Salted Chips 50g',   'Snacks & Savouries','Snacks',        'Nos', 180.00, 20.00, 3600.00, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 12, 508, 'ITEM-CMP12-508', 'Cadbury Dairy Milk Silk 60g',      'Confectionery',     'Confectionery', 'Nos', 100.00, 85.00, 8500.00, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (cmpid, name) DO NOTHING;

COMMIT;
