import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Tag, Plus, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface TaxSlab {
  id: string;
  name: string;
  rate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  isDefault?: boolean;
}

export const TaxDetailsView: React.FC = () => {
  const { company } = useErp();

  const [taxSlabs, setTaxSlabs] = useState<TaxSlab[]>([
    { id: 'tax_0', name: 'Exempt / Nil Rated (0%)', rate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0 },
    { id: 'tax_5', name: 'GST Essential Goods (5%)', rate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 5 },
    { id: 'tax_12', name: 'GST Packaged Confectionery (12%)', rate: 12, cgstRate: 6, sgstRate: 6, igstRate: 12 },
    { id: 'tax_18', name: 'GST Standard FMCG & Beverages (18%)', rate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18, isDefault: true },
    { id: 'tax_28', name: 'GST Aerated Luxury Drinks (28%)', rate: 28, cgstRate: 14, sgstRate: 14, igstRate: 28 },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [rate, setRate] = useState<number>(18);

  const handleAddSlab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const half = rate / 2;
    setTaxSlabs([
      ...taxSlabs,
      {
        id: `tax_${Date.now()}`,
        name,
        rate,
        cgstRate: half,
        sgstRate: half,
        igstRate: rate,
      },
    ]);
    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tax Slabs & GST / VAT Configurations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure intra-state (CGST + SGST) and inter-state (IGST) tax slabs applied across item masters and invoice lines.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Tax Slab</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            <tr>
              <th className="py-3 px-4">Tax Slab Name</th>
              <th className="py-3 px-4 text-right">Combined Tax %</th>
              <th className="py-3 px-4 text-right">CGST %</th>
              <th className="py-3 px-4 text-right">SGST %</th>
              <th className="py-3 px-4 text-right">IGST %</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {taxSlabs.map(slab => (
              <tr key={slab.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-sans font-bold text-slate-900">{slab.name}</td>
                <td className="py-3 px-4 text-right font-bold text-indigo-700 text-sm">{slab.rate}%</td>
                <td className="py-3 px-4 text-right text-slate-600">{slab.cgstRate}%</td>
                <td className="py-3 px-4 text-right text-slate-600">{slab.sgstRate}%</td>
                <td className="py-3 px-4 text-right text-slate-600">{slab.igstRate}%</td>
                <td className="py-3 px-4 text-center font-sans">
                  {slab.isDefault ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Standard Default
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Configured</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add Tax Rate Slab</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSlab} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tax Slab Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Luxury Surcharge (32%)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Tax Rate %</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={rate}
                  onChange={e => setRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-sm"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Split automatically as {(rate / 2).toFixed(1)}% CGST + {(rate / 2).toFixed(1)}% SGST.
                </p>
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
                  Save Tax Slab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
