-- =============================================================================
-- TALLIFFY — 01_tables.sql   SCHEMA: tables, constraints, sequences, views
--
-- Generated from a database built and verified against the JPA entities.
-- Replaces the previous sql/ + deploy/sql/ collection (all_tables.sql plus 13
-- follow-up migrations), which had drifted: it was missing 2 entity tables
-- (van_shift, van_location_ping) and 22 columns that existed on developer
-- machines only because the dev profile runs ddl-auto=update.
--
-- CONTENTS
--   48 tables · 44 sequences · 150 constraints (PK/FK/UNIQUE) · 3 views
--    1 function · 3 triggers
--
-- Indexes are NOT here — they are in 02_indexes.sql, which must run second.
-- Reference/seed data is in 03_seed_data.sql, which must run third.
--
-- RUN ORDER (fresh database):
--   createdb "TallyDB"
--   psql -d TallyDB -v ON_ERROR_STOP=1 -f 01_tables.sql
--   psql -d TallyDB                    -f 02_indexes.sql    -- no transaction
--   psql -d TallyDB -v ON_ERROR_STOP=1 -f 03_seed_data.sql
--
-- The application runs ddl-auto=none (prod) and creates NOTHING. If a column
-- is missing here, the app fails at runtime — set ddl-auto=validate to have it
-- refuse to start instead.
-- =============================================================================

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
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_config (
    config_key character varying(100) NOT NULL,
    config_value character varying(255) NOT NULL,
    value_type character varying(20) DEFAULT 'STRING'::character varying NOT NULL,
    description character varying(255),
    is_active smallint DEFAULT 1 NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: balance_sheet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.balance_sheet (
    balanceid bigint NOT NULL,
    name character varying(255) NOT NULL,
    cmp_id bigint NOT NULL,
    guid character varying(255) NOT NULL,
    is_group character varying(255),
    parent_group character varying(255),
    sub_amount numeric(19,2),
    main_amount numeric(19,2),
    created_time timestamp without time zone,
    updated_time timestamp without time zone,
    financial_year character varying(20) DEFAULT 'Full'::character varying,
    is_present boolean DEFAULT true
);


--
-- Name: balance_sheet_balanceid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.balance_sheet_balanceid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: balance_sheet_balanceid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.balance_sheet_balanceid_seq OWNED BY public.balance_sheet.balanceid;


--
-- Name: bill_outstanding_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bill_outstanding_summary (
    id bigint NOT NULL,
    cmp_id bigint NOT NULL,
    report_type character varying(20) NOT NULL,
    party_name character varying(255) NOT NULL,
    total_pending numeric(18,2),
    total_overdue numeric(18,2),
    bill_count integer,
    oldest_due_date date,
    max_overdue_days integer,
    synced_at timestamp without time zone
);


--
-- Name: bill_outstanding_summary_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bill_outstanding_summary_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bill_outstanding_summary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bill_outstanding_summary_id_seq OWNED BY public.bill_outstanding_summary.id;


--
-- Name: bills_outstanding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bills_outstanding (
    id integer NOT NULL,
    cmp_id integer NOT NULL,
    party_name character varying(255) NOT NULL,
    bill_ref character varying(255),
    bill_date date,
    pending_amount numeric(18,2) DEFAULT 0,
    dr_cr character varying(2),
    due_date date,
    overdue_days integer DEFAULT 0,
    report_type character varying(20) NOT NULL,
    credit_period character varying(50),
    synced_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: bills_outstanding_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bills_outstanding_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bills_outstanding_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bills_outstanding_id_seq OWNED BY public.bills_outstanding.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    cmpid bigint NOT NULL,
    userid bigint NOT NULL,
    company_guid character varying(64) NOT NULL,
    name character varying(255) NOT NULL,
    mailing_name character varying(255),
    pan_number character varying(20),
    business_type character varying(100),
    status character varying(50) DEFAULT 'ACTIVE'::character varying,
    imported_from character varying(100),
    imported_date date,
    sync_status character varying(50),
    last_sync_date timestamp without time zone,
    address_line_1 character varying(255) NOT NULL,
    address_line_2 character varying(255),
    address_line_3 character varying(255),
    address_line_4 character varying(255),
    state character varying(100),
    country character varying(100) DEFAULT 'India'::character varying NOT NULL,
    pincode character varying(20),
    telephone character varying(20),
    mobile character varying(20),
    fax character varying(20),
    email character varying(100),
    website character varying(255),
    code character varying(50),
    financial_year_start date NOT NULL,
    books_start date NOT NULL,
    currency_symbol character varying(5) DEFAULT '₹'::character varying,
    currency_formal_name character varying(50) DEFAULT 'INR'::character varying,
    currency_decimal_places integer DEFAULT 2,
    currency_in_millions boolean DEFAULT false,
    gst_applicable_date date,
    gst_state character varying(100),
    gst_type character varying(50),
    gstin character varying(15),
    gst_freezone boolean DEFAULT false,
    gst_einvoice_applicable boolean DEFAULT false,
    gst_eway_bill_applicable boolean DEFAULT false,
    vat_emirate character varying(100),
    vat_applicable_date date,
    vat_registration_number character varying(50),
    vat_account_id character varying(50),
    vat_freezone boolean DEFAULT false,
    billwise_enabled boolean DEFAULT true,
    costcentre_enabled boolean DEFAULT false,
    batch_enabled boolean DEFAULT false,
    use_discount_column boolean DEFAULT true,
    use_actual_column boolean DEFAULT false,
    payroll_enabled boolean DEFAULT false,
    sync_from_date date,
    sync_to_date date,
    first_time_sync_done boolean DEFAULT false,
    receivable_synced boolean DEFAULT false,
    payable_synced boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_currency_decimals CHECK (((currency_decimal_places >= 0) AND (currency_decimal_places <= 4))),
    CONSTRAINT chk_financial_dates CHECK ((books_start >= financial_year_start))
);


--
-- Name: companies_cmpid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.companies_cmpid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: companies_cmpid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.companies_cmpid_seq OWNED BY public.companies.cmpid;


--
-- Name: company_entry_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_entry_settings (
    id bigint NOT NULL,
    cmp_id bigint NOT NULL,
    sales_ledger_name character varying(255),
    cash_ledger_name character varying(255),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    vat_ledger_name character varying(255),
    vat_rate_percent numeric(6,3)
);


--
-- Name: company_entry_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_entry_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_entry_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_entry_settings_id_seq OWNED BY public.company_entry_settings.id;


--
-- Name: company_sync_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_sync_status (
    id bigint NOT NULL,
    cmp_id bigint NOT NULL,
    last_alter_id bigint DEFAULT 0 NOT NULL,
    last_sync_time timestamp without time zone,
    entity_type character varying(50),
    reports_voucher_alter_id bigint,
    reports_synced_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: company_sync_status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_sync_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_sync_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_sync_status_id_seq OWNED BY public.company_sync_status.id;


--
-- Name: cost_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cost_categories (
    costcategory_id bigint NOT NULL,
    userid bigint NOT NULL,
    cmpid bigint NOT NULL,
    guid character varying(64) NOT NULL,
    masterid bigint NOT NULL,
    alterid bigint,
    name character varying(255) NOT NULL,
    reservedname character varying(255),
    languageid integer,
    is_deleted boolean DEFAULT false,
    allocate_revenue boolean,
    allocate_non_revenue boolean,
    is_active boolean,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


--
-- Name: cost_categories_costcategory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cost_categories_costcategory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cost_categories_costcategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cost_categories_costcategory_id_seq OWNED BY public.cost_categories.costcategory_id;


--
-- Name: costcentre; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.costcentre (
    costcentre_id bigint NOT NULL,
    userid bigint NOT NULL,
    cmpid bigint NOT NULL,
    guid character varying(64) NOT NULL,
    masterid bigint NOT NULL,
    alterid bigint,
    name character varying(255) NOT NULL,
    category character varying(255),
    reservedname character varying(255),
    languageid integer,
    is_deleted boolean DEFAULT false,
    parent character varying(255),
    is_active boolean,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


--
-- Name: costcentre_costcentre_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.costcentre_costcentre_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: costcentre_costcentre_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.costcentre_costcentre_id_seq OWNED BY public.costcentre.costcentre_id;


--
-- Name: country_currency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.country_currency (
    country_iso2 character varying(2) NOT NULL,
    country_name character varying(100) NOT NULL,
    currency_code character varying(3) NOT NULL,
    is_active smallint DEFAULT 1 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: currency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.currency (
    currency_id bigint NOT NULL,
    userid bigint NOT NULL,
    cmpid bigint NOT NULL,
    guid character varying(64) NOT NULL,
    masterid bigint NOT NULL,
    alterid bigint,
    name character varying(255) NOT NULL,
    symbol character varying(16),
    formalname character varying(255),
    decimalplaces integer,
    decimalseparator character varying(8),
    showamountinwords character(1),
    suffixsymbol character(1),
    spacebetweenamountandsymbol character(1),
    languageid integer,
    in_millions boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


--
-- Name: currency_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.currency_config (
    code character varying(3) NOT NULL,
    symbol character varying(8) NOT NULL,
    locale character varying(10) DEFAULT 'en-US'::character varying NOT NULL,
    decimal_places smallint DEFAULT 2 NOT NULL,
    is_active smallint DEFAULT 1 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: currency_currency_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.currency_currency_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: currency_currency_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.currency_currency_id_seq OWNED BY public.currency.currency_id;


--
-- Name: godowns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.godowns (
    godown_id bigint NOT NULL,
    userid bigint NOT NULL,
    cmpid bigint NOT NULL,
    masterid bigint,
    alterid bigint,
    guid character varying(100),
    name character varying(255) NOT NULL,
    address text,
    reserved_name character varying(255),
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: godowns_godown_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.godowns_godown_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: godowns_godown_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.godowns_godown_id_seq OWNED BY public.godowns.godown_id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    grpid bigint NOT NULL,
    userid bigint NOT NULL,
    cmpid bigint NOT NULL,
    masterid bigint NOT NULL,
    alterid bigint,
    guid character varying(100) NOT NULL,
    grp_name character varying(255) NOT NULL,
    grp_code character varying(50),
    grp_alias character varying(255),
    grp_parent character varying(255),
    grp_primary_group character varying(255),
    grp_nature character varying(50),
    is_revenue boolean DEFAULT false,
    is_reserved boolean DEFAULT false,
    reserved_name character varying(255),
    parent_grpid bigint,
    level_number integer DEFAULT 0,
    full_path character varying(1000),
    language_id integer DEFAULT 1033,
    alternate_names text,
    is_active boolean DEFAULT true,
    is_deleted boolean DEFAULT false,
    sync_status character varying(50) DEFAULT 'SYNCED'::character varying,
    last_sync_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_grp_level_number CHECK (((level_number >= 0) AND (level_number <= 10)))
);


--
-- Name: groups_grpid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.groups_grpid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: groups_grpid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.groups_grpid_seq OWNED BY public.groups.grpid;


--
-- Name: ledgers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ledgers (
    ledid bigint NOT NULL,
    userid bigint NOT NULL,
    cmpid bigint NOT NULL,
    masterid bigint NOT NULL,
    alterid bigint,
    guid character varying(100) NOT NULL,
    led_name character varying(255) NOT NULL,
    led_code character varying(50),
    led_alias character varying(255),
    led_parent character varying(255),
    led_primary_group character varying(255),
    led_description text,
    led_note text,
    is_revenue boolean DEFAULT false,
    is_reserved boolean DEFAULT false,
    reserved_name character varying(255),
    last_parent character varying(255),
    led_billwise_on boolean DEFAULT false,
    led_is_costcentre_on boolean DEFAULT false,
    parent_ledid bigint,
    grpid bigint,
    level_number integer DEFAULT 0,
    full_path character varying(1000),
    parent_hierarchy text,
    led_mailing_name character varying(255),
    led_address_1 character varying(255),
    led_address_2 character varying(255),
    led_address_3 character varying(255),
    led_address_4 character varying(255),
    led_state character varying(100),
    led_country character varying(100),
    led_pincode character varying(20),
    led_contact character varying(100),
    led_phone character varying(20),
    led_country_isd_code character varying(10),
    led_mobile character varying(20),
    led_email character varying(100),
    led_website character varying(255),
    led_opening_balance numeric(18,2) DEFAULT 0.00,
    currency_name character varying(50) DEFAULT '₹'::character varying,
    income_tax_number character varying(50),
    gst_applicable boolean DEFAULT false,
    gst_registration_type character varying(50),
    gst_registration_date date,
    gst_gstin character varying(15),
    gst_is_freezone boolean DEFAULT false,
    gst_state character varying(100),
    gst_place_of_supply character varying(100),
    gst_transporter_id character varying(50),
    gst_is_other_territory_assessee boolean DEFAULT false,
    gst_consider_purchase_for_export boolean DEFAULT false,
    gst_is_transporter boolean DEFAULT false,
    gst_is_common_party boolean DEFAULT false,
    vat_applicable boolean DEFAULT false,
    vat_registration_type character varying(50),
    vat_registration_date date,
    vat_tin_number character varying(50),
    vat_is_freezone boolean DEFAULT false,
    language_id integer DEFAULT 1033,
    alternate_names text,
    is_active boolean DEFAULT true,
    is_deleted boolean DEFAULT false,
    sync_status character varying(50) DEFAULT 'SYNCED'::character varying,
    last_sync_date timestamp without time zone,
    mailing_details_applicable_from date,
    gst_details_applicable_from date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    led_closing_balance numeric(18,2),
    led_closing_forex_rate numeric(18,6),
    CONSTRAINT chk_led_level_number CHECK (((level_number >= 0) AND (level_number <= 10)))
);


--
-- Name: ledgers_ledid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ledgers_ledid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ledgers_ledid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ledgers_ledid_seq OWNED BY public.ledgers.ledid;


--
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_settings (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    send_login_alert boolean DEFAULT true NOT NULL,
    send_sync_success_alert boolean DEFAULT true NOT NULL
);


--
-- Name: notification_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_settings_id_seq OWNED BY public.notification_settings.id;


--
-- Name: partner_extension_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_extension_log (
    id bigint NOT NULL,
    partner_user_id bigint NOT NULL,
    target_user_id bigint NOT NULL,
    extension_days integer NOT NULL,
    extended_at timestamp without time zone NOT NULL
);


--
-- Name: partner_extension_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partner_extension_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partner_extension_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partner_extension_log_id_seq OWNED BY public.partner_extension_log.id;


--
-- Name: plan_feature; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_feature (
    feature_id bigint NOT NULL,
    plan_id bigint NOT NULL,
    feature_key character varying(80) NOT NULL,
    feature_value character varying(50) DEFAULT '0'::character varying NOT NULL,
    label character varying(150),
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: plan_feature_feature_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plan_feature_feature_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plan_feature_feature_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plan_feature_feature_id_seq OWNED BY public.plan_feature.feature_id;


--
-- Name: plan_price; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_price (
    price_id bigint NOT NULL,
    plan_id bigint NOT NULL,
    currency character varying(3) NOT NULL,
    billing_period character varying(10) NOT NULL,
    amount numeric(12,2) NOT NULL,
    tax_note character varying(120),
    is_active smallint DEFAULT 1 NOT NULL
);


--
-- Name: plan_price_price_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plan_price_price_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plan_price_price_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plan_price_price_id_seq OWNED BY public.plan_price.price_id;


--
-- Name: profit_loss; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profit_loss (
    plid bigint NOT NULL,
    name character varying(255) NOT NULL,
    cmp_id bigint NOT NULL,
    guid character varying(255) NOT NULL,
    is_group character varying(255),
    parent_group character varying(255),
    sub_amount numeric(19,2),
    main_amount numeric(19,2),
    created_time timestamp without time zone,
    updated_time timestamp without time zone,
    financial_year character varying(20) DEFAULT 'Full'::character varying,
    is_present boolean DEFAULT true
);


--
-- Name: profit_loss_plid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profit_loss_plid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profit_loss_plid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profit_loss_plid_seq OWNED BY public.profit_loss.plid;


--
-- Name: revoked_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revoked_tokens (
    id bigint NOT NULL,
    token character varying(1000) NOT NULL,
    revoked_at timestamp without time zone NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


--
-- Name: revoked_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.revoked_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: revoked_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.revoked_tokens_id_seq OWNED BY public.revoked_tokens.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id bigint NOT NULL,
    role_id bigint NOT NULL,
    permission_key character varying(100) NOT NULL,
    permission_value smallint DEFAULT 0 NOT NULL
);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.role_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    role_id bigint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    is_system smallint DEFAULT 0 NOT NULL,
    is_active smallint DEFAULT 1 NOT NULL
);


--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- Name: session_conflicts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_conflicts (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    existing_device_id bigint NOT NULL,
    new_device_id bigint,
    conflict_type character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    conflict_token character varying(500) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    resolved_at timestamp without time zone,
    resolution_action character varying(50),
    ip_address character varying(50),
    user_agent character varying(500)
);


--
-- Name: session_conflicts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.session_conflicts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: session_conflicts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.session_conflicts_id_seq OWNED BY public.session_conflicts.id;


--
-- Name: stock_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_categories (
    stockcategory_id bigint NOT NULL,
    userid bigint NOT NULL,
    cmpid bigint NOT NULL,
    masterid bigint,
    alterid bigint,
    guid character varying(100),
    name character varying(255) NOT NULL,
    parent character varying(255),
    reserved_name character varying(255),
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stock_categories_stockcategory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_categories_stockcategory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_categories_stockcategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_categories_stockcategory_id_seq OWNED BY public.stock_categories.stockcategory_id;


--
-- Name: stock_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_groups (
    stockgroup_id bigint NOT NULL,
    userid bigint NOT NULL,
    cmpid bigint NOT NULL,
    masterid bigint,
    alterid bigint,
    guid character varying(100),
    name character varying(255) NOT NULL,
    parent character varying(255),
    reserved_name character varying(255),
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stock_groups_stockgroup_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_groups_stockgroup_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_groups_stockgroup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_groups_stockgroup_id_seq OWNED BY public.stock_groups.stockgroup_id;


--
-- Name: stock_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_items (
    stockitem_id bigint NOT NULL,
    userid bigint NOT NULL,
    cmpid bigint NOT NULL,
    masterid bigint,
    alterid bigint,
    guid character varying(100),
    name character varying(255) NOT NULL,
    parent character varying(255),
    category character varying(255),
    description text,
    mailing_name character varying(255),
    reserved_name character varying(255),
    base_units character varying(100),
    additional_units character varying(100),
    opening_balance numeric(19,4),
    opening_value numeric(19,4),
    opening_rate numeric(19,4),
    costing_method character varying(50),
    valuation_method character varying(50),
    gst_type_of_supply character varying(50),
    hsn_code character varying(50),
    is_batch_wise_on boolean DEFAULT false,
    is_cost_centers_on boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stock_items_stockitem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_items_stockitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_items_stockitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_items_stockitem_id_seq OWNED BY public.stock_items.stockitem_id;


--
-- Name: subscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription (
    subscription_id bigint NOT NULL,
    user_id bigint NOT NULL,
    plan_id bigint NOT NULL,
    status character varying(20) DEFAULT 'TRIAL'::character varying NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    billing_period character varying(10),
    start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    end_date timestamp without time zone,
    trial_end_date timestamp without time zone,
    auto_renew smallint DEFAULT 0 NOT NULL,
    seat_limit integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


--
-- Name: subscription_plan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plan (
    plan_id bigint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    seat_limit integer DEFAULT 1 NOT NULL,
    is_trial_default smallint DEFAULT 0 NOT NULL,
    is_active smallint DEFAULT 1 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


--
-- Name: subscription_plan_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subscription_plan_plan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscription_plan_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subscription_plan_plan_id_seq OWNED BY public.subscription_plan.plan_id;


--
-- Name: subscription_subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subscription_subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscription_subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subscription_subscription_id_seq OWNED BY public.subscription.subscription_id;


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    subject character varying(255) NOT NULL,
    message text NOT NULL,
    status character varying(20) DEFAULT 'OPEN'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.support_tickets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.support_tickets_id_seq OWNED BY public.support_tickets.id;


--
-- Name: survey; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey (
    id bigint NOT NULL,
    survey_type character varying(50) DEFAULT 'PARTNER_VOLUNTEER'::character varying NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: survey_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.survey ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: taxunit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.taxunit (
    taxunit_id bigint NOT NULL,
    userid bigint NOT NULL,
    cmpid bigint NOT NULL,
    guid character varying(64) NOT NULL,
    masterid bigint NOT NULL,
    alterid bigint,
    name character varying(255) NOT NULL,
    reservedname character varying(255),
    languageid integer,
    is_deleted boolean DEFAULT false,
    is_active boolean,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


--
-- Name: taxunit_taxunit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.taxunit_taxunit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: taxunit_taxunit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.taxunit_taxunit_id_seq OWNED BY public.taxunit.taxunit_id;


--
-- Name: trail_balance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trail_balance (
    tid bigint NOT NULL,
    name character varying(255) NOT NULL,
    cmp_id bigint NOT NULL,
    guid character varying(255) NOT NULL,
    is_group character varying(255),
    parent_group character varying(255),
    debit_amount numeric(19,2),
    credit_amount numeric(19,2),
    created_time timestamp without time zone,
    updated_time timestamp without time zone,
    financial_year character varying(20) DEFAULT 'Full'::character varying,
    is_present boolean DEFAULT true
);


--
-- Name: trail_balance_tid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trail_balance_tid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trail_balance_tid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trail_balance_tid_seq OWNED BY public.trail_balance.tid;


--
-- Name: units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.units (
    unit_id bigint NOT NULL,
    userid bigint NOT NULL,
    cmpid bigint NOT NULL,
    guid character varying(64) NOT NULL,
    masterid bigint NOT NULL,
    alterid bigint,
    unit_name character varying(255) NOT NULL,
    is_simple_unit boolean DEFAULT true,
    original_name character varying(255),
    reserved_name character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: units_unit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.units_unit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: units_unit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.units_unit_id_seq OWNED BY public.units.unit_id;


--
-- Name: user_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_devices (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    device_token character varying(500) NOT NULL,
    device_type character varying(20) NOT NULL,
    device_info character varying(255),
    login_at timestamp without time zone NOT NULL,
    last_active_at timestamp without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    device_jwt character varying(1000),
    refresh_token character varying(1000),
    expiry_at timestamp without time zone,
    system_id character varying(100),
    platform character varying(50),
    ip_address character varying(50),
    browser_info character varying(255),
    conflict_token character varying(500)
);


--
-- Name: user_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_devices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_devices_id_seq OWNED BY public.user_devices.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    role_id bigint NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    userid bigint NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    licence_no bigint NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(255),
    role character varying(255),
    enabled character(1) DEFAULT 'Y'::bpchar,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone,
    created_by bigint,
    updated_by bigint,
    isactive character(1) DEFAULT 'Y'::bpchar,
    last_login timestamp without time zone,
    device_token character varying(500),
    device_login_at timestamp without time zone,
    email_verified character(1) DEFAULT 'N'::bpchar,
    country_code character varying(5),
    mobile character varying(20),
    mobile_otp character varying(6),
    mobile_verified character(1) DEFAULT 'N'::bpchar,
    otp_code character varying(6),
    otp_expiry timestamp without time zone,
    otp_sent_at timestamp without time zone,
    otp_verified character(1) DEFAULT 'N'::bpchar,
    otp_resend_count integer DEFAULT 0,
    otp_last_resend_at timestamp without time zone,
    sms_count_today integer DEFAULT 0,
    sms_last_sent_date date,
    otp_failed_attempts integer DEFAULT 0,
    failed_login_attempts integer DEFAULT 0,
    account_locked_until timestamp without time zone,
    type_of_user character varying(20) DEFAULT 'TRIAL'::character varying,
    country character varying(2),
    currency character varying(3),
    parent_user_id bigint,
    referred_by_partner_id bigint,
    van_godown_name character varying(255),
    plan_region character varying(20),
    plan_region_source character varying(20),
    device_country character varying(2),
    CONSTRAINT users_email_verified_check CHECK ((email_verified = ANY (ARRAY['Y'::bpchar, 'N'::bpchar]))),
    CONSTRAINT users_enabled_check CHECK ((enabled = ANY (ARRAY['Y'::bpchar, 'N'::bpchar]))),
    CONSTRAINT users_isactive_check CHECK ((isactive = ANY (ARRAY['Y'::bpchar, 'N'::bpchar]))),
    CONSTRAINT users_mobile_verified_check CHECK ((mobile_verified = ANY (ARRAY['Y'::bpchar, 'N'::bpchar]))),
    CONSTRAINT users_otp_verified_check CHECK ((otp_verified = ANY (ARRAY['Y'::bpchar, 'N'::bpchar])))
);


--
-- Name: users_userid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_userid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_userid_seq OWNED BY public.users.userid;


--
-- Name: voucher_bill_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voucher_bill_allocations (
    id integer NOT NULL,
    ledger_entry_id integer NOT NULL,
    voucher_id integer NOT NULL,
    cmp_id integer NOT NULL,
    voucher_guid character varying(64),
    voucher_number character varying(100),
    voucher_date date,
    voucher_type character varying(100),
    ledger_name character varying(255),
    bill_type character varying(50),
    bill_name character varying(255),
    bill_ref character varying(255),
    bill_date date,
    bill_due_date date,
    bill_credit_period character varying(50),
    bill_amount numeric(18,2) DEFAULT 0,
    tds_deductee_is_special_rate boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vouchers (
    id integer NOT NULL,
    cmp_id integer NOT NULL,
    user_id integer NOT NULL,
    guid character varying(64) NOT NULL,
    master_id bigint DEFAULT 0,
    alter_id bigint DEFAULT 0,
    voucher_key bigint DEFAULT 0,
    voucher_retain_key bigint DEFAULT 0,
    remote_id character varying(255),
    remote_alt_guid character varying(255),
    voucher_number character varying(100),
    voucher_type character varying(100) NOT NULL,
    voucher_date date NOT NULL,
    effective_date date,
    voucher_number_series character varying(100),
    persisted_view character varying(100),
    party_ledger_name character varying(255),
    party_name character varying(255),
    amount numeric(18,2) DEFAULT 0,
    reference character varying(500),
    narration text,
    party_gstin character varying(20),
    company_gstin character varying(20),
    company_gst_registration_type character varying(50),
    company_gst_state character varying(100),
    gst_registration character varying(100),
    place_of_supply character varying(100),
    vch_gst_class character varying(100),
    irn character varying(100),
    irn_ack_no character varying(50),
    irn_ack_date date,
    irn_qr_code text,
    is_optional boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    is_cancelled boolean DEFAULT false,
    is_void boolean DEFAULT false,
    is_on_hold boolean DEFAULT false,
    is_invoice boolean DEFAULT false,
    is_post_dated boolean DEFAULT false,
    has_cash_flow boolean DEFAULT false,
    has_discounts boolean DEFAULT false,
    is_deemed_positive boolean DEFAULT false,
    is_reverse_charge_applicable boolean DEFAULT false,
    is_multi_currency boolean DEFAULT false,
    forex_currency character varying(16),
    sync_status character varying(20) DEFAULT 'synced'::character varying,
    is_active boolean DEFAULT true,
    created_by_user_id bigint,
    source character varying(20) DEFAULT 'TALLY'::character varying,
    tally_voucher_number character varying(100),
    entry_latitude numeric(10,7),
    entry_longitude numeric(10,7),
    entry_accuracy_m numeric(10,2),
    payment_mode character varying(30),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: v_outstanding_bills; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_outstanding_bills AS
 SELECT ba.cmp_id,
    ba.ledger_name,
    ba.bill_name,
    ba.bill_type,
    ba.bill_date,
    ba.bill_due_date,
    ba.voucher_type,
    ba.voucher_number,
    ba.voucher_date,
    ba.bill_amount,
        CASE
            WHEN ((ba.bill_due_date IS NOT NULL) AND (ba.bill_due_date < CURRENT_DATE)) THEN (CURRENT_DATE - ba.bill_due_date)
            ELSE 0
        END AS overdue_days
   FROM (public.voucher_bill_allocations ba
     JOIN public.vouchers v ON ((v.id = ba.voucher_id)))
  WHERE ((v.is_active = true) AND (v.is_cancelled = false) AND (v.is_deleted = false));


--
-- Name: voucher_inventory_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voucher_inventory_entries (
    id integer NOT NULL,
    voucher_id integer NOT NULL,
    cmp_id integer NOT NULL,
    voucher_guid character varying(64),
    voucher_number character varying(100),
    voucher_date date,
    voucher_type character varying(100),
    stock_item_name character varying(255) NOT NULL,
    stock_item_guid character varying(64),
    billed_qty numeric(18,4) DEFAULT 0,
    actual_qty numeric(18,4) DEFAULT 0,
    rate numeric(18,4) DEFAULT 0,
    amount numeric(18,2) DEFAULT 0,
    discount numeric(18,2) DEFAULT 0,
    uom character varying(50),
    alternate_uom character varying(50),
    rate_uom character varying(50),
    is_deemed_positive boolean DEFAULT false,
    is_outward boolean DEFAULT false,
    godown_name character varying(255),
    tracking_number character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: v_stock_movement; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_stock_movement AS
 SELECT vie.cmp_id,
    vie.stock_item_name,
    vie.voucher_date,
    vie.voucher_type,
    vie.voucher_number,
    vie.is_outward,
    vie.actual_qty,
    vie.billed_qty,
    vie.rate,
    vie.amount,
    vie.godown_name,
    vie.uom
   FROM (public.voucher_inventory_entries vie
     JOIN public.vouchers v ON ((v.id = vie.voucher_id)))
  WHERE ((v.is_active = true) AND (v.is_cancelled = false) AND (v.is_deleted = false));


--
-- Name: voucher_ledger_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voucher_ledger_entries (
    id integer NOT NULL,
    voucher_id integer NOT NULL,
    cmp_id integer NOT NULL,
    voucher_guid character varying(64) NOT NULL,
    voucher_number character varying(100),
    voucher_date date,
    voucher_type character varying(100),
    ledger_name character varying(255) NOT NULL,
    ledger_guid character varying(64),
    amount numeric(18,2) DEFAULT 0,
    dr_cr character varying(2),
    entry_index integer DEFAULT 0 NOT NULL,
    is_deemed_positive boolean DEFAULT false,
    is_party_ledger boolean DEFAULT false,
    ledger_from_item boolean DEFAULT false,
    gst_class character varying(100),
    appropriate_for character varying(255),
    forex_amount numeric(18,4),
    forex_currency character varying(16),
    exchange_rate numeric(18,6),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: v_voucher_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_voucher_summary AS
 SELECT v.cmp_id,
    v.voucher_type,
    v.voucher_date,
    v.voucher_number,
    v.party_ledger_name,
    v.amount,
    v.narration,
    v.is_cancelled,
    v.is_deleted,
    count(DISTINCT vle.id) AS ledger_entry_count,
    count(DISTINCT vie.id) AS inventory_entry_count,
    count(DISTINCT vba.id) AS bill_count
   FROM (((public.vouchers v
     LEFT JOIN public.voucher_ledger_entries vle ON ((vle.voucher_id = v.id)))
     LEFT JOIN public.voucher_inventory_entries vie ON ((vie.voucher_id = v.id)))
     LEFT JOIN public.voucher_bill_allocations vba ON ((vba.voucher_id = v.id)))
  WHERE (v.is_active = true)
  GROUP BY v.id, v.cmp_id, v.voucher_type, v.voucher_date, v.voucher_number, v.party_ledger_name, v.amount, v.narration, v.is_cancelled, v.is_deleted;


--
-- Name: van_location_ping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.van_location_ping (
    id bigint NOT NULL,
    cmp_id bigint NOT NULL,
    salesman_user_id bigint NOT NULL,
    shift_id bigint,
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    accuracy_m numeric(10,2),
    speed_mps numeric(10,2),
    heading_deg numeric(6,2),
    battery_pct smallint,
    is_moving boolean,
    recorded_at timestamp without time zone NOT NULL,
    received_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: van_location_ping_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.van_location_ping_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: van_location_ping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.van_location_ping_id_seq OWNED BY public.van_location_ping.id;


--
-- Name: van_shift; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.van_shift (
    id bigint NOT NULL,
    cmp_id bigint NOT NULL,
    salesman_user_id bigint NOT NULL,
    started_at timestamp without time zone NOT NULL,
    ended_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: van_shift_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.van_shift_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: van_shift_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.van_shift_id_seq OWNED BY public.van_shift.id;


--
-- Name: voucher_batch_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voucher_batch_allocations (
    id integer NOT NULL,
    inventory_entry_id integer NOT NULL,
    voucher_id integer NOT NULL,
    cmp_id integer NOT NULL,
    voucher_guid character varying(64),
    voucher_number character varying(100),
    voucher_date date,
    voucher_type character varying(100),
    stock_item_name character varying(255),
    batch_name character varying(255),
    godown_name character varying(255),
    destination_godown character varying(255),
    batch_qty numeric(18,4) DEFAULT 0,
    batch_rate numeric(18,4) DEFAULT 0,
    batch_amount numeric(18,2) DEFAULT 0,
    batch_uom character varying(50),
    mfg_date date,
    expiry_date date,
    is_deemed_positive boolean DEFAULT false,
    is_outward boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: voucher_batch_allocations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voucher_batch_allocations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voucher_batch_allocations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voucher_batch_allocations_id_seq OWNED BY public.voucher_batch_allocations.id;


--
-- Name: voucher_bill_allocations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voucher_bill_allocations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voucher_bill_allocations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voucher_bill_allocations_id_seq OWNED BY public.voucher_bill_allocations.id;


--
-- Name: voucher_cost_category_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voucher_cost_category_allocations (
    id integer NOT NULL,
    ledger_entry_id integer NOT NULL,
    voucher_id integer NOT NULL,
    cmp_id integer NOT NULL,
    voucher_guid character varying(64),
    voucher_number character varying(100),
    voucher_date date,
    voucher_type character varying(100),
    category_name character varying(255),
    amount numeric(18,2) DEFAULT 0,
    is_deemed_positive boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: voucher_cost_category_allocations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voucher_cost_category_allocations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voucher_cost_category_allocations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voucher_cost_category_allocations_id_seq OWNED BY public.voucher_cost_category_allocations.id;


--
-- Name: voucher_cost_centre_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voucher_cost_centre_allocations (
    id integer NOT NULL,
    cost_category_id integer NOT NULL,
    voucher_id integer NOT NULL,
    cmp_id integer NOT NULL,
    voucher_guid character varying(64),
    voucher_number character varying(100),
    voucher_date date,
    voucher_type character varying(100),
    cost_centre_name character varying(255),
    amount numeric(18,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: voucher_cost_centre_allocations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voucher_cost_centre_allocations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voucher_cost_centre_allocations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voucher_cost_centre_allocations_id_seq OWNED BY public.voucher_cost_centre_allocations.id;


--
-- Name: voucher_entry_counter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voucher_entry_counter (
    id bigint NOT NULL,
    cmp_id bigint NOT NULL,
    created_by_user_id bigint NOT NULL,
    voucher_type character varying(100) NOT NULL,
    next_seq bigint DEFAULT 1 NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: voucher_entry_counter_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voucher_entry_counter_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voucher_entry_counter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voucher_entry_counter_id_seq OWNED BY public.voucher_entry_counter.id;


--
-- Name: voucher_inventory_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voucher_inventory_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voucher_inventory_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voucher_inventory_entries_id_seq OWNED BY public.voucher_inventory_entries.id;


--
-- Name: voucher_ledger_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voucher_ledger_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voucher_ledger_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voucher_ledger_entries_id_seq OWNED BY public.voucher_ledger_entries.id;


--
-- Name: vouchers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vouchers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vouchers_id_seq OWNED BY public.vouchers.id;


--
-- Name: vouchertype; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vouchertype (
    vouchertype_id bigint NOT NULL,
    userid bigint NOT NULL,
    cmpid bigint NOT NULL,
    guid character varying(64) NOT NULL,
    masterid bigint NOT NULL,
    alterid bigint,
    name character varying(255) NOT NULL,
    parent character varying(255),
    reservedname character varying(255),
    numberingmethod character varying(64),
    preventduplicates character(1),
    isdeemedpositive character(1),
    affectstotal character(1),
    printaftersave character(1),
    languageid integer,
    is_deleted boolean DEFAULT false,
    numbering_method character varying(255),
    is_active boolean,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


--
-- Name: vouchertype_vouchertype_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vouchertype_vouchertype_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vouchertype_vouchertype_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vouchertype_vouchertype_id_seq OWNED BY public.vouchertype.vouchertype_id;


--
-- Name: balance_sheet balanceid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_sheet ALTER COLUMN balanceid SET DEFAULT nextval('public.balance_sheet_balanceid_seq'::regclass);


--
-- Name: bill_outstanding_summary id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_outstanding_summary ALTER COLUMN id SET DEFAULT nextval('public.bill_outstanding_summary_id_seq'::regclass);


--
-- Name: bills_outstanding id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills_outstanding ALTER COLUMN id SET DEFAULT nextval('public.bills_outstanding_id_seq'::regclass);


--
-- Name: companies cmpid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies ALTER COLUMN cmpid SET DEFAULT nextval('public.companies_cmpid_seq'::regclass);


--
-- Name: company_entry_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_entry_settings ALTER COLUMN id SET DEFAULT nextval('public.company_entry_settings_id_seq'::regclass);


--
-- Name: company_sync_status id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_sync_status ALTER COLUMN id SET DEFAULT nextval('public.company_sync_status_id_seq'::regclass);


--
-- Name: cost_categories costcategory_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_categories ALTER COLUMN costcategory_id SET DEFAULT nextval('public.cost_categories_costcategory_id_seq'::regclass);


--
-- Name: costcentre costcentre_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costcentre ALTER COLUMN costcentre_id SET DEFAULT nextval('public.costcentre_costcentre_id_seq'::regclass);


--
-- Name: currency currency_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currency ALTER COLUMN currency_id SET DEFAULT nextval('public.currency_currency_id_seq'::regclass);


--
-- Name: godowns godown_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.godowns ALTER COLUMN godown_id SET DEFAULT nextval('public.godowns_godown_id_seq'::regclass);


--
-- Name: groups grpid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups ALTER COLUMN grpid SET DEFAULT nextval('public.groups_grpid_seq'::regclass);


--
-- Name: ledgers ledid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledgers ALTER COLUMN ledid SET DEFAULT nextval('public.ledgers_ledid_seq'::regclass);


--
-- Name: notification_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings ALTER COLUMN id SET DEFAULT nextval('public.notification_settings_id_seq'::regclass);


--
-- Name: partner_extension_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_extension_log ALTER COLUMN id SET DEFAULT nextval('public.partner_extension_log_id_seq'::regclass);


--
-- Name: plan_feature feature_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_feature ALTER COLUMN feature_id SET DEFAULT nextval('public.plan_feature_feature_id_seq'::regclass);


--
-- Name: plan_price price_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_price ALTER COLUMN price_id SET DEFAULT nextval('public.plan_price_price_id_seq'::regclass);


--
-- Name: profit_loss plid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profit_loss ALTER COLUMN plid SET DEFAULT nextval('public.profit_loss_plid_seq'::regclass);


--
-- Name: revoked_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revoked_tokens ALTER COLUMN id SET DEFAULT nextval('public.revoked_tokens_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- Name: session_conflicts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_conflicts ALTER COLUMN id SET DEFAULT nextval('public.session_conflicts_id_seq'::regclass);


--
-- Name: stock_categories stockcategory_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_categories ALTER COLUMN stockcategory_id SET DEFAULT nextval('public.stock_categories_stockcategory_id_seq'::regclass);


--
-- Name: stock_groups stockgroup_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_groups ALTER COLUMN stockgroup_id SET DEFAULT nextval('public.stock_groups_stockgroup_id_seq'::regclass);


--
-- Name: stock_items stockitem_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_items ALTER COLUMN stockitem_id SET DEFAULT nextval('public.stock_items_stockitem_id_seq'::regclass);


--
-- Name: subscription subscription_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription ALTER COLUMN subscription_id SET DEFAULT nextval('public.subscription_subscription_id_seq'::regclass);


--
-- Name: subscription_plan plan_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plan ALTER COLUMN plan_id SET DEFAULT nextval('public.subscription_plan_plan_id_seq'::regclass);


--
-- Name: support_tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN id SET DEFAULT nextval('public.support_tickets_id_seq'::regclass);


--
-- Name: taxunit taxunit_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxunit ALTER COLUMN taxunit_id SET DEFAULT nextval('public.taxunit_taxunit_id_seq'::regclass);


--
-- Name: trail_balance tid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trail_balance ALTER COLUMN tid SET DEFAULT nextval('public.trail_balance_tid_seq'::regclass);


--
-- Name: units unit_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units ALTER COLUMN unit_id SET DEFAULT nextval('public.units_unit_id_seq'::regclass);


--
-- Name: user_devices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices ALTER COLUMN id SET DEFAULT nextval('public.user_devices_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: users userid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN userid SET DEFAULT nextval('public.users_userid_seq'::regclass);


--
-- Name: van_location_ping id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.van_location_ping ALTER COLUMN id SET DEFAULT nextval('public.van_location_ping_id_seq'::regclass);


--
-- Name: van_shift id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.van_shift ALTER COLUMN id SET DEFAULT nextval('public.van_shift_id_seq'::regclass);


--
-- Name: voucher_batch_allocations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_batch_allocations ALTER COLUMN id SET DEFAULT nextval('public.voucher_batch_allocations_id_seq'::regclass);


--
-- Name: voucher_bill_allocations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_bill_allocations ALTER COLUMN id SET DEFAULT nextval('public.voucher_bill_allocations_id_seq'::regclass);


--
-- Name: voucher_cost_category_allocations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_cost_category_allocations ALTER COLUMN id SET DEFAULT nextval('public.voucher_cost_category_allocations_id_seq'::regclass);


--
-- Name: voucher_cost_centre_allocations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_cost_centre_allocations ALTER COLUMN id SET DEFAULT nextval('public.voucher_cost_centre_allocations_id_seq'::regclass);


--
-- Name: voucher_entry_counter id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_entry_counter ALTER COLUMN id SET DEFAULT nextval('public.voucher_entry_counter_id_seq'::regclass);


--
-- Name: voucher_inventory_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_inventory_entries ALTER COLUMN id SET DEFAULT nextval('public.voucher_inventory_entries_id_seq'::regclass);


--
-- Name: voucher_ledger_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_ledger_entries ALTER COLUMN id SET DEFAULT nextval('public.voucher_ledger_entries_id_seq'::regclass);


--
-- Name: vouchers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers ALTER COLUMN id SET DEFAULT nextval('public.vouchers_id_seq'::regclass);


--
-- Name: vouchertype vouchertype_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchertype ALTER COLUMN vouchertype_id SET DEFAULT nextval('public.vouchertype_vouchertype_id_seq'::regclass);


--
-- Name: app_config app_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_config
    ADD CONSTRAINT app_config_pkey PRIMARY KEY (config_key);


--
-- Name: balance_sheet balance_sheet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_sheet
    ADD CONSTRAINT balance_sheet_pkey PRIMARY KEY (balanceid);


--
-- Name: bill_outstanding_summary bill_outstanding_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_outstanding_summary
    ADD CONSTRAINT bill_outstanding_summary_pkey PRIMARY KEY (id);


--
-- Name: bills_outstanding bills_outstanding_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills_outstanding
    ADD CONSTRAINT bills_outstanding_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (cmpid);


--
-- Name: company_entry_settings company_entry_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_entry_settings
    ADD CONSTRAINT company_entry_settings_pkey PRIMARY KEY (id);


--
-- Name: company_sync_status company_sync_status_cmp_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_sync_status
    ADD CONSTRAINT company_sync_status_cmp_id_key UNIQUE (cmp_id);


--
-- Name: company_sync_status company_sync_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_sync_status
    ADD CONSTRAINT company_sync_status_pkey PRIMARY KEY (id);


--
-- Name: cost_categories cost_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_categories
    ADD CONSTRAINT cost_categories_pkey PRIMARY KEY (costcategory_id);


--
-- Name: costcentre costcentre_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costcentre
    ADD CONSTRAINT costcentre_pkey PRIMARY KEY (costcentre_id);


--
-- Name: country_currency country_currency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country_currency
    ADD CONSTRAINT country_currency_pkey PRIMARY KEY (country_iso2);


--
-- Name: currency_config currency_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currency_config
    ADD CONSTRAINT currency_config_pkey PRIMARY KEY (code);


--
-- Name: currency currency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currency
    ADD CONSTRAINT currency_pkey PRIMARY KEY (currency_id);


--
-- Name: godowns godowns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.godowns
    ADD CONSTRAINT godowns_pkey PRIMARY KEY (godown_id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (grpid);


--
-- Name: ledgers ledgers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledgers
    ADD CONSTRAINT ledgers_pkey PRIMARY KEY (ledid);


--
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (id);


--
-- Name: notification_settings notification_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_user_id_key UNIQUE (user_id);


--
-- Name: partner_extension_log partner_extension_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_extension_log
    ADD CONSTRAINT partner_extension_log_pkey PRIMARY KEY (id);


--
-- Name: partner_extension_log partner_extension_log_target_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_extension_log
    ADD CONSTRAINT partner_extension_log_target_user_id_key UNIQUE (target_user_id);


--
-- Name: plan_feature plan_feature_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_feature
    ADD CONSTRAINT plan_feature_pkey PRIMARY KEY (feature_id);


--
-- Name: plan_price plan_price_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_price
    ADD CONSTRAINT plan_price_pkey PRIMARY KEY (price_id);


--
-- Name: profit_loss profit_loss_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profit_loss
    ADD CONSTRAINT profit_loss_pkey PRIMARY KEY (plid);


--
-- Name: revoked_tokens revoked_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revoked_tokens
    ADD CONSTRAINT revoked_tokens_pkey PRIMARY KEY (id);


--
-- Name: revoked_tokens revoked_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revoked_tokens
    ADD CONSTRAINT revoked_tokens_token_key UNIQUE (token);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_code_key UNIQUE (code);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: session_conflicts session_conflicts_conflict_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_conflicts
    ADD CONSTRAINT session_conflicts_conflict_token_key UNIQUE (conflict_token);


--
-- Name: session_conflicts session_conflicts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_conflicts
    ADD CONSTRAINT session_conflicts_pkey PRIMARY KEY (id);


--
-- Name: stock_categories stock_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_categories
    ADD CONSTRAINT stock_categories_pkey PRIMARY KEY (stockcategory_id);


--
-- Name: stock_groups stock_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_groups
    ADD CONSTRAINT stock_groups_pkey PRIMARY KEY (stockgroup_id);


--
-- Name: stock_items stock_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_items
    ADD CONSTRAINT stock_items_pkey PRIMARY KEY (stockitem_id);


--
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (subscription_id);


--
-- Name: subscription_plan subscription_plan_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plan
    ADD CONSTRAINT subscription_plan_code_key UNIQUE (code);


--
-- Name: subscription_plan subscription_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plan
    ADD CONSTRAINT subscription_plan_pkey PRIMARY KEY (plan_id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: survey survey_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey
    ADD CONSTRAINT survey_pkey PRIMARY KEY (id);


--
-- Name: taxunit taxunit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxunit
    ADD CONSTRAINT taxunit_pkey PRIMARY KEY (taxunit_id);


--
-- Name: trail_balance trail_balance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trail_balance
    ADD CONSTRAINT trail_balance_pkey PRIMARY KEY (tid);


--
-- Name: company_entry_settings uk_company_entry_settings; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_entry_settings
    ADD CONSTRAINT uk_company_entry_settings UNIQUE (cmp_id);


--
-- Name: cost_categories uk_costcategory_cmpid_masterid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_categories
    ADD CONSTRAINT uk_costcategory_cmpid_masterid UNIQUE (cmpid, masterid);


--
-- Name: cost_categories uk_costcategory_cmpid_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_categories
    ADD CONSTRAINT uk_costcategory_cmpid_name UNIQUE (cmpid, name);


--
-- Name: costcentre uk_costcentre_cmpid_masterid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costcentre
    ADD CONSTRAINT uk_costcentre_cmpid_masterid UNIQUE (cmpid, masterid);


--
-- Name: costcentre uk_costcentre_cmpid_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costcentre
    ADD CONSTRAINT uk_costcentre_cmpid_name UNIQUE (cmpid, name);


--
-- Name: currency uk_currency_cmpid_masterid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currency
    ADD CONSTRAINT uk_currency_cmpid_masterid UNIQUE (cmpid, masterid);


--
-- Name: currency uk_currency_cmpid_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currency
    ADD CONSTRAINT uk_currency_cmpid_name UNIQUE (cmpid, name);


--
-- Name: users uk_email_licence; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_email_licence UNIQUE (email, licence_no);


--
-- Name: godowns uk_godown_cmpid_masterid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.godowns
    ADD CONSTRAINT uk_godown_cmpid_masterid UNIQUE (cmpid, masterid);


--
-- Name: godowns uk_godown_cmpid_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.godowns
    ADD CONSTRAINT uk_godown_cmpid_name UNIQUE (cmpid, name);


--
-- Name: groups uk_groups_cmpid_masterid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT uk_groups_cmpid_masterid UNIQUE (cmpid, masterid);


--
-- Name: ledgers uk_ledgers_cmpid_masterid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledgers
    ADD CONSTRAINT uk_ledgers_cmpid_masterid UNIQUE (cmpid, masterid);


--
-- Name: plan_feature uk_planfeature; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_feature
    ADD CONSTRAINT uk_planfeature UNIQUE (plan_id, feature_key);


--
-- Name: plan_price uk_planprice; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_price
    ADD CONSTRAINT uk_planprice UNIQUE (plan_id, currency, billing_period);


--
-- Name: role_permissions uk_role_permission; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT uk_role_permission UNIQUE (role_id, permission_key);


--
-- Name: stock_categories uk_stockcategory_cmpid_masterid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_categories
    ADD CONSTRAINT uk_stockcategory_cmpid_masterid UNIQUE (cmpid, masterid);


--
-- Name: stock_categories uk_stockcategory_cmpid_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_categories
    ADD CONSTRAINT uk_stockcategory_cmpid_name UNIQUE (cmpid, name);


--
-- Name: stock_groups uk_stockgroup_cmpid_masterid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_groups
    ADD CONSTRAINT uk_stockgroup_cmpid_masterid UNIQUE (cmpid, masterid);


--
-- Name: stock_groups uk_stockgroup_cmpid_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_groups
    ADD CONSTRAINT uk_stockgroup_cmpid_name UNIQUE (cmpid, name);


--
-- Name: stock_items uk_stockitem_cmpid_masterid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_items
    ADD CONSTRAINT uk_stockitem_cmpid_masterid UNIQUE (cmpid, masterid);


--
-- Name: stock_items uk_stockitem_cmpid_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_items
    ADD CONSTRAINT uk_stockitem_cmpid_name UNIQUE (cmpid, name);


--
-- Name: taxunit uk_taxunit_cmpid_masterid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxunit
    ADD CONSTRAINT uk_taxunit_cmpid_masterid UNIQUE (cmpid, masterid);


--
-- Name: taxunit uk_taxunit_cmpid_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxunit
    ADD CONSTRAINT uk_taxunit_cmpid_name UNIQUE (cmpid, name);


--
-- Name: units uk_units_cmpid_masterid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT uk_units_cmpid_masterid UNIQUE (cmpid, masterid);


--
-- Name: units uk_units_cmpid_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT uk_units_cmpid_name UNIQUE (cmpid, unit_name);


--
-- Name: user_roles uk_user_role; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT uk_user_role UNIQUE (user_id, role_id);


--
-- Name: voucher_entry_counter uk_voucher_entry_counter; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_entry_counter
    ADD CONSTRAINT uk_voucher_entry_counter UNIQUE (cmp_id, created_by_user_id, voucher_type);


--
-- Name: vouchertype uk_vouchertype_cmpid_masterid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchertype
    ADD CONSTRAINT uk_vouchertype_cmpid_masterid UNIQUE (cmpid, masterid);


--
-- Name: vouchertype uk_vouchertype_cmpid_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchertype
    ADD CONSTRAINT uk_vouchertype_cmpid_name UNIQUE (cmpid, name);


--
-- Name: groups unique_group_per_company; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT unique_group_per_company UNIQUE (cmpid, grp_name);


--
-- Name: ledgers unique_ledger_per_company; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledgers
    ADD CONSTRAINT unique_ledger_per_company UNIQUE (cmpid, led_name);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (unit_id);


--
-- Name: balance_sheet uq_balsheet; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_sheet
    ADD CONSTRAINT uq_balsheet UNIQUE (cmp_id, balanceid);


--
-- Name: bills_outstanding uq_bill_outstanding; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bills_outstanding
    ADD CONSTRAINT uq_bill_outstanding UNIQUE (cmp_id, report_type, party_name, bill_ref);


--
-- Name: bill_outstanding_summary uq_bill_summary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_outstanding_summary
    ADD CONSTRAINT uq_bill_summary UNIQUE (cmp_id, report_type, party_name);


--
-- Name: companies uq_company_user_guid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT uq_company_user_guid UNIQUE (userid, company_guid);


--
-- Name: voucher_ledger_entries uq_led_entry; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_ledger_entries
    ADD CONSTRAINT uq_led_entry UNIQUE (voucher_id, ledger_name, amount, entry_index);


--
-- Name: profit_loss uq_profitloss; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profit_loss
    ADD CONSTRAINT uq_profitloss UNIQUE (cmp_id, plid);


--
-- Name: trail_balance uq_trailbalance; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trail_balance
    ADD CONSTRAINT uq_trailbalance UNIQUE (cmp_id, tid);


--
-- Name: vouchers uq_vouchers_guid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT uq_vouchers_guid UNIQUE (cmp_id, guid);


--
-- Name: user_devices user_devices_device_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_device_token_key UNIQUE (device_token);


--
-- Name: user_devices user_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: van_location_ping van_location_ping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.van_location_ping
    ADD CONSTRAINT van_location_ping_pkey PRIMARY KEY (id);


--
-- Name: van_shift van_shift_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.van_shift
    ADD CONSTRAINT van_shift_pkey PRIMARY KEY (id);


--
-- Name: voucher_batch_allocations voucher_batch_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_batch_allocations
    ADD CONSTRAINT voucher_batch_allocations_pkey PRIMARY KEY (id);


--
-- Name: voucher_bill_allocations voucher_bill_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_bill_allocations
    ADD CONSTRAINT voucher_bill_allocations_pkey PRIMARY KEY (id);


--
-- Name: voucher_cost_category_allocations voucher_cost_category_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_cost_category_allocations
    ADD CONSTRAINT voucher_cost_category_allocations_pkey PRIMARY KEY (id);


--
-- Name: voucher_cost_centre_allocations voucher_cost_centre_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_cost_centre_allocations
    ADD CONSTRAINT voucher_cost_centre_allocations_pkey PRIMARY KEY (id);


--
-- Name: voucher_entry_counter voucher_entry_counter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_entry_counter
    ADD CONSTRAINT voucher_entry_counter_pkey PRIMARY KEY (id);


--
-- Name: voucher_inventory_entries voucher_inventory_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_inventory_entries
    ADD CONSTRAINT voucher_inventory_entries_pkey PRIMARY KEY (id);


--
-- Name: voucher_ledger_entries voucher_ledger_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_ledger_entries
    ADD CONSTRAINT voucher_ledger_entries_pkey PRIMARY KEY (id);


--
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);


--
-- Name: vouchertype vouchertype_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchertype
    ADD CONSTRAINT vouchertype_pkey PRIMARY KEY (vouchertype_id);


--
-- Name: idx_balsheet_cmp_fy; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_balsheet_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_bo_cmp_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_bo_overdue; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_bo_party; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_bo_report_type; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_bos_cmp_type; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_bos_overdue; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_companies_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_company_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_company_sync_cmp_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_company_sync_status; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_company_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_costcategory_cmpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_costcategory_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_costcategory_masterid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_costcategory_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_costcentre_cmpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_costcentre_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_costcentre_masterid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_costcentre_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_currency_cmpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_currency_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_currency_masterid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_currency_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_godown_cmpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_godown_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_godown_masterid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_godown_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_groups_cmpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_groups_company_active; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_groups_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_groups_masterid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_groups_name; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_groups_parent; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_groups_parent_grpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_groups_revenue; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_groups_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_cmpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_company_active; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_email; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_grpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_gstin; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_masterid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_mobile; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_name; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_parent; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_parent_ledid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_revenue; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_ledgers_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_profitloss_cmp_fy; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_profitloss_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_revoked_tokens_expires; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_revoked_tokens_token; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockcategory_cmpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockcategory_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockcategory_masterid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockcategory_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockgroup_cmpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockgroup_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockgroup_masterid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockgroup_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockitem_category; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockitem_cmpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockitem_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockitem_hsn_code; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockitem_masterid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockitem_parent; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_stockitem_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_subscription_status; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_subscription_user; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_support_status; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_support_user_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_survey_type_created; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_taxunit_cmpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_taxunit_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_taxunit_masterid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_taxunit_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_trailbalance_cmp_fy; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_trailbalance_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_units_cmpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_units_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_units_masterid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_units_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_user_devices_token_active; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_user_devices_user_token_active; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_users_device_token; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_users_email_licence; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_users_parent; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_van_ping_lookup; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_van_ping_recorded_at; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_van_shift_lookup; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vba2_batch_name; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vba2_cmp_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vba2_inventory_entry; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vba2_voucher_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vba_bill_name; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vba_bill_type; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vba_cmp_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vba_ledger_entry_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vba_voucher_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vcca_cmp_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vcca_ledger_entry; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vcca_voucher_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vccna_cmp_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vccna_cost_cat; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vccna_voucher_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vie_cmp_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vie_stock_item; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vie_voucher_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vie_voucher_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vle_cmp_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vle_cmp_ledger_date; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vle_ledger_name; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vle_voucher_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vle_voucher_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchers_alter_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchers_cmp_date_cover; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchers_cmp_id; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchers_cmp_ltype_date; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchers_created_by; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchers_date; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchers_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchers_number; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchers_party; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchers_pending_push; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchers_type; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchertype_cmp_lparent; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchertype_cmpid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchertype_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchertype_masterid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: idx_vouchertype_userid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uk_van_ping_dedupe; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uk_van_shift_open; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uq_cost_categories_cmp_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uq_costcentre_cmp_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uq_godowns_cmp_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uq_groups_cmp_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uq_ledgers_cmp_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uq_stock_categories_cmp_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uq_stock_groups_cmp_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uq_stock_items_cmp_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uq_taxunit_cmp_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uq_vouchers_cmp_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: uq_vouchertype_cmp_guid; Type: INDEX; Schema: public; Owner: -
--



--
-- Name: vouchers trg_voucher_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_voucher_updated BEFORE UPDATE ON public.vouchers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: groups trigger_groups_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ledgers trigger_ledgers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_ledgers_updated_at BEFORE UPDATE ON public.ledgers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: company_sync_status fk_company_sync_cmp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_sync_status
    ADD CONSTRAINT fk_company_sync_cmp FOREIGN KEY (cmp_id) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: companies fk_company_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT fk_company_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: cost_categories fk_costcategory_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_categories
    ADD CONSTRAINT fk_costcategory_company FOREIGN KEY (cmpid) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: cost_categories fk_costcategory_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_categories
    ADD CONSTRAINT fk_costcategory_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: costcentre fk_costcentre_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costcentre
    ADD CONSTRAINT fk_costcentre_company FOREIGN KEY (cmpid) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: costcentre fk_costcentre_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costcentre
    ADD CONSTRAINT fk_costcentre_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: country_currency fk_countrycur_currency; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country_currency
    ADD CONSTRAINT fk_countrycur_currency FOREIGN KEY (currency_code) REFERENCES public.currency_config(code);


--
-- Name: currency fk_currency_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currency
    ADD CONSTRAINT fk_currency_company FOREIGN KEY (cmpid) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: currency fk_currency_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currency
    ADD CONSTRAINT fk_currency_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: godowns fk_godown_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.godowns
    ADD CONSTRAINT fk_godown_company FOREIGN KEY (cmpid) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: godowns fk_godown_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.godowns
    ADD CONSTRAINT fk_godown_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: groups fk_groups_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT fk_groups_company FOREIGN KEY (cmpid) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: groups fk_groups_parent; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT fk_groups_parent FOREIGN KEY (parent_grpid) REFERENCES public.groups(grpid) ON DELETE SET NULL;


--
-- Name: groups fk_groups_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT fk_groups_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: ledgers fk_ledgers_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledgers
    ADD CONSTRAINT fk_ledgers_company FOREIGN KEY (cmpid) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: ledgers fk_ledgers_group; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledgers
    ADD CONSTRAINT fk_ledgers_group FOREIGN KEY (grpid) REFERENCES public.groups(grpid) ON DELETE SET NULL;


--
-- Name: ledgers fk_ledgers_parent; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledgers
    ADD CONSTRAINT fk_ledgers_parent FOREIGN KEY (parent_ledid) REFERENCES public.ledgers(ledid) ON DELETE SET NULL;


--
-- Name: ledgers fk_ledgers_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledgers
    ADD CONSTRAINT fk_ledgers_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: notification_settings fk_notif_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: plan_feature fk_planfeature_plan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_feature
    ADD CONSTRAINT fk_planfeature_plan FOREIGN KEY (plan_id) REFERENCES public.subscription_plan(plan_id) ON DELETE CASCADE;


--
-- Name: plan_price fk_planprice_plan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_price
    ADD CONSTRAINT fk_planprice_plan FOREIGN KEY (plan_id) REFERENCES public.subscription_plan(plan_id) ON DELETE CASCADE;


--
-- Name: role_permissions fk_roleperm_role; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_roleperm_role FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE;


--
-- Name: session_conflicts fk_sc_existing_device; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_conflicts
    ADD CONSTRAINT fk_sc_existing_device FOREIGN KEY (existing_device_id) REFERENCES public.user_devices(id) ON DELETE CASCADE;


--
-- Name: session_conflicts fk_sc_new_device; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_conflicts
    ADD CONSTRAINT fk_sc_new_device FOREIGN KEY (new_device_id) REFERENCES public.user_devices(id) ON DELETE CASCADE;


--
-- Name: session_conflicts fk_sc_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_conflicts
    ADD CONSTRAINT fk_sc_user FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: stock_categories fk_stockcategory_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_categories
    ADD CONSTRAINT fk_stockcategory_company FOREIGN KEY (cmpid) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: stock_categories fk_stockcategory_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_categories
    ADD CONSTRAINT fk_stockcategory_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: stock_groups fk_stockgroup_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_groups
    ADD CONSTRAINT fk_stockgroup_company FOREIGN KEY (cmpid) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: stock_groups fk_stockgroup_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_groups
    ADD CONSTRAINT fk_stockgroup_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: stock_items fk_stockitem_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_items
    ADD CONSTRAINT fk_stockitem_company FOREIGN KEY (cmpid) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: stock_items fk_stockitem_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_items
    ADD CONSTRAINT fk_stockitem_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: subscription fk_subscription_plan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT fk_subscription_plan FOREIGN KEY (plan_id) REFERENCES public.subscription_plan(plan_id);


--
-- Name: subscription fk_subscription_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT fk_subscription_user FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: support_tickets fk_support_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT fk_support_user FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: taxunit fk_taxunit_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxunit
    ADD CONSTRAINT fk_taxunit_company FOREIGN KEY (cmpid) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: taxunit fk_taxunit_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxunit
    ADD CONSTRAINT fk_taxunit_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: units fk_units_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT fk_units_company FOREIGN KEY (cmpid) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: units fk_units_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT fk_units_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: user_devices fk_user_devices_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT fk_user_devices_user FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: user_roles fk_userroles_role; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_userroles_role FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE;


--
-- Name: user_roles fk_userroles_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_userroles_user FOREIGN KEY (user_id) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: users fk_users_parent; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_parent FOREIGN KEY (parent_user_id) REFERENCES public.users(userid) ON DELETE SET NULL;


--
-- Name: vouchertype fk_vouchertype_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchertype
    ADD CONSTRAINT fk_vouchertype_company FOREIGN KEY (cmpid) REFERENCES public.companies(cmpid) ON DELETE CASCADE;


--
-- Name: vouchertype fk_vouchertype_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchertype
    ADD CONSTRAINT fk_vouchertype_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: voucher_batch_allocations voucher_batch_allocations_inventory_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_batch_allocations
    ADD CONSTRAINT voucher_batch_allocations_inventory_entry_id_fkey FOREIGN KEY (inventory_entry_id) REFERENCES public.voucher_inventory_entries(id) ON DELETE CASCADE;


--
-- Name: voucher_batch_allocations voucher_batch_allocations_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_batch_allocations
    ADD CONSTRAINT voucher_batch_allocations_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id) ON DELETE CASCADE;


--
-- Name: voucher_bill_allocations voucher_bill_allocations_ledger_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_bill_allocations
    ADD CONSTRAINT voucher_bill_allocations_ledger_entry_id_fkey FOREIGN KEY (ledger_entry_id) REFERENCES public.voucher_ledger_entries(id) ON DELETE CASCADE;


--
-- Name: voucher_bill_allocations voucher_bill_allocations_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_bill_allocations
    ADD CONSTRAINT voucher_bill_allocations_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id) ON DELETE CASCADE;


--
-- Name: voucher_cost_category_allocations voucher_cost_category_allocations_ledger_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_cost_category_allocations
    ADD CONSTRAINT voucher_cost_category_allocations_ledger_entry_id_fkey FOREIGN KEY (ledger_entry_id) REFERENCES public.voucher_ledger_entries(id) ON DELETE CASCADE;


--
-- Name: voucher_cost_category_allocations voucher_cost_category_allocations_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_cost_category_allocations
    ADD CONSTRAINT voucher_cost_category_allocations_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id) ON DELETE CASCADE;


--
-- Name: voucher_cost_centre_allocations voucher_cost_centre_allocations_cost_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_cost_centre_allocations
    ADD CONSTRAINT voucher_cost_centre_allocations_cost_category_id_fkey FOREIGN KEY (cost_category_id) REFERENCES public.voucher_cost_category_allocations(id) ON DELETE CASCADE;


--
-- Name: voucher_cost_centre_allocations voucher_cost_centre_allocations_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_cost_centre_allocations
    ADD CONSTRAINT voucher_cost_centre_allocations_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id) ON DELETE CASCADE;


--
-- Name: voucher_inventory_entries voucher_inventory_entries_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_inventory_entries
    ADD CONSTRAINT voucher_inventory_entries_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id) ON DELETE CASCADE;


--
-- Name: voucher_ledger_entries voucher_ledger_entries_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_ledger_entries
    ADD CONSTRAINT voucher_ledger_entries_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


