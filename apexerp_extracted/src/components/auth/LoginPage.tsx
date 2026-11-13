import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { UserAccount } from '../../types/erp';
import { Server, Lock, User, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { users, setCurrentUser, setIsAuthenticated, setCurrentView } = useErp();
  const [selectedUser, setSelectedUser] = useState<UserAccount>(users[0]);
  const [password, setPassword] = useState('demo123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser(selectedUser);
    setIsAuthenticated(true);
    // Proceed to select company screen
    setCurrentView('select_company');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="bg-slate-950 p-6 text-white text-center relative">
          <button
            onClick={() => setCurrentView('landing')}
            className="absolute left-4 top-5 text-slate-400 hover:text-white text-xs flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="font-bold text-lg text-white">AP</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight">ApexERP VPS Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">Single-Tenant VPS Dedicated Instance</p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-indigo-300 mt-3 font-mono">
            <Server className="w-3 h-3 text-indigo-400" />
            <span>vps-node-blr-01.apexfmcg.com</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Select User Role Profile
            </label>
            <div className="space-y-1.5">
              {users.map(u => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                    selectedUser.id === u.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="leading-tight">{u.name}</p>
                      <p className="text-[10px] text-slate-500 font-normal capitalize">
                        {u.role.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  {selectedUser.id === u.id && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Instance Access Token / Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-indigo-600 font-mono"
                required
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Pre-filled for 1-click evaluation</p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>Proceed to Company Selection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Strict Debit = Credit accounting engine enabled
        </div>
      </div>
    </div>
  );
};
