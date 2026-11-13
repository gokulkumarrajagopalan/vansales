import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { PeriodType, VoucherType } from '../../types/erp';
import {
  Calendar,
  Plus,
  Building2,
  User,
  ChevronDown,
  RotateCcw,
  Search,
  Truck,
  ExternalLink,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';

const PERIOD_OPTIONS: Array<{ key: PeriodType; label: string }> = [
  { key: 'today', label: 'Today (26 Oct 2026)' },
  { key: 'yesterday', label: 'Yesterday (25 Oct 2026)' },
  { key: 'this_week', label: 'This Week' },
  { key: 'this_month', label: 'This Month (Oct 2026)' },
  { key: 'last_month', label: 'Last Month (Sep 2026)' },
  { key: 'this_year', label: 'This Fiscal Year (2026-27)' },
  { key: 'custom', label: 'Custom Period' },
];

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    company,
    currentUser,
    selectedPeriod,
    setSelectedPeriod,
    customDateRange,
    setCustomDateRange,
    openVoucherModal,
    setCurrentView,
    resetDatabase,
    vehicles,
    currentView,
  } = useErp();

  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [quickVoucherOpen, setQuickVoucherOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

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
      customers: 'Sales / Customers Master',
      sales_order: 'Sales / Sales Orders',
      sales: 'Sales / Invoices & POS',
      sales_return: 'Sales / Credit Notes (Sales Return)',
      collect_payment: 'Sales / Collect Customer Payment',
      customer_statement: 'Sales / Customer Statement',
      customer_outstandings: 'Sales / Customer Outstandings Aging',
      suppliers: 'Purchase / Suppliers Master',
      purchase_order: 'Purchase / Purchase Orders',
      purchase: 'Purchase / Purchase Bills',
      purchase_return: 'Purchase / Debit Notes (Purchase Return)',
      make_payment: 'Purchase / Make Supplier Payment',
      supplier_statement: 'Purchase / Supplier Statement',
      supplier_outstandings: 'Purchase / Supplier Outstandings',
      vouchers_hub: 'Accounting Vouchers Hub',
      items: 'Inventory / Items Master',
      item_groups: 'Inventory / Groups',
      item_categories: 'Inventory / Categories',
      units: 'Inventory / Units of Measure',
      price_list: 'Inventory / Price Lists',
      godowns: 'Inventory / Godowns & Van Locations',
      stock_summary: 'Inventory / Stock Movement Summary (Tally)',
      godown_summary: 'Inventory / Godown & Van Stock Summary',
      fleet_master: 'Fleet Management / Vehicle Master',
      salesman_driver: 'Fleet Management / Drivers & Salesmen',
      fleet_wise_report: 'Fleet Management / Fleet Operations Report',
      daybook: 'Accountant / Daybook Voucher Feed',
      ledger_statements: 'Accountant / General Ledger Statements',
      ledger_outstandings: 'Accountant / Bill-wise Outstandings',
      voucher_register: 'Accountant / Voucher Registers',
      trial_balance: 'Final Accounts / Trial Balance',
      balance_sheet: 'Final Accounts / Balance Sheet',
      profit_loss: 'Final Accounts / Profit & Loss Statement',
      company_profile: 'Settings / Company Profile',
      tax_details: 'Settings / Tax Details',
      users_permissions: 'Settings / Users & Roles',
      developer_api: 'Settings / Developer Mobile API',
      about: 'Settings / About & Architecture',
    };
    return titles[view] || 'ApexERP';
  };

  return (
    <>
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs transition-colors">
        {/* Left: Breadcrumbs & Company Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="truncate max-w-[190px]">{company.name}</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal font-mono text-[11px]">{company.currencySymbol}</span>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500">/</div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
            {getBreadcrumbLabel(currentView)}
          </span>
        </div>

        {/* Center / Right: Date Period Quick Selector, Dark Mode Switcher & Fast Vouchers */}
        <div className="flex items-center gap-2">
          {/* Active Vans Badge */}
          <button
            onClick={() => setCurrentView('fleet_wise_report')}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 rounded-md border border-emerald-200 dark:border-emerald-800/60 transition-colors"
            title="Active Vans on field right now"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{activeVansCount} Vans Active on Field</span>
          </button>

          {/* Period Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="capitalize">{PERIOD_OPTIONS.find(p => p.key === selectedPeriod)?.label || selectedPeriod}</span>
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
                      selectedPeriod === opt.key ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/40' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedPeriod === opt.key && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Voucher Modal Trigger */}
          <div className="relative">
            <button
              onClick={() => setQuickVoucherOpen(!quickVoucherOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-2xs"
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
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center justify-between"
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

          {/* Dark Mode / Light Mode Switch Button (Always on Top Bar) */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Profile / VPS Tenant Info */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                {currentUser ? currentUser.name[0] : 'A'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {currentUser ? currentUser.name.split(' ')[0] : 'Admin'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {currentUser ? currentUser.role.replace('_', ' ') : 'Administrator'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{currentUser?.name || 'Administrator'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser?.email || 'admin@vps-node1.apexfmcg.com'}</p>
                  <span className="inline-block mt-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-200 dark:border-slate-700">
                    Single-Tenant VPS Dedicated
                  </span>
                </div>
                <button
                  onClick={() => { setCurrentView('company_profile'); setUserDropdownOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Company Profile</span>
                </button>
                <button
                  onClick={() => { setCurrentView('developer_api'); setUserDropdownOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mobile App API Sync</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Reset sample data to initial factory state?')) {
                      resetDatabase();
                      setUserDropdownOpen(false);
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Reset Sample Data</span>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                <button
                  onClick={() => {
                    setCurrentView('landing');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Sign Out / Exit VPS Session
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Select Custom Period</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Filter dashboard, financial reports, and daybook between specific accounting dates.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={e => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={e => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-indigo-600"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSelectedPeriod('custom');
                  setShowCustomModal(false);
                }}
                className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
