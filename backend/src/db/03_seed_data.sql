-- =============================================================================
-- TALLIFFY — 03_seed_data.sql   Reference / configuration data
--
-- Dumped from a verified local database. Run THIRD, after 01_tables.sql and
-- 02_indexes.sql.
--
-- CONTENTS — 104 rows across 8 reference tables:
--   app_config       13   roles              6   role_permissions  37
--   subscription_plan 3   plan_price         8   plan_feature      21
--   currency_config   3   country_currency  13
--
-- TRIAL LENGTH IS 90 DAYS  (app_config.trial.duration.days = '90', and the
-- FREE_TRIAL plan description matches).
--
-- WHAT IS DELIBERATELY NOT HERE
--   users, companies, vouchers, subscription, user_roles and all Tally master
--   data. Those are per-environment records, not reference data — a production
--   database must not be seeded with developer accounts or someone else's
--   books. The tables are created by 01_tables.sql and start empty.
--
-- FRESH DATABASE ONLY
--   These are plain INSERTs with explicit primary keys, so re-running against a
--   populated database fails on duplicate keys. That is intentional: it stops a
--   half-applied re-run from silently overwriting live configuration. To repair
--   or update an EXISTING database, use idempotent upserts instead.
--
-- Sequences are reset with setval() at the end, so the first row the
-- application inserts does not collide with these seeded ids.
--
-- APPLY:
--   psql -d TallyDB -v ON_ERROR_STOP=1 -f 03_seed_data.sql
--
-- VERIFY:
--   SELECT config_value FROM app_config WHERE config_key='trial.duration.days';  -- 90
--   SELECT count(*) FROM roles;                                                  -- 6
--   SELECT r.code, count(*) FROM role_permissions rp JOIN roles r USING(role_id)
--    GROUP BY r.code ORDER BY r.code;
--   -- ACCOUNTANT 10 | ADMIN 12 | PARTNER 1 | SALESMAN 2 | USER 10 | VIEWER 2
-- =============================================================================

BEGIN;

--
-- PostgreSQL database dump
--

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1
-- (pg_dump 18's \restrict/\unrestrict psql meta-commands were removed: psql
--  releases before 18 do not understand them and swallow the rest of the file
--  as arguments. SET transaction_timeout was removed too — it is PostgreSQL 17+
--  only and errors on the PG15 that ships with Amazon Linux 2023.)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: app_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('trial.duration.days', '90', 'INT', 'Free trial length in days for new accounts', 1, '2026-08-18 00:05:11.620353');
INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('trial.default.plan.code', 'FREE_TRIAL', 'STRING', 'Plan code assigned to new trial accounts', 1, '2026-08-18 00:05:11.620353');
INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('feature.beta.mode', '0', 'BOOL', '0 = production (trials actually expire after the duration)', 1, '2026-08-18 00:05:11.620353');
INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('account.default.user.type', 'TRIAL', 'STRING', 'Default type_of_user for new registrations', 1, '2026-08-18 00:05:11.620353');
INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('account.default.owner.role', 'USER', 'STRING', 'Access role for a new account owner (ADMIN is reserved for the Talliffy platform owner)', 1, '2026-08-18 00:05:11.620353');
INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('account.default.seat.limit', '1', 'INT', 'Default sub-account seats before the plan overrides it', 1, '2026-08-18 00:05:11.620353');
INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('currency.default', 'USD', 'STRING', 'Fallback billing currency when the country is unknown', 1, '2026-08-18 00:05:11.620353');
INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('feature.signup.country.required', '0', 'BOOL', '1 = country is mandatory at signup', 1, '2026-08-18 00:05:11.620353');
INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('salesman.default.limit', '3', 'INT', 'Salesman sub-accounts an owner may create when no plan feature applies', 1, '2026-08-18 00:05:11.620353');
INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('van.tracking.retention.days', '45', 'INT', 'Days of van location history kept before the nightly purge', 1, '2026-08-18 00:05:11.620353');
INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('support.phone', '+1 (555) 123-4567', 'STRING', 'Support Phone Number', 1, '2026-08-18 00:05:11.620353');
INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('support.email', 'support@talliffy.com', 'STRING', 'Support Email Address', 1, '2026-08-18 00:05:11.620353');
INSERT INTO public.app_config (config_key, config_value, value_type, description, is_active, updated_at) VALUES ('support.whatsapp', '+15551234567', 'STRING', 'Support WhatsApp Number (no + or spaces)', 1, '2026-08-18 00:05:11.620353');


