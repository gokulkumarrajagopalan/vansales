import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Plus, Eye, ArrowRightLeft } from 'lucide-react';

export const DebitNotesView: React.FC = () => {
  const { vouchers, company, openVoucherModal, setInvoiceToView } = useErp();
  const debitNotes = vouchers.filter(v => v.voucherType === 'debit_note');

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Purchase Return / Debit Notes Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Debit notes issued to suppliers for goods returned from warehouse, damaged stocks, or rate differences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openVoucherModal({ initialType: 'debit_note' })}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Debit Note</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            <tr>
              <th className="py-3 px-4 w-28">Date</th>
              <th className="py-3 px-4 w-32">Debit Note #</th>
              <th className="py-3 px-4">Supplier Party</th>
              <th className="py-3 px-4">Returned from Godown</th>
              <th className="py-3 px-4">Narration</th>
              <th className="py-3 px-4 text-right">Debit Amount ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {debitNotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No debit notes recorded yet.</p>
                </td>
              </tr>
            ) : (
              debitNotes.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500">{v.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">{v.voucherNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{v.partyName}</td>
                  <td className="py-3 px-4 text-slate-600">{v.locationName}</td>
                  <td className="py-3 px-4 text-slate-500">{v.narration}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-indigo-900 text-sm">
                    {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setInvoiceToView(v)}
                      className="px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded font-medium flex items-center gap-1 mx-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Note</span>
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
