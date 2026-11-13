import React from 'react';
import { X, Printer, Share2, CheckCircle2, Building2, MapPin, Phone, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  invoice: any;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const amount = parseFloat(invoice.amount || 0);
  const vat = parseFloat(invoice.vat || 0);
  const subtotal = Math.max(0, amount - vat);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-scaleUp">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
              V
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-none">
                Tax Invoice #{invoice.invoiceNumber || invoice.voucherNumber}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Display Mode • Ready to Print & Export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Saved Status Banner */}
          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-blue-900 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
            <span>Invoice #{invoice.invoiceNumber || invoice.voucherNumber} recorded & double-entry validated.</span>
          </div>

          {/* Document Sheet */}
          <div className="rounded-xl border border-slate-200 p-6 bg-white space-y-5 shadow-sm">
            {/* Header Voucher Meta */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">VOUCHER NUMBER</p>
                <h4 className="text-xl font-black text-blue-700 mt-0.5">
                  {invoice.invoiceNumber || invoice.voucherNumber}
                </h4>
                <p className="text-xs font-mono text-slate-400 mt-1">{invoice.guid}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DATE & TIME</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {new Date(invoice.date || invoice.voucherDate || Date.now()).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                  {invoice.paymentMode || 'CASH'}
                </span>
              </div>
            </div>

            {/* Seller & Buyer Row */}
            <div className="grid grid-cols-2 gap-6 border-b border-slate-100 pb-4 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ISSUED BY</p>
                <p className="font-bold text-slate-900 text-sm">Talliffy Global Systems LLC</p>
                <p className="text-slate-500 mt-0.5">Al Rigga Road, Deira, Dubai, UAE</p>
                <p className="text-blue-600 font-mono font-semibold mt-1">TRN: 100234567800003</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">CUSTOMER & BILL TO</p>
                <p className="font-bold text-slate-900 text-sm">{invoice.customerName || invoice.partyName}</p>
                <p className="text-slate-500 mt-0.5">Commercial Delivery Location</p>
                <p className="text-slate-600 font-mono mt-1">Payment: {invoice.paymentMode || 'CASH'} (Settled)</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2">BODY OF INVOICE</p>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Rate</th>
                    <th className="py-2 text-right">Tax (5%)</th>
                    <th className="py-2 text-right">Amount (AED)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 font-semibold text-slate-900">
                      Standard Van Sales Goods Batch
                      <span className="block text-[10px] text-slate-400 font-normal">Van 01 Godown Allocation</span>
                    </td>
                    <td className="py-2.5 text-center font-medium text-slate-700">1 Unit</td>
                    <td className="py-2.5 text-right font-medium text-slate-700">{subtotal.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-medium text-slate-700">{vat.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{amount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-slate-100 pt-4 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal</span>
                <span className="font-semibold text-slate-900">AED {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>UAE VAT (5.00%)</span>
                <span className="font-semibold text-slate-900">AED {vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-bold text-slate-900">Grand Total</span>
                <span className="font-black text-blue-700 text-lg">AED {amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Amount In Words Box */}
            <div className="rounded-lg bg-slate-50 p-3 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                AMOUNT IN WORDS
              </span>
              <p className="font-semibold text-slate-800">
                {invoice.amountInWords || `AED ${amount.toFixed(2)} Dirhams Only`}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Tally ERP Double-Entry Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
