import React, { useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { PeriodType } from '../../types/erp';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  Landmark,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertTriangle,
  FileText,
  CreditCard,
  Plus,
  ChevronRight,
  Eye,
  Activity,
  Layers,
  Shield,
  CheckCircle2,
  Target,
  Award,
  Fuel,
} from 'lucide-react';
import { GoogleMapLiveTracker } from './GoogleMapLiveTracker';

export const DashboardView: React.FC = () => {
  const {
    company,
    selectedPeriod,
    setSelectedPeriod,
    getFilteredVouchers,
    getLedgerBalance,
    getCustomerBalance,
    getSupplierBalance,
    ledgers,
    vehicles,
    drivers,
    customers,
    suppliers,
    openVoucherModal,
    setCurrentView,
    setInvoiceToView,
    setSelectedPartyId,
    setSelectedFleetId,
    getProfitAndLoss,
    currentUser,
    isVoucherAccessible,
    vouchers,
  } = useErp();

  const isSalesman = currentUser?.role === 'salesman_pos';

  const periodVouchers = getFilteredVouchers(selectedPeriod);

  // Sales in selected period (auto-filtered by isVoucherAccessible)
  const totalPeriodSales = periodVouchers
    .filter(v => v.voucherType === 'sales')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  // Collections (Receipts) in selected period (auto-filtered by isVoucherAccessible)
  const totalPeriodCollections = periodVouchers
    .filter(v => v.voucherType === 'receipt')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  // Purchases in selected period
  const totalPeriodPurchases = periodVouchers
    .filter(v => v.voucherType === 'purchase')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  // Cash in hand
  const cashLedger = ledgers.find(l => l.subtype === 'cash');
  const cashBalance = cashLedger ? getLedgerBalance(cashLedger.id) : 0;

  // Van-specific cash calculation for salesman
  const salesmanCashReceipts = useMemo(() => {
    return vouchers
      .filter(v => isVoucherAccessible(v) && v.voucherType === 'receipt')
      .reduce((sum, v) => sum + v.totalAmount, 0);
  }, [vouchers, isVoucherAccessible]);

  const salesmanCashExpenses = useMemo(() => {
    return vouchers
      .filter(v => isVoucherAccessible(v) && v.voucherType === 'payment')
      .reduce((sum, v) => sum + v.totalAmount, 0);
  }, [vouchers, isVoucherAccessible]);

  const vanCashInHand = salesmanCashReceipts - salesmanCashExpenses;
  const displayCashBalance = isSalesman ? vanCashInHand : cashBalance;

  // Bank balances
  const bankLedgers = ledgers.filter(l => l.subtype === 'bank');
  const totalBankBalance = bankLedgers.reduce((sum, l) => sum + getLedgerBalance(l.id), 0);

  // Territory-filtered customers for salesman
  const roleCustomers = useMemo(() => {
    if (!isSalesman || !currentUser) return customers;
    return customers.filter(
      c =>
        c.createdBy === currentUser.id ||
        c.assignedSalesmanId === currentUser.id ||
        (currentUser.assignedVehicleId && c.assignedVehicleId === currentUser.assignedVehicleId)
    );
  }, [customers, isSalesman, currentUser]);

  // Receivables (Customers) strictly within territory
  const totalReceivables = roleCustomers.reduce((sum, c) => sum + getCustomerBalance(c.id), 0);

  // Payables (Suppliers)
  const totalPayables = suppliers.reduce((sum, s) => sum + getSupplierBalance(s.id), 0);

  // Profit & Loss
  const pnl = getProfitAndLoss();

  // Fleet activity
  const vehiclesOnField = vehicles.filter(v => v.status === 'on_field');
  const assignedVehicle = vehicles.find(
    v => v.id === currentUser?.assignedVehicleId || v.locationId === currentUser?.assignedLocationId
  ) || vehicles[0];
  const assignedDriver = drivers.find(d => d.id === assignedVehicle?.assignedDriverId || d.assignedVehicleId === assignedVehicle?.id);
  const routeArea = assignedDriver?.routeArea || 'Route 1 - North Belt';

  const periods: { id: PeriodType; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_year', label: 'This Year' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Period Control Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isSalesman ? `Van 01 Field POS Dashboard · ${currentUser?.name}` : 'Executive Distribution & POS Dashboard'}
            </h1>
            {isSalesman && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1 font-mono">
                <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{assignedVehicle?.regNumber || 'KA-01-EA-1024'}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSalesman
              ? `Real-time spot sales, cash drawer collections, and route accounts receivable for ${routeArea}.`
              : 'Real-time van sales, double-entry collections, inventory movement, and cash flows.'}
          </p>
        </div>

        {/* Interactive Segmented Period Filter Bar */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                selectedPeriod === p.id
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Summary Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isSalesman ? 'Your Sales' : `${selectedPeriod.replace('_', ' ')} Sales`}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {company.currencySymbol} {totalPeriodSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{isSalesman ? 'Your Spot Invoices Posted' : 'Spot Van Delivery & B2B Orders'}</span>
            </div>
          </div>
        </div>

        {/* Collections Summary Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isSalesman ? 'Amount You Collected' : `${selectedPeriod.replace('_', ' ')} Collection`}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {company.currencySymbol} {totalPeriodCollections.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{isSalesman ? 'Cash & UPI Receipts in Hand' : 'Cash & UPI Collections'}</span>
            </div>
          </div>
        </div>

        {/* Cash in Hand */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isSalesman ? 'Van Drawer Cash' : 'Cash Balance (In Hand)'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {company.currencySymbol} {displayCashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isSalesman ? 'Receipts collected minus fuel paid' : 'Available across physical drawers & vans'}
            </p>
          </div>
        </div>

        {/* Assigned Vehicle or Vehicles on Field Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isSalesman ? 'Assigned Vehicle' : 'Vehicles on Field'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isSalesman ? (
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                  {assignedVehicle?.regNumber}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {assignedVehicle?.model} · {routeArea}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                    {vehiclesOnField.length} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ {vehicles.length} Active</span>
                  </h3>
                </div>
                <button
                  onClick={() => setCurrentView('fleet_wise_report')}
                  className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold flex items-center gap-0.5"
                >
                  <span>View Van Fleet Live Stats</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Production Google Maps Live Point Van Tracker */}
      <GoogleMapLiveTracker />

      {/* Second Row: Role-tailored financial summary */}
      {isSalesman ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Van Cash Reconciliation */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Van Cash &amp; Fuel Reconciliation
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Ready for Handover
                </span>
              </div>

              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 dark:text-slate-400">Total Cash Collections (Receipts):</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    + {company.currencySymbol} {salesmanCashReceipts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 dark:text-slate-400">Van Fuel &amp; Toll Expenses Paid:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    - {company.currencySymbol} {salesmanCashExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center mt-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Net Physical Cash in Van:</span>
                  <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                    {company.currencySymbol} {vanCashInHand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Need to record fuel expense?</span>
              <button
                onClick={() => openVoucherModal({ initialType: 'payment' })}
                className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Fuel className="w-3.5 h-3.5" />
                <span>Log Van Fuel (F5)</span>
              </button>
            </div>
          </div>

          {/* Card 2: Assigned Route Receivables */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Your Route Receivables
                </h3>
              </div>

              <div className="mt-4 p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Route Balance Outstanding:</span>
                  <span className="font-mono font-bold text-blue-900 dark:text-blue-300 text-base">
                    {company.currencySymbol} {totalReceivables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Across {roleCustomers.length} retail stores on your route</span>
                  <button
                    onClick={() => setCurrentView('customer_outstandings')}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    View Aging Report →
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                {roleCustomers.slice(0, 3).map(c => (
                  <div key={c.id} className="text-xs flex items-center justify-between py-1 px-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{c.name}</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      {company.currencySymbol} {getCustomerBalance(c.id).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <button
                onClick={() => setCurrentView('customer_statement')}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Customer Ledgers &amp; Statements →
              </button>
            </div>
          </div>

          {/* Card 3: Field POS Shortcuts */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Van POS Field Actions
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Territory POS</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => openVoucherModal({ initialType: 'sales' })}
                  className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-left transition-colors flex flex-col justify-between shadow-xs"
                >
                  <span className="text-xs font-bold text-white">Spot Van Sale</span>
                  <span className="text-[10px] text-blue-200 font-mono mt-1">F8 · Issue Invoice</span>
                </button>
                <button
                  onClick={() => openVoucherModal({ initialType: 'receipt' })}
                  className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-left transition-colors flex flex-col justify-between shadow-xs"
                >
                  <span className="text-xs font-bold text-white">Collect Payment</span>
                  <span className="text-[10px] text-emerald-200 font-mono mt-1">F6 · Cash / UPI</span>
                </button>
                <button
                  onClick={() => openVoucherModal({ initialType: 'payment' })}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-colors flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-white">Log Van Fuel</span>
                  <span className="text-[10px] text-rose-300 font-mono mt-1">F5 · Diesel Expense</span>
                </button>
                <button
                  onClick={() => setCurrentView('customers')}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-colors flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-white">My Retail Stores</span>
                  <span className="text-[10px] text-slate-300 font-mono mt-1">{roleCustomers.length} Assigned</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <button
                onClick={() => setCurrentView('sales_invoices')}
                className="text-slate-300 hover:text-white flex items-center gap-1 font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>My Sales Invoices</span>
              </button>
              <button
                onClick={() => setCurrentView('collect_payment')}
                className="text-slate-300 hover:text-white flex items-center gap-1 font-medium"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>My Collections</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Admin Financial Overview */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bank Balances (Ledger-wise breakup) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Bank Balance (Ledger Breakup)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {company.currencySymbol} {totalBankBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              {bankLedgers.map(bank => {
                const bal = getLedgerBalance(bank.id);
                return (
                  <div key={bank.id} className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 px-2 rounded-lg transition-colors">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{bank.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        A/C: {bank.bankAccountNumber || 'Direct Current'} · {bank.bankBranch || 'Central Hub'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">
                        {company.currencySymbol} {bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Reconciled</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>Transfer cash to bank?</span>
              <button
                onClick={() => openVoucherModal({ initialType: 'contra' })}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Post Contra Entry
              </button>
            </div>
          </div>

          {/* Outstanding Receivables & Payables Summary */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Receivables &amp; Payables Outstandings
                </h3>
              </div>

              <div className="space-y-4 mt-4">
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Accounts Receivable (Customers Owe):</span>
                    <span className="font-mono font-bold text-indigo-900 dark:text-indigo-300 text-sm">
                      {company.currencySymbol} {totalReceivables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>From {customers.length} retail stores</span>
                    <button
                      onClick={() => setCurrentView('customer_outstandings')}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      View Aging Report →
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Accounts Payable (We Owe Suppliers):</span>
                    <span className="font-mono font-bold text-amber-900 dark:text-amber-300 text-sm">
                      {company.currencySymbol} {totalPayables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>To {suppliers.length} vendor depots</span>
                    <button
                      onClick={() => setCurrentView('supplier_outstandings')}
                      className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                    >
                      View Bill Aging →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Net Operating Working Capital:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {company.currencySymbol} {(cashBalance + totalBankBalance + totalReceivables - totalPayables).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Quick Vouchers Action Hub */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Quick Transaction Shortcuts
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">F-Keys</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => openVoucherModal({ initialType: 'sales' })}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-colors flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-white">Van Sales / POS</span>
                  <span className="text-[10px] text-blue-300 font-mono mt-1">F8 · Invoice</span>
                </button>
                <button
                  onClick={() => openVoucherModal({ initialType: 'receipt' })}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-colors flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-white">Collect Payment</span>
                  <span className="text-[10px] text-emerald-300 font-mono mt-1">F6 · Receipt</span>
                </button>
                <button
                  onClick={() => openVoucherModal({ initialType: 'purchase' })}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-colors flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-white">Purchase Bill</span>
                  <span className="text-[10px] text-amber-300 font-mono mt-1">F9 · Vendor</span>
                </button>
                <button
                  onClick={() => openVoucherModal({ initialType: 'payment' })}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-colors flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-white">Make Payment</span>
                  <span className="text-[10px] text-rose-300 font-mono mt-1">F5 · Expense</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <button
                onClick={() => setCurrentView('daybook')}
                className="text-slate-300 hover:text-white flex items-center gap-1 font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Open Daybook Register</span>
              </button>
              <button
                onClick={() => setCurrentView('trial_balance')}
                className="text-slate-300 hover:text-white flex items-center gap-1 font-medium"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Trial Balance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Third Row: Charts */}
      {isSalesman ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Van Route Sales Trend */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Van 01 Route Sales Movement ({selectedPeriod.replace('_', ' ')})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Daily store deliveries &amp; cash collections on Route 1</p>
              </div>
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-semibold font-mono">
                <Truck className="w-3.5 h-3.5" /> Van 01
              </span>
            </div>

            {/* Visualization */}
            <div className="mt-5 h-48 flex items-end gap-3 pt-6 px-2">
              {[
                { day: 'Mon', val: 12000, target: 15000 },
                { day: 'Tue', val: 18500, target: 15000 },
                { day: 'Wed', val: 14000, target: 15000 },
                { day: 'Thu', val: 22000, target: 20000 },
                { day: 'Fri', val: 19500, target: 20000 },
                { day: 'Sat', val: 28000, target: 25000 },
                { day: 'Sun (Today)', val: 20950, target: 20000 },
              ].map((col, idx) => {
                const maxVal = 35000;
                const heightPct = Math.round((col.val / maxVal) * 100);
                const targetPct = Math.round((col.target / maxVal) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {company.currencySymbol}{(col.val / 1000).toFixed(1)}k
                    </div>
                    <div className="w-full relative flex items-end justify-center h-36">
                      <div
                        className="absolute w-full border-t border-dashed border-slate-300 dark:border-slate-700 pointer-events-none"
                        style={{ bottom: `${targetPct}%` }}
                      />
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[28px] bg-blue-600 hover:bg-blue-500 rounded-t-sm transition-all shadow-xs"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-2 whitespace-nowrap">
                      {col.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Today's Dispatches: {company.currencySymbol} {totalPeriodSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Route benchmark exceeded</span>
            </div>
          </div>

          {/* Sales Target vs Actual Achievement */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Monthly Route Target &amp; Commission
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Tier 1 Bonus Active
                </span>
              </div>

              <div className="space-y-4 mt-5">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">Target Monthly Sales</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {company.currencySymbol} 50,000.00
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (totalPeriodSales / 50000) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Achieved: {company.currencySymbol} {totalPeriodSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {((totalPeriodSales / 50000) * 100).toFixed(1)}% Achieved
                    </span>
                  </div>
                </div>

                {/* Commission accrual card */}
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">Accrued Route Incentive</span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400">2.0% on spot van deliveries</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-emerald-800 dark:text-emerald-300">
                      {company.currencySymbol} {(totalPeriodSales * 0.02).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Incentive credited on month-end settlement</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Target On Track
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Admin Company Trends */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Sales Movement Trend ({selectedPeriod.replace('_', ' ')})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Gross dispatch values across fleet routes</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" /> Van Sales
                </span>
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> Target
                </span>
              </div>
            </div>

            {/* Visualization */}
            <div className="mt-5 h-48 flex items-end gap-3 pt-6 px-2">
              {[
                { day: 'Mon', val: 24000, target: 20000 },
                { day: 'Tue', val: 32000, target: 25000 },
                { day: 'Wed', val: 28500, target: 25000 },
                { day: 'Thu', val: 41000, target: 30000 },
                { day: 'Fri', val: 38200, target: 30000 },
                { day: 'Sat', val: 56400, target: 40000 },
                { day: 'Sun (Today)', val: 35300, target: 25000 },
              ].map((col, idx) => {
                const maxVal = 60000;
                const heightPct = Math.round((col.val / maxVal) * 100);
                const targetPct = Math.round((col.target / maxVal) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {company.currencySymbol}{(col.val / 1000).toFixed(0)}k
                    </div>
                    <div className="w-full relative flex items-end justify-center h-36">
                      <div
                        className="absolute w-full border-t border-dashed border-slate-300 dark:border-slate-700 pointer-events-none"
                        style={{ bottom: `${targetPct}%` }}
                      />
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[28px] bg-blue-600 hover:bg-blue-500 rounded-t-sm transition-all shadow-xs"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-2 whitespace-nowrap">
                      {col.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Peak Day: Saturday ({company.currencySymbol} 56,400)</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">+18.4% above weekly benchmark</span>
            </div>
          </div>

          {/* Sales vs Purchase & Profit Margin */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Sales vs Purchase + Expenses Comparison
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Margin spread and Nett Profit trend</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Nett Margin: {pnl.tradingIncome > 0 ? ((pnl.netProfit / pnl.tradingIncome) * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="space-y-4 mt-5">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">Gross Trading Sales</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {company.currencySymbol} {pnl.tradingIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">Cost of Goods Sold (Purchase)</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                      {company.currencySymbol} {pnl.costOfGoodsSold.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${pnl.tradingIncome > 0 ? (pnl.costOfGoodsSold / pnl.tradingIncome) * 100 : 65}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">Operating Expenses (Van Fuel + Warehouse)</span>
                    <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                      {company.currencySymbol} {pnl.operatingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${pnl.tradingIncome > 0 ? (pnl.operatingExpenses / pnl.tradingIncome) * 100 : 15}%` }}
                    />
                  </div>
                </div>

                {/* Net Profit Bar */}
                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">Nett Profit for the Period</span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Auto-credited to Owner Equity</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-emerald-800 dark:text-emerald-300">
                      {company.currencySymbol} {pnl.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <button
                onClick={() => setCurrentView('profit_loss')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Full Trading &amp; Profit/Loss Statement</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fourth Row: Recent Chronological Vouchers */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/60 dark:bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Recent Transactions ({selectedPeriod.replace('_', ' ')})
              </h3>
              {isSalesman && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Filtered to Van 01 Records Only</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isSalesman
                ? `Live feed of spot invoices, receipts, and fuel expenses created by ${currentUser?.name}.`
                : 'Live feed of posted sales, collections, and purchases across company godowns.'}
            </p>
          </div>
          <button
            onClick={() => setCurrentView(isSalesman ? 'sales_invoices' : 'daybook')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            {isSalesman ? 'View All My Invoices →' : 'Open Full Daybook →'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Voucher No</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Party / Details</th>
                <th className="py-2.5 px-4">Location / Van</th>
                <th className="py-2.5 px-4 text-right">Amount ({company.currencySymbol})</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {periodVouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    <FileText className="w-7 h-7 mx-auto mb-1.5 opacity-40" />
                    <p>No transactions posted for this period yet.</p>
                  </td>
                </tr>
              ) : (
                periodVouchers.slice(0, 7).map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">{v.date}</td>
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-white">{v.voucherNumber}</td>
                    <td className="py-2.5 px-4">
                      <span className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                        v.voucherType === 'sales'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : v.voucherType === 'receipt'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        {v.voucherType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{v.partyName || v.narration}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        {v.vehicleId && <Truck className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />}
                        <span className="truncate max-w-[160px]">{v.locationName || 'Central'}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => setInvoiceToView(v)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/60"
                        title="View & Print Voucher"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
