import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { SummaryCard } from '../components/common/SummaryCard';
import { 
  FileSpreadsheet, 
  Save, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Percent, 
  Sparkles, 
  Building2, 
  RefreshCw 
} from 'lucide-react';

export const LedgerMapping: React.FC = () => {
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'SALES' | 'TAX' | 'CASH' | 'ROUND'>('ALL');

  const fetchMappings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/v1/tally/mappings');
      if (res.data.isValid) {
        setMappings(res.data.data.mappings || []);
      }
    } catch (err) {
      console.error('[Fetch Mappings Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (mappingKey: string, tallyLedgerName: string, description: string) => {
    try {
      setSavingKey(mappingKey);
      const res = await apiClient.put('/api/v1/tally/mappings', {
        mappingKey,
        tallyLedgerName,
        description,
      });
      if (res.data.isValid) {
        setMessage(`Mapped "${mappingKey}" -> "${tallyLedgerName}" in Tally!`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      setMessage('Update failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingKey(null);
    }
  };

  const handleChange = (key: string, field: string, value: string) => {
    setMappings(prev =>
      prev.map(m => (m.mapping_key === key ? { ...m, [field]: value } : m))
    );
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  const filteredMappings = mappings.filter(m => {
    const matchesSearch = 
      m.mapping_key.toLowerCase().includes(search.toLowerCase()) ||
      m.tally_ledger_name.toLowerCase().includes(search.toLowerCase()) ||
      (m.description || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'SALES') return m.mapping_key.includes('SALES');
    if (selectedCategory === 'TAX') return m.mapping_key.includes('VAT') || m.mapping_key.includes('TAX');
    if (selectedCategory === 'CASH') return m.mapping_key.includes('CASH') || m.mapping_key.includes('BANK');
    if (selectedCategory === 'ROUND') return m.mapping_key.includes('ROUND');
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Tally Chart of Accounts Mapping</h2>
            <span className="rounded-md bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
              Balanced Rules
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Map mobile operational keys to official Tally Chart of Accounts for clean double-entry posting.
          </p>
        </div>

        <button
          onClick={fetchMappings}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium shadow-xs transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200/80 text-emerald-900 rounded-lg text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-emerald-500 hover:text-emerald-700 font-bold px-1">✕</button>
        </div>
      )}

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          title="Mapped Accounts"
          value={mappings.length}
          icon={BookOpen}
          accentColor="blue"
          trend="100% Configured"
          trendDirection="neutral"
          subtitle="Tally accounts"
        />
        <SummaryCard
          title="VAT Ledger"
          value="5% Standard"
          icon={Percent}
          accentColor="emerald"
          trend="Output VAT 5%"
          trendDirection="neutral"
          subtitle="Duties & Taxes"
        />
        <SummaryCard
          title="Rounding Ledger"
          value="±0.20 AED"
          icon={Sparkles}
          accentColor="purple"
          trend="Round Off (+/-)"
          trendDirection="neutral"
          subtitle="Balancing account"
        />
        <SummaryCard
          title="Tally Company"
          value="30449"
          icon={Building2}
          accentColor="amber"
          trend="Talliffy Systems"
          trendDirection="neutral"
          subtitle="Active database"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'SALES', 'TAX', 'CASH', 'ROUND'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'ALL' ? 'All Accounts' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search operational key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1 rounded-lg border border-slate-200/80 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {/* Ledger Matrix Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2.5">Operational Key</th>
                <th className="px-4 py-2.5">Tally Chart of Accounts Target</th>
                <th className="px-4 py-2.5">Rule / Impact</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredMappings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No account mappings match search.
                  </td>
                </tr>
              ) : (
                filteredMappings.map((m) => (
                  <tr key={m.mapping_key} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="font-mono font-semibold text-blue-700 bg-blue-50/70 px-1.5 py-0.5 rounded text-[11px]">
                        {m.mapping_key}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={m.tally_ledger_name}
                        onChange={(e) => handleChange(m.mapping_key, 'tally_ledger_name', e.target.value)}
                        className="w-full max-w-xs px-2.5 py-1 border border-slate-200/80 rounded-md text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                        m.mapping_key.includes('SALES') || m.mapping_key.includes('VAT')
                          ? 'bg-emerald-50 text-emerald-700'
                          : m.mapping_key.includes('CASH') || m.mapping_key.includes('BANK')
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}>
                        {m.mapping_key.includes('SALES') ? 'Credit (Revenue)' :
                         m.mapping_key.includes('VAT') ? 'Credit (Liability)' :
                         m.mapping_key.includes('CASH') ? 'Debit (Asset)' :
                         m.mapping_key.includes('ROUND') ? 'Balancing (±0.20)' : 'Ledger Line'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-[11px]">
                      {m.description || 'System ledger'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleUpdate(m.mapping_key, m.tally_ledger_name, m.description)}
                        disabled={savingKey === m.mapping_key}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[11px] font-medium transition-colors"
                      >
                        <Save className="h-3 w-3" />
                        <span>{savingKey === m.mapping_key ? 'Saving...' : 'Save'}</span>
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
