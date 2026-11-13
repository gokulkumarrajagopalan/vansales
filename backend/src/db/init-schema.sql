-- =============================================================================
-- VANSALES PRO DATABASE EXTENSION & TALLY INTEGRATION SCHEMA
-- =============================================================================

-- 1. Create Tally Ledger Mappings Matrix Table
CREATE TABLE IF NOT EXISTS public.tally_ledger_mappings (
    id BIGSERIAL PRIMARY KEY,
    cmp_id BIGINT NOT NULL,
    mapping_key VARCHAR(50) NOT NULL,
    tally_ledger_name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cmp_mapping UNIQUE (cmp_id, mapping_key)
);

-- 2. Alter van_shift with operational columns if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='van_shift' AND column_name='opening_odometer') THEN
        ALTER TABLE public.van_shift ADD COLUMN opening_odometer INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='van_shift' AND column_name='closing_odometer') THEN
        ALTER TABLE public.van_shift ADD COLUMN closing_odometer INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='van_shift' AND column_name='opening_cash') THEN
        ALTER TABLE public.van_shift ADD COLUMN opening_cash NUMERIC(12,2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='van_shift' AND column_name='closing_cash_physical') THEN
        ALTER TABLE public.van_shift ADD COLUMN closing_cash_physical NUMERIC(12,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='van_shift' AND column_name='closing_cash_system') THEN
        ALTER TABLE public.van_shift ADD COLUMN closing_cash_system NUMERIC(12,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='van_shift' AND column_name='godown_name') THEN
        ALTER TABLE public.van_shift ADD COLUMN godown_name VARCHAR(255) DEFAULT 'Van 01 Godown';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='van_shift' AND column_name='status') THEN
        ALTER TABLE public.van_shift ADD COLUMN status VARCHAR(20) DEFAULT 'OPEN';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='van_shift' AND column_name='handover_notes') THEN
        ALTER TABLE public.van_shift ADD COLUMN handover_notes TEXT;
    END IF;
END $$;

-- 3. Alter vouchers with operational columns if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='shift_id') THEN
        ALTER TABLE public.vouchers ADD COLUMN shift_id BIGINT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='tax_amount') THEN
        ALTER TABLE public.vouchers ADD COLUMN tax_amount NUMERIC(14,2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='round_off_amount') THEN
        ALTER TABLE public.vouchers ADD COLUMN round_off_amount NUMERIC(6,2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='sync_error_message') THEN
        ALTER TABLE public.vouchers ADD COLUMN sync_error_message TEXT;
    END IF;
END $$;

-- 4. Seed default Tally ledger mappings for company 12
INSERT INTO public.tally_ledger_mappings (cmp_id, mapping_key, tally_ledger_name, description)
VALUES 
    (12, 'CASH', 'Cash', 'Van Cash in hand settlement'),
    (12, 'CARD', 'Bank Accounts', 'Electronic card payments'),
    (12, 'VAT_OUTPUT', 'Output VAT 5%', 'Standard UAE 5% VAT Output Ledger'),
    (12, 'SALES', 'Sales Account', 'Main revenue sales ledger'),
    (12, 'DISCOUNT', 'Discount Allowed', 'Spot sales trade discounts'),
    (12, 'ROUND_OFF', 'Round Off (+/-)', 'Tolerance balance round-off ledger')
ON CONFLICT (cmp_id, mapping_key) DO UPDATE 
SET tally_ledger_name = EXCLUDED.tally_ledger_name;

-- 5. Ensure Van 01 Godown exists for company 12
INSERT INTO public.godowns (cmpid, userid, name, guid, address, is_deleted, created_at)
SELECT 12, 1, 'Van 01 Godown', 'GODOWN-VAN-01', 'Van 01 Vehicle Storage', false, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM public.godowns WHERE cmpid = 12 AND name = 'Van 01 Godown'
);

