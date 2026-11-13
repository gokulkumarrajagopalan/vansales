import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { SummaryCard } from '../components/common/SummaryCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Receipt, 
  Search, 
  CheckCircle2, 
  DollarSign, 
  Building2, 
  RefreshCw 
} from 'lucide-react';

export const Receipts: React.FC = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMode, setSelectedMode] = useState<'ALL' | 'Cash' | 'Cheque' | 'Bank'>('ALL');

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/v1/receipts?limit=100');
      if (res.data.isValid) {
        setReceipts(res.data.data.receipts || []);
      }
    } catch (err) {
      console.error('[Fetch Receipts Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    let result = receipts;
    if (selectedMode !== 'ALL') {
      result = result.filter(r => r.paymentMode === selectedMode);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => 
        r.receiptNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        (r.narration || '').toLowerCase().includes(q)
      );
    }
    setFilteredReceipts(result);
  }, [receipts, selectedMode, search]);

  const totalCollected = receipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const cashCollected = receipts.filter(r => r.paymentMode === 'Cash').reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const chequeCollected = receipts.filter(r => r.paymentMode === 'Cheque').reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Payment Collections &amp; Receipts</h2>
            <span className="rounded-md bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
              Receipt Vouchers
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Cash and cheque payments collected on route by field sales reps credited to customer ledgers in Tally.
          </p>
        </div>

        <button
          onClick={fetchReceipts}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium shadow-xs transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          title="Total Collections"
          value={`${totalCollected.toFixed(2)} AED`}
          icon={Receipt}
          accentColor="emerald"
          trend="Field Funds"
          trendDirection="up"
          subtitle="Total cash & cheques"
        />
        <SummaryCard
          title="Cash in Hand"
          value={`${cashCollected.toFixed(2)} AED`}
          icon={DollarSign}
          accentColor="blue"
          trend="Van Safe Float"
          trendDirection="neutral"
          subtitle="Physical cash"
        />
        <SummaryCard
          title="Cheques & Bank"
          value={`${chequeCollected.toFixed(2)} AED`}
          icon={Building2}
          accentColor="purple"
          trend="Pending Clearing"
          trendDirection="neutral"
          subtitle="Bank deposits"
        />
        <SummaryCard
          title="Total Receipts"
          value={receipts.length}
          icon={CheckCircle2}
          accentColor="indigo"
          trend="Balanced"
          trendDirection="neutral"
          subtitle="Receipts issued"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1">
          {(['ALL', 'Cash', 'Cheque', 'Bank'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedMode === mode
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {mode === 'ALL' ? 'All Payments' : mode}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search receipt #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1 rounded-lg border border-slate-200/80 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* Collections Register Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2.5">Receipt #</th>
                <th className="px-4 py-2.5">Customer / Debtor</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Mode</th>
                <th className="px-4 py-2.5 text-right">Collected Amount</th>
                <th className="px-4 py-2.5">Narration / Cheque #</th>
                <th className="px-4 py-2.5 text-center">Tally Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No payment collections found.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rct) => (
                  <tr key={rct.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-semibold text-emerald-700">
                      {rct.receiptNumber}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      {rct.customerName}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {new Date(rct.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] font-mono text-slate-500">
                      {rct.paymentMode}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-700">
                      {Number(rct.amount).toFixed(2)} AED
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate text-[11px]">
                      {rct.narration || 'On account payment against outstanding bills'}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status="SYNCED" size="sm" />
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
