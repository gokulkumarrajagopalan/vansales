import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Clock, Printer, BookOpen, CreditCard, ArrowLeft } from 'lucide-react';

export const SupplierOutstandingsView: React.FC = () => {
  const { getSupplierAging, company, setCurrentView, setSelectedPartyId, openVoucherModal } = useErp();
  const agingData = getSupplierAging();

  const totalOutstanding = agingData.reduce((sum, a) => sum + a.total, 0);
  const totalD1_30 = agingData.reduce((sum, a) => sum + a.d1_30, 0);
  const totalD31_60 = agingData.reduce((sum, a) => sum + a.d31_60, 0);
  const totalD61_90 = agingData.reduce((sum, a) => sum + a.d61_90, 0);
  const totalD90Plus = agingData.reduce((sum, a) => sum + a.d90_plus, 0);

  const handleOpenStatement = (supplierId: string) => {
    setSelectedPartyId(supplierId);
    setCurrentView('supplier_statement');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('suppliers')}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Back to Suppliers"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Supplier Payables Aging & Outstandings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Bill-wise payable aging buckets (0-30 days, 31-60 days, 61-90 days, 90+ days) for supplier credit management.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Payables Aging</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Total Payables</span>
          <p className="text-lg font-bold font-mono text-amber-950 mt-1">
            {company.currencySymbol} {totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400">All Vendor Depots</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700">1 - 30 Days</span>
          <p className="text-lg font-bold font-mono text-emerald-900 mt-1">
            {company.currencySymbol} {totalD1_30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-emerald-600">Standard Credit</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-amber-700">31 - 60 Days</span>
          <p className="text-lg font-bold font-mono text-amber-900 mt-1">
            {company.currencySymbol} {totalD31_60.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-amber-600">Due Soon</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-orange-700">61 - 90 Days</span>
          <p className="text-lg font-bold font-mono text-orange-900 mt-1">
            {company.currencySymbol} {totalD61_90.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-orange-600">Due Overdue</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-rose-700">&gt; 90 Days</span>
          <p className="text-lg font-bold font-mono text-rose-900 mt-1">
            {company.currencySymbol} {totalD90Plus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-rose-600">Action Required</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            <tr>
              <th className="py-3 px-4">Supplier Depot & Contact</th>
              <th className="py-3 px-4 text-right">Terms</th>
              <th className="py-3 px-4 text-right">1-30 Days</th>
              <th className="py-3 px-4 text-right">31-60 Days</th>
              <th className="py-3 px-4 text-right">61-90 Days</th>
              <th className="py-3 px-4 text-right">&gt; 90 Days</th>
              <th className="py-3 px-4 text-right">Payable Dues ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-center print:hidden">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {agingData.map(({ supplier, d1_30, d31_60, d61_90, d90_plus, total }) => (
              <tr key={supplier.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-sans font-medium text-slate-900">
                  <p className="font-bold">{supplier.name}</p>
                  <p className="text-[11px] text-slate-500 font-normal">{supplier.address} · Ph: {supplier.phone}</p>
                </td>
                <td className="py-3 px-4 text-right text-slate-600">
                  {supplier.paymentTermsDays} Days
                </td>
                <td className="py-3 px-4 text-right text-emerald-800">
                  {d1_30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right text-amber-800">
                  {d31_60.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right text-orange-800">
                  {d61_90.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right text-rose-800 font-semibold">
                  {d90_plus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-bold text-amber-950 text-sm">
                  {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Cr
                </td>
                <td className="py-3 px-4 text-center font-sans print:hidden">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleOpenStatement(supplier.id)}
                      className="px-2 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
                    >
                      Statement
                    </button>
                    <button
                      onClick={() => openVoucherModal({ initialType: 'payment', partyId: supplier.id })}
                      className="px-2 py-1 text-xs text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded"
                    >
                      Pay Bill
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-xs text-slate-900">
            <tr>
              <td className="py-3 px-4 font-sans">Total Supplier Payables Aging:</td>
              <td className="py-3 px-4 text-right">-</td>
              <td className="py-3 px-4 text-right text-emerald-900">{totalD1_30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right text-amber-900">{totalD31_60.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right text-orange-900">{totalD61_90.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right text-rose-900">{totalD90Plus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right text-amber-950 text-sm">
                {totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Cr
              </td>
              <td className="print:hidden"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
