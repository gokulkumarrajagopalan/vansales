import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { PeriodType, VoucherType } from '../../types/erp';
import {
  Calendar,
  Plus,
  Building2,
  User,
  ChevronDown,
  Truck,
  ExternalLink,
  Sun,
  Moon,
  CheckCircle2,
  X,
  LogOut,
} from 'lucide-react';

const PERIOD_OPTIONS: Array<{ key: PeriodType; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'this_week', label: 'This Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'this_year', label: 'Fiscal Year (2026-27)' },
  { key: 'custom', label: 'Custom Period' },
];

const PERIOD_DISPLAY_LABELS: Record<PeriodType, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This Week',
  this_month: 'This Month',
  last_month: 'Last Month',
  this_year: 'FY 2026-27',
  custom: 'Custom Range',
};

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    company,
    currentUser,
    logout,
    selectedPeriod,
    setSelectedPeriod,
    customDateRange,
    setCustomDateRange,
    openVoucherModal,
    setCurrentView,
    vehicles,
    currentView,
  } = useErp();

  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [quickVoucherOpen, setQuickVoucherOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Active vans on field
  const activeVansCount = vehicles.filter(v => v.status === 'on_field').length;

  const handlePeriodSelect = (period: PeriodType) => {
    if (period === 'custom') {
      setShowCustomModal(true);
    } else {
      setSelectedPeriod(period);
    }
    setPeriodDropdownOpen(false);
  };

  const getBreadcrumbLabel = (view: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard',
      chart_of_accounts: 'Chart of Accounts',
      customers: 'Customers Master',
      sales_order: 'Sales Orders',
      sales: 'Sales Invoices & POS',
      sales_return: 'Credit Notes',
      collect_payment: 'Collect Payment',
      customer_statement: 'Customer Statement',
      customer_outstandings: 'Customer Outstandings',
      suppliers: 'Suppliers Master',
      purchase_order: 'Purchase Orders',
      purchase: 'Purchase Bills',
      purchase_return: 'Debit Notes',
      make_payment: 'Make Payment',
      supplier_statement: 'Supplier Statement',
      supplier_outstandings: 'Supplier Outstandings',
      vouchers_hub: 'Vouchers Hub',
      items: 'Items Master',
      item_groups: 'Item Groups',
      item_categories: 'Categories',
      units: 'Units of Measure',
      price_list: 'Price Lists',
      godowns: 'Godowns & Vans',
      stock_summary: 'Stock Summary',
      godown_summary: 'Godown Summary',
      fleet_master: 'Vehicle Master',
      salesman_driver: 'Drivers & Salesmen',
      fleet_wise_report: 'Fleet Report',
      live_tracking: 'Live GPS Tracker',
      daybook: 'Daybook Feed',
      ledger_statements: 'General Ledgers',
      ledger_outstandings: 'Bill Outstandings',
      voucher_register: 'Voucher Register',
      trial_balance: 'Trial Balance',
      balance_sheet: 'Balance Sheet',
      profit_loss: 'Profit & Loss',
      orders_billing: 'Orders & Approvals',
      crop_advisory: 'Crop Advisory Desk',
      tally_sync: 'Tally Sync Center',
      theme_settings: 'Theme Settings',
      permissions_registry: 'Permissions Matrix',
      company_profile: 'Company Profile',
      tax_details: 'Tax Details',
      users_permissions: 'Users & Roles',
      developer_api: 'Mobile API Sync',
      about: 'System Overview',
    };
    return titles[view] || 'Talliffy';
  };

  return (
    <>
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs transition-colors">
        {/* Left: Breadcrumbs & Company Tag */}
        <div className="flex items-center gap-2.5 min-w-0 shrink">
          {/* Company Pill */}
          <button
            onClick={() => setCurrentView('company_profile')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
            title="Alter Company Profile"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate max-w-[150px] whitespace-nowrap">
              {company.tradeName || company.name}
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-normal">|</span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] font-normal">
              {company.currencySymbol}
            </span>
          </button>

          <div className="text-slate-300 dark:text-slate-600 text-xs shrink-0 select-none">/</div>

          {/* Current View Breadcrumb Title */}
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight whitespace-nowrap truncate max-w-[200px] sm:max-w-[280px]">
            {getBreadcrumbLabel(currentView)}
          </h2>
        </div>

        {/* Right: Actions, Filters, Theme, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Vans Badge */}
          <button
            onClick={() => setCurrentView('live_tracking')}
            className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            title="Open Live Van GPS Tracker"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{activeVansCount} Vans Active</span>
          </button>

          {/* Period Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="whitespace-nowrap">{PERIOD_DISPLAY_LABELS[selectedPeriod] || selectedPeriod}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {periodDropdownOpen && (
              <div className="absolute right-0 mt-1 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Filter Accounting Period
                </div>
                {PERIOD_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handlePeriodSelect(opt.key)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      selectedPeriod === opt.key ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/40' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedPeriod === opt.key && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Voucher Modal Trigger */}
          <div className="relative">
            <button
              onClick={() => setQuickVoucherOpen(!quickVoucherOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0 active:scale-98"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Voucher</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {quickVoucherOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Quick Create Voucher
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { openVoucherModal({ initialType: 'sales' }); setQuickVoucherOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-between"
                  >
                    <span>Sales Invoice / POS</span>
                    <span className="text-[10px] text-slate-400 font-mono">F8</span>
                  </button>
                  <button
                    onClick={() => { openVoucherModal({ initialType: 'receipt' }); setQuickVoucherOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center justify-between"
                  >
                    <span>Receipt (Payment In)</span>
                    <span className="text-[10px] text-slate-400 font-mono">F6</span>
                  </button>
                  <button
                    onClick={() => { openVoucherModal({ initialType: 'purchase' }); setQuickVoucherOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-700 dark:hover:text-amber-300 flex items-center justify-between"
                  >
                    <span>Purchase Bill</span>
                    <span className="text-[10px] text-slate-400 font-mono">F9</span>
                  </button>
                  <button
                    onClick={() => { openVoucherModal({ initialType: 'payment' }); setQuickVoucherOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-300 flex items-center justify-between"
                  >
                    <span>Payment (Supplier/Expense)</span>
                    <span className="text-[10px] text-slate-400 font-mono">F5</span>
                  </button>
                  <button
                    onClick={() => { openVoucherModal({ initialType: 'contra' }); setQuickVoucherOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-between"
                  >
                    <span>Contra (Cash / Bank)</span>
                    <span className="text-[10px] text-slate-400 font-mono">F4</span>
                  </button>
                  <button
                    onClick={() => { openVoucherModal({ initialType: 'journal' }); setQuickVoucherOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-700 dark:hover:text-purple-300 flex items-center justify-between"
                  >
                    <span>Journal Entry</span>
                    <span className="text-[10px] text-slate-400 font-mono">F7</span>
                  </button>
                  <button
                    onClick={() => { openVoucherModal({ initialType: 'credit_note' }); setQuickVoucherOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Sales Return (Credit Note)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0 mx-0.5" />

          {/* Dark Mode / Light Mode Switch Button */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200/70 dark:border-slate-700/70 shrink-0 whitespace-nowrap"
            >
              <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                {currentUser ? currentUser.name[0] : 'T'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap leading-tight">
                  {currentUser ? currentUser.name : 'Talliffy Admin'}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-none">
                  {currentUser?.role === 'salesman_pos' ? 'Van Sales POS' : currentUser?.role === 'accountant' ? 'Accountant' : currentUser?.role === 'warehouse_manager' ? 'Depot Mgr' : 'Administrator'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser?.name || 'Talliffy Admin'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser?.email || 'admin@talliffy.com'}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono border border-blue-200 dark:border-blue-800">
                      {currentUser?.role?.toUpperCase() || 'ADMIN'}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      ● Active Session
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { setCurrentView('company_profile'); setUserDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Company Profile</span>
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => { setCurrentView('developer_api'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mobile Sync API</span>
                    </button>
                  )}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 my-0.5" />
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-5 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Select Custom Period</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Filter dashboard, financial reports, and daybook between specific accounting dates.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">From Date</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={e => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">To Date</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={e => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSelectedPeriod('custom');
                  setShowCustomModal(false);
                }}
                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};

export default Header;
