import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Truck,
  TrendingUp,
  DollarSign,
  Fuel,
  Boxes,
  ArrowRight,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Eye,
  Plus,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  Radio,
} from 'lucide-react';

export const FleetWiseReportView: React.FC = () => {
  const {
    vehicles,
    drivers,
    locations,
    vouchers,
    stockMatrix,
    items,
    company,
    selectedFleetId,
    setSelectedFleetId,
    setInvoiceToView,
    openVoucherModal,
    selectedPeriod,
    setCurrentView,
  } = useErp();

  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(selectedFleetId || null);
  const [expandVouchers, setExpandVouchers] = useState<boolean>(true);
  const [expandStock, setExpandStock] = useState<boolean>(true);

  // If no vehicle selected, show the Fleets in Card Style
  if (!activeVehicleId) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in zoom-in-95">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Fleet Wise Performance Report</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select any mobile delivery van from the fleet cards below to inspect vehicle-specific dashboard, sales, collections, and on-van stock.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('live_tracking')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Open Live Google Map Point Tracker</span>
          </button>
        </div>

        {/* Fleets Card Style Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map(veh => {
            const driver = drivers.find(d => d.id === veh.assignedDriverId);
            const loc = locations.find(l => l.id === veh.locationId);

            // Calculate vehicle specific figures
            const vehVouchers = vouchers.filter(v => v.vehicleId === veh.id || v.locationId === veh.locationId);
            const totalSales = vehVouchers
              .filter(v => v.voucherType === 'sales')
              .reduce((sum, v) => sum + v.totalAmount, 0);
            const totalCollections = vehVouchers
              .filter(v => v.voucherType === 'receipt')
              .reduce((sum, v) => sum + v.totalAmount, 0);

            // Stock value currently inside van
            const vanStockVal = stockMatrix
              .filter(s => s.locationId === veh.locationId)
              .reduce((sum, s) => {
                const itm = items.find(i => i.id === s.itemId);
                return sum + (s.quantity * (itm?.sellingPrice || 0));
              }, 0);

            return (
              <button
                key={veh.id}
                onClick={() => {
                  setActiveVehicleId(veh.id);
                  setSelectedFleetId(veh.id);
                }}
                className="bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg p-5 text-left transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono tracking-tight text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {veh.regNumber}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      veh.status === 'on_field'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {veh.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">
                    {veh.model}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Driver: <span className="text-slate-800 font-semibold">{driver?.name || 'Assigned'}</span> · {driver?.routeArea || 'Route'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sales Billed:</span>
                      <span className="text-xs font-bold font-mono text-indigo-900">
                        {company.currencySymbol} {totalSales.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="p-2 bg-emerald-50/60 rounded-lg">
                      <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Collected:</span>
                      <span className="text-xs font-bold font-mono text-emerald-900">
                        {company.currencySymbol} {totalCollections.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500">
                    <span>Van Stock Value: </span>
                    <span className="font-mono font-bold text-slate-900">
                      {company.currencySymbol} {vanStockVal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Vehicle Selected: Render Fleet-Wise Dashboard & Expandable Tables
  const selectedVehicle = vehicles.find(v => v.id === activeVehicleId);
  const driver = drivers.find(d => d.id === selectedVehicle?.assignedDriverId);
  const location = locations.find(l => l.id === selectedVehicle?.locationId);

  // Vouchers on this vehicle
  const fleetVouchers = vouchers.filter(v =>
    v.vehicleId === selectedVehicle?.id || v.locationId === selectedVehicle?.locationId
  );

  const fleetSales = fleetVouchers
    .filter(v => v.voucherType === 'sales')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  const fleetCollections = fleetVouchers
    .filter(v => v.voucherType === 'receipt')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  const fleetExpenses = fleetVouchers
    .filter(v => v.voucherType === 'payment')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  // Stock on this vehicle
  const vanStockItems = stockMatrix
    .filter(s => s.locationId === selectedVehicle?.locationId)
    .map(s => {
      const itm = items.find(i => i.id === s.itemId);
      return {
        item: itm,
        quantity: s.quantity,
        costValue: (s.quantity * (itm?.costPrice || 0)),
        salesValue: (s.quantity * (itm?.sellingPrice || 0)),
      };
    })
    .filter(s => s.item);

  const totalVanStockCost = vanStockItems.reduce((sum, i) => sum + i.costValue, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Switch Fleet Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {selectedVehicle?.model} ({selectedVehicle?.regNumber})
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                {selectedVehicle?.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Driver: <span className="text-slate-800 font-semibold">{driver?.name}</span> (Ph: {driver?.phone}) · Route: {driver?.routeArea}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveVehicleId(null)}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select Different Fleet</span>
          </button>
          <button
            onClick={() => openVoucherModal({ initialType: 'sales', locationId: selectedVehicle?.locationId })}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Bill from this Van</span>
          </button>
        </div>
      </div>

      {/* Fleet Dashboard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Fleet Sales Billed</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {company.currencySymbol} {fleetSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-emerald-600 mt-1">Direct spot customer invoices</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Collections Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold font-mono text-emerald-900 mt-2">
            {company.currencySymbol} {fleetCollections.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Cash and QR receipts</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Van Fuel & Running</span>
            <Fuel className="w-4 h-4 text-rose-600" />
          </div>
          <h3 className="text-2xl font-bold font-mono text-rose-900 mt-2">
            {company.currencySymbol} {fleetExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Direct fleet expense vouchers</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">On-Van Inventory Value</span>
            <Boxes className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {company.currencySymbol} {totalVanStockCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{vanStockItems.length} active loaded SKUs</p>
        </div>
      </div>

      {/* Expandable Section 1: Fleet Detailed Vouchers Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <button
          onClick={() => setExpandVouchers(!expandVouchers)}
          className="w-full p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors text-left"
        >
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Fleet Wise Detailed Vouchers ({fleetVouchers.length} Transactions)
            </h3>
            <p className="text-[11px] text-slate-500">Every sales invoice, collection receipt, and fuel bill linked to this vehicle</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <span>{expandVouchers ? 'Collapse' : 'Expand'}</span>
            {expandVouchers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {expandVouchers && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-2.5 px-4 w-28">Date</th>
                  <th className="py-2.5 px-4 w-32">Voucher #</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Party / Shop Name</th>
                  <th className="py-2.5 px-4">Narration / Particulars</th>
                  <th className="py-2.5 px-4 text-right">Amount ({company.currencySymbol})</th>
                  <th className="py-2.5 px-4 text-center">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fleetVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No transactions recorded for this fleet yet.
                    </td>
                  </tr>
                ) : (
                  fleetVouchers.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono text-slate-500">{v.date}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{v.voucherNumber}</td>
                      <td className="py-2.5 px-4">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">
                          {v.voucherType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{v.partyName || '-'}</td>
                      <td className="py-2.5 px-4 text-slate-500 truncate max-w-xs">{v.narration}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => setInvoiceToView(v)}
                          className="p-1 text-indigo-600 hover:text-indigo-900 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expandable Section 2: Fleet Stock Movement & Van Inventory */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <button
          onClick={() => setExpandStock(!expandStock)}
          className="w-full p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors text-left"
        >
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              On-Van Physical Stock Movement & Live Payload
            </h3>
            <p className="text-[11px] text-slate-500">Inventory balance physically present in this van for spot sales</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <span>{expandStock ? 'Collapse' : 'Expand'}</span>
            {expandStock ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {expandStock && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold font-mono">
                <tr>
                  <th className="py-2.5 px-4 font-sans">SKU & Item Name</th>
                  <th className="py-2.5 px-4 text-right">Physical Loaded Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Cost Rate</th>
                  <th className="py-2.5 px-4 text-right">Selling Rate</th>
                  <th className="py-2.5 px-4 text-right">Stock Valuation at Cost ({company.currencySymbol})</th>
                  <th className="py-2.5 px-4 text-right">Potential Sales Revenue ({company.currencySymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {vanStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                      Van is currently empty. Use "Transfer Stock to Van" from Godowns menu to load items.
                    </td>
                  </tr>
                ) : (
                  vanStockItems.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-sans font-bold text-slate-900">
                        <span>{row.item?.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2 font-mono font-normal">[{row.item?.sku}]</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-indigo-950 text-sm">
                        {row.quantity} Units
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600">{row.item?.costPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right text-slate-600">{row.item?.sellingPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-800">
                        {row.costValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-800">
                        {row.salesValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-xs text-slate-900">
                <tr>
                  <td className="py-3 px-4 font-sans">Total Physical Van Inventory Value:</td>
                  <td className="py-3 px-4 text-right text-indigo-900">
                    {vanStockItems.reduce((sum, i) => sum + i.quantity, 0)} Units
                  </td>
                  <td colSpan={2}></td>
                  <td className="py-3 px-4 text-right text-sm">
                    {totalVanStockCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-900 text-sm">
                    {vanStockItems.reduce((sum, i) => sum + i.salesValue, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
