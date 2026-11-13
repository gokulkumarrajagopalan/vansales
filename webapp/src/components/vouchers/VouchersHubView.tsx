import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { VoucherType } from '../../types/erp';
import {
  Receipt,
  ArrowRightLeft,
  BookOpen,
  CreditCard,
  ShoppingCart,
  ShoppingBag,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  Search,
  Eye,
  Plus,
  Download,
} from 'lucide-react';
import { exportVoucherPdf } from '../../utils/pdfExport';

interface VoucherCardDef {
  type: VoucherType;
  title: string;
  fKey: string;
  category: 'Cash & Bank' | 'Sales' | 'Purchase' | 'General';
  description: string;
  color: string;
  icon: React.ReactNode;
}

export const VouchersHubView: React.FC = () => {
  const { openVoucherModal, vouchers, company, setInvoiceToView, customers, suppliers, items } = useErp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const voucherCards: VoucherCardDef[] = [
    {
      type: 'contra',
      title: 'Contra Voucher',
      fKey: 'F4',
      category: 'Cash & Bank',
      description: 'Transfer funds between cash drawer and bank accounts or inter-bank transfers.',
      color: 'blue',
      icon: <ArrowRightLeft className="w-5 h-5 text-blue-600" />,
    },
    {
      type: 'payment',
      title: 'Payment Voucher',
      fKey: 'F5',
      category: 'Cash & Bank',
      description: 'Disburse funds to suppliers, van diesel fuel, operational overheads, or expenses.',
      color: 'rose',
      icon: <CreditCard className="w-5 h-5 text-rose-600" />,
    },
    {
      type: 'receipt',
      title: 'Receipt Voucher',
      fKey: 'F6',
      category: 'Cash & Bank',
      description: 'Receive payments from customers against invoices, spot van sales, or other incomes.',
      color: 'emerald',
      icon: <Receipt className="w-5 h-5 text-emerald-600" />,
    },
    {
      type: 'journal',
      title: 'Journal Entry',
      fKey: 'F7',
      category: 'General',
      description: 'General double-entry adjustment voucher for depreciation, year-end, and provisions.',
      color: 'purple',
      icon: <BookOpen className="w-5 h-5 text-purple-600" />,
    },
    {
      type: 'sales',
      title: 'Sales Invoice / POS',
      fKey: 'F8',
      category: 'Sales',
      description: 'Issue tax invoices, spot delivery bills from vans, deduct stock, and debit AR.',
      color: 'indigo',
      icon: <ShoppingCart className="w-5 h-5 text-indigo-600" />,
    },
    {
      type: 'purchase',
      title: 'Purchase Bill',
      fKey: 'F9',
      category: 'Purchase',
      description: 'Record inward vendor purchases into Central Warehouse and credit AP.',
      color: 'amber',
      icon: <ShoppingBag className="w-5 h-5 text-amber-600" />,
    },
    {
      type: 'credit_note',
      title: 'Credit Note (Sales Return)',
      fKey: 'Alt+F6',
      category: 'Sales',
      description: 'Goods returned by customers to van or godown, sales allowance, or rate correction.',
      color: 'orange',
      icon: <FileText className="w-5 h-5 text-orange-600" />,
    },
    {
      type: 'debit_note',
      title: 'Debit Note (Purchase Return)',
      fKey: 'Alt+F5',
      category: 'Purchase',
      description: 'Goods returned to supplier depot, shortage deductions, or purchase allowances.',
      color: 'red',
      icon: <FileText className="w-5 h-5 text-red-600" />,
    },
    {
      type: 'sales_order',
      title: 'Sales Order (SO)',
      fKey: 'Alt+F8',
      category: 'Sales',
      description: 'Pre-order booking during salesman van visits before billing and dispatch.',
      color: 'cyan',
      icon: <FileSpreadsheet className="w-5 h-5 text-cyan-600" />,
    },
    {
      type: 'purchase_order',
      title: 'Purchase Order (PO)',
      fKey: 'Alt+F9',
      category: 'Purchase',
      description: 'Procurement order placed to FMCG manufacturing supply depots.',
      color: 'teal',
      icon: <FileSpreadsheet className="w-5 h-5 text-teal-600" />,
    },
  ];

  const filteredCards = voucherCards.filter(c =>
    (selectedCategory === 'all' || c.category === selectedCategory) &&
    (c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Vouchers Hub (10 Canonical Accounting Types)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict double-entry accounting engine. Every transaction verifies that Total Debits equal Total Credits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Double-Entry Invariant Guarded</span>
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'Sales', 'Purchase', 'Cash & Bank', 'General'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All 10 Voucher Types' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search voucher type or shortcut..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* 10 Voucher Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {filteredCards.map(card => {
          const count = vouchers.filter(v => v.voucherType === card.type).length;
          return (
            <div
              key={card.type}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {card.fKey}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {count} recorded
                </span>
                <button
                  onClick={() => openVoucherModal({ initialType: card.type })}
                  className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Universal Vouchers Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            All Posted Accounting Vouchers Log
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Total {vouchers.length} double-entry records
          </span>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-2.5 px-4 w-28">Date</th>
              <th className="py-2.5 px-4 w-32">Voucher #</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4">Party / Account</th>
              <th className="py-2.5 px-4">Location</th>
              <th className="py-2.5 px-4 text-right">Debit / Credit ({company.currencySymbol})</th>
              <th className="py-2.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vouchers.map(v => (
              <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-4 font-mono text-slate-500">{v.date}</td>
                <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{v.voucherNumber}</td>
                <td className="py-2.5 px-4">
                  <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                    {v.voucherType.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <span className="font-semibold text-slate-800">{v.partyName || v.journalEntries[0]?.ledgerName}</span>
                  <span className="text-[11px] text-slate-400 block truncate max-w-xs">{v.narration}</span>
                </td>
                <td className="py-2.5 px-4 text-slate-600">{v.locationName || 'Central Warehouse'}</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                  {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => setInvoiceToView(v)}
                      className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-800 rounded"
                      title="View Voucher"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const party = v.partyType === 'customer'
                          ? customers.find(c => c.id === v.partyId)
                          : suppliers.find(s => s.id === v.partyId);
                        exportVoucherPdf(company, v, party, v.locationName, items);
                      }}
                      className="p-1 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-slate-800 rounded"
                      title="Download PDF with Company Letterhead"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
