import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { SummaryCard } from '../components/common/SummaryCard';
import { 
  Layers, 
  Warehouse, 
  Package, 
  Search, 
  RefreshCw, 
  Truck, 
  Tag, 
  Percent 
} from 'lucide-react';

export const StockGodowns: React.FC = () => {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/v1/stock/van-stock');
      if (res.data.isValid) {
        setStockItems(res.data.data.items || []);
      }
    } catch (err) {
      console.error('[Fetch Stock Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(stockItems.map(i => i.category || 'General Goods')))];

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (categoryFilter !== 'ALL' && (item.category || 'General Goods') !== categoryFilter) return false;
    return true;
  });

  const totalQuantity = stockItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalStockValuation = stockItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Inventory &amp; Van Stock Directory</h2>
            <span className="rounded-md bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
              Multi-Godown Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Warehouse godowns and mobile van stocks synchronized with Tally stock items.
          </p>
        </div>

        <button
          onClick={fetchStockData}
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
          title="Catalog SKUs"
          value={stockItems.length}
          icon={Package}
          accentColor="blue"
          trend="Active"
          trendDirection="neutral"
          subtitle="Tally stock items"
        />
        <SummaryCard
          title="Van Stock"
          value={`${totalQuantity} Units`}
          icon={Truck}
          accentColor="emerald"
          trend="On Van 01"
          trendDirection="neutral"
          subtitle="Mobile inventory"
        />
        <SummaryCard
          title="Stock Valuation"
          value={`${totalStockValuation.toFixed(2)} AED`}
          icon={Layers}
          accentColor="purple"
          trend="Selling Price"
          trendDirection="neutral"
          subtitle="Current load"
        />
        <SummaryCard
          title="Standard VAT"
          value="5.00%"
          icon={Percent}
          accentColor="amber"
          trend="All Items"
          trendDirection="neutral"
          subtitle="UAE tax rate"
        />
      </div>

      {/* Godowns Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Warehouse className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900">Main Distribution Warehouse</h4>
              <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">Central</span>
            </div>
            <p className="text-[11px] text-slate-400">Main Location • Bulk depot replenishment</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900">Van 01 Mobile Godown</h4>
              <span className="text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                Active Route
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Assigned to Ahmed Al Mansoori (Rep)</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'ALL' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search stock item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1 rounded-lg border border-slate-200/80 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {/* Stock Catalog Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2.5">Stock Item Name</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5 text-center">Unit</th>
                <th className="px-4 py-2.5 text-right">Van Stock</th>
                <th className="px-4 py-2.5 text-right">Unit Price</th>
                <th className="px-4 py-2.5 text-center">VAT</th>
                <th className="px-4 py-2.5 text-right">Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No stock items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const qty = Number(item.quantity || 0);
                  const price = Number(item.price || 0);
                  const val = qty * price;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono">SKU #{item.id}</div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {item.category || 'General'}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono text-[11px] text-slate-600">
                        {item.unit || 'PCS'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          qty > 0 ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400'
                        }`}>
                          {qty}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                        {price.toFixed(2)} AED
                      </td>
                      <td className="px-4 py-2.5 text-center text-[10px] text-slate-500">
                        5.00%
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                        {val.toFixed(2)} AED
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