--
-- Data for Name: currency_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.currency_config (code, symbol, locale, decimal_places, is_active, sort_order) VALUES ('INR', '₹', 'en-IN', 2, 1, 1);
INSERT INTO public.currency_config (code, symbol, locale, decimal_places, is_active, sort_order) VALUES ('USD', '$', 'en-US', 2, 1, 2);
INSERT INTO public.currency_config (code, symbol, locale, decimal_places, is_active, sort_order) VALUES ('AED', 'د.إ', 'en-AE', 2, 0, 3);


--
-- Data for Name: country_currency; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('IN', 'India', 'INR', 1, 1);
INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('AE', 'United Arab Emirates', 'USD', 1, 2);
INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('SA', 'Saudi Arabia', 'USD', 1, 3);
INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('QA', 'Qatar', 'USD', 1, 4);
INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('KW', 'Kuwait', 'USD', 1, 5);
INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('BH', 'Bahrain', 'USD', 1, 6);
INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('OM', 'Oman', 'USD', 1, 7);
INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('US', 'United States', 'USD', 1, 8);
INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('GB', 'United Kingdom', 'USD', 1, 9);
INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('SG', 'Singapore', 'USD', 1, 10);
INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('AU', 'Australia', 'USD', 1, 11);
INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('CA', 'Canada', 'USD', 1, 12);
INSERT INTO public.country_currency (country_iso2, country_name, currency_code, is_active, sort_order) VALUES ('OT', 'Other / International', 'USD', 1, 99);


--
-- Data for Name: subscription_plan; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.subscription_plan (plan_id, code, name, description, seat_limit, is_trial_default, is_active, sort_order, created_at, updated_at) VALUES (1, 'FREE_TRIAL', 'Free Trial', '90-day free trial for new accounts', 1, 1, 1, 0, '2026-08-18 00:05:11.620353', '2026-08-18 00:05:11.620353');
INSERT INTO public.subscription_plan (plan_id, code, name, description, seat_limit, is_trial_default, is_active, sort_order, created_at, updated_at) VALUES (2, 'BASIC', 'Basic', 'Perfect for small businesses', 1, 0, 1, 1, '2026-08-18 00:05:11.620353', '2026-08-18 00:05:11.620353');
INSERT INTO public.subscription_plan (plan_id, code, name, description, seat_limit, is_trial_default, is_active, sort_order, created_at, updated_at) VALUES (3, 'PROFESSIONAL', 'Professional', 'For growing & multi-company setups', 10, 0, 1, 2, '2026-08-18 00:05:11.620353', '2026-08-18 00:05:11.620353');


--
-- Data for Name: plan_feature; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (1, 1, 'companies.limit', '1', '1 Company Portfolio', 1);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (2, 1, 'sync.frequency', 'STANDARD', 'Standard Sync Frequency', 2);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (3, 1, 'support.level', 'EMAIL', 'Email Support', 3);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (4, 1, 'auto.updates', '1', 'Automatic Updates', 4);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (5, 1, 'api.access', '0', 'REST API Access', 5);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (6, 1, 'realtime.fetch', '0', 'Real-time Data Fetching', 6);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (7, 1, 'salesman.limit', '3', '3 Sales Van Users', 7);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (8, 2, 'companies.limit', '1', '1 Company Portfolio', 1);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (9, 2, 'sync.frequency', 'STANDARD', 'Standard Sync Frequency', 2);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (10, 2, 'support.level', 'EMAIL', 'Email Support', 3);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (11, 2, 'auto.updates', '1', 'Automatic Updates', 4);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (12, 2, 'api.access', '0', 'REST API Access', 5);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (13, 2, 'realtime.fetch', '0', 'Real-time Data Fetching', 6);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (14, 2, 'salesman.limit', '3', '3 Sales Van Users', 7);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (15, 3, 'companies.limit', 'UNLIMITED', 'Unlimited Companies', 1);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (16, 3, 'sync.frequency', 'ADVANCED', 'Advanced Sync Management', 2);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (17, 3, 'support.level', 'PRIORITY', 'Priority 24/7 Support', 3);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (18, 3, 'auto.updates', '1', 'Automatic Updates', 4);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (19, 3, 'api.access', '1', 'REST API Access', 5);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (20, 3, 'realtime.fetch', '1', 'Real-time Data Fetching', 6);
INSERT INTO public.plan_feature (feature_id, plan_id, feature_key, feature_value, label, sort_order) VALUES (21, 3, 'salesman.limit', '10', '10 Sales Van Users', 7);


