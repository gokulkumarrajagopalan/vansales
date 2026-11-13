import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { LogoMark } from '../common/LogoMark';
import {
  Server,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Truck,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Download,
  Sun,
  Moon,
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { setCompany, company, setCurrentUser, setIsAuthenticated, setIsCompanySelected, setCurrentView, addUser, theme, toggleTheme } = useErp();

  // Form State
  const [companyName, setCompanyName] = useState('Talliffy Distribution & Van Sales Ltd.');
  const [industry, setIndustry] = useState('FMCG Wholesale & Distribution');
  const [fleetSize, setFleetSize] = useState('4 - 10 Vans (Growth Fleet)');
  const [city, setCity] = useState('Ahmedabad');
  const [state, setState] = useState('Gujarat');
  const [taxNumber, setTaxNumber] = useState('24AABCA1234F1Z5');

  const [fullName, setFullName] = useState('Talliffy Administrator');
  const [email, setEmail] = useState('admin@talliffy.com');
  const [phone, setPhone] = useState('+91 98250 88200');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  const [tallySyncEnabled, setTallySyncEnabled] = useState(true);
  const [gpsTrackingEnabled, setGpsTrackingEnabled] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick 1-click prefill helper
  const handlePrefillSample = () => {
    setCompanyName('Talliffy Agro & Beverage Logistics');
    setIndustry('Agrochemicals & Beverages');
    setFleetSize('4 - 10 Vans (Growth Fleet)');
    setCity('Surat');
    setState('Gujarat');
    setTaxNumber('24AABCS8899K1Z2');
    setFullName('Kiran Shah');
    setEmail('kiran@talliffyagro.com');
    setPhone('+91 98791 22334');
    setPassword('talliffy2026');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to the Terms of Service to continue.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Update company profile
      const updatedCompany = {
        ...company,
        name: companyName.trim() || 'Talliffy Distribution & Van Sales Ltd.',
        tradeName: companyName.trim(),
        city: city.trim() || 'Ahmedabad',
        state: state.trim() || 'Gujarat',
        taxNumber: taxNumber.trim() || '24AABCA1234F1Z5',
      };
      setCompany(updatedCompany);
      try {
        localStorage.setItem('apex_erp_company', JSON.stringify(updatedCompany));
      } catch (err) {
        console.error(err);
      }

      // 2. Create and set active user
      const newAdminUser = {
        id: 'usr_admin_' + Date.now(),
        name: fullName.trim() || 'Talliffy Admin',
        email: email.trim().toLowerCase() || 'admin@talliffy.com',
        role: 'admin' as const,
        active: true,
      };

      try {
        addUser(newAdminUser);
      } catch (e) {
        // user may exist
      }

      setCurrentUser(newAdminUser);
      setIsAuthenticated(true);
      setIsCompanySelected(true);
      setIsSubmitting(false);

      // 3. Navigate into active ERP dashboard
      setCurrentView('dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Top Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2.5 group text-left"
          >
            <LogoMark size="sm" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Talliffy
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Van Sales
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors shrink-0 shadow-2xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              Already have a workspace?
            </span>
            <button
              onClick={() => setCurrentView('login')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Brand & Value Highlights (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-slate-700 dark:text-slate-300">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-700 dark:text-blue-300 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>14-Day Full Enterprise Free Trial · No Card Required</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Empower your van sales fleet and automate distribution.
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Connect your field delivery vans directly to our strict double-entry accounting core and continuous TallyPrime sync.
              </p>
            </div>

            {/* Checklist of Enterprise Capabilities */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-slate-900 dark:text-white block font-medium">Live Google Maps GPS Tracker</strong>
                  <span className="text-slate-500 dark:text-slate-400">Track van heading, speed, live stops and customer visits in real time.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-slate-900 dark:text-white block font-medium">Spot Invoicing &amp; Bluetooth Thermal Print</strong>
                  <span className="text-slate-500 dark:text-slate-400">Drivers bill shops in 3 clicks with instant cash or UPI QR collection.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-slate-900 dark:text-white block font-medium">Zero-Rogue Discount Approval Queue</strong>
                  <span className="text-slate-500 dark:text-slate-400">Field discount requests require instant admin approval before printing.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-slate-900 dark:text-white block font-medium">Strict Double-Entry Accounting Core</strong>
                  <span className="text-slate-500 dark:text-slate-400">Zero unbalanced vouchers allowed. Real-time Daybook, P&amp;L and Balance Sheet.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-slate-900 dark:text-white block font-medium">Direct TallyPrime Bi-directional Sync</strong>
                  <span className="text-slate-500 dark:text-slate-400">Synchronize all sales, receipts, and multi-godown van stocks via XML port 9000.</span>
                </div>
              </div>
            </div>

            {/* Mobile App Download Pill */}
            <div className="p-3.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-xs dark:shadow-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Talliffy Van Sales Pro</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Android APK for field drivers (v2.4)</p>
                </div>
              </div>
              <a
                href="/TalliffyVanSalesPro.apk"
                download="TalliffyVanSalesPro.apk"
                className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:text-white bg-blue-50 dark:bg-blue-950 hover:bg-blue-600 dark:hover:bg-blue-800 border border-blue-200 dark:border-blue-800/60 rounded-md transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>APK</span>
              </a>
            </div>

            {/* Trust Quote */}
            <div className="p-3 bg-white/90 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 rounded-r-lg text-[11px] text-slate-600 dark:text-slate-400 shadow-2xs dark:shadow-none">
              <p className="italic">
                &ldquo;Talliffy cut our van reconciliation time from 3 hours every evening down to 4 minutes. Tally sync is flawless.&rdquo;
              </p>
              <p className="mt-1 font-semibold text-slate-800 dark:text-slate-300">— Ramesh Patel, Director, Western FMCG Logistics</p>
            </div>
          </div>

          {/* Right Column: Signup Form Card (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
            <div className="bg-slate-50 dark:bg-slate-950 p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <LogoMark size="sm" />
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Create Distribution Workspace</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Set up your company &amp; admin account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePrefillSample}
                className="text-[11px] font-medium text-blue-700 dark:text-blue-300 hover:text-white bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-600 dark:hover:bg-blue-900 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800/60 transition-colors"
                title="Fill with example company details"
              >
                Use Example Details
              </button>
            </div>

            <form onSubmit={handleSignup} className="p-6 space-y-5 text-xs">
              {/* Part 1: Company Profile */}
              <div>
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold uppercase tracking-wider text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>1. Company &amp; Fleet Profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Company / Distributor Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Horizon FMCG & Van Sales Ltd."
                      className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Business Sector
                    </label>
                    <select
                      value={industry}
                      onChange={e => setIndustry(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option>FMCG Wholesale &amp; Distribution</option>
                      <option>Beverages, Soda &amp; Juices</option>
                      <option>Dairy, Ice Cream &amp; Cold Chain</option>
                      <option>Bakery, Confectionery &amp; Snacks</option>
                      <option>Agrochemicals, Seeds &amp; Fertilizers</option>
                      <option>Paan, Tobacco &amp; Convenience Goods</option>
                      <option>General Wholesale Trading</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Fleet Size (Delivery Vans)
                    </label>
                    <select
                      value={fleetSize}
                      onChange={e => setFleetSize(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option>1 - 3 Vans (Starter Fleet)</option>
                      <option>4 - 10 Vans (Growth Fleet)</option>
                      <option>11 - 25 Vans (Regional Network)</option>
                      <option>25+ Vans (Enterprise Fleet)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      City / Headquarters
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Ahmedabad"
                      className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      GSTIN / Tax ID
                    </label>
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={e => setTaxNumber(e.target.value)}
                      placeholder="e.g. 24AABCA1234F1Z5"
                      className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Part 2: Admin Account Credentials */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold uppercase tracking-wider text-[11px]">
                  <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>2. Administrator Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Admin Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Mehul Patel"
                      className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Work Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@yourcompany.com"
                      className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Mobile / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98250 00000"
                      className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs px-3 py-2 pr-9 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Part 3: Architecture & Sync Preferences */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="tally-sync"
                    checked={tallySyncEnabled}
                    onChange={e => setTallySyncEnabled(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <label htmlFor="tally-sync" className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                    Enable bi-directional TallyPrime / Tally.ERP 9 XML connector (Default Port 9000)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="gps-tracking"
                    checked={gpsTrackingEnabled}
                    onChange={e => setGpsTrackingEnabled(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <label htmlFor="gps-tracking" className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                    Enable Real-Time Google Maps Van Telemetry &amp; Speed Tracking
                  </label>
                </div>
              </div>

              {/* Agreement */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 mt-0.5"
                />
                <label htmlFor="agree-terms" className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  I agree to the Talliffy Terms of Service, Single-Tenant Data Privacy Agreement, and acknowledge strict double-entry balancing rules.
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-75"
              >
                <span>{isSubmitting ? 'Provisioning Workspace...' : 'Create Talliffy Workspace & Launch Free Trial'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Already have an account? Sign In to Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-5 px-6 text-center text-xs text-slate-500 transition-colors">
        <p>© 2026 Talliffy Cloud · Enterprise Van Sales &amp; Distribution Accounting Suite</p>
      </footer>
    </div>
  );
};
