import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Printer, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import { exportProfitLossPdf } from '../../utils/pdfExport';

export const ProfitLossView: React.FC = () => {
  const { getProfitAndLoss, company, selectedPeriod, setSelectedPeriod } = useErp();
  const { tradingIncome, costOfGoodsSold, grossProfit, operatingExpenses, netProfit, expenseDetails } = getProfitAndLoss();

  const handleExportPdf = () => {
    exportProfitLossPdf(company, {
      tradingIncome,
      costOfGoodsSold,
      grossProfit,
      operatingExpenses,
      netProfit,
      expenseDetails,
    }, 'FY 2026-27 (1 Apr 2026 - 26 Oct 2026)');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Trading & Profit and Loss Account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Periodic financial performance statement computing Gross Margin and Nett Profit for FY 2026-27.
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

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Gross Sales Revenue</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {company.currencySymbol} {tradingIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Cost of Goods Sold</span>
          <p className="text-xl font-bold font-mono text-amber-800 mt-1">
            {company.currencySymbol} {costOfGoodsSold.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Gross Profit (Margin)</span>
          <p className="text-xl font-bold font-mono text-indigo-900 mt-1">
            {company.currencySymbol} {grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-indigo-600">
            {tradingIncome > 0 ? ((grossProfit / tradingIncome) * 100).toFixed(1) : 0}% Margin
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Nett Profit for Period</span>
          <p className="text-xl font-bold font-mono text-emerald-800 mt-1">
            {company.currencySymbol} {netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-emerald-600">After Operating Overheads</span>
        </div>
      </div>

      {/* Printable P&L Statement Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-8 space-y-6 text-xs text-slate-800 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">{company.name}</h2>
            <p className="text-[11px] text-slate-500">{company.tradeName}</p>
            <p className="text-[11px] text-slate-600 font-mono mt-0.5">GSTIN: {company.taxNumber}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-900 block">
              Trading & Profit & Loss Account
            </span>
            <p className="text-xs text-slate-500 mt-0.5">For Period: 01 Apr 2026 to 26 Oct 2026</p>
          </div>
        </div>

        {/* Part 1: Trading Account */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-t-lg border border-slate-200 border-b-0">
            Section 1: Trading Account (Direct Margins)
          </h3>
          <div className="border border-slate-200 rounded-b-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">Gross Sales Invoices & POS Delivery Revenue</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900 w-44">
                    {tradingIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans text-slate-600 pl-8">Less: Cost of Goods Sold (Direct Vendor Purchases)</td>
                  <td className="py-2.5 px-4 text-right text-amber-800 font-semibold">
                    ({costOfGoodsSold.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </td>
                </tr>
                <tr className="bg-indigo-50/60 font-bold text-indigo-950">
                  <td className="py-2.5 px-4 font-sans">Gross Trading Profit (COGS Deducted)</td>
                  <td className="py-2.5 px-4 text-right text-sm">
                    {grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Part 2: Operating Expenses & Nett Profit */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-t-lg border border-slate-200 border-b-0">
            Section 2: Operating & Administration Expenses
          </h3>
          <div className="border border-slate-200 rounded-b-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-100 font-mono">
                {expenseDetails.map((exp, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 font-sans text-slate-700 pl-8">{exp.name}</td>
                    <td className="py-2.5 px-4 text-right text-slate-800 w-44">
                      {exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">Total Operating Expenses</td>
                  <td className="py-2.5 px-4 text-right font-bold text-rose-800">
                    ({operatingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </td>
                </tr>
                <tr className="bg-emerald-50 border-t-2 border-slate-300 font-bold text-emerald-950 text-sm">
                  <td className="py-3 px-4 font-sans">Nett Profit for the Period (Transferred to Capital / Equity)</td>
                  <td className="py-3 px-4 text-right text-base text-emerald-900">
                    {company.currencySymbol} {netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
