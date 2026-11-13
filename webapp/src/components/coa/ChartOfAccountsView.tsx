import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { LedgerAccount, AccountType, AccountSubtype } from '../../types/erp';
import { Plus, Search, Filter, BookOpen, Layers, ArrowUpRight, ArrowDownRight, X, ArrowLeft } from 'lucide-react';

export const ChartOfAccountsView: React.FC = () => {
  const { ledgers, addLedger, getLedgerBalance, company, setCurrentView, setSelectedPartyId } = useErp();
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<AccountType>('asset');
  const [subtype, setSubtype] = useState<AccountSubtype>('current_asset');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankBranch, setBankBranch] = useState('');

  const filtered = ledgers.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.code.includes(search);
    const matchesType = filterType === 'all' || l.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    addLedger({
      name,
      code,
      type,
      subtype,
      openingBalance,
      bankAccountNumber: subtype === 'bank' ? bankAccountNumber : undefined,
      bankBranch: subtype === 'bank' ? bankBranch : undefined,
    });
    setShowAddModal(false);
    setName('');
    setCode('');
    setOpeningBalance(0);
  };

  const openStatementForLedger = (ledger: LedgerAccount) => {
    setSelectedPartyId(ledger.id);
    setCurrentView('ledger_statements');
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Chart of Accounts</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured general ledger accounts compliant with standard double-entry accounting.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add General Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'asset', 'liability', 'equity', 'income', 'expense'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                filterType === t
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t === 'all' ? 'All Accounts' : t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by code or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3 px-4 w-20">Code</th>
              <th className="py-3 px-4">Ledger Account Name</th>
              <th className="py-3 px-4">Primary Type</th>
              <th className="py-3 px-4">Sub-Category</th>
              <th className="py-3 px-4 text-right">Current Balance ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(l => {
              const bal = getLedgerBalance(l.id);
              const isDebit = bal >= 0;
              return (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-500">{l.code}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{l.name}</td>
                  <td className="py-2.5 px-4">
                    <span className="capitalize text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {l.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 capitalize text-[11px]">
                    {l.subtype.replace(/_/g, ' ')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold">
                    <span className={bal < 0 ? 'text-amber-700' : 'text-slate-900'}>
                      {Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1 font-sans">
                      {l.type === 'asset' || l.type === 'expense'
                        ? (bal >= 0 ? 'Dr' : 'Cr')
                        : (bal >= 0 ? 'Cr' : 'Dr')}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={() => openStatementForLedger(l)}
                      className="px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded font-medium flex items-center gap-1 mx-auto"
                      title="View Ledger Statement"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Statement</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add New General Ledger</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5005"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vehicle Repairs & Tyre Replacement"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as AccountType)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                    <option value="equity">Equity</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subcategory</label>
                  <select
                    value={subtype}
                    onChange={e => setSubtype(e.target.value as AccountSubtype)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash Account</option>
                    <option value="current_asset">Current Asset</option>
                    <option value="fixed_asset">Fixed Asset</option>
                    <option value="accounts_receivable">Accounts Receivable</option>
                    <option value="current_liability">Current Liability</option>
                    <option value="accounts_payable">Accounts Payable</option>
                    <option value="capital">Capital / Equity</option>
                    <option value="sales_income">Sales Income</option>
                    <option value="direct_expense">Direct Expense</option>
                    <option value="indirect_expense">Indirect Expense</option>
                  </select>
                </div>
              </div>

              {subtype === 'bank' && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 50100984123"
                      value={bankAccountNumber}
                      onChange={e => setBankAccountNumber(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Branch Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Peenya Industrial Branch"
                      value={bankBranch}
                      onChange={e => setBankBranch(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opening Balance ({company.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  value={openingBalance}
                  onChange={e => setOpeningBalance(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
