import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Printer, Calendar, BookOpen, Layers, Eye, Download } from 'lucide-react';
import { exportLedgerStatementPdf } from '../../utils/pdfExport';

export const LedgerStatementsView: React.FC = () => {
  const {
    ledgers,
    vouchers,
    company,
    selectedPartyId,
    setSelectedPartyId,
    setInvoiceToView,
  } = useErp();

  const [activeLedgerId, setActiveLedgerId] = useState<string>(
    selectedPartyId || (ledgers[0]?.id || '')
  );
  const [fromDate, setFromDate] = useState('2026-04-01');
  const [toDate, setToDate] = useState('2026-10-26');

  const selectedLedger = ledgers.find(l => l.id === activeLedgerId);

  // Filter vouchers that impact this ledger
  const relevantVouchers = vouchers
    .filter(v => {
      const touchesLedger = v.journalEntries.some(j => j.ledgerId === activeLedgerId);
      const inDate = v.date >= fromDate && v.date <= toDate;
      return touchesLedger && inDate;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  let runningBalance = selectedLedger ? selectedLedger.openingBalance : 0;

  const rows = relevantVouchers.map(v => {
    let debit = 0;
    let credit = 0;

    v.journalEntries.forEach(line => {
      if (line.ledgerId === activeLedgerId) {
        debit += line.debit || 0;
        credit += line.credit || 0;
      }
    });

    if (selectedLedger?.type === 'asset' || selectedLedger?.type === 'expense') {
      runningBalance += debit - credit;
    } else {
      runningBalance += credit - debit;
    }

    return {
      voucher: v,
      debit,
      credit,
      runningBalance,
    };
  });

  const totalDebit = rows.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = rows.reduce((sum, r) => sum + r.credit, 0);

  const handleExportPdf = () => {
    if (!selectedLedger) return;
    exportLedgerStatementPdf(
      company,
      {
        name: selectedLedger.name,
        code: selectedLedger.code,
        type: 'general_ledger',
      },
      {
        fromDate,
        toDate,
        openingBalance: selectedLedger.openingBalance,
        rows: rows.map(r => ({
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
        closingBalance: runningBalance,
      }
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">General Ledger Statement</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Zoho Books style running account statement for any customer, supplier, bank, or expense ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Ledger Selector Dropdown */}
          <select
            value={activeLedgerId}
            onChange={e => {
              setActiveLedgerId(e.target.value);
              setSelectedPartyId(e.target.value);
            }}
            className="text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-indigo-600 shadow-2xs max-w-xs"
          >
            {ledgers.map(l => (
              <option key={l.id} value={l.id}>
                {l.name} [{l.type.toUpperCase()}]
              </option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="bg-transparent border-none text-xs p-0 focus:outline-none"
            />
            <span>to</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="bg-transparent border-none text-xs p-0 focus:outline-none"
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
          </div>
          <div className="text-right">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-900 block">
              Ledger Account Statement
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {fromDate} to {toDate}
            </p>
          </div>
        </div>

        {/* Ledger Header Card */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Account Particulars:</span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedLedger?.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Code: {selectedLedger?.code} · Classification: {selectedLedger?.type.toUpperCase()} / {selectedLedger?.subtype.replace('_', ' ')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Net Closing Position:</span>
            <div className="text-base font-bold font-mono text-indigo-900 mt-0.5">
              {company.currencySymbol} {Math.abs(runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              <span className="text-xs ml-1 font-sans">
                {selectedLedger?.type === 'asset' || selectedLedger?.type === 'expense'
                  ? (runningBalance >= 0 ? 'Dr' : 'Cr')
                  : (runningBalance >= 0 ? 'Cr' : 'Dr')}
              </span>
            </div>
          </div>
        </div>

        {/* Statement Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-4 w-24">Date</th>
                <th className="py-2.5 px-4 w-32">Voucher #</th>
                <th className="py-2.5 px-4 w-28">Type</th>
                <th className="py-2.5 px-4">Narration / Opposing Ledger</th>
                <th className="py-2.5 px-4 text-right">Debit ({company.currencySymbol})</th>
                <th className="py-2.5 px-4 text-right">Credit ({company.currencySymbol})</th>
                <th className="py-2.5 px-4 text-right">Running Balance ({company.currencySymbol})</th>
                <th className="py-2.5 px-3 text-center print:hidden w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-slate-50/60 font-medium font-mono">
                <td className="py-2.5 px-4 text-slate-500">{fromDate}</td>
                <td className="py-2.5 px-4 text-slate-400">OPENING</td>
                <td className="py-2.5 px-4 font-sans text-slate-500">Opening Balance</td>
                <td className="py-2.5 px-4 font-sans text-slate-700 italic">Balance Brought Forward</td>
                <td className="py-2.5 px-4 text-right">
                  {(selectedLedger?.openingBalance || 0) > 0 ? (selectedLedger?.openingBalance || 0).toFixed(2) : '-'}
                </td>
                <td className="py-2.5 px-4 text-right">
                  {(selectedLedger?.openingBalance || 0) < 0 ? Math.abs(selectedLedger?.openingBalance || 0).toFixed(2) : '-'}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                  {Math.abs(selectedLedger?.openingBalance || 0).toFixed(2)}
                </td>
                <td className="print:hidden"></td>
              </tr>

              {rows.map(({ voucher, debit, credit, runningBalance: bal }) => (
                <tr key={voucher.id} className="hover:bg-slate-50/70 transition-colors font-mono">
                  <td className="py-2.5 px-4 text-slate-600">{voucher.date}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{voucher.voucherNumber}</td>
                  <td className="py-2.5 px-4 font-sans">
                    <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                      {voucher.voucherType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-800">
                    <span className="font-semibold block">{voucher.partyName || voucher.narration}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-900 font-medium">
                    {debit > 0 ? debit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-900 font-medium">
                    {credit > 0 ? credit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-indigo-950">
                    {Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center print:hidden">
                    <button
                      onClick={() => setInvoiceToView(voucher)}
                      className="p-1 text-indigo-600 hover:text-indigo-900 rounded"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-xs text-slate-900">
              <tr>
                <td colSpan={4} className="py-3 px-4 font-sans text-right">Totals & Final Balance:</td>
                <td className="py-3 px-4 text-right">{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right">{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right text-indigo-950 text-sm">
                  {Math.abs(runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
