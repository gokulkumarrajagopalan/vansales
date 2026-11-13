import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { Plus, Eye, ArrowRightLeft, FileText, Shield, Truck, Search, Filter } from 'lucide-react';

export const CreditNotesView: React.FC = () => {
  const { vouchers, company, openVoucherModal, setInvoiceToView, currentUser, isVoucherAccessible } = useErp();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'loc_van1' | 'loc_van2' | 'loc_main'>('all');

  const isSalesman = currentUser?.role === 'salesman_pos';

  const roleCreditNotes = useMemo(() => {
    return vouchers.filter(v => {
      if (v.voucherType !== 'credit_note') return false;
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
    return roleCreditNotes.filter(v =>
      v.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
      (v.partyName && v.partyName.toLowerCase().includes(search.toLowerCase())) ||
      (v.narration && v.narration.toLowerCase().includes(search.toLowerCase()))
    );
  }, [roleCreditNotes, search]);

  const totalCreditAmount = filtered.reduce((sum, v) => sum + v.totalAmount, 0);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Sales Return / Credit Notes Register</h1>
            {isSalesman ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Van 01 Returns Only</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>All Company Returns</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSalesman
              ? `Credit notes issued on your van for damaged or returned goods by ${currentUser?.name}.`
              : 'Credit notes issued against customer returns, damaged goods returned to van/godown, and price adjustments.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Total Credit Value</span>
            <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
              {company.currencySymbol} {totalCreditAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={() => openVoucherModal({ initialType: 'credit_note' })}
            className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Credit Note</span>
          </button>
        </div>
      </div>

      {/* Territory Isolation Notice for Field Rep */}
      {isSalesman && (
        <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Territory Isolation Active:</strong> Viewing sales return notes issued strictly on <strong>Van 01 ({currentUser?.name})</strong>.
            </span>
          </div>
          <span className="font-mono text-[11px] bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded font-semibold">
            {filtered.length} Notes
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
            placeholder="Search by credit note number, customer, or reason..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[980px]">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              <tr className="whitespace-nowrap">
                <th className="py-3 px-4 w-28 whitespace-nowrap">Date</th>
                <th className="py-3 px-4 w-36 whitespace-nowrap">Credit Note #</th>
                <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Customer Party</th>
                <th className="py-3 px-4 min-w-[180px] whitespace-nowrap">Returned to Location</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Issued By</th>
                <th className="py-3 px-4 min-w-[220px] whitespace-nowrap">Reason / Narration</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Tax Reversal ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Credit Amount ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-center w-20 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 dark:text-slate-500">
                    <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No credit notes found for this scope.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{v.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">{v.voucherNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{v.partyName}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{v.locationName}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{v.createdByName || 'Sales Rep'}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">{v.narration}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {v.taxTotal !== undefined ? v.taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-700 dark:text-rose-400 text-sm whitespace-nowrap">
                      {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setInvoiceToView(v)}
                        className="px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded font-medium flex items-center gap-1 mx-auto transition-colors"
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
