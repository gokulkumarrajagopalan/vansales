import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { Plus, CreditCard, Search, Eye, CheckCircle2, Truck, Shield, Filter, RefreshCw, UploadCloud, ArrowLeft } from 'lucide-react';

export const CollectPaymentView: React.FC = () => {
  const {
    vouchers,
    company,
    openVoucherModal,
    setInvoiceToView,
    setCurrentView,
    currentUser,
    isVoucherAccessible,
    isSyncingBackend,
    syncFromBackend,
    postAllInvoicesToBackend,
  } = useErp();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'loc_van1' | 'loc_van2' | 'loc_main'>('all');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleSync = async () => {
    const res = await postAllInvoicesToBackend();
    setSyncNotice(`Posted ${res.postedReceipts} receipt(s) · Retrieved ${res.fetchedReceipts} receipt(s) from Backend`);
    setTimeout(() => setSyncNotice(null), 4500);
  };

  const handleFetchOnly = async () => {
    const res = await syncFromBackend();
    setSyncNotice(res.error ? `Sync failed: ${res.error}` : `Retrieved ${res.fetchedReceipts} receipt(s) from Backend`);
    setTimeout(() => setSyncNotice(null), 4500);
  };

  const isSalesman = currentUser?.role === 'salesman_pos';

  // Base receipts filtered by role
  const roleReceipts = useMemo(() => {
    return vouchers.filter(v => {
      if (v.voucherType !== 'receipt') return false;
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
    return roleReceipts.filter(v => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        v.voucherNumber.toLowerCase().includes(q) ||
        (v.partyName && v.partyName.toLowerCase().includes(q)) ||
        (v.referenceNumber && v.referenceNumber.toLowerCase().includes(q)) ||
        (v.locationName && v.locationName.toLowerCase().includes(q))
      );
    });
  }, [roleReceipts, search]);

  const totalCollected = filtered.reduce((sum, v) => sum + v.totalAmount, 0);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('sales')}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Back to Sales Invoices"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Collect Customer Payment (Receipt Vouchers)</h1>
            {isSalesman ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Van Collections Isolated</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Enterprise Treasury Register</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSalesman
              ? `Showing payment receipts collected by ${currentUser?.name}. Cash & digital collections from other vans are hidden.`
              : 'Log cash collections, on-spot van payments, bank NEFT/UPI receipts, and allocate against outstanding invoices.'}
          </p>
        </div>
      </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSync}
            disabled={isSyncingBackend}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-60"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Post All &amp; Sync</span>
          </button>
          <button
            onClick={handleFetchOnly}
            disabled={isSyncingBackend}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBackend ? 'animate-spin' : ''}`} />
            <span>Refresh Backend</span>
          </button>
          <button
            onClick={() => openVoucherModal({ initialType: 'receipt' })}
            className="px-4 py-2 text-xs font-semibold text-white rounded-xl flex items-center gap-2 shadow-sm transition-all hover:brightness-110 active:scale-[0.98] bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Payment Receipt (F6)</span>
          </button>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{syncNotice}</span>
        </div>
      )}

      {/* Role Notice Banner for Sales Rep */}
      {isSalesman && (
        <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 transition-colors">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Territory Filter Active:</strong> Viewing payment receipts collected strictly by <strong>{currentUser?.name}</strong>. Collections made by other vans are hidden.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            {company.currencySymbol} {totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Collected
          </span>
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search receipt #, customer, reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-between sm:justify-end">
          {!isSalesman && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Vans &amp; Depots</option>
                <option value="loc_van1">Van 01 · John (KA-01-EA-1024)</option>
                <option value="loc_van2">Van 02 · David (KA-04-MB-4890)</option>
                <option value="loc_main">Central Office / Main Godown</option>
              </select>
            </div>
          )}

          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {isSalesman ? 'Amount You Collected:' : 'Total Collections in Register:'}{' '}
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
              {company.currencySymbol} {totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4 w-28">Receipt Date</th>
                <th className="py-3 px-4 w-32">Receipt #</th>
                <th className="py-3 px-4">Customer Party</th>
                <th className="py-3 px-4">Van / Godown Location</th>
                <th className="py-3 px-4">Deposited To / Collected Via</th>
                <th className="py-3 px-4">Reference / Mode</th>
                <th className="py-3 px-4">Allocated Bill</th>
                <th className="py-3 px-4 text-right">Amount Received ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-sm font-medium">No payment receipts found</p>
                    <p className="text-xs mt-1">
                      {isSalesman
                        ? 'No collections have been recorded on your van shift yet. Click "+ Record Payment Receipt" to collect cash or QR payment.'
                        : 'No matching receipts found for the selected filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map(v => {
                  const debitEntry = v.journalEntries.find(j => j.debit > 0);
                  const allocatedBill = v.allocatedBills && v.allocatedBills.length > 0 ? v.allocatedBills[0] : null;

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{v.date}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{v.voucherNumber}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{v.partyName}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-xs">{v.narration}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          {v.vehicleId ? (
                            <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="text-[11px]">{v.locationName || 'Central Warehouse'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {debitEntry?.ledgerName || 'Cash / Bank Account'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{v.referenceNumber || 'Cash Desk'}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {allocatedBill ? (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            Inv: {allocatedBill.voucherNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">On Account</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                        {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setInvoiceToView(v)}
                          className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg font-medium flex items-center gap-1 mx-auto transition"
                          title="View Receipt Voucher"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
