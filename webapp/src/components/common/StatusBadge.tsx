import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase();

  let config = {
    bg: 'bg-slate-50 border border-slate-200/80',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    label: status || 'Pending',
  };

  if (norm === 'SYNCED') {
    config = {
      bg: 'bg-emerald-50/70 border border-emerald-200/60',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Posted',
    };
  } else if (norm === 'READY') {
    config = {
      bg: 'bg-blue-50/70 border border-blue-200/60',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      label: 'Pending Sync',
    };
  } else if (norm === 'FAILED_VALIDATION' || norm === 'QUARANTINED' || norm === 'FAILED') {
    config = {
      bg: 'bg-amber-50/70 border border-amber-200/60',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      label: 'Needs Review',
    };
  } else if (norm === 'OPEN') {
    config = {
      bg: 'bg-emerald-50/70 border border-emerald-200/60',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500 animate-pulse',
      label: 'Active',
    };
  } else if (norm === 'CLOSED') {
    config = {
      bg: 'bg-slate-100 border border-slate-200/60',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
      label: 'Closed',
    };
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-all ${config.bg} ${config.text} ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
