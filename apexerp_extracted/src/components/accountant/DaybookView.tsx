import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { VoucherType } from '../../types/erp';
import { Clock, Printer, Search, Filter, Eye, Plus, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import { exportDaybookPdf } from '../../utils/pdfExport';

export const DaybookView: React.FC = () => {
  const {
    vouchers,
    company,
    selectedPeriod,
    setSelectedPeriod,
    getFilteredVouchers,
    setInvoiceToView,
    openVoucherModal,
  } = useErp();

  const [filterVoucherType, setFilterVoucherType] = useState<VoucherType | 'all'>('all');
  const [search, setSearch] = useState('');

  const periodVouchers = getFilteredVouchers(selectedPeriod);

  const filtered = periodVouchers.filter(v => {
    const matchesType = filterVoucherType === 'all' || v.voucherType === filterVoucherType;
    const matchesSearch =
      v.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
      (v.partyName && v.partyName.toLowerCase().includes(search.toLowerCase())) ||
      v.narration.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalDebit = filtered.reduce((sum, v) => {
    return sum + v.journalEntries.reduce((s, j) => s + (j.debit || 0), 0);
  }, 0);

  const totalCredit = filtered.reduce((sum, v) => {
    return sum + v.journalEntries.reduce((s, j) => s + (j.credit || 0), 0);
  }, 0);

  const handleExportPdf = () => {
    exportDaybookPdf(company, filtered, `Period: ${selectedPeriod.toUpperCase().replace('_', ' ')}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Accounting Daybook Register</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Chronological audit log of all financial vouchers posted in the company.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
            title="Download PDF document with company letterhead"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF (Letterhead)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={() => openVoucherModal()}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Voucher</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 print:hidden">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={filterVoucherType}
            onChange={e => setFilterVoucherType(e.target.value as any)}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-indigo-600 shadow-2xs"
          >
            <option value="all">All Voucher Types</option>
            <option value="sales">Sales Invoices</option>
            <option value="receipt">Receipts (Money In)</option>
            <option value="purchase">Purchase Bills</option>
            <option value="payment">Payments (Money Out)</option>
            <option value="contra">Contra (Cash/Bank)</option>
            <option value="journal">Journal Entries</option>
            <option value="credit_note">Credit Notes</option>
            <option value="debit_note">Debit Notes</option>
          </select>

          <span className="text-xs text-slate-400">|</span>

          <span className="text-xs font-semibold text-slate-700 capitalize bg-slate-100 px-2.5 py-1 rounded">
            Period: {selectedPeriod.replace('_', ' ')}
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search voucher #, party, narration..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Daybook Feed Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            <tr>
              <th className="py-3 px-4 w-24">Date</th>
              <th className="py-3 px-4 w-32">Voucher #</th>
              <th className="py-3 px-4 w-28">Voucher Type</th>
              <th className="py-3 px-4">Particulars & Ledger Breakdown</th>
              <th className="py-3 px-4 text-right">Debit ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-right">Credit ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-center print:hidden w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                  No vouchers found for this period. Try changing date period filter above.
                </td>
              </tr>
            ) : (
              filtered.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500">{v.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{v.voucherNumber}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {v.voucherType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <p className="font-bold text-slate-900">{v.partyName || v.journalEntries[0]?.ledgerName}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-md">{v.narration}</p>
                    {/* Compact ledger entries */}
                    <div className="mt-1 space-y-0.5 text-[10.5px] font-mono text-slate-500">
                      {v.journalEntries.map((j, idx) => (
                        <div key={idx} className="flex justify-between max-w-sm">
                          <span>{j.ledgerName || j.ledgerId}</span>
                          <span>{j.debit > 0 ? `Dr ${j.debit.toFixed(2)}` : `Cr ${j.credit.toFixed(2)}`}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                    {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                    {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center font-sans print:hidden">
                    <button
                      onClick={() => setInvoiceToView(v)}
                      className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
                      title="View Voucher"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-xs text-slate-900">
            <tr>
              <td colSpan={4} className="py-3 px-4 font-sans text-right">Daybook Balanced Totals:</td>
              <td className="py-3 px-4 text-right text-indigo-950 text-sm">
                {totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-3 px-4 text-right text-indigo-950 text-sm">
                {totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="print:hidden"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
