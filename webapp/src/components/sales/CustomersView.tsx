import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { Customer } from '../../types/erp';
import {
  Plus,
  Search,
  BookOpen,
  CreditCard,
  Phone,
  MapPin,
  X,
  FileText,
  Truck,
  User,
  Shield,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Filter,
  ArrowLeft,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const {
    customers,
    addCustomer,
    getCustomerBalance,
    company,
    setCurrentView,
    setSelectedPartyId,
    openVoucherModal,
    currentUser,
    users,
    vehicles,
    themeColor,
  } = useErp();

  const salesmanUsers = useMemo(() => users.filter(u => u.role === 'salesman_pos'), [users]);
  const [search, setSearch] = useState('');
  const [salesmanFilter, setSalesmanFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for Add Customer
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
  const [assignedSalesmanId, setAssignedSalesmanId] = useState<string>('usr_van1');

  const isSalesman = currentUser?.role === 'salesman_pos';

  // Role-based customer filtering
  const visibleCustomers = useMemo(() => {
    return customers.filter(c => {
      // If logged in user is a salesman, restrict strictly to their assigned / created customers
      if (isSalesman && currentUser) {
        const isCreatedByMe = c.createdBy === currentUser.id;
        const isAssignedToMe = c.assignedSalesmanId === currentUser.id;
        const isAssignedToMyVan = currentUser.assignedVehicleId && c.assignedVehicleId === currentUser.assignedVehicleId;
        if (!isCreatedByMe && !isAssignedToMe && !isAssignedToMyVan) {
          return false;
        }
      } else {
        // Admin / Accountant filter controls
        if (salesmanFilter === 'admin') {
          if (!c.createdBy?.includes('admin') && c.assignedSalesmanId) return false;
        } else if (salesmanFilter === 'my_created') {
          if (c.createdBy !== currentUser?.id) return false;
        } else if (salesmanFilter !== 'all') {
          if (c.assignedSalesmanId !== salesmanFilter) return false;
        }
      }

      // Search match
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        (c.createdByName && c.createdByName.toLowerCase().includes(q))
      );
    });
  }, [customers, isSalesman, currentUser, salesmanFilter, search]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    // Determine assigned salesman and vehicle
    let targetSalesmanId = assignedSalesmanId;
    let targetVehicleId = 'veh_1';

    if (isSalesman && currentUser) {
      targetSalesmanId = currentUser.id;
      targetVehicleId = currentUser.assignedVehicleId || 'veh_1';
    } else {
      const selectedUser = users.find(u => u.id === assignedSalesmanId);
      targetVehicleId = selectedUser?.assignedVehicleId || (assignedSalesmanId === 'usr_van2' ? 'veh_2' : assignedSalesmanId === 'usr_van3' ? 'veh_3' : 'veh_1');
    }

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
      createdBy: currentUser?.id || 'usr_admin1',
      createdByName: currentUser?.name || 'System Admin Lead',
      assignedSalesmanId: targetSalesmanId,
      assignedVehicleId: targetVehicleId,
    });

    setShowAddModal(false);
    setName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setTaxNumber('');
    setOpeningBalance(0);
    setCode(`CUST-00${customers.length + 2}`);
  };

  const handleOpenStatement = (customerId: string) => {
    setSelectedPartyId(customerId);
    setCurrentView('customer_statement');
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Master Directory</h1>
            {isSalesman ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Van Territory Restricted</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Full Enterprise Directory</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSalesman
              ? `You are viewing customers assigned to your van and route (${currentUser?.name}). Unauthorized customer records are hidden.`
              : 'Manage retail stores, wholesale accounts, routes, credit limits, assigned fleet vans, and live balances.'}
          </p>
        </div>
      </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isSalesman && currentUser) {
                setAssignedSalesmanId(currentUser.id);
                setRoute(currentUser.assignedLocationId === 'loc_van2' ? 'Route 2 - East Industrial' : 'Route 1 - North Belt');
              }
              setShowAddModal(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white rounded-xl flex items-center gap-2 shadow-sm transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: themeColor }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Role Notice Banner for Salesman */}
      {isSalesman && (
        <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-start sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Role: <span className="text-blue-600 dark:text-blue-400">{currentUser?.name}</span> (Salesman POS)
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Showing customers created by you or assigned to your van. New customers you create will automatically stamp your profile.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 font-mono text-[10px] text-blue-700 dark:text-blue-400 font-bold shrink-0">
            {visibleCustomers.length} Assigned Store(s)
          </span>
        </div>
      )}

      {/* Search & Role Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search customer, shop, mobile, or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
        </div>

        {/* Filter controls for Admin / Accountant */}
        {!isSalesman ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Van / Salesman:</span>
            </span>
            <select
              value={salesmanFilter}
              onChange={e => setSalesmanFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Vans &amp; Salesmen ({customers.length})</option>
              {salesmanUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
              <option value="admin">Head Office · Admin Created</option>
              <option value="my_created">Created by Me ({currentUser?.name})</option>
            </select>
          </div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <span className="text-slate-900 dark:text-white font-bold">{visibleCustomers.length}</span> assigned retail store(s)
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[1020px]">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              <tr className="whitespace-nowrap">
                <th className="py-3 px-4 w-28 whitespace-nowrap">Customer Code</th>
                <th className="py-3 px-4 min-w-[180px] whitespace-nowrap">Customer / Shop Name</th>
                <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Assigned Van / Created By</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Route / Belt</th>
                <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Contact &amp; GSTIN</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Credit Limit ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Outstanding Balance ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-center w-28 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {visibleCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-sm font-medium">No customers found</p>
                    <p className="text-xs mt-1">
                      {isSalesman
                        ? 'No customers have been assigned to your van yet. Click "+ Add New Customer" to register one.'
                        : 'Try adjusting your search query or salesman filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                visibleCustomers.map(c => {
                  const balance = getCustomerBalance(c.id);
                  const isOverLimit = balance > c.creditLimit;
                  const isCreatedByMe = c.createdBy === currentUser?.id;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                        {c.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                          {isCreatedByMe && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold text-[9px] border border-amber-200 dark:border-amber-800/60" title="Created by you">
                              Your Customer
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.companyName || c.address}</p>
                      </td>
                      <td className="py-3 px-4">
                        {(() => {
                          const assignedUser = users.find(u => u.id === c.assignedSalesmanId);
                          if (assignedUser) {
                            return (
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px] font-medium">
                                <Truck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span>{assignedUser.name}</span>
                              </div>
                            );
                          }
                          return (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                              <Shield className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                              <span>{c.createdByName || 'Head Office Admin'}</span>
                            </div>
                          );
                        })()}
                        {c.createdByName && c.assignedSalesmanId && c.createdBy !== c.assignedSalesmanId && (
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            Created by: {c.createdByName}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 px-2 py-0.5 rounded-lg font-medium">
                          {c.route}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                          GST: {c.taxNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                        {c.creditLimit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500">{c.creditDays} Days</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        <span className={`font-bold text-sm ${balance > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                          {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        {isOverLimit && (
                          <span className="block text-[10px] text-rose-600 dark:text-rose-400 font-sans font-semibold">
                            Exceeds Limit
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenStatement(c.id)}
                            className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg font-medium flex items-center gap-1 transition"
                            title="View Customer Statement"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Statement</span>
                          </button>
                          <button
                            onClick={() => openVoucherModal({ initialType: 'receipt', partyId: c.id })}
                            className="px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg font-medium flex items-center gap-1 transition"
                            title="Collect Payment from this customer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                          <button
                            onClick={() => openVoucherModal({ initialType: 'sales', partyId: c.id })}
                            className="px-2 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg font-medium flex items-center gap-1 transition"
                            title="Create Sales Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 text-slate-800 dark:text-slate-100 transition-colors">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Customer Master</h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  RBAC Tagged
                </span>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Salesman context info */}
            {isSalesman ? (
              <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  Registering customer under your van account (<strong>{currentUser?.name}</strong>). Customer will be tagged with your ID.
                </span>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Customer To Salesman &amp; Van:
                </label>
                <select
                  value={assignedSalesmanId}
                  onChange={e => {
                    const val = e.target.value;
                    setAssignedSalesmanId(val);
                    if (val === 'usr_van1') setRoute('Route 1 - North Belt');
                    else if (val === 'usr_van2') setRoute('Route 2 - East Industrial');
                    else if (val === 'usr_van3') setRoute('Route 3 - South Belt');
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  {salesmanUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                  <option value="usr_admin1">System Admin Lead (Head Office / General)</option>
                </select>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer / Store Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City Supermarket"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Trade Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. City Retail Pvt Ltd"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98800..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="accounts@store.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN / VAT Tax ID</label>
                  <input
                    type="text"
                    placeholder="GSTIN29AAACA..."
                    value={taxNumber}
                    onChange={e => setTaxNumber(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Delivery Route / Belt</label>
                  <select
                    value={route}
                    onChange={e => setRoute(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
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
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Credit Limit ({company.currencySymbol})</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={e => setCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Credit Days</label>
                  <input
                    type="number"
                    value={creditDays}
                    onChange={e => setCreditDays(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Address</label>
                <input
                  type="text"
                  placeholder="Street, locality, landmark"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white font-semibold rounded-xl shadow-sm hover:brightness-110 active:scale-[0.98]"
                  style={{ backgroundColor: themeColor }}
                >
                  Save Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
