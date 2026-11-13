import React from 'react';
import { useErp } from '../../context/ErpContext';
import { LogoMark } from '../common/LogoMark';
import { Building2, ArrowRight, ShieldCheck, MapPin, Calendar, CheckCircle2, Sun, Moon, LogOut } from 'lucide-react';

export const CompanySelector: React.FC = () => {
  const { company, setIsCompanySelected, setCurrentView, currentUser, logout, theme, toggleTheme } = useErp();

  const handleEnterWorkspace = () => {
    setIsCompanySelected(true);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 transition-colors">
        <div className="bg-slate-50 dark:bg-slate-950 p-6 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center relative">
          <button
            onClick={logout}
            className="absolute left-4 top-4 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={toggleTheme}
            className="absolute right-4 top-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <div className="flex justify-center mb-3">
            <LogoMark size="xl" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">Select Business Workspace</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Signed in as <span className="text-blue-600 dark:text-blue-400 font-semibold">{currentUser?.name}</span>
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40 rounded-lg text-xs text-blue-900 dark:text-blue-300">
            <span className="font-semibold block mb-0.5">Talliffy ERP Workspace:</span>
            <span>Balanced double-entry accounting ledger with real-time TallyPrime synchronization.</span>
          </div>

          {/* Active Company Card */}
          <div className="border-2 border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl p-4 relative shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <LogoMark size="md" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{company.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{company.tradeName}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded uppercase tracking-wider">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/30 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{company.city}, {company.state}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>FY 2026-2027</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="text-slate-400 font-sans font-semibold">GSTIN:</span>
                <span className="truncate text-slate-800 dark:text-slate-200">{company.taxNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="text-slate-400 font-sans font-semibold">Currency:</span>
                <span className="text-slate-800 dark:text-slate-200">{company.currency} ({company.currencySymbol})</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleEnterWorkspace}
            className="w-full py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Open Company Dashboard &amp; ERP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Double-Entry Financial Integrity Verified</span>
        </div>
      </div>
    </div>
  );
};
