import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { Plus, Search, Eye, Truck, FileText, Download, Filter, Shield, RefreshCw, UploadCloud, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { exportVoucherPdf } from '../../utils/pdfExport';

export const SalesInvoicesView: React.FC = () => {
  const {
    vouchers,
    company,
    openVoucherModal,
    setInvoiceToView,
    setCurrentView,
    customers,
    items,
    currentUser,
    themeColor,
    isVoucherAccessible,
    isSyncingBackend,
    backendSyncError,
    syncFromBackend,
    postAllInvoicesToBackend,
  } = useErp();

  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'loc_van1' | 'loc_van2' | 'loc_main'>('all');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handlePostAll = async () => {
    const res = await postAllInvoicesToBackend();
    setSyncNotice(
      `Posted ${res.postedInvoices} invoice(s), ${res.postedReceipts} receipt(s) · Fetched ${res.fetchedInvoices} invoice(s) from Backend${res.failed > 0 ? ` (${res.failed} failed)` : ''}`
    );
    setTimeout(() => setSyncNotice(null), 5000);
  };

  const handleFetchBackend = async () => {
    const res = await syncFromBackend();
    if (res.error) {
      setSyncNotice(`Sync failed: ${res.error}`);
    } else {
      setSyncNotice(`Retrieved ${res.fetchedInvoices} invoice(s) & ${res.fetchedReceipts} receipt(s) from Backend API`);
    }
    setTimeout(() => setSyncNotice(null), 4500);
  };

  const isSalesman = currentUser?.role === 'salesman_pos';

  // Base sales vouchers filtered by RBAC
  const roleSalesVouchers = useMemo(() => {
    return vouchers.filter(v => {
      if (v.voucherType !== 'sales') return false;
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
    return roleSalesVouchers.filter(v => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        v.voucherNumber.toLowerCase().includes(q) ||
        (v.partyName && v.partyName.toLowerCase().includes(q)) ||
        (v.referenceNumber && v.referenceNumber.toLowerCase().includes(q)) ||
        (v.locationName && v.locationName.toLowerCase().includes(q))
      );
    });
  }, [roleSalesVouchers, search]);

  const totalSales = filtered.reduce((sum, v) => sum + v.totalAmount, 0);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Sales Invoices &amp; POS Register</h1>
            {isSalesman ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Van Territory Isolated</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Enterprise Billing Hub</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSalesman
              ? `Displaying sales invoices created by your van (${currentUser?.name}). Dispatches from other vans are hidden.`
              : 'Spot van sales, wholesale orders, tax invoices with automatic stock deduction and GL postings.'}
          </p>
        </div>
      </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePostAll}
            disabled={isSyncingBackend}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-60"
            title="Post all accessible local sales invoices & receipts to Backend DB"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Post All to Backend</span>
          </button>
          <button
            onClick={handleFetchBackend}
            disabled={isSyncingBackend}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-60"
            title="Fetch latest invoices from Backend DB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBackend ? 'animate-spin' : ''}`} />
            <span>Sync from Backend</span>
          </button>
          <button
            onClick={() => openVoucherModal({ initialType: 'sales' })}
            className="px-4 py-2 text-xs font-semibold text-white rounded-xl flex items-center gap-2 shadow-sm transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: themeColor }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Sales Invoice (F8)</span>
          </button>
        </div>
      </div>

      {/* Sync Result Notification */}
      {(syncNotice || backendSyncError) && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            backendSyncError && !syncNotice
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          {backendSyncError && !syncNotice ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span className="font-medium">{syncNotice || backendSyncError}</span>
        </div>
      )}

      {/* Role Notice Banner for Sales Rep */}
      {isSalesman && (
        <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 transition-colors">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Territory Filter Active:</strong> Viewing sales invoices generated by <strong>{currentUser?.name}</strong>. Invoices created by other van drivers are hidden.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800">
            {filtered.length} Invoices
          </span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search invoice #, customer name, ref..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vans &amp; Warehouses</option>
                <option value="loc_van1">Van 01 · John (KA-01-EA-1024)</option>
                <option value="loc_van2">Van 02 · David (KA-04-MB-4890)</option>
                <option value="loc_main">Central Main Warehouse</option>
              </select>
            </div>
          )}

          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {isSalesman ? 'Your Van Sales Total:' : 'Total Invoiced:'}{' '}
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {company.currencySymbol} {totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                <th className="py-3 px-4 w-28">Invoice Date</th>
                <th className="py-3 px-4 w-32">Invoice Number</th>
                <th className="py-3 px-4">Customer Party</th>
                <th className="py-3 px-4">Fulfilled From (Location)</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Tax ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-right">Grand Total ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-sm font-medium">No sales invoices found</p>
                    <p className="text-xs mt-1">
                      {isSalesman
                        ? 'No sales invoices have been issued from your van yet. Click "+ Create Sales Invoice" to issue one.'
                        : 'No matching records for the selected filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{v.date}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">{v.voucherNumber}</span>
                      <div className="mt-1 flex items-center gap-1 flex-wrap">
                        {v.backendId ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            DB #{v.backendId} · {v.source || 'WEB_APP'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Local Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{v.partyName || 'Cash Sale'}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-xs block">{v.narration}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        {v.vehicleId ? (
                          <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="text-[11.5px]">{v.locationName || 'Central Warehouse'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{v.referenceNumber || '-'}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      {v.taxTotal !== undefined ? v.taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {v.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setInvoiceToView(v)}
                          className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg font-medium flex items-center gap-1 transition"
                          title="View & Print Tax Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => {
                            const cust = customers.find(c => c.id === v.partyId);
                            exportVoucherPdf(company, v, cust, v.locationName, items);
                          }}
                          className="px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg font-medium flex items-center gap-1 transition"
                          title="Download PDF with Company Letterhead"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
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
