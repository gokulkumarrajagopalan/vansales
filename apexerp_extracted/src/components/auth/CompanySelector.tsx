import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Building2, ArrowRight, ShieldCheck, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export const CompanySelector: React.FC = () => {
  const { company, setIsCompanySelected, setCurrentView, currentUser } = useErp();

  const handleEnterWorkspace = () => {
    setIsCompanySelected(true);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-slate-950 p-6 text-white text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">Select Business Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-indigo-300 font-semibold">{currentUser?.name}</span>
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <span className="font-semibold block mb-0.5">Single-Tenant VPS Architecture:</span>
            <span>This VPS instance is dedicated to a single company. Multi-company hosting is isolated per virtual private server machine.</span>
          </div>

          {/* Active Company Card */}
          <div className="border-2 border-indigo-600 bg-indigo-50/40 rounded-xl p-4 relative shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  AP
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{company.name}</h3>
                  <p className="text-xs text-slate-600">{company.tradeName}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded uppercase tracking-wider">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-indigo-100 text-xs text-slate-600">
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
                <span className="truncate">{company.taxNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="text-slate-400 font-sans font-semibold">Currency:</span>
                <span>{company.currency} ({company.currencySymbol})</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleEnterWorkspace}
            className="w-full py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Open Company Dashboard & ERP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Double-Entry Financial Integrity Verified</span>
        </div>
      </div>
    </div>
  );
};
