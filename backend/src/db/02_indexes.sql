-- =============================================================================
-- TALLIFFY — 02_indexes.sql   All 148 non-constraint indexes
--
-- Run AFTER 01_tables.sql. Indexes backing PRIMARY KEY / UNIQUE constraints are
-- created by 01_tables.sql with their constraints and are not repeated here.
--
-- NOTE — no transaction wrapper. Statements are plain CREATE INDEX so a fresh
-- build is fast. To add these to a LIVE database instead, rewrite as
-- CREATE INDEX CONCURRENTLY (which cannot run inside a transaction) so no
-- write lock is taken on a populated table.
--
--   psql -d TallyDB -f 02_indexes.sql
--
-- Verify afterwards (expect 0 rows — CONCURRENTLY can fail part-way):
--   SELECT indexrelid::regclass FROM pg_index WHERE NOT indisvalid;
-- =============================================================================

CREATE INDEX idx_balsheet_cmp_fy ON public.balance_sheet USING btree (cmp_id, financial_year);
CREATE INDEX idx_balsheet_id ON public.balance_sheet USING btree (balanceid);
CREATE INDEX idx_bo_cmp_id ON public.bills_outstanding USING btree (cmp_id);
CREATE INDEX idx_bo_overdue ON public.bills_outstanding USING btree (cmp_id, report_type, overdue_days);
CREATE INDEX idx_bo_party ON public.bills_outstanding USING btree (cmp_id, party_name);
CREATE INDEX idx_bo_report_type ON public.bills_outstanding USING btree (cmp_id, report_type);
CREATE INDEX idx_bos_cmp_type ON public.bill_outstanding_summary USING btree (cmp_id, report_type);
CREATE INDEX idx_bos_overdue ON public.bill_outstanding_summary USING btree (total_overdue, cmp_id, report_type);
CREATE INDEX idx_companies_userid ON public.companies USING btree (userid);
CREATE INDEX idx_company_guid ON public.companies USING btree (company_guid);
CREATE INDEX idx_company_sync_cmp_id ON public.company_sync_status USING btree (cmp_id);
CREATE INDEX idx_company_sync_status ON public.companies USING btree (sync_status);
CREATE INDEX idx_company_userid ON public.companies USING btree (userid);
CREATE INDEX idx_costcategory_cmpid ON public.cost_categories USING btree (cmpid);
CREATE INDEX idx_costcategory_guid ON public.cost_categories USING btree (guid);
CREATE INDEX idx_costcategory_masterid ON public.cost_categories USING btree (masterid);
CREATE INDEX idx_costcategory_userid ON public.cost_categories USING btree (userid);
CREATE INDEX idx_costcentre_cmpid ON public.costcentre USING btree (cmpid);
CREATE INDEX idx_costcentre_guid ON public.costcentre USING btree (guid);
CREATE INDEX idx_costcentre_masterid ON public.costcentre USING btree (masterid);
CREATE INDEX idx_costcentre_userid ON public.costcentre USING btree (userid);
CREATE INDEX idx_currency_cmpid ON public.currency USING btree (cmpid);
CREATE INDEX idx_currency_guid ON public.currency USING btree (guid);
CREATE INDEX idx_currency_masterid ON public.currency USING btree (masterid);
CREATE INDEX idx_currency_userid ON public.currency USING btree (userid);
CREATE INDEX idx_godown_cmpid ON public.godowns USING btree (cmpid);
CREATE INDEX idx_godown_guid ON public.godowns USING btree (guid);
CREATE INDEX idx_godown_masterid ON public.godowns USING btree (masterid);
CREATE INDEX idx_godown_userid ON public.godowns USING btree (userid);
CREATE INDEX idx_groups_cmpid ON public.groups USING btree (cmpid);
CREATE INDEX idx_groups_company_active ON public.groups USING btree (cmpid, is_active) WHERE (is_deleted = false);
CREATE INDEX idx_groups_guid ON public.groups USING btree (guid);
CREATE INDEX idx_groups_masterid ON public.groups USING btree (masterid);
CREATE INDEX idx_groups_name ON public.groups USING btree (grp_name);
CREATE INDEX idx_groups_parent ON public.groups USING btree (grp_parent);
CREATE INDEX idx_groups_parent_grpid ON public.groups USING btree (parent_grpid);
CREATE INDEX idx_groups_revenue ON public.groups USING btree (is_revenue);
CREATE INDEX idx_groups_userid ON public.groups USING btree (userid);
CREATE INDEX idx_ledgers_cmpid ON public.ledgers USING btree (cmpid);
CREATE INDEX idx_ledgers_company_active ON public.ledgers USING btree (cmpid, is_active) WHERE (is_deleted = false);
CREATE INDEX idx_ledgers_email ON public.ledgers USING btree (led_email) WHERE (led_email IS NOT NULL);
CREATE INDEX idx_ledgers_grpid ON public.ledgers USING btree (grpid);
CREATE INDEX idx_ledgers_gstin ON public.ledgers USING btree (gst_gstin) WHERE (gst_gstin IS NOT NULL);
CREATE INDEX idx_ledgers_guid ON public.ledgers USING btree (guid);
CREATE INDEX idx_ledgers_masterid ON public.ledgers USING btree (masterid);
CREATE INDEX idx_ledgers_mobile ON public.ledgers USING btree (led_mobile) WHERE (led_mobile IS NOT NULL);
CREATE INDEX idx_ledgers_name ON public.ledgers USING btree (led_name);
CREATE INDEX idx_ledgers_parent ON public.ledgers USING btree (led_parent);
CREATE INDEX idx_ledgers_parent_ledid ON public.ledgers USING btree (parent_ledid);
CREATE INDEX idx_ledgers_revenue ON public.ledgers USING btree (is_revenue);
CREATE INDEX idx_ledgers_userid ON public.ledgers USING btree (userid);
CREATE INDEX idx_profitloss_cmp_fy ON public.profit_loss USING btree (cmp_id, financial_year);
CREATE INDEX idx_profitloss_id ON public.profit_loss USING btree (plid);
CREATE INDEX idx_revoked_tokens_expires ON public.revoked_tokens USING btree (expires_at);
CREATE UNIQUE INDEX idx_revoked_tokens_token ON public.revoked_tokens USING btree (token);
CREATE INDEX idx_stockcategory_cmpid ON public.stock_categories USING btree (cmpid);
CREATE INDEX idx_stockcategory_guid ON public.stock_categories USING btree (guid);
CREATE INDEX idx_stockcategory_masterid ON public.stock_categories USING btree (masterid);
CREATE INDEX idx_stockcategory_userid ON public.stock_categories USING btree (userid);
CREATE INDEX idx_stockgroup_cmpid ON public.stock_groups USING btree (cmpid);
CREATE INDEX idx_stockgroup_guid ON public.stock_groups USING btree (guid);
CREATE INDEX idx_stockgroup_masterid ON public.stock_groups USING btree (masterid);
CREATE INDEX idx_stockgroup_userid ON public.stock_groups USING btree (userid);
CREATE INDEX idx_stockitem_category ON public.stock_items USING btree (category);
CREATE INDEX idx_stockitem_cmpid ON public.stock_items USING btree (cmpid);
CREATE INDEX idx_stockitem_guid ON public.stock_items USING btree (guid);
CREATE INDEX idx_stockitem_hsn_code ON public.stock_items USING btree (hsn_code);
CREATE INDEX idx_stockitem_masterid ON public.stock_items USING btree (masterid);
CREATE INDEX idx_stockitem_parent ON public.stock_items USING btree (parent);
CREATE INDEX idx_stockitem_userid ON public.stock_items USING btree (userid);
CREATE INDEX idx_subscription_status ON public.subscription USING btree (status);
CREATE INDEX idx_subscription_user ON public.subscription USING btree (user_id);
CREATE INDEX idx_support_status ON public.support_tickets USING btree (status);
CREATE INDEX idx_support_user_id ON public.support_tickets USING btree (user_id);
CREATE INDEX idx_survey_type_created ON public.survey USING btree (survey_type, created_at);
CREATE INDEX idx_taxunit_cmpid ON public.taxunit USING btree (cmpid);
CREATE INDEX idx_taxunit_guid ON public.taxunit USING btree (guid);
CREATE INDEX idx_taxunit_masterid ON public.taxunit USING btree (masterid);
CREATE INDEX idx_taxunit_userid ON public.taxunit USING btree (userid);
CREATE INDEX idx_trailbalance_cmp_fy ON public.trail_balance USING btree (cmp_id, financial_year);
CREATE INDEX idx_trailbalance_id ON public.trail_balance USING btree (tid);
CREATE INDEX idx_units_cmpid ON public.units USING btree (cmpid);
CREATE INDEX idx_units_guid ON public.units USING btree (guid);
CREATE INDEX idx_units_masterid ON public.units USING btree (masterid);
CREATE INDEX idx_units_userid ON public.units USING btree (userid);
CREATE INDEX idx_user_devices_token_active ON public.user_devices USING btree (device_token) WHERE (is_active = true);
CREATE INDEX idx_user_devices_user_token_active ON public.user_devices USING btree (user_id, device_token) WHERE (is_active = true);
CREATE INDEX idx_users_device_token ON public.users USING btree (device_token);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_email_licence ON public.users USING btree (email, licence_no);
CREATE INDEX idx_users_parent ON public.users USING btree (parent_user_id);
CREATE INDEX idx_users_username ON public.users USING btree (username);
CREATE INDEX idx_van_ping_lookup ON public.van_location_ping USING btree (cmp_id, salesman_user_id, recorded_at DESC);
CREATE INDEX idx_van_ping_recorded_at ON public.van_location_ping USING btree (recorded_at);
CREATE INDEX idx_van_shift_lookup ON public.van_shift USING btree (cmp_id, salesman_user_id, started_at DESC);
CREATE INDEX idx_vba2_batch_name ON public.voucher_batch_allocations USING btree (cmp_id, batch_name);
CREATE INDEX idx_vba2_cmp_id ON public.voucher_batch_allocations USING btree (cmp_id);
CREATE INDEX idx_vba2_inventory_entry ON public.voucher_batch_allocations USING btree (inventory_entry_id);
CREATE INDEX idx_vba2_voucher_id ON public.voucher_batch_allocations USING btree (voucher_id);
CREATE INDEX idx_vba_bill_name ON public.voucher_bill_allocations USING btree (cmp_id, ledger_name, bill_name);
CREATE INDEX idx_vba_bill_type ON public.voucher_bill_allocations USING btree (cmp_id, bill_type);
CREATE INDEX idx_vba_cmp_id ON public.voucher_bill_allocations USING btree (cmp_id);
CREATE INDEX idx_vba_ledger_entry_id ON public.voucher_bill_allocations USING btree (ledger_entry_id);
CREATE INDEX idx_vba_voucher_id ON public.voucher_bill_allocations USING btree (voucher_id);
CREATE INDEX idx_vcca_cmp_id ON public.voucher_cost_category_allocations USING btree (cmp_id);
CREATE INDEX idx_vcca_ledger_entry ON public.voucher_cost_category_allocations USING btree (ledger_entry_id);
CREATE INDEX idx_vcca_voucher_id ON public.voucher_cost_category_allocations USING btree (voucher_id);
CREATE INDEX idx_vccna_cmp_id ON public.voucher_cost_centre_allocations USING btree (cmp_id);
CREATE INDEX idx_vccna_cost_cat ON public.voucher_cost_centre_allocations USING btree (cost_category_id);
CREATE INDEX idx_vccna_voucher_id ON public.voucher_cost_centre_allocations USING btree (voucher_id);
CREATE INDEX idx_vie_cmp_id ON public.voucher_inventory_entries USING btree (cmp_id);
CREATE INDEX idx_vie_stock_item ON public.voucher_inventory_entries USING btree (cmp_id, stock_item_name);
CREATE INDEX idx_vie_voucher_guid ON public.voucher_inventory_entries USING btree (voucher_guid);
CREATE INDEX idx_vie_voucher_id ON public.voucher_inventory_entries USING btree (voucher_id);
CREATE INDEX idx_vle_cmp_id ON public.voucher_ledger_entries USING btree (cmp_id);
CREATE INDEX idx_vle_cmp_ledger_date ON public.voucher_ledger_entries USING btree (cmp_id, ledger_name, voucher_date);
CREATE INDEX idx_vle_ledger_name ON public.voucher_ledger_entries USING btree (cmp_id, ledger_name);
CREATE INDEX idx_vle_voucher_guid ON public.voucher_ledger_entries USING btree (voucher_guid);
CREATE INDEX idx_vle_voucher_id ON public.voucher_ledger_entries USING btree (voucher_id);
CREATE INDEX idx_vouchers_alter_id ON public.vouchers USING btree (cmp_id, alter_id);
CREATE INDEX idx_vouchers_cmp_date_cover ON public.vouchers USING btree (cmp_id, voucher_date) INCLUDE (voucher_type, party_ledger_name, amount) WHERE (is_deleted = false);
CREATE INDEX idx_vouchers_cmp_id ON public.vouchers USING btree (cmp_id);
CREATE INDEX idx_vouchers_cmp_ltype_date ON public.vouchers USING btree (cmp_id, lower((voucher_type)::text), voucher_date) WHERE ((is_deleted = false) AND (is_active = true) AND (is_cancelled = false));
CREATE INDEX idx_vouchers_created_by ON public.vouchers USING btree (cmp_id, created_by_user_id, voucher_date);
CREATE INDEX idx_vouchers_date ON public.vouchers USING btree (cmp_id, voucher_date);
CREATE INDEX idx_vouchers_guid ON public.vouchers USING btree (guid);
CREATE INDEX idx_vouchers_number ON public.vouchers USING btree (cmp_id, voucher_number);
CREATE INDEX idx_vouchers_party ON public.vouchers USING btree (cmp_id, party_ledger_name);
CREATE INDEX idx_vouchers_pending_push ON public.vouchers USING btree (cmp_id, source, sync_status);
CREATE INDEX idx_vouchers_type ON public.vouchers USING btree (cmp_id, voucher_type);
CREATE INDEX idx_vouchertype_cmp_lparent ON public.vouchertype USING btree (cmpid, lower((parent)::text)) INCLUDE (name) WHERE ((is_deleted = false) OR (is_deleted IS NULL));
CREATE INDEX idx_vouchertype_cmpid ON public.vouchertype USING btree (cmpid);
CREATE INDEX idx_vouchertype_guid ON public.vouchertype USING btree (guid);
CREATE INDEX idx_vouchertype_masterid ON public.vouchertype USING btree (masterid);
CREATE INDEX idx_vouchertype_userid ON public.vouchertype USING btree (userid);
CREATE UNIQUE INDEX uk_van_ping_dedupe ON public.van_location_ping USING btree (salesman_user_id, recorded_at);
CREATE UNIQUE INDEX uk_van_shift_open ON public.van_shift USING btree (salesman_user_id) WHERE (ended_at IS NULL);
CREATE UNIQUE INDEX uq_cost_categories_cmp_guid ON public.cost_categories USING btree (cmpid, guid);
CREATE UNIQUE INDEX uq_costcentre_cmp_guid ON public.costcentre USING btree (cmpid, guid);
CREATE UNIQUE INDEX uq_godowns_cmp_guid ON public.godowns USING btree (cmpid, guid);
CREATE UNIQUE INDEX uq_groups_cmp_guid ON public.groups USING btree (cmpid, guid);
CREATE UNIQUE INDEX uq_ledgers_cmp_guid ON public.ledgers USING btree (cmpid, guid);
CREATE UNIQUE INDEX uq_stock_categories_cmp_guid ON public.stock_categories USING btree (cmpid, guid);
CREATE UNIQUE INDEX uq_stock_groups_cmp_guid ON public.stock_groups USING btree (cmpid, guid);
CREATE UNIQUE INDEX uq_stock_items_cmp_guid ON public.stock_items USING btree (cmpid, guid);
CREATE UNIQUE INDEX uq_taxunit_cmp_guid ON public.taxunit USING btree (cmpid, guid);
CREATE UNIQUE INDEX uq_vouchers_cmp_guid ON public.vouchers USING btree (cmp_id, guid);
CREATE UNIQUE INDEX uq_vouchertype_cmp_guid ON public.vouchertype USING btree (cmpid, guid);
