import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { getFiscalYearBoundsIso, getTodayIsoDate } from '../../utils/dateUtils';
import { Customer } from '../../types/erp';
import { Printer, Calendar, ArrowLeft, Download, BookOpen, Truck, Eye, Shield } from 'lucide-react';
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
    currentUser,
    isVoucherAccessible,
  } = useErp();

  const isSalesman = currentUser?.role === 'salesman_pos';

  // Role filtered customers
  const roleCustomers = useMemo(() => {
    if (!isSalesman || !currentUser) return customers;
    return customers.filter(
      c =>
        c.createdBy === currentUser.id ||
        c.assignedSalesmanId === currentUser.id ||
        (currentUser.assignedVehicleId && c.assignedVehicleId === currentUser.assignedVehicleId)
    );
  }, [customers, isSalesman, currentUser]);

  const [activeCustomerId, setActiveCustomerId] = useState<string>(() => {
    if (selectedPartyId && roleCustomers.some(c => c.id === selectedPartyId)) {
      return selectedPartyId;
    }
    return roleCustomers[0]?.id || '';
  });

  const [fromDate, setFromDate] = useState(() => getFiscalYearBoundsIso().start);
  const [toDate, setToDate] = useState(() => getTodayIsoDate());

  const customer = roleCustomers.find(c => c.id === activeCustomerId);

  // Filter vouchers for this customer (with strict salesman isolation)
  const customerVouchers = vouchers
    .filter(v => {
      if (v.partyType !== 'customer' || v.partyId !== activeCustomerId) return false;
      if (v.date < fromDate || v.date > toDate) return false;
      if (isSalesman && !isVoucherAccessible(v)) return false;
      return true;
    })
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('customers')}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Statement of Accounts</h1>
              {isSalesman && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Your Van Route
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chronological running ledger balance &amp; transaction history.</p>
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
            className="text-xs font-semibold px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roleCustomers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="bg-transparent border-none text-xs p-0 focus:outline-none text-slate-800 dark:text-slate-200"
            />
            <span>to</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="bg-transparent border-none text-xs p-0 focus:outline-none text-slate-800 dark:text-slate-200"
            />
          </div>

          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition"
            title="Download PDF document with company letterhead"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Statement Sheet (Printable Document) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-6 text-xs text-slate-800 dark:text-slate-200 print:shadow-none print:border-none print:p-0 transition-colors">
        {/* Header Branding */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{company.name}</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{company.tradeName}</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{company.address}, {company.city}</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">GSTIN: {company.taxNumber}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white block">
              Statement of Accounts
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {fromDate} to {toDate}
            </p>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-start">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Account Information:</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{customer?.name}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs">{customer?.address}, {customer?.city}</p>
            <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px] mt-0.5">GSTIN: {customer?.taxNumber} · Phone: {customer?.phone}</p>
          </div>
          <div className="text-right space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Balance Summary:</span>
            <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
              {company.currencySymbol} {closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Credit Limit: {company.currencySymbol} {customer?.creditLimit.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Statement Data Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[850px]">
              <thead className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                <tr className="whitespace-nowrap">
                  <th className="py-2.5 px-4 w-28 whitespace-nowrap">Date</th>
                  <th className="py-2.5 px-4 w-32 whitespace-nowrap">Voucher #</th>
                  <th className="py-2.5 px-4 min-w-[200px] whitespace-nowrap">Transaction Details</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Debit ({company.currencySymbol})</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Credit ({company.currencySymbol})</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Balance ({company.currencySymbol})</th>
                  <th className="py-2.5 px-3 text-center print:hidden w-12 whitespace-nowrap"></th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* Opening balance row */}
              <tr className="bg-slate-50/60 dark:bg-slate-950/40 font-medium">
                <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">{fromDate}</td>
                <td className="py-2.5 px-4 font-mono text-slate-400">OPENING</td>
                <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 italic">Opening Balance Brought Forward</td>
                <td className="py-2.5 px-4 text-right font-mono">
                  {(customer?.openingBalance || 0) > 0 ? (customer?.openingBalance || 0).toFixed(2) : '-'}
                </td>
                <td className="py-2.5 px-4 text-right font-mono">-</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                  {(customer?.openingBalance || 0).toFixed(2)} Dr
                </td>
                <td className="print:hidden"></td>
              </tr>

              {/* Transactions */}
              {statementRows.map(({ voucher, debit, credit, runningBalance: bal }) => (
                <tr key={voucher.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">{voucher.date}</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">{voucher.voucherNumber}</td>
                  <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="font-semibold capitalize text-slate-900 dark:text-white">
                        {voucher.voucherType.replace('_', ' ')}
                      </span>
                      {voucher.locationName && (
                        <span className="text-slate-400 text-[11px] ml-1.5">
                          · {voucher.locationName}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{voucher.narration}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-900 dark:text-white">
                    {debit > 0 ? debit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    {credit > 0 ? credit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                    {Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {bal >= 0 ? 'Dr' : 'Cr'}
                  </td>
                  <td className="py-2.5 px-3 text-center print:hidden">
                    <button
                      onClick={() => setInvoiceToView(voucher)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-1 rounded hover:bg-blue-50 dark:hover:bg-slate-800"
                      title="View Voucher Bill"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 dark:bg-slate-950/80 border-t-2 border-slate-200 dark:border-slate-800 font-mono font-bold text-xs text-slate-900 dark:text-white">
              <tr>
                <td colSpan={3} className="py-3 px-4 font-sans text-right">Period Totals &amp; Closing Balance:</td>
                <td className="py-3 px-4 text-right">{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400 text-sm">
                  {Math.abs(closingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {closingBalance >= 0 ? 'Dr' : 'Cr'}
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
