import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  CheckCircle2, 
  Truck, 
  LogOut
} from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [tallyHealthy, setTallyHealthy] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/health');
        if (res.data?.status === 'HEALTHY') {
          setTallyHealthy(true);
        }
      } catch {
        setTallyHealthy(false);
      }
    })();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-12 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur-md">
      {/* Left: Company Context Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/60 px-2.5 py-1 transition-all hover:bg-slate-100/80 cursor-pointer">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white text-[10px] font-bold">
            T
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs font-semibold text-slate-800">Talliffy Global Systems LLC</span>
              <span className="rounded bg-slate-200/70 px-1 py-0.2 text-[9px] font-mono font-medium text-slate-600">
                {user?.companyCode || '30449'}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-mono mt-0.5">TRN: 100234567800003</p>
          </div>
          <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
        </div>
      </div>

      {/* Center: Universal Quick Search */}
      <div className="hidden md:flex items-center relative w-72">
        <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2" />
        <input
          type="text"
          placeholder="Search vouchers, customers, TRN..."
          className="w-full rounded-lg border border-slate-200/80 bg-slate-50/70 pl-8 pr-12 py-1 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
        />
        <kbd className="absolute right-2 top-1.5 rounded bg-slate-200/70 px-1 py-0.2 text-[9px] font-mono text-slate-500">
          Alt+K
        </kbd>
      </div>

      {/* Right: Telemetry Badges & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Tally Connectivity Pill */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-emerald-200/60 bg-emerald-50/60 px-2 py-0.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-medium text-emerald-800">
            Tally Connected
          </span>
        </div>

        {/* Active Van Route */}
        <div className="hidden lg:flex items-center gap-1 rounded-md border border-slate-200/60 bg-slate-50/60 px-2 py-0.5">
          <Truck className="h-3 w-3 text-blue-600" />
          <span className="text-[10px] font-medium text-slate-700">
            {user?.godownName || 'Van 01 Godown'}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-white text-[10px] font-bold">
              {getInitials(user?.fullName || user?.username)}
            </div>
            <div className="hidden sm:block text-left leading-none">
              <span className="text-xs font-semibold text-slate-800">
                {user?.fullName || user?.username || 'Admin'}
              </span>
              <p className="text-[9px] text-slate-400 mt-0.5 font-medium uppercase">
                {user?.role || 'MANAGER'}
              </p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">{user?.fullName || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || `${user?.username || 'admin'}@talliffy.com`}</p>
                <p className="text-[9px] text-blue-600 font-medium mt-0.5">{user?.godownName || 'Van 01 Godown'}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors mt-0.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
