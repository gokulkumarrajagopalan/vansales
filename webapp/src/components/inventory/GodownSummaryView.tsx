import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { StockSummaryView } from './StockSummaryView';
import { MapPin, Truck, Building, ArrowRight, RotateCcw } from 'lucide-react';

export const GodownSummaryView: React.FC = () => {
  const { locations, stockMatrix, items } = useErp();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  if (!selectedLocationId) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Select Godown or Van Location</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Choose a warehouse depot or mobile delivery van to inspect location-filtered stock movement, opening, inward, outward, and closing balances.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locations.map(loc => {
            const isVan = loc.type === 'van';
            const locStockCount = stockMatrix
              .filter(s => s.locationId === loc.id && s.quantity > 0)
              .length;

            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocationId(loc.id)}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md text-left transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isVan ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isVan ? <Truck className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {loc.code}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{loc.address || 'Peenya Central Logistics Hub'}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {locStockCount} Active SKUs in Stock
                  </span>
                  <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>View Stock</span>
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

  return (
    <div className="space-y-4">
      {/* Location switcher toolbar */}
      <div className="max-w-7xl mx-auto px-6 pt-4 flex justify-end">
        <button
          onClick={() => setSelectedLocationId(null)}
          className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
          <span>Switch Location / Godown</span>
        </button>
      </div>

      <StockSummaryView forcedLocationId={selectedLocationId} />
    </div>
  );
};
