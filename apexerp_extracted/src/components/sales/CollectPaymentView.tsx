import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Plus, CreditCard, Search, Eye, CheckCircle2, ArrowRight } from 'lucide-react';

export const CollectPaymentView: React.FC = () => {
  const { vouchers, company, openVoucherModal, setInvoiceToView } = useErp();
  const [search, setSearch] = useState('');

  const receipts = vouchers.filter(v => v.voucherType === 'receipt');
  const filtered = receipts.filter(v =>
    v.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
    (v.partyName && v.partyName.toLowerCase().includes(search.toLowerCase())) ||
    (v.referenceNumber && v.referenceNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCollected = filtered.reduce((sum, v) => sum + v.totalAmount, 0);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Collect Customer Payment (Receipt Vouchers)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log cash collections, on-spot van payments, bank NEFT/UPI receipts, and allocate against outstanding invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openVoucherModal({ initialType: 'receipt' })}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Payment Receipt (F6)</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search receipt #, customer, reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
        <div className="text-xs text-slate-600 font-medium">
          Total Collections in Register: <span className="font-mono font-bold text-emerald-800">{company.currencySymbol} {totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            <tr>
              <th className="py-3 px-4 w-28">Receipt Date</th>
              <th className="py-3 px-4 w-32">Receipt #</th>
              <th className="py-3 px-4">Customer Party</th>
              <th className="py-3 px-4">Deposited To / Collected Via</th>
              <th className="py-3 px-4">Reference / Mode</th>
              <th className="py-3 px-4">Allocated Bill</th>
              <th className="py-3 px-4 text-right">Amount Received ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(v => {
              const debitEntry = v.journalEntries.find(j => j.debit > 0);
              const allocatedBill = v.allocatedBills && v.allocatedBills.length > 0 ? v.allocatedBills[0] : null;

              return (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500">{v.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">{v.voucherNumber}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{v.partyName}</span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-xs">{v.narration}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {debitEntry?.ledgerName || 'Cash / Bank Account'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{v.referenceNumber || 'Cash Desk'}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    {allocatedBill ? (
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                        Inv: {allocatedBill.voucherNumber}
                      </span>
                    ) : (
                      <span className="text-slate-400">On Account</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 text-sm">
                    {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setInvoiceToView(v)}
                      className="px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded font-medium flex items-center gap-1 mx-auto"
                      title="View Receipt Voucher"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
