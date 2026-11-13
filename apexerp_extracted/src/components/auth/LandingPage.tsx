import React from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Truck,
  ShieldCheck,
  Server,
  TrendingUp,
  Receipt,
  Boxes,
  Database,
  ArrowRight,
  CheckCircle,
  Building2,
  FileCheck,
  Layers,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView } = useErp();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar Contract */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
              AP
            </div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              ApexERP <span className="text-xs font-mono font-normal text-indigo-400">VAN & POS CLOUD</span>
            </span>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#architecture" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              VPS Architecture
            </a>
            <a href="#features" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Van Sales & Accounting
            </a>
            <a href="#tally" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Tally & Zoho Engine
            </a>
            <a href="#api" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Mobile App Sync API
            </a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('login')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-1.5"
            >
              <span>Sign In to VPS Instance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-xs text-indigo-300 mb-6">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>Single-Tenant VPS Dedicated Architecture · 100% Data Sovereignty</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto text-balance">
            Powerful Backend POS ERP with Mobile Van Fleet & Double-Entry Accounting
          </h1>

          <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Engineered for FMCG distributors and wholesale traders. Seamlessly connect on-field delivery vans with a rock-solid accounting core inspired by Zoho Books and Tally.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setCurrentView('login')}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Launch Cloud Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentView('login');
              }}
              className="w-full sm:w-auto px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
            >
              Demo Credentials (1-Click)
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto text-left">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Accounting Rule</span>
              <p className="text-base font-bold text-white mt-1">Strict Debit = Credit</p>
              <p className="text-[11px] text-emerald-400 mt-1">Zero unbalanced entries allowed</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Multi-Location</span>
              <p className="text-base font-bold text-white mt-1">Vans as Godowns</p>
              <p className="text-[11px] text-indigo-400 mt-1">Real-time van stock tracking</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Stock Reports</span>
              <p className="text-base font-bold text-white mt-1">Tally Movement</p>
              <p className="text-[11px] text-amber-400 mt-1">Opening, In, Out, Closing drill</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Deployment</span>
              <p className="text-base font-bold text-white mt-1">Single-Tenant VPS</p>
              <p className="text-[11px] text-cyan-400 mt-1">Dedicated machine per customer</p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-800">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-white">Full-Stack Operational Suite</h2>
            <p className="text-xs text-slate-400 mt-1">Everything required to run wholesale distribution and retail van delivery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-900/60 text-indigo-400 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Fleet & Salesman Management</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track vehicles on field, routes, driver commission rates, insurance renewals, and fleet-wise sales & collection cards.
              </p>
            </div>

            <div className="p-6 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Bill-Wise Outstanding Aging</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aging analysis (1-30, 31-60, 61-90, 90+ days) for customer receivables and supplier payables with bill allocation.
              </p>
            </div>

            <div className="p-6 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-900/60 text-blue-400 flex items-center justify-center">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Tally Movement & Godown Summary</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Periodic opening, inward, outward, and closing balances with multi-tier drilldowns down to monthly registers and individual vouchers.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 px-6 text-center text-xs text-slate-500">
        <p>© 2026 ApexERP Cloud · Dedicated Single-Tenant VPS Distribution Architecture</p>
      </footer>
    </div>
  );
};
