import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Layers, Tag, Box, Plus, X } from 'lucide-react';

export const InventoryMastersView: React.FC<{ activeTab?: 'groups' | 'categories' | 'units' }> = ({
  activeTab = 'groups',
}) => {
  const { groups, categories, units } = useErp();
  const [tab, setTab] = useState<'groups' | 'categories' | 'units'>(activeTab);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Inventory Classification Masters
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure Product Groups, Packaging Categories, and Units of Measure with conversion multipliers.
        </p>

        {/* Tab Controls */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setTab('groups')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === 'groups' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Product Groups ({groups.length})</span>
          </button>
          <button
            onClick={() => setTab('categories')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === 'categories' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Packaging Categories ({categories.length})</span>
          </button>
          <button
            onClick={() => setTab('units')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === 'units' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Units of Measure ({units.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {tab === 'groups' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4 w-1/4">Group Name</th>
                <th className="py-3 px-4">Description / FMCG Vertical</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map(g => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{g.name}</td>
                  <td className="py-3 px-4 text-slate-600">{g.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'categories' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4 w-1/3">Packaging Category Name</th>
                <th className="py-3 px-4">Classification Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 text-slate-600">Material specification packaging unit</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'units' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4 w-24">Unit Code</th>
                <th className="py-3 px-4">Unit Name</th>
                <th className="py-3 px-4">Base Unit Multiplier</th>
                <th className="py-3 px-4">System Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {units.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-indigo-700">{u.code}</td>
                  <td className="py-3 px-4 font-sans text-slate-900 font-medium">{u.name}</td>
                  <td className="py-3 px-4 text-slate-700">
                    {u.isBaseUnit ? '1 (Base Unit)' : `1 ${u.code} = ${u.baseMultiplier} ${u.baseUnitCode || 'PCS'}`}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {u.isBaseUnit ? 'Primary Base' : 'Compound Pack'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
