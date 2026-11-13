import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { SummaryCard } from '../components/common/SummaryCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Truck, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Gauge, 
  User, 
  RefreshCw 
} from 'lucide-react';

export const VanShifts: React.FC = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/v1/shifts/current');
      if (res.data.isValid && res.data.data?.shift) {
        setCurrentShift(res.data.data.shift);
        setShifts([res.data.data.shift]);
      } else {
        setCurrentShift(null);
        setShifts([]);
      }
    } catch (err) {
      console.error('[Fetch Shifts Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Van Fleet Shifts &amp; Field Dispatch</h2>
            <span className="rounded-md bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
              {currentShift ? '1 Active Route' : '0 Active Routes'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Real-time tracking of van assignments, odometer readings, and cash float reconciliations.
          </p>
        </div>

        <button
          onClick={fetchShifts}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium shadow-xs transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          title="Active Vans"
          value={currentShift ? "1 Van" : "0 Vans"}
          icon={Truck}
          accentColor="blue"
          trend="Van 01"
          trendDirection="neutral"
          subtitle="Ahmed Al Mansoori"
        />
        <SummaryCard
          title="Cash Float"
          value={currentShift ? `${Number(currentShift.opening_cash || 500).toFixed(2)} AED` : "0.00 AED"}
          icon={DollarSign}
          accentColor="emerald"
          trend="Issued"
          trendDirection="neutral"
          subtitle="Morning float"
        />
        <SummaryCard
          title="Start Mileage"
          value={currentShift ? `${currentShift.opening_odometer || 14250} KM` : "0 KM"}
          icon={Gauge}
          accentColor="purple"
          trend="Logged"
          trendDirection="neutral"
          subtitle="Route start"
        />
        <SummaryCard
          title="Shift Status"
          value={currentShift ? "Active" : "Closed"}
          icon={Clock}
          accentColor="amber"
          trend="Shift In Progress"
          trendDirection="neutral"
          subtitle="Daily execution"
        />
      </div>

      {/* Active Van Card */}
      {currentShift && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm">
                  {currentShift.godown_name || 'Van 01 Godown'}
                </h3>
                <StatusBadge status="OPEN" size="sm" />
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span className="text-slate-600 font-medium">Ahmed Al Mansoori (Rep)</span>
                <span>•</span>
                <span>Route: Deira Retail Sector</span>
                <span>•</span>
                <span>Started: {new Date(currentShift.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-4">
            <div>
              <div className="text-[10px] text-slate-400">Opening Cash</div>
              <div className="font-bold text-slate-900">{Number(currentShift.opening_cash || 500).toFixed(2)} AED</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Initial Mileage</div>
              <div className="font-mono font-bold text-blue-700">{currentShift.opening_odometer || 14250} KM</div>
            </div>
          </div>
        </div>
      )}

      {/* Shifts Register Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2.5">Shift ID</th>
                <th className="px-4 py-2.5">Assigned Van</th>
                <th className="px-4 py-2.5">Sales Rep</th>
                <th className="px-4 py-2.5">Start Time</th>
                <th className="px-4 py-2.5 font-mono">Odometer</th>
                <th className="px-4 py-2.5 text-right">Cash Float</th>
                <th className="px-4 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No active van shift running.
                  </td>
                </tr>
              ) : (
                shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-900">#SHF-{s.id}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      {s.godown_name || 'Van 01 Godown'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      Ahmed Al Mansoori
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {new Date(s.started_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">
                      {s.opening_odometer} KM
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                      {Number(s.opening_cash || 500).toFixed(2)} AED
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status={s.status} size="sm" />
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
