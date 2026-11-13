import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export type CardColor = 'blue' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'purple';

export interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: CardColor;
  accentColor?: CardColor;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

const colorMap: Record<CardColor, { bg: string; icon: string; border: string; badge: string }> = {
  blue: {
    bg: 'bg-blue-50/60',
    icon: 'text-blue-600',
    border: 'hover:border-blue-200',
    badge: 'bg-blue-50 text-blue-700 border border-blue-100',
  },
  emerald: {
    bg: 'bg-emerald-50/60',
    icon: 'text-emerald-600',
    border: 'hover:border-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50/60',
    icon: 'text-amber-600',
    border: 'hover:border-amber-200',
    badge: 'bg-amber-50 text-amber-700 border border-amber-100',
  },
  indigo: {
    bg: 'bg-indigo-50/60',
    icon: 'text-indigo-600',
    border: 'hover:border-indigo-200',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  },
  rose: {
    bg: 'bg-rose-50/60',
    icon: 'text-rose-600',
    border: 'hover:border-rose-200',
    badge: 'bg-rose-50 text-rose-700 border border-rose-100',
  },
  purple: {
    bg: 'bg-purple-50/60',
    icon: 'text-purple-600',
    border: 'hover:border-purple-200',
    badge: 'bg-purple-50 text-purple-700 border border-purple-100',
  },
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  accentColor,
  trend,
  trendDirection = 'neutral',
  onClick,
}) => {
  const chosen = (accentColor || color || 'blue') as CardColor;
  const c = colorMap[chosen] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all duration-200 hover:shadow-sm ${c.border} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="text-xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
        </div>

        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${c.bg} ${c.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100/80 pt-2 text-xs">
          {subtitle && (
            <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
              {subtitle}
            </span>
          )}
          {trend && (
            <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold ${c.badge}`}>
              {trendDirection === 'up' && <ArrowUpRight className="h-2.5 w-2.5" />}
              {trendDirection === 'down' && <ArrowDownRight className="h-2.5 w-2.5" />}
              {trendDirection === 'neutral' && <Minus className="h-2 w-2" />}
              <span>{trend}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
