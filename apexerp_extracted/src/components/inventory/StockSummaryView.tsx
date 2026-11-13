import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Item, Location } from '../../types/erp';
import {
  TrendingUp,
  Printer,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Eye,
  X,
  FileText,
  Boxes,
  Truck,
  Building,
} from 'lucide-react';

export const StockSummaryView: React.FC<{ forcedLocationId?: string | null }> = ({ forcedLocationId }) => {
  const {
    items,
    locations,
    company,
    getStockSummary,
    getItemMonthlyMovement,
    getItemVoucherHistory,
    selectedDrilldownItemId,
    setSelectedDrilldownItemId,
    setInvoiceToView,
    selectedPeriod,
  } = useErp();

  const [activeLocationId, setActiveLocationId] = useState<string | null>(forcedLocationId || null);
  const [drilldownItemId, setDrilldownItemId] = useState<string | null>(selectedDrilldownItemId);
  const [drilldownView, setDrilldownView] = useState<'monthly' | 'vouchers'>('monthly');

  const stockRows = getStockSummary(activeLocationId);

  const totalOpeningValue = stockRows.reduce((sum, r) => sum + r.openingValue, 0);
  const totalInwardValue = stockRows.reduce((sum, r) => sum + r.inwardValue, 0);
  const totalOutwardValue = stockRows.reduce((sum, r) => sum + r.outwardValue, 0);
  const totalClosingValue = stockRows.reduce((sum, r) => sum + r.closingValue, 0);

  const selectedItem = items.find(i => i.id === drilldownItemId);
  const monthlyData = drilldownItemId ? getItemMonthlyMovement(drilldownItemId, activeLocationId) : [];
  const voucherHistory = drilldownItemId ? getItemVoucherHistory(drilldownItemId, activeLocationId) : [];

  const activeLocation = locations.find(l => l.id === activeLocationId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tally-Style Stock Movement Summary
            </h1>
            {activeLocation && (
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 font-mono">
                {activeLocation.type === 'van' ? <Truck className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                <span>{activeLocation.name}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Periodic Opening, Inward, Outward, and Closing balance movement analysis with multi-level drilldown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Location filter dropdown if not forced */}
          {!forcedLocationId && (
            <select
              value={activeLocationId || ''}
              onChange={e => setActiveLocationId(e.target.value ? e.target.value : null)}
              className="text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-indigo-600 shadow-2xs"
            >
              <option value="">🏢 All Godowns & Vans Combined</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} {loc.type === 'van' ? '(Mobile Van)' : '(Godown)'}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tally Style Movement Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Stock Summary & Valuation ({selectedPeriod.replace('_', ' ')})</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Click any row to drill down into monthly vouchers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold text-[11.5px]">
              <tr>
                <th rowSpan={2} className="py-2 px-3 border-r border-slate-200 w-3/12">Particulars / Item Name</th>
                <th colSpan={2} className="py-1 px-2 text-center border-r border-slate-200 bg-slate-50">Opening Balance</th>
                <th colSpan={2} className="py-1 px-2 text-center border-r border-slate-200 bg-emerald-50 text-emerald-900">Inward (Receipt)</th>
                <th colSpan={2} className="py-1 px-2 text-center border-r border-slate-200 bg-rose-50 text-rose-900">Outward (Issue / Sales)</th>
                <th colSpan={2} className="py-1 px-2 text-center bg-indigo-50 text-indigo-900">Closing Balance</th>
                <th rowSpan={2} className="py-2 px-2 text-center w-12 print:hidden">Drill</th>
              </tr>
              <tr className="border-t border-slate-200 text-[11px] text-slate-600 font-mono">
                <th className="py-1 px-2 text-right border-r border-slate-200">Quantity</th>
                <th className="py-1 px-2 text-right border-r border-slate-200">Value ({company.currencySymbol})</th>
                <th className="py-1 px-2 text-right border-r border-slate-200">Quantity</th>
                <th className="py-1 px-2 text-right border-r border-slate-200">Value ({company.currencySymbol})</th>
                <th className="py-1 px-2 text-right border-r border-slate-200">Quantity</th>
                <th className="py-1 px-2 text-right border-r border-slate-200">Value ({company.currencySymbol})</th>
                <th className="py-1 px-2 text-right border-r border-slate-200">Quantity</th>
                <th className="py-1 px-2 text-right">Value ({company.currencySymbol})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {stockRows.map(row => (
                <tr
                  key={row.item.id}
                  onClick={() => setDrilldownItemId(row.item.id)}
                  className="hover:bg-indigo-50/60 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900 border-r border-slate-100">
                    <div className="flex items-center justify-between">
                      <span>{row.item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">[{row.item.sku}]</span>
                    </div>
                  </td>
                  {/* Opening */}
                  <td className="py-2.5 px-2 text-right border-r border-slate-100 text-slate-700">
                    {row.openingQty} {row.unit.code}
                  </td>
                  <td className="py-2.5 px-2 text-right border-r border-slate-100 text-slate-700">
                    {row.openingValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  {/* Inward */}
                  <td className="py-2.5 px-2 text-right border-r border-slate-100 text-emerald-800 font-semibold">
                    {row.inwardQty > 0 ? `${row.inwardQty} ${row.unit.code}` : '-'}
                  </td>
                  <td className="py-2.5 px-2 text-right border-r border-slate-100 text-emerald-800 font-semibold">
                    {row.inwardValue > 0 ? row.inwardValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  {/* Outward */}
                  <td className="py-2.5 px-2 text-right border-r border-slate-100 text-rose-800 font-semibold">
                    {row.outwardQty > 0 ? `${row.outwardQty} ${row.unit.code}` : '-'}
                  </td>
                  <td className="py-2.5 px-2 text-right border-r border-slate-100 text-rose-800 font-semibold">
                    {row.outwardValue > 0 ? row.outwardValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  {/* Closing */}
                  <td className="py-2.5 px-2 text-right border-r border-slate-100 font-bold text-indigo-950">
                    {row.closingQty} {row.unit.code}
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-indigo-950">
                    {row.closingValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  {/* Action */}
                  <td className="py-2.5 px-2 text-center print:hidden">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-xs text-slate-900">
              <tr>
                <td className="py-3 px-3 font-sans border-r border-slate-200">Total Stock Valuation:</td>
                <td className="py-3 px-2 text-right border-r border-slate-200">-</td>
                <td className="py-3 px-2 text-right border-r border-slate-200">{totalOpeningValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-2 text-right border-r border-slate-200 text-emerald-900">-</td>
                <td className="py-3 px-2 text-right border-r border-slate-200 text-emerald-900">{totalInwardValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-2 text-right border-r border-slate-200 text-rose-900">-</td>
                <td className="py-3 px-2 text-right border-r border-slate-200 text-rose-900">{totalOutwardValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-2 text-right border-r border-slate-200 text-indigo-950">-</td>
                <td className="py-3 px-2 text-right text-indigo-950 text-sm">
                  {totalClosingValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="print:hidden"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Tally Drilldown Modal / Drawer */}
      {drilldownItemId && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between rounded-t-xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Tally Stock Item Movement Drilldown
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {selectedItem.name} ({selectedItem.sku})
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Cost: {company.currencySymbol}{selectedItem.costPrice} · Selling: {company.currencySymbol}{selectedItem.sellingPrice} · Tax: {selectedItem.taxRate}%
                </p>
              </div>
              <button
                onClick={() => {
                  setDrilldownItemId(null);
                  setSelectedDrilldownItemId(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs: Monthly Summary vs Item Vouchers Register */}
            <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setDrilldownView('monthly')}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                    drilldownView === 'monthly'
                      ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly Movement Breakdown
                </button>
                <button
                  onClick={() => setDrilldownView('vouchers')}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                    drilldownView === 'vouchers'
                      ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Item Vouchers Register ({voucherHistory.length})
                </button>
              </div>
            </div>

            {/* Drilldown Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {drilldownView === 'monthly' ? (
                /* Level 1: Monthly movement table (Tally Style) */
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold font-mono">
                      <tr>
                        <th className="py-2.5 px-4 font-sans">Month</th>
                        <th className="py-2.5 px-4 text-right">Inward Qty</th>
                        <th className="py-2.5 px-4 text-right">Inward Value ({company.currencySymbol})</th>
                        <th className="py-2.5 px-4 text-right">Outward Qty</th>
                        <th className="py-2.5 px-4 text-right">Outward Value ({company.currencySymbol})</th>
                        <th className="py-2.5 px-4 text-right">Net Closing Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {monthlyData.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">{m.monthName}</td>
                          <td className="py-2.5 px-4 text-right text-emerald-800">{m.inwardQty}</td>
                          <td className="py-2.5 px-4 text-right text-emerald-800">{m.inwardValue.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-right text-rose-800">{m.outwardQty}</td>
                          <td className="py-2.5 px-4 text-right text-rose-800">{m.outwardValue.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-indigo-950">{m.netClosingQty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Level 2: Item Vouchers Detailed Register */
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Voucher #</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Party / Location</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-right">Amount ({company.currencySymbol})</th>
                        <th className="py-2.5 px-2 text-center">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {voucherHistory.map(v => {
                        const line = v.items?.find(it => it.itemId === drilldownItemId);
                        const isInward = v.voucherType === 'purchase' || v.voucherType === 'credit_note';
                        return (
                          <tr key={v.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-slate-500">{v.date}</td>
                            <td className="py-2 px-3 font-bold text-indigo-700">{v.voucherNumber}</td>
                            <td className="py-2 px-3">
                              <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                                {v.voucherType.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-sans text-slate-800">
                              <span className="font-semibold block">{v.partyName || v.locationName}</span>
                              <span className="text-[10px] text-slate-400">{v.locationName}</span>
                            </td>
                            <td className={`py-2 px-3 text-right font-bold ${isInward ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {isInward ? `+${line?.quantity}` : `-${line?.quantity}`}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-600">{line?.rate.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">{line?.amount.toFixed(2)}</td>
                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() => setInvoiceToView(v)}
                                className="p-1 text-indigo-600 hover:text-indigo-900 rounded"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-xl">
              <button
                onClick={() => {
                  setDrilldownItemId(null);
                  setSelectedDrilldownItemId(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Back to Stock Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
