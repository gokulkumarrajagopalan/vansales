import React from 'react';
import { LogoMark } from '../common/LogoMark';
import { Server, ShieldCheck, Database, Smartphone, CheckCircle2, Cpu } from 'lucide-react';

export const AboutPageView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs text-center">
        <div className="flex justify-center mb-3">
          <LogoMark size="xl" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Talliffy · Van Sales &amp; Distribution Suite
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enterprise Van Sales, FMCG Distribution &amp; TallyPrime Integration · Version 3.0.0 (Enterprise LTS)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dedicated Cloud Architecture</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Talliffy provisions dedicated PostgreSQL storage, Tally connectors, and live GPS telemetry for each workspace, ensuring data isolation, low latency, and reliable audit history.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Strict Double-Entry Accounting</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Every transaction is mathematically bound by the fundamental rule: <code className="font-mono text-blue-700 bg-blue-50 dark:bg-blue-950 px-1 py-0.5 rounded">Total Debits = Total Credits</code>. Unbalanced entries are rejected by design, ensuring audited trial balance accuracy verified with TallyPrime.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Van Mobile POS &amp; Offline Sync</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Delivery vans function as mobile godown locations. Salesmen use the mobile app on routes with Bluetooth thermal printers. Spot invoices deduct mobile van inventory in real-time, and auto-sync when cellular network is restored.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tally Movement Stock Analysis</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Periodic stock summary tracks Opening, Inward, Outward, and Closing balances across all warehouses and vans, featuring multi-level drilldown down to monthly registers and item voucher history.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
        <h4 className="font-bold text-slate-800 dark:text-white">Deployment Machine Specification</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px] mt-2">
          <div><span className="text-slate-400 block font-sans">Instance Node:</span> talliffy-node-01</div>
          <div><span className="text-slate-400 block font-sans">Database Engine:</span> High-Perf Relational</div>
          <div><span className="text-slate-400 block font-sans">Port Protocol:</span> 3000 / HTTPS SSL</div>
          <div><span className="text-slate-400 block font-sans">API Protocol:</span> REST v1 JSON Bearer</div>
        </div>
      </div>
    </div>
  );
};
