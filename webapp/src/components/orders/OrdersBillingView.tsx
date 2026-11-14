import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { Order, OrderStatus } from '../../types/erp';
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  RotateCw,
  X,
  Store,
  User,
  Package,
  Calendar,
  DollarSign,
  Send,
  Building,
  ArrowLeft,
} from 'lucide-react';

export const OrdersBillingView: React.FC = () => {
  const { orders, approveOrder, rejectOrder, syncOrderToTally, themeColor, currentUser, users, setCurrentView, company } = useErp();

  const salesmanUsers = useMemo(() => users.filter(u => u.role === 'salesman_pos'), [users]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [salesmanFilter, setSalesmanFilter] = useState<string>('all');
  
  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);

  const isSalesman = currentUser?.role === 'salesman_pos';
  const canApprove = currentUser?.role === 'admin' || currentUser?.role === 'warehouse_manager';

  // Base orders accessible to the current user
  const roleOrders = useMemo(() => {
    return orders.filter(order => {
      if (isSalesman && currentUser) {
        return (
          order.salesPersonId === currentUser.id ||
          order.salesPersonName.toLowerCase().includes(currentUser.name.split(' ')[0].toLowerCase())
        );
      }
      if (salesmanFilter !== 'all' && order.salesPersonId !== salesmanFilter) return false;
      return true;
    });
  }, [orders, isSalesman, currentUser, salesmanFilter]);

  // Tab counts based on accessible orders
  const counts = useMemo(() => {
    return {
      all: roleOrders.length,
      pending: roleOrders.filter(o => o.status === 'pending').length,
      approved: roleOrders.filter(o => o.status === 'approved').length,
      rejected: roleOrders.filter(o => o.status === 'rejected').length,
    };
  }, [roleOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return roleOrders.filter(order => {
      const matchesTab = activeTab === 'all' || order.status === activeTab;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.vendorName.toLowerCase().includes(q) ||
        order.vendorShopName.toLowerCase().includes(q) ||
        order.salesPersonName.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [roleOrders, activeTab, searchTerm]);

  const handleApprove = (order: Order) => {
    approveOrder(order.id);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOrder || !rejectionReason.trim()) return;
    rejectOrder(rejectingOrder.id, rejectionReason.trim());
    setRejectingOrder(null);
    setRejectionReason('');
  };

  const handleSyncToTally = (orderId: string) => {
    setSyncingOrderId(orderId);
    setTimeout(() => {
      syncOrderToTally(orderId);
      setSyncingOrderId(null);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <span className="p-2 rounded-xl text-white shadow-sm" style={{ backgroundColor: themeColor }}>
                <FileCheck className="w-5 h-5" />
              </span>
              Orders & Billing Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review salesman order entries, approve special discount requests, and manage finalized Tally ERP billing.
          </p>
        </div>
      </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-3">
          {isSalesman ? (
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Sales Rep Queue: {currentUser?.name}</span>
            </div>
          ) : counts.pending > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>{counts.pending} Discount Request(s) Require Approval</span>
            </div>
          )}
        </div>
      </div>

      {/* Role Notice for Salesman */}
      {isSalesman && (
        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>RBAC Isolation Active:</strong> You are viewing orders booked under your salesman profile. Discount approvals are restricted to Administrator / Accounts roles.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800">
            {filteredOrders.length} Orders
          </span>
        </div>
      )}

      {/* 4 Status Tabs Matching Live Tally Order Portal */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            style={activeTab === 'all' ? { backgroundColor: themeColor } : {}}
          >
            <span>Total Orders</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Discount Requests</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
              }`}
            >
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approved Bills</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'approved' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
              }`}
            >
              {counts.approved}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
              }`}
            >
              {counts.rejected}
            </span>
          </button>
        </div>

        {/* Search & Salesman Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isSalesman && (
            <select
              value={salesmanFilter}
              onChange={e => setSalesmanFilter(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Salespersons</option>
              {salesmanUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          )}

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID, Vendor, Salesperson..."
              className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Sales Person</th>
                <th className="py-3 px-4">Vendor / Shop</th>
                <th className="py-3 px-4">Items / Qty</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Final Total</th>
                <th className="py-3 px-4 text-center">Status & Approval</th>
                <th className="py-3 px-4 text-center">Tally Sync</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">No orders found matching this filter.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const hasDiscount = order.discountAmount > 0;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="text-emerald-600 dark:text-emerald-400">#{order.orderNumber}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>

                      {/* Sales Person */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.salesPersonName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{order.salesPersonPhone}</div>
                      </td>

                      {/* Vendor / Shop */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.vendorShopName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{order.vendorName} • {order.vendorAddress.split(',')[0]}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Borrow Limit: {company.currencySymbol} {order.vendorBorrowLimit.toLocaleString()}
                        </div>
                      </td>

                      {/* Items / Qty */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {order.items.length} Product(s)
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]" title={order.items.map(i => i.productName).join(', ')}>
                          {order.items[0]?.productName}
                          {order.items.length > 1 && ` +${order.items.length - 1} more`}
                        </div>
                      </td>

                      {/* Subtotal */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {company.currencySymbol} {order.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Discount */}
                      <td className="py-3.5 px-4 text-right">
                        {hasDiscount ? (
                          <span className="font-semibold text-amber-600 dark:text-amber-400">
                            -{company.currencySymbol} {order.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Final Total */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {company.currencySymbol} {order.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status & Approval */}
                      <td className="py-3.5 px-4 text-center">
                        {order.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            <span>Discount Pending</span>
                          </span>
                        )}
                        {order.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            <span>Confirmed</span>
                          </span>
                        )}
                        {order.status === 'rejected' && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 cursor-help"
                            title={`Reason: ${order.rejectionReason}`}
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Tally Sync */}
                      <td className="py-3.5 px-4 text-center">
                        {order.tallySyncStatus === 'synced' ? (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              <CheckCircle className="w-2.5 h-2.5" />
                              <span>Synced</span>
                            </span>
                            {order.tallyVoucherNumber && (
                              <span className="text-[9px] text-slate-400 mt-0.5">{order.tallyVoucherNumber}</span>
                            )}
                          </div>
                        ) : order.status === 'approved' ? (
                          <button
                            onClick={() => handleSyncToTally(order.id)}
                            disabled={syncingOrderId === order.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
                          >
                            <RotateCw className={`w-3 h-3 ${syncingOrderId === order.id ? 'animate-spin' : ''}`} />
                            <span>Sync to Tally</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Pending Approval</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Modal */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            title="View Order Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Approval Actions for Pending Orders */}
                          {order.status === 'pending' && (
                            canApprove ? (
                              <>
                                <button
                                  onClick={() => handleApprove(order)}
                                  title="Approve Order & Discount"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] shadow-xs transition flex items-center gap-1"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setRejectingOrder(order);
                                    setRejectionReason('');
                                  }}
                                  title="Reject Order"
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-medium text-[11px] border border-rose-200 dark:border-rose-800 transition flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                title="Awaiting Administrator approval. Sales representatives cannot self-approve discount requests."
                              >
                                <Clock className="w-3 h-3" />
                                <span>Awaiting Approval</span>
                              </span>
                            )
                          )}
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

      {/* REJECTION MODAL (Exact match to Tally Order portal modal) */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Reject Order</h3>
                  <p className="text-xs text-slate-500">Order #{rejectingOrder.orderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setRejectingOrder(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl mb-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{rejectingOrder.vendorShopName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Discount:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{company.currencySymbol} {rejectingOrder.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order Total:</span>
                <span className="font-bold text-slate-900 dark:text-white">{company.currencySymbol} {rejectingOrder.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="e.g. Discount exceeds permissible margin, customer credit limit exceeded, insufficient stock..."
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    #{selectedOrder.orderNumber}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedOrder.vendorShopName}
                </h3>
                <p className="text-xs text-slate-500">{selectedOrder.vendorName} • {selectedOrder.vendorPhone}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vendor Details Box */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl text-xs mb-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Sales Executive</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedOrder.salesPersonName}</span>
                <span className="text-slate-400 block text-[11px]">{selectedOrder.salesPersonPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Address</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedOrder.vendorAddress}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Booked Items & Packing
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Packing Specification</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {item.packingQty}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                        {company.currencySymbol} {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {company.currencySymbol} {item.lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal (Gross Amount)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{company.currencySymbol} {selectedOrder.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                  <span>Special Discount Requested</span>
                  <span>-{company.currencySymbol} {selectedOrder.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2">
                <span>Final Billing Total</span>
                <span className="text-base text-emerald-600 dark:text-emerald-400">{company.currencySymbol} {selectedOrder.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              {selectedOrder.rejectionReason && (
                <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300">
                  <span className="font-bold block text-[11px] uppercase">Rejection Reason:</span>
                  <span>{selectedOrder.rejectionReason}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
