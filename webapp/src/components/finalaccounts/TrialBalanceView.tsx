import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Printer, CheckCircle2, AlertCircle, FileCheck, BookOpen, Download, ArrowLeft } from 'lucide-react';
import { exportTrialBalancePdf } from '../../utils/pdfExport';

export const TrialBalanceView: React.FC = () => {
  const { getTrialBalance, company, setCurrentView, setSelectedPartyId } = useErp();
  const { rows, totalDebit, totalCredit } = getTrialBalance();
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.05;

  const openLedgerStatement = (ledgerId: string) => {
    setSelectedPartyId(ledgerId);
    setCurrentView('ledger_statements');
  };

  const handleExportPdf = () => {
    exportTrialBalancePdf(company, { rows, totalDebit, totalCredit }, '26 October 2026');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Final Accounts · Trial Balance</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Periodic summary of debit and credit balances of all ledger accounts to verify arithmetical accuracy.
            </p>
          </div>
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
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Mathematical Verification Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
        isBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}>
        <div className="flex items-center gap-2.5">
          {isBalanced ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div>
            <span className="font-bold text-sm block">
              {isBalanced ? 'Trial Balance is Perfectly Balanced!' : 'Trial Balance Unbalanced!'}
            </span>
            <span className="text-xs opacity-90">
              {isBalanced
                ? 'Total Debit equals Total Credit. Double-entry integrity is 100% mathematically verified.'
                : `Out of balance difference: ${company.currencySymbol} ${difference.toFixed(2)}`}
            </span>
          </div>
        </div>
        <div className="font-mono text-xs font-bold text-right">
          <div>Debit: {company.currencySymbol} {totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div>Credit: {company.currencySymbol} {totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Trial Balance Table Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-8 space-y-6 text-xs text-slate-800 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">{company.name}</h2>
            <p className="text-[11px] text-slate-500">{company.tradeName}</p>
            <p className="text-[11px] text-slate-600 font-mono mt-0.5">GSTIN: {company.taxNumber}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-900 block">
              Trial Balance Statement
            </span>
            <p className="text-xs text-slate-500 mt-0.5">As of 26 October 2026 (FY 2026-27)</p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold font-mono">
              <tr>
                <th className="py-3 px-4 w-20">Code</th>
                <th className="py-3 px-4 font-sans">Particulars / Ledger Account</th>
                <th className="py-3 px-4 font-sans">Account Group</th>
                <th className="py-3 px-4 text-right">Debit Balance ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-right">Credit Balance ({company.currencySymbol})</th>
                <th className="py-3 px-3 text-center print:hidden w-12 font-sans"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {rows.map(({ ledger, debit, credit }) => (
                <tr key={ledger.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 text-slate-400">{ledger.code}</td>
                  <td className="py-2.5 px-4 font-sans font-bold text-slate-900">{ledger.name}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-500 capitalize">{ledger.subtype.replace('_', ' ')}</td>
                  <td className="py-2.5 px-4 text-right font-medium text-slate-900">
                    {debit > 0 ? debit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium text-slate-900">
                    {credit > 0 ? credit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center print:hidden">
                    <button
                      onClick={() => openLedgerStatement(ledger.id)}
                      className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
                      title="Drill down to Ledger Statement"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-mono font-bold text-xs text-slate-900">
              <tr>
                <td colSpan={3} className="py-3.5 px-4 font-sans text-right text-sm">Grand Totals:</td>
                <td className="py-3.5 px-4 text-right text-indigo-950 text-sm">
                  {totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right text-indigo-950 text-sm">
                  {totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
