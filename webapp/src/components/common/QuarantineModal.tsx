import React, { useState } from 'react';
import { X, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../services/api';

interface QuarantineModalProps {
  voucher: any;
  onClose: () => void;
  onResolved: () => void;
}

export const QuarantineModal: React.FC<QuarantineModalProps> = ({ voucher, onClose, onResolved }) => {
  const [resolving, setResolving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!voucher) return null;

  const handleAutoBalance = async () => {
    setResolving(true);
    try {
      // Trigger sync-now which evaluates balance and transitions ready
      const res = await apiClient.post('/api/v1/tally/sync-now');
      if (res.data.isValid) {
        setSuccessMsg('Voucher balanced and queued for Tally pull!');
        setTimeout(() => {
          onResolved();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      alert('Failed: ' + err.message);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-red-200 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-100 bg-red-50/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-red-950 text-base leading-none">
                Double-Entry Quarantine Resolution
              </h3>
              <p className="text-xs text-red-700 mt-1">{voucher.voucherNumber} • {voucher.guid}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm">
          {successMsg ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-800 font-semibold border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          ) : null}

          {/* Error Details Card */}
          <div className="rounded-xl border border-red-100 bg-red-50/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              <span>Imbalance Detection Log</span>
            </div>
            <p className="text-xs text-slate-700 font-mono bg-white p-3 rounded-lg border border-red-100">
              {voucher.errorMessage || 'Imbalance exceeds ±0.20 AED tolerance rule.'}
            </p>
          </div>

          {/* Ledger Comparison View */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Account Line Item</span>
              <span>Posting Amount</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-800">{voucher.partyName || 'Debtor Party'}</span>
                <span className="font-bold text-blue-700">DEBIT {voucher.amount?.toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-800">Sales Account - Van</span>
                <span className="font-bold text-emerald-700">CREDIT {(voucher.amount * 0.9523)?.toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-800">Output VAT 5% (UAE)</span>
                <span className="font-bold text-emerald-700">CREDIT {(voucher.amount * 0.0476)?.toFixed(2)} AED</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-200/60 leading-relaxed">
            <b>Automatic Resolution:</b> Clicking Auto-Balance books the remaining fraction into the configured <b>Round Off (+/-)</b> ledger so the entry achieves 100% mathematical parity.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAutoBalance}
            disabled={resolving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
          >
            <span>{resolving ? 'Balancing...' : 'Auto-Balance & Release'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
