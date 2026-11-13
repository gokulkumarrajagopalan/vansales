import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { getFiscalYearBoundsIso, getTodayIsoDate } from '../../utils/dateUtils';
import { Printer, Calendar, BookOpen, Layers, Eye, Download, Shield, Truck } from 'lucide-react';
import { exportLedgerStatementPdf } from '../../utils/pdfExport';

export const LedgerStatementsView: React.FC = () => {
  const {
    ledgers,
    vouchers,
    company,
    selectedPartyId,
    setSelectedPartyId,
    setInvoiceToView,
    currentUser,
    isVoucherAccessible,
  } = useErp();

  const isSalesman = currentUser?.role === 'salesman_pos';

  // Role filtered selectable ledgers
  const availableLedgers = useMemo(() => {
    if (!isSalesman) return ledgers;
    // Salesman can inspect Cash in Hand, Receivables, Sales accounts
    return ledgers.filter(
      l =>
        l.subtype === 'cash' ||
        l.id === 'led_ar' ||
        l.id === 'led_sales' ||
        l.subtype === 'accounts_receivable'
    );
  }, [ledgers, isSalesman]);

  const [activeLedgerId, setActiveLedgerId] = useState<string>(
    selectedPartyId || (availableLedgers[0]?.id || '')
  );
  const [fromDate, setFromDate] = useState(() => getFiscalYearBoundsIso().start);
  const [toDate, setToDate] = useState(() => getTodayIsoDate());

  const selectedLedger = availableLedgers.find(l => l.id === activeLedgerId) || availableLedgers[0];

  // Filter vouchers that impact this ledger (strictly filtered by role)
  const relevantVouchers = useMemo(() => {
    return vouchers
      .filter(v => {
        if (isSalesman && !isVoucherAccessible(v)) return false;
        const touchesLedger = v.journalEntries.some(j => j.ledgerId === activeLedgerId);
        const inDate = v.date >= fromDate && v.date <= toDate;
        return touchesLedger && inDate;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [vouchers, isSalesman, isVoucherAccessible, activeLedgerId, fromDate, toDate]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">General Ledger Statement</h1>
            {isSalesman && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Van 01 Scope Only</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSalesman
              ? `Account running entries created strictly on your van route by ${currentUser?.name}.`
              : 'Standard running account statement for any customer, supplier, bank, or expense ledger.'}
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
            className="text-xs font-semibold px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-blue-600 shadow-2xs max-w-xs"
          >
            {availableLedgers.map(l => (
              <option key={l.id} value={l.id}>
                {l.name} [{l.type.toUpperCase()}]
              </option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="bg-transparent border-none text-xs p-0 focus:outline-none dark:text-white"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="bg-transparent border-none text-xs p-0 focus:outline-none dark:text-white"
            />
          </div>

          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            title="Download PDF document with company letterhead"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Territory Isolation Warning */}
      {isSalesman && (
        <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Territory Restriction:</strong> Ledger entries filtered strictly to transactions created by <strong>{currentUser?.name}</strong>. Central accounts and Van 02 postings are isolated.
            </span>
          </div>
        </div>
      )}

      {/* Statement Sheet */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 text-xs text-slate-800 dark:text-slate-200 print:shadow-none print:border-none print:p-0 transition-colors">
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{company.name}</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{company.tradeName}</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{company.address}, {company.city}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white block">
              Ledger Account Statement
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {fromDate} to {toDate}
            </p>
          </div>
        </div>

        {/* Ledger Header Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Account Particulars:</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selectedLedger?.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Code: {selectedLedger?.code} · Classification: {selectedLedger?.type.toUpperCase()} / {selectedLedger?.subtype.replace('_', ' ')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Net Closing Position:</span>
            <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
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
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="bg-slate-50/60 dark:bg-slate-900/60 font-medium font-mono">
                <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{fromDate}</td>
                <td className="py-2.5 px-4 text-slate-400 dark:text-slate-500">OPENING</td>
                <td className="py-2.5 px-4 font-sans text-slate-500 dark:text-slate-400">Opening Balance</td>
                <td className="py-2.5 px-4 font-sans text-slate-700 dark:text-slate-300 italic">Balance Brought Forward</td>
                <td className="py-2.5 px-4 text-right">
                  {(selectedLedger?.openingBalance || 0) > 0 ? (selectedLedger?.openingBalance || 0).toFixed(2) : '-'}
                </td>
                <td className="py-2.5 px-4 text-right">
                  {(selectedLedger?.openingBalance || 0) < 0 ? Math.abs(selectedLedger?.openingBalance || 0).toFixed(2) : '-'}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                  {Math.abs(selectedLedger?.openingBalance || 0).toFixed(2)}
                </td>
                <td className="print:hidden"></td>
              </tr>

              {rows.map(({ voucher, debit, credit, runningBalance: bal }) => (
                <tr key={voucher.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors font-mono">
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{voucher.date}</td>
                  <td className="py-2.5 px-4 font-bold text-blue-600 dark:text-blue-400">{voucher.voucherNumber}</td>
                  <td className="py-2.5 px-4 font-sans">
                    <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {voucher.voucherType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-800 dark:text-slate-200">
                    <span className="font-semibold block">{voucher.partyName || voucher.narration}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-900 dark:text-white font-medium">
                    {debit > 0 ? debit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-900 dark:text-white font-medium">
                    {credit > 0 ? credit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                    {Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center print:hidden">
                    <button
                      onClick={() => setInvoiceToView(voucher)}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 rounded"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-700 font-mono font-bold text-xs text-slate-900 dark:text-white">
              <tr>
                <td colSpan={4} className="py-3 px-4 font-sans text-right">Totals &amp; Final Balance:</td>
                <td className="py-3 px-4 text-right">{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right">{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400 text-sm">
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
