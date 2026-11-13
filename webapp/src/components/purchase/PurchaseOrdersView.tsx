import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Plus, Search, Eye, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export const PurchaseOrdersView: React.FC = () => {
  const { vouchers, company, openVoucherModal, setInvoiceToView } = useErp();
  const [search, setSearch] = useState('');

  const orderVouchers = vouchers.filter(v => v.voucherType === 'purchase_order');
  const filtered = orderVouchers.filter(v =>
    v.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
    (v.partyName && v.partyName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Purchase Orders (PO) Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Procurement purchase orders placed to FMCG manufacturing plants and central supply depots.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openVoucherModal({ initialType: 'purchase_order' })}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Purchase Order</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            <tr>
              <th className="py-3 px-4 w-28">PO Date</th>
              <th className="py-3 px-4 w-32">PO Number</th>
              <th className="py-3 px-4">Supplier Depot</th>
              <th className="py-3 px-4">Delivery Godown</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">PO Amount ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No purchase orders currently recorded.</p>
                  <button
                    onClick={() => openVoucherModal({ initialType: 'purchase_order' })}
                    className="mt-2 text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    Create first purchase order →
                  </button>
                </td>
              </tr>
            ) : (
              filtered.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500">{v.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">{v.voucherNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{v.partyName}</td>
                  <td className="py-3 px-4 text-slate-600">{v.locationName}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Transmitted
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                    {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setInvoiceToView(v)}
                      className="px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded font-medium flex items-center gap-1 mx-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View PO</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
