-- Migration Patch: Add missing columns to public.vouchers required by backend & webapp

BEGIN;

ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS cmp_id BIGINT DEFAULT 12;
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS user_id BIGINT DEFAULT 5;
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT DEFAULT 5;
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS voucher_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS amount NUMERIC(18,2) DEFAULT 0.00;
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS party_ledger_name VARCHAR(255);
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS party_name VARCHAR(255);
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS reference VARCHAR(500);
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50) DEFAULT 'CASH';
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'VAN';
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50) DEFAULT 'READY';
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS guid VARCHAR(100);
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS entry_latitude NUMERIC(10,7);
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS entry_longitude NUMERIC(10,7);
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS entry_accuracy_m NUMERIC(10,2);
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS party_gstin VARCHAR(50);
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS tally_voucher_number VARCHAR(100);
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT FALSE;

-- Synchronize legacy column names if already populated
UPDATE public.vouchers 
SET voucher_date = COALESCE(voucher_date, date, CURRENT_DATE),
    amount = COALESCE(amount, total_amount, 0),
    sync_status = COALESCE(sync_status, tally_sync_status, 'READY'),
    guid = COALESCE(guid, tally_guid, 'VCH-' || id),
    cmp_id = COALESCE(cmp_id, 12),
    created_by_user_id = COALESCE(created_by_user_id, user_id, 5),
    user_id = COALESCE(user_id, created_by_user_id, 5);

-- Indexes for fast web dashboard and reporting queries
CREATE INDEX IF NOT EXISTS idx_vouchers_cmp_id ON public.vouchers (cmp_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_created_by ON public.vouchers (cmp_id, created_by_user_id, voucher_date);
CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_type ON public.vouchers (cmp_id, voucher_type);
CREATE INDEX IF NOT EXISTS idx_vouchers_date ON public.vouchers (cmp_id, voucher_date);

COMMIT;
