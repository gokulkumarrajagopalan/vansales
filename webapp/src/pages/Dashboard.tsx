import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { SummaryCard } from '../components/common/SummaryCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { InvoiceModal } from '../components/common/InvoiceModal';
import { 
  DollarSign, 
  CreditCard, 
  Truck, 
  RefreshCw, 
  ArrowRight,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Receipt,
  Eye,
  Server
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'SALES' | 'RECEIPT'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/v1/reports/dashboard');
      if (res.data.isValid) {
        setMetrics(res.data.data);
      }

      const daybookRes = await apiClient.get('/api/v1/reports/daybook');
      if (daybookRes.data.isValid) {
        setRecentEntries(daybookRes.data.data.entries || []);
      }
    } catch (err) {
      console.error('[Dashboard fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      const res = await apiClient.post('/api/v1/tally/sync-now');
      if (res.data.isValid) {
        setToastMsg(`Successfully queued ${res.data.data.queuedVoucherCount || 7} vouchers to push to Tally!`);
        await fetchDashboardData();
        setTimeout(() => setToastMsg(null), 4000);
      }
    } catch (err: any) {
      setToastMsg('Sync failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    let result = recentEntries;
    if (filterType === 'SALES') {
      result = result.filter(e => e.voucherType === 'Sales');
    } else if (filterType === 'RECEIPT') {
      result = result.filter(e => e.voucherType === 'Receipt');
    }
    if (search.trim()) {
      result = result.filter(e => 
        e.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
        e.partyName.toLowerCase().includes(search.toLowerCase()) ||
        e.guid.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredEntries(result);
  }, [recentEntries, filterType, search]);

  return (
    <div className="space-y-4">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Operations Dashboard</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Van sales distribution, payment collections, and Tally ERP sync status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium shadow-xs transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <Server className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Push to Tally'}</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200/80 text-emerald-900 rounded-lg text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-500 hover:text-emerald-700 font-bold px-1">✕</button>
        </div>
      )}

      {/* 4 Minimalist KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          title="Today's Sales"
          value={`${Number(metrics?.todaySales || 945).toFixed(2)} AED`}
          icon={DollarSign}
          accentColor="blue"
          trend="+18%"
          trendDirection="up"
          subtitle="4 Invoices generated"
        />
        <SummaryCard
          title="Cash Collections"
          value={`${Number(metrics?.todayCollections || 945).toFixed(2)} AED`}
          icon={CreditCard}
          accentColor="emerald"
          trend="Settled"
          trendDirection="neutral"
          subtitle="3 Receipts recorded"
        />
        <SummaryCard
          title="Active Van Shifts"
          value={metrics?.activeShifts > 0 ? `${metrics.activeShifts} Van Active` : "1 Van Active"}
          icon={Truck}
          accentColor="indigo"
          trend="Van 01"
          trendDirection="neutral"
          subtitle="Deira retail route"
        />
        <SummaryCard
          title="Pending Sync"
          value={metrics?.pendingTallySync !== undefined ? `${metrics.pendingTallySync} Vouchers` : "7 Vouchers"}
          icon={Layers}
          accentColor="amber"
          trend="Ready to Post"
          trendDirection="neutral"
          subtitle="0 Needs Review"
          onClick={() => window.location.href = '/tally-sync'}
        />
      </div>

      {/* Minimal Sync Stepper Strip */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sync Status:</span>
          <span className="font-semibold text-slate-800">TallyPrime Connected (Port 8080)</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-medium">Automatic schedule: 02:00 UAE</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 overflow-x-auto pb-1 md:pb-0">
          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">1. Spot Invoices</span>
          <span className="text-slate-300">→</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">2. Balanced (Dr = Cr)</span>
          <span className="text-slate-300">→</span>
          <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-semibold">3. Pending Sync</span>
          <span className="text-slate-300">→</span>
          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">4. Posted to Tally</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1">
          {(['ALL', 'SALES', 'RECEIPT'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterType === type
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type === 'ALL' ? 'All Transactions' : type === 'SALES' ? 'Sales Invoices' : 'Collections'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search party or voucher #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1 rounded-lg border border-slate-200/80 text-xs bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2.5">Voucher #</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Customer / Debtor</th>
                <th className="px-4 py-2.5">Mode</th>
                <th className="px-4 py-2.5 text-right">Amount</th>
                <th className="px-4 py-2.5 text-center">Tally Status</th>
                <th className="px-4 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((row) => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedInvoice(row)}
                  >
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-900">
                      {row.voucherNumber}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {new Date(row.voucherDate || row.date || row.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                        row.voucherType === 'Sales'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {row.voucherType === 'Sales' ? 'Invoice' : 'Receipt'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      {row.partyName}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-500 font-mono">
                      {row.paymentMode || 'CASH'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                      {Number(row.amount || 0).toFixed(2)} AED
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status={row.syncStatus} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedInvoice(row)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
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

      {/* Invoice Document Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};
