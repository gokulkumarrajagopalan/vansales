import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { getFiscalYearBoundsIso, getTodayIsoDate } from '../../utils/dateUtils';
import { Printer, Calendar, ArrowLeft, Eye, Download } from 'lucide-react';
import { exportLedgerStatementPdf } from '../../utils/pdfExport';

export const SupplierStatementView: React.FC = () => {
  const {
    suppliers,
    selectedPartyId,
    setSelectedPartyId,
    vouchers,
    company,
    setInvoiceToView,
    setCurrentView,
  } = useErp();

  const [activeSupplierId, setActiveSupplierId] = useState<string>(
    selectedPartyId || (suppliers[0]?.id || '')
  );
  const [fromDate, setFromDate] = useState(() => getFiscalYearBoundsIso().start);
  const [toDate, setToDate] = useState(() => getTodayIsoDate());

  const supplier = suppliers.find(s => s.id === activeSupplierId);

  // Filter vouchers for this supplier
  const supplierVouchers = vouchers
    .filter(v => v.partyType === 'supplier' && v.partyId === activeSupplierId && v.date >= fromDate && v.date <= toDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  let runningBalance = supplier?.openingBalance || 0;

  const statementRows = supplierVouchers.map(v => {
    let debit = 0;
    let credit = 0;

    if (v.voucherType === 'purchase') {
      credit = v.totalAmount;
      runningBalance += credit;
    } else if (v.voucherType === 'payment') {
      debit = v.totalAmount;
      runningBalance -= debit;
    } else if (v.voucherType === 'debit_note') {
      debit = v.totalAmount;
      runningBalance -= debit;
    }

    return {
      voucher: v,
      debit,
      credit,
      runningBalance,
    };
  });

  const totalDebit = statementRows.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = statementRows.reduce((sum, r) => sum + r.credit, 0);
  const closingBalance = runningBalance;

  const handleExportPdf = () => {
    if (!supplier) return;
    exportLedgerStatementPdf(
      company,
      {
        name: supplier.name,
        code: supplier.code,
        address: supplier.address,
        taxId: supplier.taxNumber,
        phone: supplier.phone,
        type: 'supplier',
      },
      {
        fromDate,
        toDate,
        openingBalance: supplier.openingBalance,
        rows: statementRows.map(r => ({
          date: r.voucher.date,
          voucherNumber: r.voucher.voucherNumber,
          voucherType: r.voucher.voucherType,
          narration: r.voucher.narration,
          debit: r.debit,
          credit: r.credit,
          runningBalance: r.runningBalance,
        })),
        totalDebit,
        totalCredit,
        closingBalance,
      }
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('suppliers')}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Supplier Statement of Accounts</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chronological vendor ledger statement &amp; payment summary.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeSupplierId}
            onChange={e => {
              setActiveSupplierId(e.target.value);
              setSelectedPartyId(e.target.value);
            }}
            className="text-xs font-semibold px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-indigo-600 shadow-2xs"
          >
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="bg-transparent border-none text-xs p-0 focus:outline-none dark:text-slate-200"
            />
            <span>to</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="bg-transparent border-none text-xs p-0 focus:outline-none dark:text-slate-200"
            />
          </div>

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
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Statement Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-8 space-y-6 text-xs text-slate-800 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">{company.name}</h2>
            <p className="text-[11px] text-slate-500">{company.tradeName}</p>
            <p className="text-[11px] text-slate-600 mt-1">{company.address}, {company.city}</p>
            <p className="text-[11px] text-slate-600 font-mono">GSTIN: {company.taxNumber}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-900 block">
              Vendor Statement of Accounts
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {fromDate} to {toDate}
            </p>
          </div>
        </div>

        {/* Supplier Info */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-start">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Vendor Details:</span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">{supplier?.name}</h3>
            <p className="text-slate-600 text-xs">{supplier?.address}, {supplier?.city}</p>
            <p className="text-slate-600 font-mono text-[11px] mt-0.5">GSTIN: {supplier?.taxNumber} · Phone: {supplier?.phone}</p>
          </div>
          <div className="text-right space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Payable Balance:</span>
            <div className="text-base font-bold font-mono text-amber-900">
              {company.currencySymbol} {closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Cr
            </div>
            <span className="text-[10px] text-slate-500 block">Terms: {supplier?.paymentTermsDays} Days Net</span>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[850px]">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <tr className="whitespace-nowrap">
                  <th className="py-2.5 px-4 w-28 whitespace-nowrap">Date</th>
                  <th className="py-2.5 px-4 w-32 whitespace-nowrap">Bill / Voucher #</th>
                  <th className="py-2.5 px-4 min-w-[200px] whitespace-nowrap">Transaction Details</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Debit Paid ({company.currencySymbol})</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Credit Billed ({company.currencySymbol})</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Running Balance ({company.currencySymbol})</th>
                  <th className="py-2.5 px-3 text-center print:hidden w-12 whitespace-nowrap"></th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-slate-50/60 font-medium">
                <td className="py-2.5 px-4 font-mono text-slate-500">{fromDate}</td>
                <td className="py-2.5 px-4 font-mono text-slate-400">OPENING</td>
                <td className="py-2.5 px-4 text-slate-700 italic">Opening Balance Brought Forward</td>
                <td className="py-2.5 px-4 text-right font-mono">-</td>
                <td className="py-2.5 px-4 text-right font-mono">
                  {(supplier?.openingBalance || 0).toFixed(2)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                  {(supplier?.openingBalance || 0).toFixed(2)} Cr
                </td>
                <td className="print:hidden"></td>
              </tr>

              {statementRows.map(({ voucher, debit, credit, runningBalance: bal }) => (
                <tr key={voucher.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-600">{voucher.date}</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">{voucher.voucherNumber}</td>
                  <td className="py-2.5 px-4 text-slate-700">
                    <span className="font-semibold capitalize text-slate-900">{voucher.voucherType.replace('_', ' ')}</span>
                    <span className="text-[11px] text-slate-500 block">{voucher.narration}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-rose-700">
                    {debit > 0 ? debit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-900">
                    {credit > 0 ? credit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-900">
                    {Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {bal >= 0 ? 'Cr' : 'Dr'}
                  </td>
                  <td className="py-2.5 px-3 text-center print:hidden">
                    <button
                      onClick={() => setInvoiceToView(voucher)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                      title="View Bill Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-xs text-slate-900">
              <tr>
                <td colSpan={3} className="py-3 px-4 font-sans text-right">Totals & Closing Balance:</td>
                <td className="py-3 px-4 text-right text-rose-800">{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right">{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right text-amber-950 text-sm">
                  {Math.abs(closingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {closingBalance >= 0 ? 'Cr' : 'Dr'}
                </td>
                <td className="print:hidden"></td>
              </tr>
            </tfoot>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};
