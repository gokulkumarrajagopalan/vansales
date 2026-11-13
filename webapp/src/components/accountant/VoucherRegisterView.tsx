import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { VoucherType } from '../../types/erp';
import {
  FileSpreadsheet,
  Receipt,
  ArrowRightLeft,
  CreditCard,
  ShoppingCart,
  ShoppingBag,
  BookOpen,
  FileText,
  RotateCcw,
  Printer,
  Search,
  Eye,
  Plus,
} from 'lucide-react';

export const VoucherRegisterView: React.FC = () => {
  const {
    vouchers,
    company,
    selectedVoucherTypeFilter,
    setSelectedVoucherTypeFilter,
    setInvoiceToView,
    openVoucherModal,
  } = useErp();

  const [selectedType, setSelectedType] = useState<VoucherType | null>(
    selectedVoucherTypeFilter !== 'all' ? selectedVoucherTypeFilter : null
  );
  const [search, setSearch] = useState('');

  const typesList: Array<{ type: VoucherType; label: string; icon: React.ReactNode; desc: string }> = [
    { type: 'sales', label: 'Sales Register', icon: <ShoppingCart className="w-5 h-5 text-indigo-600" />, desc: 'All sales invoices & spot van delivery bills' },
    { type: 'purchase', label: 'Purchase Register', icon: <ShoppingBag className="w-5 h-5 text-amber-600" />, desc: 'Vendor purchase bills & material inward records' },
    { type: 'receipt', label: 'Receipt Register', icon: <Receipt className="w-5 h-5 text-emerald-600" />, desc: 'Cash and bank collections from customers' },
    { type: 'payment', label: 'Payment Register', icon: <CreditCard className="w-5 h-5 text-rose-600" />, desc: 'Vendor payments, van diesel fuel, and overhead expenses' },
    { type: 'contra', label: 'Contra Register', icon: <ArrowRightLeft className="w-5 h-5 text-blue-600" />, desc: 'Internal bank to cash and cash deposit transfers' },
    { type: 'journal', label: 'Journal Register', icon: <BookOpen className="w-5 h-5 text-purple-600" />, desc: 'General non-cash double entry adjustment vouchers' },
    { type: 'credit_note', label: 'Credit Note Register', icon: <FileText className="w-5 h-5 text-orange-600" />, desc: 'Customer sales returns and allowances' },
    { type: 'debit_note', label: 'Debit Note Register', icon: <FileText className="w-5 h-5 text-red-600" />, desc: 'Supplier purchase returns and rate differences' },
    { type: 'sales_order', label: 'Sales Order Register', icon: <FileSpreadsheet className="w-5 h-5 text-cyan-600" />, desc: 'Pre-order bookings prior to dispatch' },
    { type: 'purchase_order', label: 'Purchase Order Register', icon: <FileSpreadsheet className="w-5 h-5 text-teal-600" />, desc: 'Procurement orders placed to suppliers' },
  ];

  if (!selectedType) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in-95">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Select Voucher Type Register</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Choose a canonical accounting voucher type to open its detailed register, ledger postings, and audit trails.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {typesList.map(item => {
            const count = vouchers.filter(v => v.voucherType === item.type).length;
            return (
              <button
                key={item.type}
                onClick={() => {
                  setSelectedType(item.type);
                  setSelectedVoucherTypeFilter(item.type);
                }}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md text-left transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {count} entries
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                  <span>Open Detailed Register</span>
                  <span>→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Selected Voucher Type Register
  const matchingVouchers = vouchers
    .filter(v => v.voucherType === selectedType)
    .filter(v =>
      v.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
      (v.partyName && v.partyName.toLowerCase().includes(search.toLowerCase())) ||
      v.narration.toLowerCase().includes(search.toLowerCase())
    );

  const totalAmount = matchingVouchers.reduce((sum, v) => sum + v.totalAmount, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight capitalize">
              {selectedType.replace('_', ' ')} Voucher Register
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              {matchingVouchers.length} Posted Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed chronological voucher register with strict double-entry debits and credits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedType(null)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select Different Voucher</span>
          </button>
          <button
            onClick={() => openVoucherModal({ initialType: selectedType })}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New {selectedType.replace('_', ' ')} Voucher</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search register by voucher #, party, narration..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
        <div className="text-xs text-slate-600 font-medium">
          Total Register Amount: <span className="font-mono font-bold text-slate-900">{company.currencySymbol} {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr className="whitespace-nowrap">
                <th className="py-3 px-4 w-28 whitespace-nowrap">Date</th>
                <th className="py-3 px-4 w-32 whitespace-nowrap">Voucher #</th>
                <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Party / Account</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Location / Van</th>
                <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">Particulars &amp; Narration</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Total ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-center w-20 whitespace-nowrap">Action</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {matchingVouchers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                  No vouchers recorded for this voucher type yet.
                </td>
              </tr>
            ) : (
              matchingVouchers.map(v => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500">{v.date}</td>
                  <td className="py-3 px-4 font-bold text-indigo-700">{v.voucherNumber}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                    {v.partyName || v.journalEntries[0]?.ledgerName}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600">{v.locationName || 'Central'}</td>
                  <td className="py-3 px-4 font-sans text-slate-500 truncate max-w-sm">{v.narration}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                    {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <button
                      onClick={() => setInvoiceToView(v)}
                      className="p-1 text-indigo-600 hover:text-indigo-900 rounded"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-xs text-slate-900">
            <tr>
              <td colSpan={5} className="py-3 px-4 font-sans text-right">Register Total:</td>
              <td className="py-3 px-4 text-right text-indigo-950 text-sm">
                {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        </div>
      </div>
    </div>
  );
};
