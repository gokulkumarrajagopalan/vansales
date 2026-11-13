import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogoMark } from './common/LogoMark';
import { 
  LayoutDashboard, 
  Truck, 
  RefreshCw, 
  FileSpreadsheet, 
  Users, 
  FileText, 
  Receipt, 
  Layers, 
  ShieldCheck
} from 'lucide-react';

const sections = [
  {
    title: 'Operations',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Van Shifts', href: '/van-shifts', icon: Truck },
      { name: 'Spot Invoices', href: '/invoices', icon: FileText },
      { name: 'Receipts', href: '/receipts', icon: Receipt },
    ],
  },
  {
    title: 'Tally ERP',
    items: [
      { name: 'Sync Center', href: '/tally-sync', icon: RefreshCw, badge: 'Live' },
      { name: 'Ledger Mapping', href: '/ledger-mapping', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Directories',
    items: [
      { name: 'Customers', href: '/customers', icon: Users },
      { name: 'Van Stock & Godowns', href: '/stock', icon: Layers },
    ],
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-56 bg-white border-r border-slate-200/80 flex flex-col shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="h-12 flex items-center px-4 border-b border-slate-100 gap-2.5">
        <LogoMark size="xs" />
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-slate-900 text-xs tracking-tight">Talliffy</h1>
            <span className="rounded bg-blue-50 px-1 py-0.2 text-[8px] font-bold text-blue-600 uppercase">ERP</span>
          </div>
          <p className="text-[9px] text-slate-400 font-medium">Administration</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-0.5">
            <div className="px-2.5 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
              {sec.title}
            </div>
            {sec.items.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`h-3.5 w-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 m-2 rounded-lg border border-slate-200/60 bg-slate-50/60">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 mb-0.5">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          <span>Double-Entry Guard</span>
        </div>
        <p className="text-[9px] text-slate-400 leading-tight">
          Balanced debits &amp; credits (&plusmn;0.20 AED).
        </p>
      </div>
    </aside>
  );
};
