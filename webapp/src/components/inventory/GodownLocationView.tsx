import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Location } from '../../types/erp';
import { MapPin, Truck, Building, Plus, ArrowRightLeft, X, CheckCircle2 } from 'lucide-react';

export const GodownLocationView: React.FC = () => {
  const { locations, addLocation, stockMatrix, items, vehicles, drivers, company } = useErp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Form states for new location
  const [code, setCode] = useState(`LOC-0${locations.length + 1}`);
  const [name, setName] = useState('');
  const [type, setType] = useState<'warehouse' | 'van' | 'depot'>('van');
  const [address, setAddress] = useState('');

  // Stock transfer form states
  const [fromLocId, setFromLocId] = useState('loc_main');
  const [toLocId, setToLocId] = useState(locations.find(l => l.type === 'van')?.id || 'loc_van1');
  const [transferItemId, setTransferItemId] = useState(items[0]?.id || '');
  const [transferQty, setTransferQty] = useState<number>(20);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    addLocation({
      code,
      name,
      type,
      address,
    });
    setShowAddModal(false);
    setName('');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromLocId === toLocId || transferQty <= 0) return;

    // Execute transfer in stockMatrix directly via storage update
    const saved = localStorage.getItem('apex_erp_stock');
    if (saved) {
      const matrix = JSON.parse(saved);
      const fromIdx = matrix.findIndex((s: any) => s.itemId === transferItemId && s.locationId === fromLocId);
      const toIdx = matrix.findIndex((s: any) => s.itemId === transferItemId && s.locationId === toLocId);

      if (fromIdx >= 0) {
        matrix[fromIdx].quantity = Math.max(0, matrix[fromIdx].quantity - transferQty);
      }
      if (toIdx >= 0) {
        matrix[toIdx].quantity = matrix[toIdx].quantity + transferQty;
      } else {
        matrix.push({ itemId: transferItemId, locationId: toLocId, quantity: transferQty });
      }
      localStorage.setItem('apex_erp_stock', JSON.stringify(matrix));
    }

    setTransferSuccess(true);
    setTimeout(() => {
      setTransferSuccess(false);
      setShowTransferModal(false);
      window.location.reload(); // refresh to show updated quantities
    }, 1200);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Godown & Van Locations Master
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Van ALSO acts as a mobile location. Default location is "Main Location (Central Warehouse)".
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer Stock to Van / Godown</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Godown / Van Location</span>
          </button>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {locations.map(loc => {
          const isVan = loc.type === 'van';
          const matchedVeh = vehicles.find(v => v.locationId === loc.id || v.id === loc.assignedVehicleId);
          const matchedDrv = matchedVeh ? drivers.find(d => d.id === matchedVeh.assignedDriverId) : undefined;

          const totalQty = stockMatrix
            .filter(s => s.locationId === loc.id)
            .reduce((sum, s) => sum + s.quantity, 0);

          const totalVal = stockMatrix
            .filter(s => s.locationId === loc.id)
            .reduce((sum, s) => {
              const itm = items.find(i => i.id === s.itemId);
              return sum + (s.quantity * (itm?.costPrice || 0));
            }, 0);

          return (
            <div
              key={loc.id}
              className={`bg-white p-5 rounded-xl border shadow-2xs flex flex-col justify-between ${
                loc.isDefault ? 'border-indigo-500 ring-1 ring-indigo-500/30' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isVan ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isVan ? <Truck className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                  </div>
                  {loc.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Default Main
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-3">{loc.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Code: {loc.code}</p>

                {isVan && matchedVeh && (
                  <div className="mt-3 p-2 bg-indigo-50/60 rounded-lg border border-indigo-100 text-[11px] space-y-0.5">
                    <p className="font-bold text-indigo-950 font-mono">{matchedVeh.regNumber}</p>
                    <p className="text-indigo-800">Driver: {matchedDrv?.name || 'Assigned'}</p>
                    <p className="text-slate-500 text-[10px]">Cap: {matchedVeh.capacityKg} kg · {matchedVeh.fuelType}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-end text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Physical Units:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{totalQty} Units</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Valuation:</span>
                  <span className="font-mono font-bold text-indigo-900">
                    {company.currencySymbol} {totalVal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                <span>Inter-Godown / Van Stock Transfer</span>
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {transferSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-slate-900">Stock Transfer Executed!</p>
                <p className="text-xs text-slate-500">Updating physical van matrix...</p>
              </div>
            ) : (
              <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Godown / Location (From)</label>
                  <select
                    value={fromLocId}
                    onChange={e => setFromLocId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.type === 'van' ? '🚐' : '🏢'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Godown / Van (To)</label>
                  <select
                    value={toLocId}
                    onChange={e => setToLocId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.type === 'van' ? '🚐' : '🏢'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Item to Transfer</label>
                  <select
                    value={transferItemId}
                    onChange={e => setTransferItemId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {items.map(it => (
                      <option key={it.id} value={it.id}>
                        {it.name} ({it.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transfer Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={transferQty}
                    onChange={e => setTransferQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-sm"
                    required
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Transfer Stock
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add Godown or Van Location</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Van Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Van 03 - Ravi (KA-05-AB-1234)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="van">Mobile Delivery Van</option>
                  <option value="warehouse">Central Warehouse / Godown</option>
                  <option value="depot">Cold Storage / Sub-Depot</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address / Route Description</label>
                <input
                  type="text"
                  placeholder="e.g. South Route (Jayanagar, Banashankari)"
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
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
