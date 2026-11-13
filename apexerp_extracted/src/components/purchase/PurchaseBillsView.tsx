import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Plus, Search, Eye, FileText, Building, Download } from 'lucide-react';
import { exportVoucherPdf } from '../../utils/pdfExport';

export const PurchaseBillsView: React.FC = () => {
  const { vouchers, company, openVoucherModal, setInvoiceToView, suppliers, items } = useErp();
  const [search, setSearch] = useState('');

  const purchaseBills = vouchers.filter(v => v.voucherType === 'purchase');
  const filtered = purchaseBills.filter(v =>
    v.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
    (v.partyName && v.partyName.toLowerCase().includes(search.toLowerCase())) ||
    (v.referenceNumber && v.referenceNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPurchases = filtered.reduce((sum, v) => sum + v.totalAmount, 0);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Purchase Bills Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Vendor purchase bills, inward stock receipts to Central Warehouse, input tax credits, and accounts payable.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openVoucherModal({ initialType: 'purchase' })}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Purchase Bill (F9)</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search bill #, supplier name, invoice ref..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
        <div className="text-xs text-slate-600 font-medium">
          Total Purchase Inward: <span className="font-mono font-bold text-slate-900">{company.currencySymbol} {totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            <tr>
              <th className="py-3 px-4 w-28">Bill Date</th>
              <th className="py-3 px-4 w-32">Bill #</th>
              <th className="py-3 px-4">Supplier Party</th>
              <th className="py-3 px-4">Received at Location</th>
              <th className="py-3 px-4">Supplier Invoice Ref</th>
              <th className="py-3 px-4 text-right">Tax ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-right">Bill Amount ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-mono text-slate-500">{v.date}</td>
                <td className="py-3 px-4 font-mono font-bold text-indigo-700">{v.voucherNumber}</td>
                <td className="py-3 px-4">
                  <span className="font-bold text-slate-900 block">{v.partyName}</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-xs block">{v.narration}</span>
                </td>
                <td className="py-3 px-4 text-slate-600">{v.locationName || 'Central Warehouse'}</td>
                <td className="py-3 px-4 font-mono text-slate-600">{v.referenceNumber || '-'}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">
                  {v.taxTotal !== undefined ? v.taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                  {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => setInvoiceToView(v)}
                      className="px-2 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-800 rounded font-medium flex items-center gap-1"
                      title="View Purchase Bill"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => {
                        const supp = suppliers.find(s => s.id === v.partyId);
                        exportVoucherPdf(company, v, supp, v.locationName, items);
                      }}
                      className="px-2 py-1 text-xs text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-slate-800 rounded font-medium flex items-center gap-1"
                      title="Download PDF with Company Letterhead"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
