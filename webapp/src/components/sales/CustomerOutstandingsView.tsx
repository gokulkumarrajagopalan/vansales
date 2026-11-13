import React, { useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { Clock, Printer, BookOpen, CreditCard, AlertCircle, Truck, Shield, ArrowLeft } from 'lucide-react';

export const CustomerOutstandingsView: React.FC = () => {
  const { getCustomerAging, company, setCurrentView, setSelectedPartyId, openVoucherModal, currentUser } = useErp();
  const isSalesman = currentUser?.role === 'salesman_pos';
  const allAgingData = getCustomerAging();

  const agingData = useMemo(() => {
    if (!isSalesman || !currentUser) return allAgingData;
    return allAgingData.filter(a => {
      const c = a.customer;
      return (
        c.createdBy === currentUser.id ||
        c.assignedSalesmanId === currentUser.id ||
        (currentUser.assignedVehicleId && c.assignedVehicleId === currentUser.assignedVehicleId)
      );
    });
  }, [allAgingData, isSalesman, currentUser]);

  const totalOutstanding = agingData.reduce((sum, a) => sum + a.total, 0);
  const totalD1_30 = agingData.reduce((sum, a) => sum + a.d1_30, 0);
  const totalD31_60 = agingData.reduce((sum, a) => sum + a.d31_60, 0);
  const totalD61_90 = agingData.reduce((sum, a) => sum + a.d61_90, 0);
  const totalD90Plus = agingData.reduce((sum, a) => sum + a.d90_plus, 0);

  const handleOpenStatement = (customerId: string) => {
    setSelectedPartyId(customerId);
    setCurrentView('customer_statement');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('customers')}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Back to Customers"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Outstandings &amp; Aging Analysis</h1>
            {isSalesman && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Your Route Receivables</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isSalesman
              ? `Bill-wise receivables aging buckets for retail stores assigned to ${currentUser?.name}.`
              : 'Bill-wise receivables aging buckets (0-30 days, 31-60 days, 61-90 days, 90+ days).'}
          </p>
        </div>
      </div>
        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Aging Report</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Receivables</span>
          <p className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {company.currencySymbol} {totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{isSalesman ? 'Your Van Customers' : 'All Customers'}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">1 - 30 Days</span>
          <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {company.currencySymbol} {totalD1_30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-500">Within Terms</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">31 - 60 Days</span>
          <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {company.currencySymbol} {totalD31_60.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-500">Attention Needed</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[10px] uppercase font-bold text-orange-700 dark:text-orange-400">61 - 90 Days</span>
          <p className="text-lg font-bold font-mono text-orange-600 dark:text-orange-400 mt-1">
            {company.currencySymbol} {totalD61_90.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-orange-600 dark:text-orange-500">Overdue</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">&gt; 90 Days</span>
          <p className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {company.currencySymbol} {totalD90Plus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-rose-600 dark:text-rose-500">High Risk</span>
        </div>
      </div>

      {/* Aging Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Customer Store &amp; Route</th>
                <th className="py-3 px-4 text-right">Credit Limit</th>
                <th className="py-3 px-4 text-right">1-30 Days</th>
                <th className="py-3 px-4 text-right">31-60 Days</th>
                <th className="py-3 px-4 text-right">61-90 Days</th>
                <th className="py-3 px-4 text-right">&gt; 90 Days</th>
                <th className="py-3 px-4 text-right">Total Outstanding ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-center print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
              {agingData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500 font-sans">
                    No customer receivables found for this route.
                  </td>
                </tr>
              ) : (
                agingData.map(({ customer, d1_30, d31_60, d61_90, d90_plus, total }) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-white">
                      <p className="font-bold">{customer.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{customer.route} · Ph: {customer.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                      {customer.creditLimit.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">
                      {d1_30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-600 dark:text-amber-400">
                      {d31_60.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-orange-600 dark:text-orange-400">
                      {d61_90.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-600 dark:text-rose-400 font-semibold">
                      {d90_plus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white text-sm">
                      {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center font-sans print:hidden">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenStatement(customer.id)}
                          className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                        >
                          Statement
                        </button>
                        <button
                          onClick={() => openVoucherModal({ initialType: 'receipt', partyId: customer.id })}
                          className="px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                        >
                          Collect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-100 dark:bg-slate-950/80 border-t-2 border-slate-200 dark:border-slate-800 font-mono font-bold text-xs text-slate-900 dark:text-white">
              <tr>
                <td className="py-3 px-4 font-sans">Total Receivables Aging:</td>
                <td className="py-3 px-4 text-right">-</td>
                <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">{totalD1_30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right text-amber-600 dark:text-amber-400">{totalD31_60.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right text-orange-600 dark:text-orange-400">{totalD61_90.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right text-rose-600 dark:text-rose-400">{totalD90Plus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400 text-sm">
                  {totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="print:hidden"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
