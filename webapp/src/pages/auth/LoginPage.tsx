import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogoMark } from '../../components/common/LogoMark';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Truck, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Server,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: RefreshCw,
    title: 'Continuous Tally Sync',
    description: 'Field sales invoices and receipts stream into TallyPrime Daybook automatically.',
  },
  {
    icon: ShieldCheck,
    title: 'Double-Entry Guard',
    description: 'Enforces mathematical debit = credit balance (±0.20 AED tolerance rule).',
  },
  {
    icon: Truck,
    title: 'Fleet & Route Dispatch',
    description: 'Real-time van assignments, odometer readings, and cash float tracking.',
  },
  {
    icon: Building2,
    title: 'UAE VAT 5% Compliance',
    description: 'Automated 5% VAT calculation, TRN validation, and ESC/POS tax receipts.',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to previous location or dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await login(username, password);
      if (res.success) {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Invalid username or password.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between select-none">
      {/* Top Simple Brand Bar */}
      <header className="h-14 border-b border-slate-200/80 bg-white px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark size="sm" />
          <span className="font-bold text-slate-900 text-sm tracking-tight">Talliffy</span>
          <span className="rounded bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 text-[9px] font-bold text-blue-700 uppercase">
            ERP
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>TallyPrime Gateway Online (8080)</span>
        </div>
      </header>

      {/* Main Split Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/70 rounded-full text-blue-700 text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Secure ERP Back-Office</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Enterprise Field Sales &amp; <br />
              <span className="text-blue-600">Tally ERP Synchronization</span>
            </h1>
            <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
              Automated mobile van invoicing, route collections, and bidirectional integration with TallyPrime Chart of Accounts.
            </p>
          </div>

          {/* 4 Feature Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs hover:border-blue-300 transition-all group"
              >
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <feat.icon className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs mb-1">{feat.title}</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
            <span>Talliffy Global Systems LLC (30449)</span>
            <span>•</span>
            <span>UAE TRN: 100234567800003</span>
          </div>
        </div>

        {/* Right Side: Sign-In Card */}
        <div className="w-full lg:w-96 max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Sign In to Dashboard</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your administrative credentials to continue.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Username or Email</label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-700">Password</label>
                  <span className="text-[10px] text-slate-400">Default: password123</span>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px]">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Fill Pills */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Sign-In Credentials
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin', 'password123')}
                  className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[10px] font-semibold text-center border border-slate-200/80 transition-colors"
                >
                  Admin Manager
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('vansales1', 'password123')}
                  className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[10px] font-semibold text-center border border-slate-200/80 transition-colors"
                >
                  Van Rep 01
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-200/80 bg-white text-center text-[11px] text-slate-400">
        &copy; {new Date().getFullYear()} Talliffy Van Sales &amp; Distribution ERP &bull; TallyPrime Integration Certified
      </footer>
    </div>
  );
};
