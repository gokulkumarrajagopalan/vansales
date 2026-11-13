import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { LogoMark } from '../common/LogoMark';
import {
  Truck,
  ShieldCheck,
  Server,
  TrendingUp,
  Receipt,
  Boxes,
  Database,
  ArrowRight,
  CheckCircle2,
  Building2,
  FileCheck,
  Layers,
  Smartphone,
  MapPin,
  Clock,
  Sparkles,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  Printer,
  QrCode,
  Activity,
  Percent,
  FileText,
  Radio,
  Sun,
  Moon,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, theme, toggleTheme, users, setCurrentUser, setIsAuthenticated, setIsCompanySelected } = useErp();
  const [activeTab, setActiveTab] = useState<'gps' | 'approval' | 'accounting' | 'mobile'>('gps');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleExploreOneClickDemo = () => {
    const adminUser = users.find(u => u.role === 'admin') || users[0];
    if (adminUser) {
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      setIsCompanySelected(true);
    }
    setCurrentView('dashboard');
  };

  const faqs = [
    {
      q: 'Which versions of Tally are supported by Talliffy?',
      a: 'Talliffy provides seamless bi-directional integration with TallyPrime (v1.0 through 4.0+) and Tally.ERP 9 (Release 6.0+) via the standard Tally XML Port (default: 9000). Sales vouchers, receipts, credit notes, stock items, and ledger balances sync automatically with zero manual re-entry.',
    },
    {
      q: 'Can van salesmen generate invoices when offline in remote areas?',
      a: 'Yes, 100%! The Talliffy Van Sales Pro Android app is engineered offline-first. Field drivers can view stock, take orders, issue spot invoices, and print receipts via Bluetooth thermal printers without internet. All transactions queue locally and sync automatically once mobile data or Wi-Fi reconnects.',
    },
    {
      q: 'How does the Discount Approval Workflow protect our distributor margins?',
      a: 'If a salesman on the field attempts to grant a special discount exceeding their pre-set authorization threshold, the bill is placed into the live "Discount Approval Queue". The distributor admin or sales manager receives an instant alert, reviews the customer history, and can approve or reject the discount with one click before the final invoice is printed.',
    },
    {
      q: 'What hardware and Bluetooth printers are compatible?',
      a: 'Talliffy supports any Android smartphone or rugged handheld POS (v8.0 to Android 15), as well as standard 58mm (2-inch) and 80mm (3-inch) ESC/POS Bluetooth thermal printers from brands like Epson, TVS, NGX, Essae, and generic wireless printers.',
    },
    {
      q: 'How is our company data kept secure?',
      a: 'Every Talliffy customer is deployed on a dedicated single-tenant virtual private server (VPS) architecture. Your PostgreSQL database, Tally connector, and live GPS telemetry operate in complete isolation with 100% data sovereignty and zero multi-tenant data co-mingling.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/85 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Brand Wordmark & Pop-Out Logo */}
          <div
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer select-none group"
          >
            <LogoMark size="sm" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Talliffy
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Van Sales
              </span>
            </div>
          </div>

          {/* Navigation Links (Reduced Clean Set) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
              Features
            </a>
            <a href="#mobile-app" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
              Mobile App
            </a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
              Pricing
            </a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-800 transition-colors shrink-0 shadow-2xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <a
              href="/TalliffyVanSalesPro.apk"
              download="TalliffyVanSalesPro.apk"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Android APK</span>
            </a>

            <button
              onClick={() => setCurrentView('login')}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            >
              Sign In
            </button>

            <button
              onClick={() => setCurrentView('signup')}
              className="px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all whitespace-nowrap shrink-0 shadow-md flex items-center gap-1.5"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-950 transition-colors">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 dark:bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-700 dark:text-blue-300 mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Enterprise Van Sales ERP · Live Google Maps Telemetry · TallyPrime Sync</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto text-balance">
              Empower Your Van Sales Fleet, Automate Distribution &amp; Sync Flawlessly with Tally
            </h1>

            <p className="mt-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The unified operations platform built specifically for FMCG, food &amp; beverage, and wholesale distributors. Equip field drivers with Bluetooth thermal spot billing, track vehicles live with GPS telemetry, govern field discounts, and maintain strict double-entry books with zero-delay Tally synchronization.
            </p>

            {/* Hero Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none">
              <button
                onClick={() => setCurrentView('signup')}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleExploreOneClickDemo}
                className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-center gap-2 group"
                title="Instant 1-Click Access to Live Demo Workspace"
              >
                <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
                <span>Explore 1-Click Demo</span>
              </button>

              <a
                href="/TalliffyVanSalesPro.apk"
                download="TalliffyVanSalesPro.apk"
                className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-white bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-xl transition-all border border-emerald-200 dark:border-emerald-800/60 shadow-2xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Android Sales APK</span>
              </a>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-16 max-w-4xl mx-auto text-left">
              <div className="p-4 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/50 shadow-xs dark:shadow-none transition-colors">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Accounting Rule</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">Strict Debit = Credit</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Zero unbalanced vouchers allowed</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/50 shadow-xs dark:shadow-none transition-colors">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Multi-Location</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">Vans as Godowns</p>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">Real-time van stock tracking</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/50 shadow-xs dark:shadow-none transition-colors">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Stock Reports</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">Tally Movement</p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Opening, In, Out, Closing drill</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/50 shadow-xs dark:shadow-none transition-colors">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">GPS Telemetry</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">Google Maps Live</p>
                <p className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-1">Heading, speed &amp; stop sequence</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Live Product Preview Showcase */}
        <section className="py-16 bg-slate-100/60 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 transition-colors">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs uppercase font-mono tracking-wider text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800/60">
                Interactive Operational Preview
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
                Built for the realities of FMCG field sales
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                Click across the core subsystems below to see how Talliffy unifies field vans with enterprise distribution accounting.
              </p>
            </div>

            {/* Subsystem Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <button
                onClick={() => setActiveTab('gps')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'gps'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-2xs'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>1. Live GPS Van Tracker</span>
              </button>

              <button
                onClick={() => setActiveTab('approval')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'approval'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-2xs'
                }`}
              >
                <Percent className="w-4 h-4" />
                <span>2. Discount Approval Queue</span>
              </button>

              <button
                onClick={() => setActiveTab('accounting')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'accounting'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-2xs'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>3. Strict Double-Entry Core</span>
              </button>

              <button
                onClick={() => setActiveTab('mobile')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'mobile'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-2xs'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>4. Mobile Spot Invoicing</span>
              </button>
            </div>

            {/* Showcase Viewport */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors">
              {/* Tab 1: Live GPS Map */}
              {activeTab === 'gps' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                      <strong className="text-slate-900 dark:text-white">Live Field Fleet Telemetry: 2 Vans En Route</strong>
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">(GPS 23.0225° N, 72.5714° E)</span>
                    </div>
                    <button
                      onClick={() => setCurrentView('login')}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Open Fullscreen GPS Console</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Van Card 1 */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-blue-300 dark:border-blue-600/40 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Van #01 - North Sector</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">GJ-01-AB-4421 · Driver: Mehul Patel</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 uppercase">
                          42 km/h
                        </span>
                      </div>

                      <div className="text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Current Heading:</span>
                          <span className="font-mono text-slate-900 dark:text-white">45° North-East</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Next Destination:</span>
                          <span className="text-slate-900 dark:text-white font-medium">Patel Agro Center</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Route Progress:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">4 of 7 Delivered</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Collections Today:</span>
                          <span className="font-mono text-slate-900 dark:text-white">₹47,850</span>
                        </div>
                      </div>
                    </div>

                    {/* Van Card 2 */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Van #02 - South Market</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">GJ-06-TT-9988 · Driver: Suresh R</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 uppercase">
                          Unloading (0 km/h)
                        </span>
                      </div>

                      <div className="text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Current Stop:</span>
                          <span className="text-slate-900 dark:text-white font-medium">Metro Hypermarket</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Time at Location:</span>
                          <span className="font-mono text-slate-900 dark:text-white">14 mins</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Active Invoicing:</span>
                          <span className="text-blue-600 dark:text-blue-400 font-bold">Bill #ORD-9024</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Collections Today:</span>
                          <span className="font-mono text-slate-900 dark:text-white">₹38,200</span>
                        </div>
                      </div>
                    </div>

                    {/* Stop Sequence List */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        Scheduled Route Sequence
                      </span>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>09:30 AM · Central Warehouse Depot (Loaded)</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>10:45 AM · Kisan Seva Kendra (₹24,500 Paid)</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
                          <span>11:50 AM · Patel Agro Center (In Progress)</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>01:15 PM · Gujarat Provision Store (Pending)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Discount Approval Queue */}
              {activeTab === 'approval' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      <strong className="text-slate-900 dark:text-white">Field Discount Governance Desk</strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        1 Request Pending Approval
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-amber-300 dark:border-amber-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">#ORD-9024</span>
                        <span className="text-slate-500 dark:text-slate-400">· Van 01 (Mehul Patel)</span>
                        <span className="font-bold text-slate-900 dark:text-white">Patel Agro Center</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                        Order Subtotal: <strong className="text-slate-900 dark:text-white">₹19,800</strong> · Requested Special Discount:{' '}
                        <strong className="text-amber-600 dark:text-amber-400 font-mono">₹2,000 (10.1%)</strong> · Final:{' '}
                        <strong className="text-slate-900 dark:text-white font-mono">₹17,800</strong>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Reason: Bulk seasonal purchase (5 bags NPK 19:19:19 + 2 cans liquid bio-fertilizer). Credit limit: ₹50,000.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => alert('Order #ORD-9024 approved! Synced to TallyPrime.')}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Discount</span>
                      </button>
                      <button
                        onClick={() => alert('Discount rejected. Reverted to standard list price.')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-950 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-800 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Strict Double-Entry Core */}
              {activeTab === 'accounting' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <strong className="text-slate-900 dark:text-white">Strict Double-Entry Ledger Verification</strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Imbalance = ₹0.00 (Balanced)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">Total Debits</span>
                      <p className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-1">₹2,485,320.00</p>
                      <p className="text-[11px] text-slate-500 mt-1">Cash, Bank, Debtors &amp; Van Stocks</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">Total Credits</span>
                      <p className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-1">₹2,485,320.00</p>
                      <p className="text-[11px] text-slate-500 mt-1">Sales, Suppliers, Capital &amp; GST</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-emerald-300 dark:border-emerald-800/50">
                      <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400">Debit - Credit Difference</span>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">₹0.00</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">100% Mathematically verified</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Mobile Spot Invoicing */}
              {activeTab === 'mobile' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <strong className="text-slate-900 dark:text-white">Talliffy Van Sales Pro Handheld View</strong>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Offline-First Engine</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg mx-auto font-mono text-xs space-y-2 text-slate-700 dark:text-slate-300">
                    <div className="text-center pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">TALLIFFY DISTRIBUTION &amp; VAN SALES</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">GSTIN: 24AABCA1234F1Z5 · TAX INVOICE</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Invoice: #TLY-INV-2026-0891 · Van: GJ-01-AB-4421</p>
                    </div>

                    <div className="space-y-1 text-[11px] pt-1">
                      <div className="flex justify-between">
                        <span>1. Premium Tea 250g (x24)</span>
                        <span>₹3,360.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Roasted Snacks 100g (x50)</span>
                        <span>₹1,500.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3. Spices Pouch 50g (x30)</span>
                        <span>₹900.00</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white text-xs">
                      <span>TOTAL PAYABLE (INCL. GST):</span>
                      <span className="text-emerald-600 dark:text-emerald-400">₹5,760.00</span>
                    </div>

                    <div className="text-center pt-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                        <Printer className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>Bluetooth 58mm Thermal Print Ready · UPI QR Generated</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-mono tracking-wider text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800/60">
              Complete Operations Suite
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-3">
              Engineered for wholesale distributors with field fleets
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              Say goodbye to missing receipts, stock discrepancies, and endless hours spent keying invoices into Tally every night.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div id="fleet" className="p-6 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-xs dark:shadow-none transition-all space-y-3.5 group">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/50 group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Live GPS Van Telemetry</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time Google Maps van tracking with compass bearing rotation, live speedometer, delivery stop sequences, customer check-ins, and idle time alerts.
              </p>
            </div>

            {/* Card 2 */}
            <div id="invoicing" className="p-6 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs dark:shadow-none transition-all space-y-3.5 group">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Bluetooth Spot Invoicing</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Field drivers generate GST-compliant spot invoices in 3 clicks. Pair with any 58mm or 80mm ESC/POS Bluetooth wireless printer for immediate delivery receipts.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-xs dark:shadow-none transition-all space-y-3.5 group">
              <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/50 group-hover:scale-105 transition-transform">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Discount Approval Governance</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Protect distributor profit margins. Salesman discounts over allowed limit trigger live approvals to admin desk with customer history before bill finalization.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs dark:shadow-none transition-all space-y-3.5 group">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50 group-hover:scale-105 transition-transform">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Vans as Independent Godowns</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every vehicle operates as a dedicated stock godown. Morning truck loadout, return reconciliation, item transfers, and batch-wise expiry tracking built in.
              </p>
            </div>

            {/* Card 5 */}
            <div id="accounting" className="p-6 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 shadow-xs dark:shadow-none transition-all space-y-3.5 group">
              <div className="w-11 h-11 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200 dark:border-cyan-800/50 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Strict Double-Entry Engine</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Strict mathematical Debit = Credit balancing. Comprehensive Chart of Accounts, Daybook, Bill-wise Aging (1-30, 31-60, 61-90, 90+ days), Trial Balance, and P&amp;L.
              </p>
            </div>

            {/* Card 6 */}
            <div id="tally-sync" className="p-6 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-xs dark:shadow-none transition-all space-y-3.5 group">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/50 group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Bi-Directional Tally Gateway</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Seamless XML synchronization with TallyPrime (Port 9000). Push approved sales bills, payment collections, and stock movement directly into Tally with zero manual effort.
              </p>
            </div>
          </div>
        </section>

        {/* Mobile App Spotlight Section */}
        <section id="mobile-app" className="py-20 bg-slate-100/60 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 transition-colors">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-100 dark:from-blue-950/60 dark:via-slate-900 dark:to-indigo-950/60 rounded-3xl border border-blue-200 dark:border-blue-900/40 p-8 sm:p-12 shadow-sm dark:shadow-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700/50 text-xs text-blue-700 dark:text-blue-300">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Talliffy Van Sales Pro · Android App (v2.4 Production)</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Equip your drivers with our rugged mobile sales app
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Designed for on-the-road speed and simplicity. Even in basement shops with zero cell coverage, drivers capture orders, collect cash or UPI QR payments, and print thermal tax invoices instantly.
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300 pt-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>100% Offline Mode</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Barcode Camera Scanner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Bluetooth Thermal Printing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>UPI QR Payment Collection</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <a
                      href="/TalliffyVanSalesPro.apk"
                      download="TalliffyVanSalesPro.apk"
                      className="px-5 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Android APK (16 MB)</span>
                    </a>

                    <button
                      onClick={() => setCurrentView('login')}
                      className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
                    >
                      Evaluate in Web Browser
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-64 bg-white dark:bg-slate-900 rounded-[32px] p-3 border-4 border-slate-200 dark:border-slate-800 shadow-2xl">
                    <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-[24px] p-4 text-center space-y-3">
                      <div className="w-10 h-1 bg-slate-300 dark:bg-slate-800 rounded-full mx-auto" />
                      <div className="flex justify-center">
                        <LogoMark size="sm" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Talliffy Van Sales Pro</p>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-left text-[11px] space-y-1.5 border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <p className="text-blue-600 dark:text-blue-400 font-bold">Route: Sector 4 Supermarkets</p>
                        <p className="text-slate-500 dark:text-slate-400">Next: Patel Agro Center</p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold">Stock Loaded: 480 Items</p>
                      </div>
                      <div className="p-2.5 bg-blue-600 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5">
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Bill (ESC/POS)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing & Deployment Plans */}
        <section id="pricing" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 border-t border-slate-200 dark:border-slate-900">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-mono tracking-wider text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800/60">
              Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-3">
              Plans that scale with your van sales fleet
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              Every plan includes full TallyPrime synchronization, mobile Android apps, and our double-entry accounting core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="p-6 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6 shadow-xs dark:shadow-none">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Starter Fleet</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹2,499</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Ideal for small distributors running 1 to 3 delivery vans.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Up to 3 Active Delivery Vans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Spot Invoicing &amp; Bluetooth Thermal Print</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>TallyPrime XML Connector (Port 9000)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Basic Van GPS Telemetry</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentView('signup')}
                className="w-full py-2.5 text-xs font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Tier 2: Popular */}
            <div className="p-6 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/80 dark:to-slate-900 rounded-2xl border-2 border-blue-600 relative flex flex-col justify-between space-y-6 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400">Growth Fleet</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹5,999</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Engineered for growing FMCG and beverage distributors.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-blue-200 dark:border-blue-800/40 text-xs text-slate-700 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Up to 10 Active Delivery Vans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Live Google Maps GPS Tracker &amp; Heading</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Real-time Discount Approval Queue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Multi-Godown Van Stock &amp; Replenishment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Priority WhatsApp &amp; Phone Support</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentView('signup')}
                className="w-full py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Tier 3: Enterprise */}
            <div className="p-6 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6 shadow-xs dark:shadow-none">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Enterprise Cloud</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹14,999</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Dedicated cloud deployment for large regional distribution networks.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Unlimited Delivery Vans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Dedicated Cloud Workspace Instance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>100% Data Sovereignty &amp; Isolated DB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Multi-Branch &amp; Multi-Company Tally Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Dedicated Account Manager &amp; Custom Reports</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentView('signup')}
                className="w-full py-2.5 text-xs font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
              >
                Contact Sales / Start Trial
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-slate-100/60 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 transition-colors">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs uppercase font-mono tracking-wider text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800/60">
                Got Questions?
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs dark:shadow-none transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full p-4 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {expandedFaq === idx && (
                    <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Banner CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white border-t border-slate-200 dark:border-slate-900 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to modernize your van sales and distribution?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">
              Start your 14-day free enterprise trial today. No credit card required. Connect your vans and sync with Tally in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setCurrentView('signup')}
                className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Start Free Trial Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentView('login')}
                className="w-full sm:w-auto px-5 py-3.5 text-xs font-semibold text-white bg-blue-800/80 hover:bg-blue-800 rounded-xl border border-blue-500/50 transition-colors"
              >
                Sign In to Existing Portal
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-8 px-4 sm:px-6 text-xs text-slate-500 dark:text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark size="xs" />
            <span className="font-bold text-slate-900 dark:text-white">Talliffy Cloud</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>Enterprise Van Sales &amp; Distribution Accounting Suite</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Features</a>
            <a href="#mobile-app" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Mobile App</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">FAQ</a>
            <a href="/TalliffyVanSalesPro.apk" download className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Android APK</a>
            <button onClick={() => setCurrentView('login')} className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Sign In</button>
            <button onClick={() => setCurrentView('signup')} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Sign Up</button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-100 dark:border-slate-900/80 text-[10px] text-slate-400 dark:text-slate-600 text-center md:text-left flex flex-col sm:flex-row justify-between gap-2">
          <p>© 2026 Talliffy Cloud Inc. All rights reserved.</p>
          <p>Tally and TallyPrime are registered trademarks of Tally Solutions Pvt. Ltd.</p>
        </div>
      </footer>
    </div>
  );
};
