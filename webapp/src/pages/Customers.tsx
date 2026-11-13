import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { SummaryCard } from '../components/common/SummaryCard';
import { 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  FileCheck, 
  DollarSign, 
  Building2, 
  RefreshCw, 
  CreditCard 
} from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'ALL' | 'DUE' | 'ZERO'>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async (query = '') => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/v1/customers?limit=100&search=${encodeURIComponent(query)}`);
      if (res.data.isValid) {
        setCustomers(res.data.data.customers || []);
      }
    } catch (err) {
      console.error('[Fetch Customers Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search);
  }, [search]);

  useEffect(() => {
    let result = customers;
    if (balanceFilter === 'DUE') {
      result = result.filter(c => Number(c.balance) > 0);
    } else if (balanceFilter === 'ZERO') {
      result = result.filter(c => Number(c.balance) <= 0);
    }
    setFilteredCustomers(result);
  }, [customers, balanceFilter]);

  const totalOutstanding = customers.reduce((sum, c) => sum + Number(c.balance || 0), 0);
  const vatCount = customers.filter(c => c.trn && c.trn.length > 5).length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Debtors &amp; Customer Directory</h2>
            <span className="rounded-md bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
              Sundry Debtors
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Accounts synced directly with Tally Sundry Debtors ledger with credit limits and outstanding receivables.
          </p>
        </div>

        <button
          onClick={() => fetchCustomers(search)}
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
          title="Active Debtors"
          value={customers.length}
          icon={Users}
          accentColor="blue"
          trend="Tally Mastered"
          trendDirection="neutral"
          subtitle="Sundry Debtors"
        />
        <SummaryCard
          title="Total Receivables"
          value={`${totalOutstanding.toFixed(2)} AED`}
          icon={DollarSign}
          accentColor="rose"
          trend="Outstanding"
          trendDirection="neutral"
          subtitle="Customer balances"
        />
        <SummaryCard
          title="TRN Registered"
          value={`${vatCount}/${customers.length}`}
          icon={FileCheck}
          accentColor="emerald"
          trend={`${Math.round((vatCount / (customers.length || 1)) * 100)}%`}
          trendDirection="up"
          subtitle="Tax compliant"
        />
        <SummaryCard
          title="Standard Terms"
          value="30 Days"
          icon={CreditCard}
          accentColor="purple"
          trend="50K Limit"
          trendDirection="neutral"
          subtitle="Default credit"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1">
          {(['ALL', 'DUE', 'ZERO'] as const).map(f => (
            <button
              key={f}
              onClick={() => setBalanceFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                balanceFilter === f
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f === 'ALL' ? 'All Customers' : f === 'DUE' ? 'Balance Due' : 'Zero Balance'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search by name, TRN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1 rounded-lg border border-slate-200/80 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {/* Customers Master Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2.5">Customer / Business Name</th>
                <th className="px-4 py-2.5">UAE TRN</th>
                <th className="px-4 py-2.5">Contact</th>
                <th className="px-4 py-2.5">Territory</th>
                <th className="px-4 py-2.5 text-right">Credit Limit</th>
                <th className="px-4 py-2.5 text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No customer records found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const creditLimit = 50000;
                  const ratio = Math.min(100, Math.round((Number(c.balance || 0) / creditLimit) * 100));
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono">Ledger #{c.id}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        {c.trn ? (
                          <span className="font-mono text-[11px] text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                            {c.trn}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Unregistered</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-slate-600">
                        {c.phone || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-slate-500 max-w-xs truncate">
                        {c.address || 'Dubai, UAE'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="w-20 ml-auto space-y-0.5">
                          <div className="text-[9px] text-slate-400 font-mono">50K AED</div>
                          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                ratio > 80 ? 'bg-rose-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${Math.max(5, ratio)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                        {Number(c.balance || 0).toFixed(2)} AED
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
