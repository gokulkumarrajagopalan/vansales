import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Customer } from '../../types/erp';
import { Plus, Search, BookOpen, CreditCard, Phone, MapPin, X, FileText, CheckCircle2 } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, getCustomerBalance, company, setCurrentView, setSelectedPartyId, openVoucherModal } = useErp();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [code, setCode] = useState(`CUST-00${customers.length + 1}`);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(50000);
  const [creditDays, setCreditDays] = useState<number>(15);
  const [route, setRoute] = useState('Route 1 - North Belt');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    addCustomer({
      name,
      companyName,
      code,
      phone,
      email,
      taxNumber: taxNumber || 'UNREGISTERED',
      creditLimit,
      creditDays,
      route,
      address,
      city,
      ledgerId: 'led_ar',
      openingBalance,
    });
    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  const handleOpenStatement = (customerId: string) => {
    setSelectedPartyId(customerId);
    setCurrentView('customer_statement');
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Master Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage retail stores, wholesale accounts, routes, credit limits, and running balances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search customer by name, code, or mobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-bold">{filtered.length}</span> retail partners
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3 px-4 w-24">Customer Code</th>
              <th className="py-3 px-4">Customer / Shop Name</th>
              <th className="py-3 px-4">Route / Belt</th>
              <th className="py-3 px-4">Contact & GSTIN</th>
              <th className="py-3 px-4 text-right">Credit Limit</th>
              <th className="py-3 px-4 text-right">Outstanding Balance ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(c => {
              const balance = getCustomerBalance(c.id);
              const isOverLimit = balance > c.creditLimit;
              return (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-500">{c.code}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-[11px] text-slate-500">{c.companyName || c.address}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                      {c.route}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      GST: {c.taxNumber}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {c.creditLimit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    <span className="block text-[10px] text-slate-400">{c.creditDays} Days</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={`font-bold text-sm ${balance > 0 ? 'text-indigo-900' : 'text-slate-400'}`}>
                      {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    {isOverLimit && (
                      <span className="block text-[10px] text-rose-600 font-sans font-semibold">
                        Exceeds Credit Limit
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenStatement(c.id)}
                        className="px-2 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded font-medium flex items-center gap-1"
                        title="View Customer Statement"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Statement</span>
                      </button>
                      <button
                        onClick={() => openVoucherModal({ initialType: 'receipt', partyId: c.id })}
                        className="px-2 py-1 text-xs text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded font-medium flex items-center gap-1"
                        title="Collect Payment from this customer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                      <button
                        onClick={() => openVoucherModal({ initialType: 'sales', partyId: c.id })}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded font-medium flex items-center gap-1"
                        title="Create Sales Invoice"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add Customer Master</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Store Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City Supermarket"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98800..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="accounts@store.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN / VAT Tax ID</label>
                  <input
                    type="text"
                    placeholder="GSTIN29AAACA..."
                    value={taxNumber}
                    onChange={e => setTaxNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery Route / Belt</label>
                  <select
                    value={route}
                    onChange={e => setRoute(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Route 1 - North Belt">Route 1 - North Belt</option>
                    <option value="Route 2 - East Industrial">Route 2 - East Industrial</option>
                    <option value="Route 3 - South Hub">Route 3 - South Hub</option>
                    <option value="Route 4 - West Suburbs">Route 4 - West Suburbs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credit Limit ({company.currencySymbol})</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={e => setCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credit Days</label>
                  <input
                    type="number"
                    value={creditDays}
                    onChange={e => setCreditDays(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Address</label>
                <input
                  type="text"
                  placeholder="Street, locality, landmark"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
