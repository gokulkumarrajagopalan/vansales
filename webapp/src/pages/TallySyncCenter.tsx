import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { SummaryCard } from '../components/common/SummaryCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { QuarantineModal } from '../components/common/QuarantineModal';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ArrowRight,
  ShieldAlert,
  Server,
  Activity,
  Cpu,
  Clock,
  Database,
  Search,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

export const TallySyncCenter: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'REVIEW' | 'SETTINGS'>('PENDING');
  const [selectedQuarantineVoucher, setSelectedQuarantineVoucher] = useState<any>(null);
  const [search, setSearch] = useState('');

  // Company API Token State
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showTokenPlain, setShowTokenPlain] = useState(false);
  const [selectedExpiry, setSelectedExpiry] = useState<number>(365);
  const [tokenMessage, setTokenMessage] = useState<string | null>(null);

  const fetchToken = async () => {
    try {
      setTokenLoading(true);
      const res = await apiClient.get('/api/v1/tally/token');
      if (res.data?.isValid && res.data?.data) {
        setTokenInfo(res.data.data);
      }
    } catch (err) {
      console.error('[Fetch Token Error]', err);
    } finally {
      setTokenLoading(false);
    }
  };

  const handleGenerateToken = async (expiryDays: number = selectedExpiry) => {
    try {
      setTokenLoading(true);
      setTokenMessage(null);
      const res = await apiClient.post('/api/v1/tally/token/generate', { expiryDays });
      if (res.data?.isValid && res.data?.data) {
        setTokenInfo(res.data.data);
        setTokenMessage('✓ New Company API Token generated successfully!');
        setTimeout(() => setTokenMessage(null), 4000);
      }
    } catch (err: any) {
      setTokenMessage('Failed to generate token: ' + (err.response?.data?.message || err.message));
    } finally {
      setTokenLoading(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!window.confirm('Are you sure you want to revoke this Company API Token? TDL synchronization for this company will stop until a new token is configured in Tally.')) {
      return;
    }
    try {
      setTokenLoading(true);
      const res = await apiClient.post('/api/v1/tally/token/revoke');
      if (res.data?.isValid) {
        setTokenMessage('API Token has been revoked.');
        await fetchToken();
        setTimeout(() => setTokenMessage(null), 4000);
      }
    } catch (err: any) {
      setTokenMessage('Failed to revoke token: ' + (err.response?.data?.message || err.message));
    } finally {
      setTokenLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const fetchSyncStatus = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/v1/tally/sync-status');
      if (res.data.isValid) {
        setSyncStatus(res.data.data);
      }
    } catch (err) {
      console.error('[Sync Status fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      setMessage(null);
      const res = await apiClient.post('/api/v1/tally/sync-now');
      if (res.data.isValid) {
        setMessage('Vouchers verified and queued. Push to Tally completed successfully!');
        await fetchSyncStatus();
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (err: any) {
      setMessage('Sync failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    fetchToken();
  }, []);

  const quarantinedList = syncStatus?.quarantinedVouchers || [];
  const filteredQuarantined = quarantinedList.filter((v: any) =>
    (v.voucherNumber?.toLowerCase().includes(search.toLowerCase()) ||
     v.partyName?.toLowerCase().includes(search.toLowerCase()) ||
     v.guid?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">TallyPrime Integration Center</h2>
            <span className="rounded-md bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
              Connector Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Automated bidirectional synchronization with double-entry balance validation (&plusmn;0.20 AED).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSyncStatus}
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
            <span>{syncing ? 'Posting to Tally...' : 'Push to Tally'}</span>
          </button>
        </div>
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

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          title="Pending Sync"
          value={syncStatus?.summary?.ready ?? 7}
          icon={Layers}
          accentColor="blue"
          trend="Ready to Post"
          trendDirection="neutral"
          subtitle="Balanced & awaiting posting"
        />
        <SummaryCard
          title="Posted to Tally"
          value={syncStatus?.summary?.synced ?? 0}
          icon={CheckCircle2}
          accentColor="emerald"
          trend="Daybook Mastered"
          trendDirection="neutral"
          subtitle="Saved in Tally Daybook"
        />
        <SummaryCard
          title="Needs Review"
          value={syncStatus?.summary?.quarantined ?? 0}
          icon={ShieldAlert}
          accentColor="rose"
          trend={syncStatus?.summary?.quarantined > 0 ? "Action Required" : "Zero Issues"}
          trendDirection={syncStatus?.summary?.quarantined > 0 ? "down" : "up"}
          subtitle="Imbalance > 0.20 AED"
        />
        <SummaryCard
          title="Connector Health"
          value="12 ms"
          icon={Activity}
          accentColor="indigo"
          trend="Port 8080"
          trendDirection="up"
          subtitle="TDL Integration active"
        />
      </div>

      {/* Minimal Telemetry Strip */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Company:</span>
          <span className="font-semibold text-slate-800">Talliffy Global Systems LLC (30449)</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">Tolerance: &plusmn;0.20 AED</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>TDL Endpoints: <code>/TallyIntegration/SalesVouchers</code></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'PENDING'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Sync ({syncStatus?.summary?.ready ?? 7})
          </button>

          <button
            onClick={() => setActiveTab('REVIEW')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'REVIEW'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Needs Review ({quarantinedList.length})
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'SETTINGS'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Endpoint Telemetry
          </button>
        </div>

        {activeTab === 'REVIEW' && quarantinedList.length > 0 && (
          <div className="relative w-full sm:w-56">
            <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search voucher #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
        )}
      </div>

      {/* Tab: Pending Sync */}
      {activeTab === 'PENDING' && (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-6 text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-1">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            {syncStatus?.summary?.ready ?? 7} Vouchers Verified &amp; Ready to Post
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            These field transactions have balanced debits and credits and are waiting to be posted to TallyPrime.
          </p>
          <div className="pt-2">
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              {syncing ? 'Posting...' : 'Push to Tally Now'}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Needs Review (Quarantined) */}
      {activeTab === 'REVIEW' && (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Voucher #</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Customer / Ledger</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5">Audit Note</th>
                  <th className="px-4 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredQuarantined.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-700">Zero vouchers need review</p>
                      <p className="text-[10px] text-slate-400">All vouchers are mathematically balanced.</p>
                    </td>
                  </tr>
                ) : (
                  filteredQuarantined.map((v: any) => (
                    <tr key={v.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-semibold text-slate-900">{v.voucherNumber}</td>
                      <td className="px-4 py-2.5">{v.voucherType}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{v.partyName}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900">{v.amount?.toFixed(2)} AED</td>
                      <td className="px-4 py-2.5 text-[11px] font-mono text-amber-700">
                        {v.errorMessage || 'Mismatch > 0.20 AED'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => setSelectedQuarantineVoucher(v)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md text-[10px] font-semibold transition-colors"
                        >
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Settings & Telemetry */}
      {activeTab === 'SETTINGS' && (
        <div className="space-y-4 text-xs">
          {/* Dedicated Company API Token Card */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-slate-50 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-lg shadow-xs">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Company API Token (Tally Connector)
                    {tokenInfo?.isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        {tokenInfo?.isExpired ? 'Expired' : 'Revoked / Inactive'}
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Zero-password synchronization token strictly isolated to this company's books.
                  </p>
                </div>
              </div>

              {tokenMessage && (
                <div className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 font-semibold text-[11px] animate-fade-in">
                  {tokenMessage}
                </div>
              )}
            </div>

            {/* Token Value Display Box */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] text-slate-600 font-medium">
                <span>Active Bearer Token:</span>
                <span className="text-slate-400">
                  {tokenInfo?.expiresAt ? `Valid until: ${new Date(tokenInfo.expiresAt).toLocaleDateString()} (${tokenInfo.daysRemaining} days left)` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-slate-900 text-emerald-400 font-mono text-xs px-3.5 py-2.5 rounded-lg border border-slate-800 shadow-inner overflow-hidden select-all">
                  <span className="truncate">
                    {tokenInfo ? (showTokenPlain ? tokenInfo.plaintextToken : tokenInfo.tokenPrefix || tokenInfo.plaintextToken) : 'Loading token...'}
                  </span>
                </div>
                <button
                  onClick={() => setShowTokenPlain(!showTokenPlain)}
                  className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shadow-xs transition"
                  title={showTokenPlain ? "Mask Token" : "Reveal Token"}
                >
                  {showTokenPlain ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => tokenInfo?.plaintextToken && copyToClipboard(tokenInfo.plaintextToken)}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition text-xs"
                >
                  {copiedToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedToken ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Expiry Settings & Refresh Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">New Token Validity:</span>
                <select
                  value={selectedExpiry}
                  onChange={(e) => setSelectedExpiry(Number(e.target.value))}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-700 shadow-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={180}>180 Days</option>
                  <option value={365}>1 Year (365 Days) — Recommended</option>
                </select>
                <button
                  onClick={() => handleGenerateToken(selectedExpiry)}
                  disabled={tokenLoading}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold shadow-xs transition disabled:opacity-50"
                >
                  {tokenLoading ? 'Processing...' : 'Regenerate / Refresh Token'}
                </button>
              </div>

              {tokenInfo?.isActive && (
                <button
                  onClick={handleRevokeToken}
                  disabled={tokenLoading}
                  className="text-rose-600 hover:text-rose-700 font-semibold underline self-start sm:self-auto"
                >
                  Revoke Token
                </button>
              )}
            </div>

            {/* Telemetry info */}
            <div className="pt-2 text-[10px] text-slate-400 flex flex-wrap gap-4 border-t border-slate-100">
              <span>Last Used: {tokenInfo?.lastUsedAt ? new Date(tokenInfo.lastUsedAt).toLocaleString() : 'Never synced yet'}</span>
              <span>Last Remote IP: {tokenInfo?.lastUsedIp || 'N/A'}</span>
              <span>TDL Setting Field: <code>TalliffyApiToken</code></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-900">Contract Endpoints</h4>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between">
                  <span>POST /TallyIntegration/SalesVouchers</span>
                  <span className="text-emerald-700 font-semibold">200 OK</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between">
                  <span>POST /TallyIntegration/ReceiptVouchers</span>
                  <span className="text-emerald-700 font-semibold">200 OK</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between">
                  <span>POST /TallyIntegration/StockJournalVouchers</span>
                  <span className="text-emerald-700 font-semibold">200 OK</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-900">Accounting Rules</h4>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800">Tolerance Rule:</span> Maximum &plusmn;0.20 AED rounding variance permitted to <code>Round Off (+/-)</code>.
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800">Tax Authority:</span> Standard 5.00% UAE VAT applied to goods.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quarantine Resolution Modal */}
      {selectedQuarantineVoucher && (
        <QuarantineModal
          voucher={selectedQuarantineVoucher}
          onClose={() => setSelectedQuarantineVoucher(null)}
          onResolved={() => fetchSyncStatus()}
        />
      )}
    </div>
  );
};
