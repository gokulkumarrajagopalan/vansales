import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Printer, Scale, CheckCircle2, Download } from 'lucide-react';
import { exportBalanceSheetPdf } from '../../utils/pdfExport';

export const BalanceSheetView: React.FC = () => {
  const { getBalanceSheet, company } = useErp();
  const { totalAssets, totalLiabilities, totalEquity, assetRows, liabilityRows, equityRows, netProfit } = getBalanceSheet();

  const totalLiabAndEquity = totalLiabilities + totalEquity;
  const delta = Math.abs(totalAssets - totalLiabAndEquity);
  const isBalanced = delta < 0.1;

  const handleExportPdf = () => {
    exportBalanceSheetPdf(company, {
      totalAssets,
      totalLiabilities,
      totalEquity,
      assetRows,
      liabilityRows,
      equityRows,
      netProfit,
    }, '26 October 2026');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Final Accounts · Balance Sheet</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Statement of Financial Position: Assets = Liabilities + Capital & Net Profit.
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
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Balance Verification Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">
            Accounting Fundamental Invariant Verified: Total Assets ({company.currencySymbol} {totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}) = Liabilities & Equity ({company.currencySymbol} {totalLiabAndEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
          </span>
        </div>
        <span className="font-mono font-bold text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
          Delta: {delta.toFixed(2)}
        </span>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-8 space-y-6 text-xs text-slate-800 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">{company.name}</h2>
            <p className="text-[11px] text-slate-500">{company.tradeName}</p>
            <p className="text-[11px] text-slate-600 font-mono mt-0.5">GSTIN: {company.taxNumber}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-900 block">
              Balance Sheet Statement
            </span>
            <p className="text-xs text-slate-500 mt-0.5">As of 26 October 2026</p>
          </div>
        </div>

        {/* 2-Column Split: Assets on Left, Liabilities & Equity on Right (T-format) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Assets */}
          <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                Assets (Application of Funds)
              </div>
              <div className="divide-y divide-slate-100 font-mono">
                {assetRows.map((r, idx) => (
                  <div key={idx} className="p-2.5 px-4 flex justify-between items-center hover:bg-slate-50">
                    <span className="font-sans font-medium text-slate-800">{r.name}</span>
                    <span className="font-bold text-slate-900">{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t-2 border-slate-300 flex justify-between font-bold text-xs font-mono text-slate-900">
              <span className="font-sans text-sm">Total Assets:</span>
              <span className="text-sm text-indigo-950">{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Right Column: Liabilities & Capital */}
          <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                Liabilities & Capital (Sources of Funds)
              </div>
              <div className="divide-y divide-slate-100 font-mono">
                {/* Liabilities */}
                <div className="p-2 px-4 bg-slate-50 text-[11px] font-sans font-bold text-slate-500 uppercase">
                  Current & Non-Current Liabilities:
                </div>
                {liabilityRows.map((r, idx) => (
                  <div key={idx} className="p-2.5 px-4 flex justify-between items-center hover:bg-slate-50">
                    <span className="font-sans font-medium text-slate-800">{r.name}</span>
                    <span className="font-bold text-slate-900">{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}

                {/* Capital & Equity */}
                <div className="p-2 px-4 bg-slate-50 text-[11px] font-sans font-bold text-slate-500 uppercase">
                  Owner Capital & Reserves:
                </div>
                {equityRows.map((r, idx) => (
                  <div key={idx} className="p-2.5 px-4 flex justify-between items-center hover:bg-slate-50">
                    <span className="font-sans font-medium text-slate-800">{r.name}</span>
                    <span className="font-bold text-slate-900">{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t-2 border-slate-300 flex justify-between font-bold text-xs font-mono text-slate-900">
              <span className="font-sans text-sm">Total Liabilities & Equity:</span>
              <span className="text-sm text-indigo-950">{totalLiabAndEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
