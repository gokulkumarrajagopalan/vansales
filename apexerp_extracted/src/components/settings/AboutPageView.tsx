import React from 'react';
import { Server, ShieldCheck, Database, Smartphone, CheckCircle2, Cpu } from 'lucide-react';

export const AboutPageView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs text-center">
        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-md">
          AP
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          ApexERP · Van POS & Distribution Suite
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Production Single-Tenant VPS Distribution ERP · Version 2.4.0 (Enterprise LTS)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Single-Tenant VPS Architecture</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unlike shared multi-tenant SaaS that pools database records, ApexERP is provisioned on dedicated Virtual Private Server (VPS) machines for each business. Ensures complete privacy, zero cross-tenant latency, and full control over database backups.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Strict Double-Entry Accounting</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every transaction is mathematically bound by the fundamental rule: <code className="font-mono text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">Total Debits = Total Credits</code>. Unbalanced entries are rejected by design, ensuring audited trial balance accuracy identical to Tally and Zoho Books.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Van Mobile POS & Offline Sync</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Delivery vans function as mobile godown locations. Salesmen use the mobile app on routes with Bluetooth thermal printers. Spot invoices deduct mobile van inventory in real-time, and auto-sync when cellular network is restored.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Tally Movement Stock Analysis</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Periodic stock summary tracks Opening, Inward, Outward, and Closing balances across all warehouses and vans, featuring multi-level drilldown down to monthly registers and item voucher history.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800">Deployment Machine Specification</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px] mt-2">
          <div><span className="text-slate-400 block font-sans">Instance Node:</span> vps-node-blr-01</div>
          <div><span className="text-slate-400 block font-sans">Database Engine:</span> High-Perf Relational</div>
          <div><span className="text-slate-400 block font-sans">Port Protocol:</span> 3000 / HTTPS SSL</div>
          <div><span className="text-slate-400 block font-sans">API Protocol:</span> REST v1 JSON Bearer</div>
        </div>
      </div>
    </div>
  );
};
