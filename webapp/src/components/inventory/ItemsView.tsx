import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Item } from '../../types/erp';
import { Plus, Search, Tag, Boxes, AlertTriangle, X, Eye } from 'lucide-react';

export const ItemsView: React.FC = () => {
  const {
    items,
    addItem,
    groups,
    categories,
    units,
    company,
    stockMatrix,
    setSelectedDrilldownItemId,
    setCurrentView,
  } = useErp();

  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [sku, setSku] = useState(`SKU-${Date.now().toString().slice(-4)}`);
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState(`8901${Date.now().toString().slice(-9)}`);
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [unitId, setUnitId] = useState(units[0]?.id || '');
  const [costPrice, setCostPrice] = useState<number>(20);
  const [sellingPrice, setSellingPrice] = useState<number>(30);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [reorderLevel, setReorderLevel] = useState<number>(100);

  const filtered = items.filter(i => {
    const matchesSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.barcode.includes(search);
    const matchesGroup = selectedGroup === 'all' || i.groupId === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;
    addItem({
      sku,
      name,
      barcode,
      groupId,
      categoryId,
      unitId,
      costPrice,
      sellingPrice,
      taxRate,
      reorderLevel,
    });
    setShowAddModal(false);
    setName('');
  };

  const openItemDrilldown = (itemId: string) => {
    setSelectedDrilldownItemId(itemId);
    setCurrentView('stock_summary');
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Items Master</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            FMCG product SKUs, barcodes, unit conversions, cost & selling prices, and reorder alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Item (SKU)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedGroup === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Groups ({items.length})
          </button>
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedGroup === g.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search SKU, item name, barcode..."
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
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            <tr>
              <th className="py-3 px-4 w-28">SKU Code</th>
              <th className="py-3 px-4">Item Name & Group</th>
              <th className="py-3 px-4">Barcode / EAN</th>
              <th className="py-3 px-4">Base Unit</th>
              <th className="py-3 px-4 text-right">Cost Price ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-right">Selling Price ({company.currencySymbol})</th>
              <th className="py-3 px-4 text-right">Tax %</th>
              <th className="py-3 px-4 text-right">Total Stock Across Godowns</th>
              <th className="py-3 px-4 text-center">Movement Drill</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(item => {
              const grp = groups.find(g => g.id === item.groupId);
              const unt = units.find(u => u.id === item.unitId);
              const totalStock = stockMatrix
                .filter(s => s.itemId === item.id)
                .reduce((sum, s) => sum + s.quantity, 0);
              const isLowStock = totalStock <= item.reorderLevel;

              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">{item.sku}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{grp?.name || 'General'}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{item.barcode}</td>
                  <td className="py-3 px-4 font-mono">{unt?.code || 'PCS'}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">{item.costPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{item.sellingPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">{item.taxRate}%</td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={`font-bold text-sm ${isLowStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {totalStock} {unt?.code}
                    </span>
                    {isLowStock && (
                      <span className="block text-[10px] text-rose-500 font-sans font-semibold">
                        Reorder: &lt; {item.reorderLevel}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => openItemDrilldown(item.id)}
                      className="px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded font-medium flex items-center gap-1 mx-auto"
                      title="View Tally Stock Movement Analysis"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tally Drill</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add Inventory Product SKU</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sprite 500ml Bottle"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barcode / EAN-13</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Item Group</label>
                  <select
                    value={groupId}
                    onChange={e => setGroupId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Packaging Category</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <select
                    value={unitId}
                    onChange={e => setUnitId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Price ({company.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={costPrice}
                    onChange={e => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price ({company.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tax Slab %</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reorder Threshold Level</label>
                <input
                  type="number"
                  value={reorderLevel}
                  onChange={e => setReorderLevel(parseInt(e.target.value) || 0)}
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
