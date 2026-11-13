import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { PriceList } from '../../types/erp';
import { Plus, Tag, Calendar, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const PriceListView: React.FC = () => {
  const { priceLists, items, company, addPriceList } = useErp();
  const [selectedListId, setSelectedListId] = useState<string>(priceLists[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState(`PL-0${priceLists.length + 1}`);
  const [effectiveFrom, setEffectiveFrom] = useState('2026-11-01');
  const [customerTier, setCustomerTier] = useState<'all' | 'wholesale' | 'retail' | 'key_accounts'>('wholesale');

  const activePriceList = priceLists.find(p => p.id === selectedListId) || priceLists[0];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    addPriceList({
      name,
      code,
      effectiveFrom,
      customerTier,
      items: items.map(it => ({
        itemId: it.id,
        customPrice: it.sellingPrice,
      })),
    });
    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Price Lists Master</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure tiered price schedules with mandatory effective date applicability for wholesale & spot van deliveries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Price List</span>
          </button>
        </div>
      </div>

      {/* Price List Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {priceLists.map(pl => {
          const isSelected = pl.id === selectedListId;
          const isEffective = pl.effectiveFrom <= '2026-10-26';

          return (
            <button
              key={pl.id}
              onClick={() => setSelectedListId(pl.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-500/40 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{pl.name}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                  isEffective ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isEffective ? 'Active / In Effect' : 'Scheduled'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1">Code: {pl.code} · Tier: {pl.customerTier.toUpperCase()}</p>
              <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-medium mt-3">
                <Calendar className="w-3.5 h-3.5" />
                <span>Effective From: {pl.effectiveFrom}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Items Matrix for Selected Price List */}
      {activePriceList && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Price Table for: {activePriceList.name}
              </h3>
              <p className="text-[11px] text-slate-500">
                Effective Date: <span className="font-mono font-bold text-slate-800">{activePriceList.effectiveFrom}</span>
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {activePriceList.items.length} Custom Product Rates
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-4 w-28">SKU</th>
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-4 text-right">Standard MRP / Base Rate ({company.currencySymbol})</th>
                <th className="py-2.5 px-4 text-right">Custom Price in this List ({company.currencySymbol})</th>
                <th className="py-2.5 px-4 text-right">Variance / Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {activePriceList.items.map(pItem => {
                const item = items.find(i => i.id === pItem.itemId);
                if (!item) return null;
                const diff = pItem.customPrice - item.sellingPrice;
                return (
                  <tr key={pItem.itemId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-600">{item.sku}</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">{item.name}</td>
                    <td className="py-2.5 px-4 text-right text-slate-500">{item.sellingPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-indigo-950 text-sm">
                      {pItem.customPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {diff < 0 ? (
                        <span className="text-emerald-700 font-semibold">
                          {diff.toFixed(2)} ({((diff / item.sellingPrice) * 100).toFixed(1)}%)
                        </span>
                      ) : diff > 0 ? (
                        <span className="text-indigo-700 font-semibold">
                          +{diff.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">Standard</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Create New Price List</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price List Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Special Spot Price"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price List Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Effective Date (Applicable From)</label>
                <input
                  type="date"
                  required
                  value={effectiveFrom}
                  onChange={e => setEffectiveFrom(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Rates become effective on vouchers on or after this date.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Customer Tier</label>
                <select
                  value={customerTier}
                  onChange={e => setCustomerTier(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="wholesale">Wholesale B2B</option>
                  <option value="retail">Van Retail Spot Delivery</option>
                  <option value="key_accounts">Key Supermarket Accounts</option>
                  <option value="all">All Customer Tiers</option>
                </select>
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
                  Save Price List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