--
-- Data for Name: plan_price; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.plan_price (price_id, plan_id, currency, billing_period, amount, tax_note, is_active) VALUES (1, 2, 'INR', '1YR', 2999.00, '+ applicable taxes', 1);
INSERT INTO public.plan_price (price_id, plan_id, currency, billing_period, amount, tax_note, is_active) VALUES (2, 2, 'INR', '3YR', 6999.00, '+ applicable taxes', 1);
INSERT INTO public.plan_price (price_id, plan_id, currency, billing_period, amount, tax_note, is_active) VALUES (3, 2, 'USD', '1YR', 89.00, 'inclusive of all charges', 1);
INSERT INTO public.plan_price (price_id, plan_id, currency, billing_period, amount, tax_note, is_active) VALUES (4, 2, 'USD', '3YR', 200.00, 'inclusive of all charges', 1);
INSERT INTO public.plan_price (price_id, plan_id, currency, billing_period, amount, tax_note, is_active) VALUES (5, 3, 'INR', '1YR', 4999.00, '+ applicable taxes', 1);
INSERT INTO public.plan_price (price_id, plan_id, currency, billing_period, amount, tax_note, is_active) VALUES (6, 3, 'INR', '3YR', 11999.00, '+ applicable taxes', 1);
INSERT INTO public.plan_price (price_id, plan_id, currency, billing_period, amount, tax_note, is_active) VALUES (7, 3, 'USD', '1YR', 149.00, 'inclusive of all charges', 1);
INSERT INTO public.plan_price (price_id, plan_id, currency, billing_period, amount, tax_note, is_active) VALUES (8, 3, 'USD', '3YR', 350.00, 'inclusive of all charges', 1);


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.roles (role_id, code, name, description, is_system, is_active) VALUES (2, 'ADMIN', 'Administrator', 'Talliffy platform owner; admin portal + user management', 1, 1);
INSERT INTO public.roles (role_id, code, name, description, is_system, is_active) VALUES (3, 'USER', 'User', 'Self-registered account owner; sees all reports', 1, 1);
INSERT INTO public.roles (role_id, code, name, description, is_system, is_active) VALUES (4, 'ACCOUNTANT', 'Accountant', 'Financial reports & vouchers', 1, 1);
INSERT INTO public.roles (role_id, code, name, description, is_system, is_active) VALUES (5, 'VIEWER', 'Viewer', 'Read-only access to permitted reports', 1, 1);
INSERT INTO public.roles (role_id, code, name, description, is_system, is_active) VALUES (6, 'PARTNER', 'Tally Partner', 'Referral partner; manages referred users', 1, 1);
INSERT INTO public.roles (role_id, code, name, description, is_system, is_active) VALUES (1, 'SALESMAN', 'Salesman', 'Van sales sub-account; creates Sales/Receipt vouchers and sees only his own', 1, 1);


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (3, 2, 'report.sales', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (4, 2, 'report.purchase', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (5, 2, 'report.receivables', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (6, 2, 'report.payables', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (7, 2, 'report.daybook', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (8, 2, 'report.balance_sheet', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (9, 2, 'report.profit_loss', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (10, 2, 'report.trial_balance', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (11, 2, 'report.ledger', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (12, 2, 'feature.export', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (13, 2, 'feature.manage_users', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (14, 2, 'feature.manage_subscription', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (15, 3, 'report.sales', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (16, 3, 'report.purchase', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (17, 3, 'report.receivables', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (18, 3, 'report.payables', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (19, 3, 'report.daybook', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (20, 3, 'report.balance_sheet', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (21, 3, 'report.profit_loss', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (22, 3, 'report.trial_balance', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (23, 3, 'report.ledger', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (24, 3, 'feature.export', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (25, 4, 'report.sales', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (26, 4, 'report.purchase', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (27, 4, 'report.receivables', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (28, 4, 'report.payables', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (29, 4, 'report.daybook', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (30, 4, 'report.balance_sheet', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (31, 4, 'report.profit_loss', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (32, 4, 'report.trial_balance', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (33, 4, 'report.ledger', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (34, 4, 'feature.export', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (35, 5, 'report.daybook', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (36, 5, 'report.ledger', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (37, 6, 'feature.manage_users', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (1, 1, 'report.sales', 1);
INSERT INTO public.role_permissions (id, role_id, permission_key, permission_value) VALUES (2, 1, 'report.receivables', 1);


--
-- Name: plan_feature_feature_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.plan_feature_feature_id_seq', 21, true);


--
-- Name: plan_price_price_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.plan_price_price_id_seq', 8, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 39, true);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 7, true);


--
-- Name: subscription_plan_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subscription_plan_plan_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--


COMMIT;
