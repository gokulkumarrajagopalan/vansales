import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Supplier } from '../../types/erp';
import { Plus, Search, BookOpen, CreditCard, Building, Phone, X, FileText } from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, getSupplierBalance, company, setCurrentView, setSelectedPartyId, openVoucherModal } = useErp();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [code, setCode] = useState(`SUPP-00${suppliers.length + 1}`);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(30);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    addSupplier({
      name,
      companyName: companyName || name,
      code,
      phone,
      email,
      taxNumber: taxNumber || 'GSTIN29AAACB...',
      paymentTermsDays,
      address,
      city,
      ledgerId: 'led_ap',
      openingBalance,
    });
    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  const handleOpenStatement = (supplierId: string) => {
    setSelectedPartyId(supplierId);
    setCurrentView('supplier_statement');
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Suppliers / Vendors Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage manufacturer depots, FMCG distributors, payment terms, and outstanding payables.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Supplier Master</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search vendor by name, code, contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-bold">{filtered.length}</span> manufacturer depots
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3 px-4 w-24">Vendor Code</th>
              <th className="py-3 px-4">Supplier / Depot Name</th>
              <th className="py-3 px-4">Contact & Location</th>
              <th className="py-3 px-4">GSTIN / Tax ID</th>
              <th className="py-3 px-4 text-right">Payment Terms</th>
              <th className="py-3 px-4 text-right">Payable Balance ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(s => {
              const balance = getSupplierBalance(s.id);
              return (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-500">{s.code}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="text-[11px] text-slate-500">{s.companyName}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{s.phone}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.address}, {s.city}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{s.taxNumber}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {s.paymentTermsDays} Days Net
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={`font-bold text-sm ${balance > 0 ? 'text-amber-900' : 'text-slate-400'}`}>
                      {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1 font-sans">Cr</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenStatement(s.id)}
                        className="px-2 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded font-medium flex items-center gap-1"
                        title="View Supplier Statement"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Statement</span>
                      </button>
                      <button
                        onClick={() => openVoucherModal({ initialType: 'payment', partyId: s.id })}
                        className="px-2 py-1 text-xs text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded font-medium flex items-center gap-1"
                        title="Make Payment to Supplier"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Payment</span>
                      </button>
                      <button
                        onClick={() => openVoucherModal({ initialType: 'purchase', partyId: s.id })}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded font-medium flex items-center gap-1"
                        title="Create Purchase Bill"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Bill</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add Supplier / Vendor Master</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Parle Agro Depot"
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
                    placeholder="+91 80 22..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="orders@parle.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    placeholder="GSTIN29AAACP..."
                    value={taxNumber}
                    onChange={e => setTaxNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Terms (Days)</label>
                  <input
                    type="number"
                    value={paymentTermsDays}
                    onChange={e => setPaymentTermsDays(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Depot / Warehouse Address</label>
                <input
                  type="text"
                  placeholder="Plot number, industrial area"
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
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
