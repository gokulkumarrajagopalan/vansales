import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { SummaryCard } from '../components/common/SummaryCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { InvoiceModal } from '../components/common/InvoiceModal';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  DollarSign, 
  Percent, 
  Layers, 
  Eye, 
  RefreshCw 
} from 'lucide-react';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMode, setSelectedMode] = useState<'ALL' | 'Cash' | 'Credit'>('ALL');
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/v1/invoices?limit=100');
      if (res.data.isValid) {
        setInvoices(res.data.data.invoices || []);
      }
    } catch (err) {
      console.error('[Fetch Invoices Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    let result = invoices;
    if (selectedMode !== 'ALL') {
      result = result.filter(inv => inv.paymentMode === selectedMode);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.guid.toLowerCase().includes(q)
      );
    }
    setFilteredInvoices(result);
  }, [invoices, selectedMode, search]);

  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalVAT = invoices.reduce((sum, inv) => sum + (Number(inv.amount || 0) * 0.0476), 0);
  const syncedCount = invoices.filter(inv => inv.syncStatus === 'SYNCED').length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Spot Sales Invoices</h2>
            <span className="rounded-md bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
              UAE Tax Invoices
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Field invoices generated on mobile vans with 5% UAE VAT and double-entry ledger allocation.
          </p>
        </div>

        <button
          onClick={fetchInvoices}
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
          title="Total Invoices"
          value={invoices.length}
          icon={FileText}
          accentColor="blue"
          trend="Field Sales"
          trendDirection="neutral"
          subtitle="Mobile generated"
        />
        <SummaryCard
          title="Total Revenue"
          value={`${totalRevenue.toFixed(2)} AED`}
          icon={DollarSign}
          accentColor="emerald"
          trend="UAE Dirhams"
          trendDirection="up"
          subtitle="Gross sales volume"
        />
        <SummaryCard
          title="Output VAT (5%)"
          value={`${totalVAT.toFixed(2)} AED`}
          icon={Percent}
          accentColor="purple"
          trend="FTA Compliant"
          trendDirection="neutral"
          subtitle="Tax collected"
        />
        <SummaryCard
          title="Posted to Tally"
          value={`${syncedCount}/${invoices.length}`}
          icon={CheckCircle2}
          accentColor="indigo"
          trend={syncedCount === invoices.length ? "100%" : "Pending Sync"}
          trendDirection="neutral"
          subtitle="Tally Daybook"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1">
          {(['ALL', 'Cash', 'Credit'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedMode === mode
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {mode === 'ALL' ? 'All Invoices' : `${mode} Sales`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1 rounded-lg border border-slate-200/80 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {/* Invoices Register Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2.5">Invoice #</th>
                <th className="px-4 py-2.5">Customer / Debtor</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Mode</th>
                <th className="px-4 py-2.5 text-right">Net Amount</th>
                <th className="px-4 py-2.5 text-center">Tally Status</th>
                <th className="px-4 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => setPreviewInvoice({
                      ...inv,
                      voucherNumber: inv.invoiceNumber,
                      partyName: inv.customerName,
                      amount: Number(inv.amount),
                      vatAmount: Number(inv.amount) * 0.0476,
                      subTotal: Number(inv.amount) * 0.9524,
                    })}
                  >
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      {inv.customerName}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] font-mono text-slate-500">
                      {inv.paymentMode}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                      {Number(inv.amount).toFixed(2)} AED
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status={inv.syncStatus} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setPreviewInvoice({
                          ...inv,
                          voucherNumber: inv.invoiceNumber,
                          partyName: inv.customerName,
                          amount: Number(inv.amount),
                          vatAmount: Number(inv.amount) * 0.0476,
                          subTotal: Number(inv.amount) * 0.9524,
                        })}
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

      {/* Tax Invoice Document Preview Modal */}
      {previewInvoice && (
        <InvoiceModal
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
        />
      )}
    </div>
  );
};
