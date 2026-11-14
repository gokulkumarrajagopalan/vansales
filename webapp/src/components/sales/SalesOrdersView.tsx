import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { Plus, Search, Eye, FileSpreadsheet, ArrowRight, CheckCircle2, Shield, Truck, User, Filter, RotateCcw } from 'lucide-react';
import { useResizableColumns } from '../../hooks/useResizableColumns';

type OrderCol = 'date' | 'number' | 'customer' | 'location' | 'bookedBy' | 'status' | 'orderValue' | 'action';

const INITIAL_ORDER_WIDTHS: Record<OrderCol, number> = {
  date: 125,
  number: 150,
  customer: 240,
  location: 200,
  bookedBy: 150,
  status: 120,
  orderValue: 140,
  action: 100,
};

const MIN_ORDER_WIDTHS: Partial<Record<OrderCol, number>> = {
  date: 95,
  number: 110,
  customer: 160,
  location: 140,
  bookedBy: 110,
  status: 90,
  orderValue: 100,
  action: 80,
};

export const SalesOrdersView: React.FC = () => {
  const { vouchers, company, openVoucherModal, setInvoiceToView, currentUser, isVoucherAccessible } = useErp();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'loc_van1' | 'loc_van2' | 'loc_main'>('all');

  const { widths, startResizing, resetWidths } = useResizableColumns<OrderCol>(
    'talliffy_sales_orders_col_widths',
    INITIAL_ORDER_WIDTHS,
    MIN_ORDER_WIDTHS
  );

  const totalTableWidth = useMemo(() => {
    return Object.values(widths).reduce((acc, curr) => acc + curr, 0);
  }, [widths]);

  const ResizeHandle: React.FC<{ colKey: OrderCol }> = ({ colKey }) => (
    <div
      onMouseDown={e => startResizing(colKey, e)}
      onClick={e => e.stopPropagation()}
      className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-500/30 active:bg-blue-600 transition-colors z-20 group flex items-center justify-center select-none"
      title="Click and drag to adjust column width"
    >
      <div className="w-[1.5px] h-4 bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-500 group-active:bg-blue-600" />
    </div>
  );

  const isSalesman = currentUser?.role === 'salesman_pos';

  const orderVouchers = useMemo(() => {
    return vouchers.filter(v => {
      if (v.voucherType !== 'sales_order') return false;
      if (isSalesman) {
        return isVoucherAccessible(v);
      }
      if (locationFilter !== 'all' && v.locationId !== locationFilter) {
        return false;
      }
      return true;
    });
  }, [vouchers, isSalesman, locationFilter, isVoucherAccessible]);

  const filtered = useMemo(() => {
    return orderVouchers.filter(v =>
      v.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
      (v.partyName && v.partyName.toLowerCase().includes(search.toLowerCase())) ||
      (v.locationName && v.locationName.toLowerCase().includes(search.toLowerCase()))
    );
  }, [orderVouchers, search]);

  const totalOrderValue = filtered.reduce((sum, v) => sum + v.totalAmount, 0);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Sales Orders Register</h1>
            {isSalesman ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Van 01 Orders Only</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>All Company Fleet</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSalesman
              ? `Booking orders registered by ${currentUser?.name}. Van 02 and Central Godown orders are restricted.`
              : 'Pre-booking orders from store visits, delivery route pre-allocation, and pending order dispatches.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Total Order Value</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {company.currencySymbol} {totalOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={() => openVoucherModal({ initialType: 'sales_order' })}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Sales Order</span>
          </button>
        </div>
      </div>

      {/* Territory Isolation Notice for Field Rep */}
      {isSalesman && (
        <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Territory Isolation Active:</strong> You are viewing orders created strictly by <strong>{currentUser?.name}</strong>. Orders from other vans are hidden.
            </span>
          </div>
          <span className="font-mono text-[11px] bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded font-semibold">
            {filtered.length} Orders
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number or customer name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={resetWidths}
            className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition flex items-center gap-1.5"
            title="Reset columns to optimal default widths"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset Columns</span>
          </button>

          {!isSalesman && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value as any)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Fleet &amp; Godowns</option>
                <option value="loc_van1">Van 01 (John Fernandez)</option>
                <option value="loc_van2">Van 02 (David Miller)</option>
                <option value="loc_main">Central Godown</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Adjustable Columns Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto w-full">
          <table
            className="text-xs text-left table-fixed border-collapse"
            style={{ width: `${Math.max(980, totalTableWidth)}px` }}
          >
            <colgroup>
              <col style={{ width: `${widths.date}px` }} />
              <col style={{ width: `${widths.number}px` }} />
              <col style={{ width: `${widths.customer}px` }} />
              <col style={{ width: `${widths.location}px` }} />
              <col style={{ width: `${widths.bookedBy}px` }} />
              <col style={{ width: `${widths.status}px` }} />
              <col style={{ width: `${widths.orderValue}px` }} />
              <col style={{ width: `${widths.action}px` }} />
            </colgroup>
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold select-none">
              <tr>
                <th className="py-3 px-3.5 relative whitespace-nowrap">
                  <span>Order Date</span>
                  <ResizeHandle colKey="date" />
                </th>
                <th className="py-3 px-3.5 relative whitespace-nowrap">
                  <span>Order Number</span>
                  <ResizeHandle colKey="number" />
                </th>
                <th className="py-3 px-3.5 relative whitespace-nowrap">
                  <span>Customer Party</span>
                  <ResizeHandle colKey="customer" />
                </th>
                <th className="py-3 px-3.5 relative whitespace-nowrap">
                  <span>Target Van / Location</span>
                  <ResizeHandle colKey="location" />
                </th>
                <th className="py-3 px-3.5 relative whitespace-nowrap">
                  <span>Booked By</span>
                  <ResizeHandle colKey="bookedBy" />
                </th>
                <th className="py-3 px-3.5 relative whitespace-nowrap">
                  <span>Status</span>
                  <ResizeHandle colKey="status" />
                </th>
                <th className="py-3 px-3.5 text-right relative whitespace-nowrap">
                  <span>Order Value ({company.currencySymbol || 'AED'})</span>
                  <ResizeHandle colKey="orderValue" />
                </th>
                <th className="py-3 px-3.5 text-center relative whitespace-nowrap">
                  <span>Action</span>
                  <ResizeHandle colKey="action" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No sales orders match your criteria.</p>
                    <button
                      onClick={() => openVoucherModal({ initialType: 'sales_order' })}
                      className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Create first sales order →
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {v.date}
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {v.voucherNumber}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white truncate" title={v.partyName}>
                      {v.partyName}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {v.vehicleId && <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                        <span className="truncate">{v.locationName || 'Central'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap truncate">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{v.createdByName || 'Sales Rep'}</span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">
                      {v.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => setInvoiceToView(v)}
                        className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded font-medium flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
