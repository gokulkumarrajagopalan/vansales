import React from 'react';
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
} from 'lucide-react';
import { FleetLiveMap } from './FleetLiveMap';

export const DashboardView: React.FC = () => {
  const {
    company,
    selectedPeriod,
    setSelectedPeriod,
    getFilteredVouchers,
    getLedgerBalance,
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
  } = useErp();

  const periodVouchers = getFilteredVouchers(selectedPeriod);

  // Sales in selected period
  const totalPeriodSales = periodVouchers
    .filter(v => v.voucherType === 'sales')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  // Collections (Receipts) in selected period
  const totalPeriodCollections = periodVouchers
    .filter(v => v.voucherType === 'receipt')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  // Purchases in selected period
  const totalPeriodPurchases = periodVouchers
    .filter(v => v.voucherType === 'purchase')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  // Expenses in selected period
  const totalPeriodExpenses = periodVouchers
    .filter(v => v.voucherType === 'payment' && !v.partyId) // expense payments
    .reduce((sum, v) => sum + v.totalAmount, 0);

  // Cash balance
  const cashBalance = getLedgerBalance('led_cash');

  // Bank ledgers breakup
  const bankLedgers = ledgers.filter(l => l.subtype === 'bank');
  const totalBankBalance = bankLedgers.reduce((sum, b) => sum + getLedgerBalance(b.id), 0);

  // Receivables & Payables
  const totalReceivables = getLedgerBalance('led_ar');
  const totalPayables = Math.abs(getLedgerBalance('led_ap'));

  // Vehicles on field
  const vehiclesOnField = vehicles.filter(v => v.status === 'on_field');

  // Profit & Loss calculation
  const pnl = getProfitAndLoss();

  // Period buttons
  const periods: Array<{ id: PeriodType; label: string }> = [
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Executive Distribution & POS Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time van sales, double-entry collections, inventory movement, and cash flows.
          </p>
        </div>

        {/* Interactive Segmented Period Filter Bar */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                selectedPeriod === p.id
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {selectedPeriod.replace('_', ' ')} Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {company.currencySymbol} {totalPeriodSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Spot Van Delivery & B2B Orders</span>
            </div>
          </div>
        </div>

        {/* Collections Summary Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {selectedPeriod.replace('_', ' ')} Collection
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {company.currencySymbol} {totalPeriodCollections.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Cash & UPI Collections</span>
            </div>
          </div>
        </div>

        {/* Cash in Hand */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cash Balance (In Hand)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {company.currencySymbol} {cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Available across physical drawers & vans</p>
          </div>
        </div>

        {/* Vehicles on Field Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Vehicles on Field
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                {vehiclesOnField.length} <span className="text-sm font-normal text-slate-500">/ {vehicles.length} Active</span>
              </h3>
            </div>
            <button
              onClick={() => setCurrentView('fleet_wise_report')}
              className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
            >
              <span>View Van Fleet Live Stats</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Fleet GPS Tracking on Interactive Map */}
      <FleetLiveMap />

      {/* Second Row: Bank Balances (Ledger Breakup) & Outstanding Receivables / Payables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bank Balances (Ledger-wise breakup) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Bank Balance (Ledger-wise Breakup)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-900">
              {company.currencySymbol} {totalBankBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {bankLedgers.map(bank => {
              const bal = getLedgerBalance(bank.id);
              return (
                <div key={bank.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{bank.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      A/C: {bank.bankAccountNumber || 'Direct Current'} · {bank.bankBranch || 'Peenya Hub'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-indigo-700">
                      {company.currencySymbol} {bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-medium">Reconciled</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Transfer cash to bank?</span>
            <button
              onClick={() => openVoucherModal({ initialType: 'contra' })}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Post Contra Entry
            </button>
          </div>
        </div>

        {/* Outstanding Receivables & Payables Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Receivables & Payables Outstandings
              </h3>
            </div>

            <div className="space-y-4 mt-4">
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Accounts Receivable (Customers Owe):</span>
                  <span className="font-mono font-bold text-indigo-900 text-sm">
                    {company.currencySymbol} {totalReceivables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>From {customers.length} retail stores</span>
                  <button
                    onClick={() => setCurrentView('customer_outstandings')}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    View Aging Report →
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Accounts Payable (We Owe Suppliers):</span>
                  <span className="font-mono font-bold text-amber-900 text-sm">
                    {company.currencySymbol} {totalPayables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>To {suppliers.length} vendor depots</span>
                  <button
                    onClick={() => setCurrentView('supplier_outstandings')}
                    className="text-amber-700 font-semibold hover:underline"
                  >
                    View Bill Aging →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Net Operating Working Capital:</span>
            <span className="font-mono font-bold text-slate-900">
              {company.currencySymbol} {(cashBalance + totalBankBalance + totalReceivables - totalPayables).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Quick Vouchers Action Hub */}
        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Quick Transaction Shortcuts
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">F-Keys</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => openVoucherModal({ initialType: 'sales' })}
                className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-left transition-colors flex flex-col justify-between"
              >
                <span className="text-xs font-semibold text-white">Van Sales / POS</span>
                <span className="text-[10px] text-indigo-300 font-mono mt-1">F8 · Invoice</span>
              </button>
              <button
                onClick={() => openVoucherModal({ initialType: 'receipt' })}
                className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-left transition-colors flex flex-col justify-between"
              >
                <span className="text-xs font-semibold text-white">Collect Payment</span>
                <span className="text-[10px] text-emerald-300 font-mono mt-1">F6 · Receipt</span>
              </button>
              <button
                onClick={() => openVoucherModal({ initialType: 'purchase' })}
                className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-left transition-colors flex flex-col justify-between"
              >
                <span className="text-xs font-semibold text-white">Purchase Bill</span>
                <span className="text-[10px] text-amber-300 font-mono mt-1">F9 · Vendor</span>
              </button>
              <button
                onClick={() => openVoucherModal({ initialType: 'payment' })}
                className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-left transition-colors flex flex-col justify-between"
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
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Open Daybook Register</span>
            </button>
            <button
              onClick={() => setCurrentView('trial_balance')}
              className="text-slate-300 hover:text-white flex items-center gap-1 font-medium"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Trial Balance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Third Row: Analytics & Visual Charts (Sales Trend, Sales vs Purchase, Nett Profit Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart (Interactive SVG) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Sales Movement Trend ({selectedPeriod.replace('_', ' ')})
              </h3>
              <p className="text-[11px] text-slate-500">Gross dispatch values across fleet routes</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-indigo-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Van Sales
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Target
              </span>
            </div>
          </div>

          {/* SVG Bar / Area visualization */}
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
                    {/* Target line */}
                    <div
                      className="absolute w-full border-t border-dashed border-slate-300 pointer-events-none"
                      style={{ bottom: `${targetPct}%` }}
                    />
                    {/* Actual Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[28px] bg-indigo-600 hover:bg-indigo-700 rounded-t-sm transition-all shadow-xs"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 mt-2 whitespace-nowrap">
                    {col.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Peak Day: Saturday ({company.currencySymbol} 56,400)</span>
            <span className="font-semibold text-emerald-600">+18.4% above weekly benchmark</span>
          </div>
        </div>

        {/* Sales vs Purchase + Expenses & Nett Profit Trend */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Sales vs Purchase + Expenses Comparison
                </h3>
                <p className="text-[11px] text-slate-500">Margin spread and Nett Profit trend</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Nett Margin: {pnl.tradingIncome > 0 ? ((pnl.netProfit / pnl.tradingIncome) * 100).toFixed(1) : 0}%
              </span>
            </div>

            <div className="space-y-4 mt-5">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-700">Gross Trading Sales</span>
                  <span className="font-mono font-bold text-slate-900">
                    {company.currencySymbol} {pnl.tradingIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-700">Cost of Goods Sold (Purchase)</span>
                  <span className="font-mono font-bold text-amber-700">
                    {company.currencySymbol} {pnl.costOfGoodsSold.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${pnl.tradingIncome > 0 ? (pnl.costOfGoodsSold / pnl.tradingIncome) * 100 : 65}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-700">Operating Expenses (Van Fuel + Warehouse)</span>
                  <span className="font-mono font-bold text-rose-700">
                    {company.currencySymbol} {pnl.operatingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${pnl.tradingIncome > 0 ? (pnl.operatingExpenses / pnl.tradingIncome) * 100 : 15}%` }}
                  />
                </div>
              </div>

              {/* Net Profit Bar */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Nett Profit for the Period</span>
                  <span className="text-[11px] text-emerald-700">Auto-credited to Owner Equity</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-emerald-800">
                    {company.currencySymbol} {pnl.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <button
              onClick={() => setCurrentView('profit_loss')}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Full Trading & Profit/Loss Statement</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Fourth Row: Recent Chronological Vouchers */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recent Transactions ({selectedPeriod.replace('_', ' ')})
            </h3>
            <p className="text-[11px] text-slate-500">Live feed of posted sales, collections, and purchases</p>
          </div>
          <button
            onClick={() => setCurrentView('daybook')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Open Full Daybook →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Voucher No</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Party / Details</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4 text-right">Amount ({company.currencySymbol})</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {periodVouchers.slice(0, 7).map(v => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-500">{v.date}</td>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900">{v.voucherNumber}</td>
                  <td className="py-2.5 px-4">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {v.voucherType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-semibold text-slate-800">{v.partyName || v.narration}</span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      {v.vehicleId && <Truck className="w-3 h-3 text-indigo-600 shrink-0" />}
                      <span className="truncate max-w-[160px]">{v.locationName || 'Central'}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={() => setInvoiceToView(v)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                      title="View & Print Voucher"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