-- 6. Ensure default field rep salesman user exists
-- Password hash for 'password123' using bcrypt
INSERT INTO public.users (
    username, password, full_name, email, role, licence_no, isactive, enabled, 
    type_of_user, van_godown_name, mobile, created_at
)
SELECT 
    'vansales1', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 
    'Ahmed Al Mansoori', 
    'sales1@talliffy.com', 
    'VAN_REP', 
    99999999, 
    '1', 
    '1', 
    'MOBILE_APP', 
    'Van 01 Godown', 
    '+971501234567', 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE username = 'vansales1'
);

-- Also ensure admin user exists with 'admin' / 'password123'
INSERT INTO public.users (
    username, password, full_name, email, role, licence_no, isactive, enabled, 
    type_of_user, mobile, created_at
)
SELECT 
    'admin', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 
    'VanSales Administrator', 
    'admin@talliffy.com', 
    'ADMIN', 
    99999998, 
    '1', 
    '1', 
    'WEB_APP', 
    '+971509999999', 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE username = 'admin'
);


-- =============================================================================
-- UNIFIED TALLY ORDER & APEXERP COMPREHENSIVE EXTENSION
-- =============================================================================

-- 1. System Settings & Dynamic Branding
CREATE TABLE IF NOT EXISTS public.settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Agro Categories Master
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    image_url VARCHAR(500),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Spatie RBAC Permissions & Roles
CREATE TABLE IF NOT EXISTS public.permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    group_name VARCHAR(100),
    guard_name VARCHAR(50) DEFAULT 'web',
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    guard_name VARCHAR(50) DEFAULT 'web',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.role_has_permissions (
    role_id BIGINT REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id BIGINT REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.model_has_roles (
    role_id BIGINT REFERENCES public.roles(id) ON DELETE CASCADE,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, model_id, model_type)
);

-- 4. Products Master with Packing Specifications
CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    packing_qty VARCHAR(100) NOT NULL,
    final_price NUMERIC(12,2) NOT NULL,
    mrp NUMERIC(12,2) NOT NULL,
    purchase_cost NUMERIC(12,2) DEFAULT 0.00,
    gst_rate NUMERIC(5,2) DEFAULT 18.00,
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Vendors & Customers with Borrow Limits
CREATE TABLE IF NOT EXISTS public.vendors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    gst_number VARCHAR(50),
    borrow_amount_limit NUMERIC(12,2) DEFAULT 0.00,
    address TEXT,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Orders Master & Discount Governance
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    sales_person_id BIGINT,
    vendor_id BIGINT REFERENCES public.vendors(id) ON DELETE RESTRICT,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12,2) DEFAULT 0.00,
    final_total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    rejection_reason TEXT,
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,
    tally_sync_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'synced', 'failed'
    tally_voucher_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    line_total NUMERIC(12,2) NOT NULL
);

-- 7. Universal Double-Entry Vouchers Hub (ApexERP)
CREATE TABLE IF NOT EXISTS public.vouchers (
    id BIGSERIAL PRIMARY KEY,
    voucher_number VARCHAR(50) UNIQUE NOT NULL,
    voucher_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    party_id BIGINT,
    total_amount NUMERIC(15,2) NOT NULL,
    tax_amount NUMERIC(12,2) DEFAULT 0.00,
    narration TEXT,
    tally_guid VARCHAR(100),
    tally_sync_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
    id BIGSERIAL PRIMARY KEY,
    voucher_id BIGINT REFERENCES public.vouchers(id) ON DELETE CASCADE,
    ledger_id BIGINT,
    debit_amount NUMERIC(15,2) DEFAULT 0.00,
    credit_amount NUMERIC(15,2) DEFAULT 0.00,
    narration VARCHAR(255)
);

-- 8. Crop Advisory Desk
CREATE TABLE IF NOT EXISTS public.crop_advisories (
    id BIGSERIAL PRIMARY KEY,
    farmer_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20),
    crop_name VARCHAR(100) NOT NULL,
    issue_description TEXT NOT NULL,
    district VARCHAR(100),
    status VARCHAR(50) DEFAULT 'In Review',
    solution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
