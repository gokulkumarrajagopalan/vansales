import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { authenticateWithBackend } from '../../services/backendSync';
import { UserAccount } from '../../types/erp';
import { LogoMark } from '../common/LogoMark';
import {
  Lock,
  ShieldCheck,
  ArrowRight,
  Mail,
  Truck,
  Eye,
  EyeOff,
  CheckCircle2,
  Download,
  Sun,
  Moon,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { users, setCurrentUser, setIsAuthenticated, setCurrentView, theme, toggleTheme } = useErp();

  // Standard credential fields (empty by default for security)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    setIsError(false);
    const identifier = email.trim();
    if (!identifier || !password) {
      setIsError(true);
      setAuthMessage('Please enter your email or username and password.');
      return;
    }

    setIsLoading(true);
    const result = await authenticateWithBackend(identifier, password);
    setIsLoading(false);

    if (!result.success || !result.backendUser) {
      setIsError(true);
      setAuthMessage(result.error || 'Invalid email/username or password.');
      return;
    }

    const bu = result.backendUser;
    const uname = (bu.username || '').toLowerCase();
    const backendRole = (bu.role || '').toUpperCase();
    const godownLower = (bu.godownName || '').toLowerCase();
    const emailLower = (bu.email || '').toLowerCase();

    // Determine strict primary role
    const isAdmin =
      backendRole === 'ADMIN' ||
      uname === 'admin' ||
      uname === 'admin1' ||
      uname === 'admin2' ||
      emailLower.includes('admin');

    const isAccountant =
      !isAdmin &&
      (backendRole === 'ACCOUNTANT' || uname === 'accountant' || emailLower.includes('accounts'));

    const isWarehouse =
      !isAdmin &&
      !isAccountant &&
      (backendRole === 'WAREHOUSE' || backendRole === 'WAREHOUSE_MANAGER' || uname === 'warehouse' || emailLower.includes('warehouse'));

    const isVanRep = !isAdmin && !isAccountant && !isWarehouse;

    const mappedRole: UserAccount['role'] = isAdmin
      ? 'admin'
      : isAccountant
      ? 'accountant'
      : isWarehouse
      ? 'warehouse_manager'
      : 'salesman_pos';

    let matchedProfile: UserAccount | undefined;

    if (isAdmin) {
      // Find admin profile strictly among admin users
      matchedProfile =
        users.find(u => u.role === 'admin' && (u.email?.toLowerCase() === emailLower || (uname === 'admin2' ? u.id === 'usr_admin2' : u.id === 'usr_admin1'))) ||
        users.find(u => u.role === 'admin');
    } else if (isAccountant) {
      matchedProfile = users.find(u => u.role === 'accountant');
    } else if (isWarehouse) {
      matchedProfile = users.find(u => u.role === 'warehouse_manager');
    } else {
      // Find van rep strictly among van salesmen
      matchedProfile = users.find(
        u =>
          u.role === 'salesman_pos' &&
          ((emailLower && u.email?.toLowerCase() === emailLower) ||
            (uname === 'van1' && u.id === 'usr_van1') ||
            (uname === 'van2' && u.id === 'usr_van2') ||
            (uname === 'van3' && u.id === 'usr_van3') ||
            (godownLower.includes('van 01') && u.id === 'usr_van1') ||
            (godownLower.includes('van 02') && u.id === 'usr_van2') ||
            (godownLower.includes('van 03') && u.id === 'usr_van3'))
      );
    }

    const vanSlot = isVanRep
      ? uname === 'van1' || godownLower.includes('van 01') || godownLower.includes('van-01')
        ? 1
        : uname === 'van2' || godownLower.includes('van 02') || godownLower.includes('van-02') || uname === 'vansales1'
        ? 2
        : uname === 'van3' || godownLower.includes('van 03') || godownLower.includes('van-03')
        ? 3
        : 1
      : null;

    const mappedUser: UserAccount = matchedProfile
      ? {
          ...matchedProfile,
          name: isAdmin ? (bu.fullName || matchedProfile.name || 'System Administrator') : (bu.fullName || matchedProfile.name),
          email: bu.email || matchedProfile.email,
          role: mappedRole,
          active: true,
          assignedLocationId: isAdmin ? undefined : matchedProfile.assignedLocationId,
          assignedVehicleId: isAdmin ? undefined : matchedProfile.assignedVehicleId,
        }
      : {
          id: isAdmin
            ? 'usr_admin1'
            : isAccountant
            ? 'usr_acct'
            : isWarehouse
            ? 'usr_wh'
            : vanSlot
            ? `usr_van${vanSlot}`
            : `usr_${bu.id || uname}`,
          name: bu.fullName || (isAdmin ? 'System Administrator' : bu.username),
          email: bu.email || (isAdmin ? 'admin@talliffy.com' : `${bu.username}@talliffy.com`),
          role: mappedRole,
          active: true,
          assignedLocationId: isVanRep && vanSlot
            ? `loc_van${vanSlot}`
            : isWarehouse
            ? 'loc_main'
            : undefined,
          assignedVehicleId: isVanRep && vanSlot ? `veh_${vanSlot}` : undefined,
        };

    try {
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(mappedUser));
      } else {
        localStorage.removeItem('user');
      }
    } catch {
      // ignore storage errors
    }

    setCurrentUser(mappedUser);
    setIsAuthenticated(true);
    setCurrentView('select_company');
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
              Need a new workspace?
            </span>
            <button
              onClick={() => setCurrentView('signup')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Branding Showcase & Trust (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-slate-700 dark:text-slate-300 hidden lg:block">
            <div className="flex justify-start">
              <LogoMark size="xl" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Sign in to Talliffy ERP
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time van sales, route stock control, order approvals, and TallyPrime synchronization.
              </p>
            </div>

            {/* Live Gateway Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-300 font-medium shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>API Sync Gateway Connected</span>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-2.5 pt-1 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Strict Double-Entry Balancing (Debit = Credit)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Real-Time Google Maps Van Telemetry &amp; Speed</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Zero-Delay TallyPrime Voucher Synchronization</span>
              </div>
            </div>

            {/* Android APK Download Card */}
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-xs dark:shadow-none">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Talliffy Mobile APK</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Android Field Van Sales (v2.4)</p>
                </div>
              </div>
              <a
                href="/TalliffyVanSalesPro.apk"
                download="TalliffyVanSalesPro.apk"
                className="px-2 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:text-white bg-blue-50 dark:bg-blue-950 hover:bg-blue-600 dark:hover:bg-blue-800 border border-blue-200 dark:border-blue-800/60 rounded transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </a>
            </div>
          </div>

          {/* Right Column: Sign In Card (7 cols) */}
          <div className="lg:col-span-7 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 border-b border-slate-200 dark:border-slate-800 text-center sm:text-left relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="lg:hidden">
                    <LogoMark size="sm" />
                  </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Sign In to Workspace</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Access your Talliffy Van Sales portal</p>
                </div>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Enterprise Edition</span>
              </div>
            </div>
            </div>

            {authMessage && (
              <div
                className={`mx-6 mt-4 p-2.5 rounded-lg border text-xs ${
                  isError
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                    : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                }`}
              >
                {authMessage}
              </div>
            )}

            {/* Email & Password Sign In Form */}
            <form onSubmit={handleCredentialsLogin} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Work Email or Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin1@talliffy.com"
                      className="w-full text-xs px-3 py-2.5 pl-9 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMessage('Contact your workspace administrator to reset your password.')}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs px-3 py-2.5 pl-9 pr-9 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span>Remember this machine for 30 days</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  <span>{isLoading ? 'Signing in...' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </form>

            {/* Bottom Register CTA Strip */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Don&apos;t have a Talliffy workspace yet? </span>
              <button
                type="button"
                onClick={() => setCurrentView('signup')}
                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-5 px-6 text-center text-xs text-slate-500 transition-colors">
        <p>© 2026 Talliffy Cloud · Strict Debit = Credit Double-Entry Accounting Core</p>
      </footer>
    </div>
  );
};
