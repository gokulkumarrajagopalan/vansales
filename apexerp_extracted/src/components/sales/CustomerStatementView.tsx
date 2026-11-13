import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Customer } from '../../types/erp';
import { Printer, Calendar, ArrowLeft, Download, BookOpen, Truck, Eye } from 'lucide-react';
import { exportLedgerStatementPdf } from '../../utils/pdfExport';

export const CustomerStatementView: React.FC = () => {
  const {
    customers,
    selectedPartyId,
    setSelectedPartyId,
    vouchers,
    company,
    setInvoiceToView,
    setCurrentView,
  } = useErp();

  const [activeCustomerId, setActiveCustomerId] = useState<string>(
    selectedPartyId || (customers[0]?.id || '')
  );
  const [fromDate, setFromDate] = useState('2026-04-01');
  const [toDate, setToDate] = useState('2026-10-26');

  const customer = customers.find(c => c.id === activeCustomerId);

  // Filter vouchers for this customer
  const customerVouchers = vouchers
    .filter(v => v.partyType === 'customer' && v.partyId === activeCustomerId && v.date >= fromDate && v.date <= toDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  let runningBalance = customer?.openingBalance || 0;

  const statementRows = customerVouchers.map(v => {
    let debit = 0;
    let credit = 0;

    if (v.voucherType === 'sales') {
      debit = v.totalAmount;
      runningBalance += debit;
    } else if (v.voucherType === 'receipt') {
      credit = v.totalAmount;
      runningBalance -= credit;
    } else if (v.voucherType === 'credit_note') {
      credit = v.totalAmount;
      runningBalance -= credit;
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
    if (!customer) return;
    exportLedgerStatementPdf(
      company,
      {
        name: customer.name,
        code: customer.code,
        address: customer.address,
        taxId: customer.taxNumber,
        phone: customer.phone,
        type: 'customer',
      },
      {
        fromDate,
        toDate,
        openingBalance: customer.openingBalance,
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
      {/* Top Filter & Customer Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('customers')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Statement of Accounts</h1>
            <p className="text-xs text-slate-500 mt-0.5">Zoho Books styled chronological running ledger balance.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Customer Dropdown */}
          <select
            value={activeCustomerId}
            onChange={e => {
              setActiveCustomerId(e.target.value);
              setSelectedPartyId(e.target.value);
            }}
            className="text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-indigo-600 shadow-2xs"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>

          {/* Date Range Inputs */}
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

      {/* Statement Sheet (Printable Document) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-8 space-y-6 text-xs text-slate-800 print:shadow-none print:border-none print:p-0">
        {/* Header Branding */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">{company.name}</h2>
            <p className="text-[11px] text-slate-500">{company.tradeName}</p>
            <p className="text-[11px] text-slate-600 mt-1">{company.address}, {company.city}</p>
            <p className="text-[11px] text-slate-600 font-mono">GSTIN: {company.taxNumber}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-900 block">
              Statement of Accounts
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {fromDate} to {toDate}
            </p>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-start">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Account Information:</span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">{customer?.name}</h3>
            <p className="text-slate-600 text-xs">{customer?.address}, {customer?.city}</p>
            <p className="text-slate-600 font-mono text-[11px] mt-0.5">GSTIN: {customer?.taxNumber} · Phone: {customer?.phone}</p>
          </div>
          <div className="text-right space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Balance Summary:</span>
            <div className="text-base font-bold font-mono text-indigo-900">
              {company.currencySymbol} {closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-500 block">Credit Limit: {company.currencySymbol} {customer?.creditLimit.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Statement Data Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-4 w-24">Date</th>
                <th className="py-2.5 px-4 w-32">Voucher #</th>
                <th className="py-2.5 px-4">Transaction Details</th>
                <th className="py-2.5 px-4 text-right">Debit ({company.currencySymbol})</th>
                <th className="py-2.5 px-4 text-right">Credit ({company.currencySymbol})</th>
                <th className="py-2.5 px-4 text-right">Balance ({company.currencySymbol})</th>
                <th className="py-2.5 px-3 text-center print:hidden w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Opening balance row */}
              <tr className="bg-slate-50/60 font-medium">
                <td className="py-2.5 px-4 font-mono text-slate-500">{fromDate}</td>
                <td className="py-2.5 px-4 font-mono text-slate-400">OPENING</td>
                <td className="py-2.5 px-4 text-slate-700 italic">Opening Balance Brought Forward</td>
                <td className="py-2.5 px-4 text-right font-mono">
                  {(customer?.openingBalance || 0) > 0 ? (customer?.openingBalance || 0).toFixed(2) : '-'}
                </td>
                <td className="py-2.5 px-4 text-right font-mono">-</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                  {(customer?.openingBalance || 0).toFixed(2)} Dr
                </td>
                <td className="print:hidden"></td>
              </tr>

              {/* Transactions */}
              {statementRows.map(({ voucher, debit, credit, runningBalance: bal }) => (
                <tr key={voucher.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-600">{voucher.date}</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">{voucher.voucherNumber}</td>
                  <td className="py-2.5 px-4 text-slate-700">
                    <div>
                      <span className="font-semibold capitalize text-slate-900">
                        {voucher.voucherType.replace('_', ' ')}
                      </span>
                      {voucher.locationName && (
                        <span className="text-slate-400 text-[11px] ml-1.5">
                          · {voucher.locationName}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block">{voucher.narration}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-900">
                    {debit > 0 ? debit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-emerald-700">
                    {credit > 0 ? credit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-900">
                    {Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {bal >= 0 ? 'Dr' : 'Cr'}
                  </td>
                  <td className="py-2.5 px-3 text-center print:hidden">
                    <button
                      onClick={() => setInvoiceToView(voucher)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                      title="View Voucher Bill"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-xs text-slate-900">
              <tr>
                <td colSpan={3} className="py-3 px-4 font-sans text-right">Period Totals & Closing Balance:</td>
                <td className="py-3 px-4 text-right">{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right text-emerald-800">{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right text-indigo-950 text-sm">
                  {Math.abs(closingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {closingBalance >= 0 ? 'Dr' : 'Cr'}
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
