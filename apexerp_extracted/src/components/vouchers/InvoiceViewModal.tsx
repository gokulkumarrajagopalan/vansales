import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Printer, X, CheckCircle, Truck, FileText, Download } from 'lucide-react';
import { exportVoucherPdf } from '../../utils/pdfExport';

export const InvoiceViewModal: React.FC = () => {
  const { invoiceToView, setInvoiceToView, company, customers, suppliers, items, vehicles } = useErp();

  if (!invoiceToView) return null;

  const party = invoiceToView.partyType === 'customer'
    ? customers.find(c => c.id === invoiceToView.partyId)
    : suppliers.find(s => s.id === invoiceToView.partyId);

  const vehicle = invoiceToView.vehicleId ? vehicles.find(v => v.id === invoiceToView.vehicleId) : null;
  const vehicleLabel = vehicle ? `${vehicle.model} (${vehicle.regNumber})` : undefined;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    exportVoucherPdf(company, invoiceToView, party, vehicleLabel, items);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 print:shadow-none print:border-none print:w-full">
        {/* Modal Controls (Hidden in print) */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Tax Invoice / Voucher Print Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Export official PDF with company letterhead"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF (Letterhead)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={() => setInvoiceToView(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 text-slate-800 text-xs space-y-6 bg-white">
          {/* Header Row */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-indigo-700 text-white font-bold flex items-center justify-center text-sm">
                  AP
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900">{company.name}</h1>
                  <p className="text-[11px] text-slate-500">{company.tradeName}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mt-2">{company.address}, {company.city}, {company.state}</p>
              <p className="text-[11px] text-slate-600 font-mono">GSTIN/Tax ID: {company.taxNumber}</p>
              <p className="text-[11px] text-slate-600">Ph: {company.phone} | {company.email}</p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase rounded bg-slate-100 text-slate-800 border border-slate-200">
                {invoiceToView.voucherType.toUpperCase().replace('_', ' ')}
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 pt-1">{invoiceToView.voucherNumber}</p>
              <p className="text-[11px] text-slate-500">Date: {invoiceToView.date}</p>
              {invoiceToView.referenceNumber && (
                <p className="text-[11px] text-slate-500">Ref: {invoiceToView.referenceNumber}</p>
              )}
              {invoiceToView.locationName && (
                <div className="text-[11px] text-indigo-700 flex items-center justify-end gap-1 mt-1 font-medium">
                  <Truck className="w-3 h-3" />
                  <span>{invoiceToView.locationName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Billed To */}
          <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Billed To (Party):</span>
              <h3 className="text-xs font-bold text-slate-900 mt-1">{invoiceToView.partyName || party?.name || 'Cash Counter Customer'}</h3>
              {party && (
                <div className="text-[11px] text-slate-600 space-y-0.5 mt-1">
                  <p>{party.address}, {party.city}</p>
                  <p>Tax / GST No: <span className="font-mono">{party.taxNumber}</span></p>
                  <p>Contact: {party.phone}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Status:</span>
              <div className="mt-1 flex items-center justify-end gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Posted & Audited</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Single-Tenant VPS Dedicated Node</p>
            </div>
          </div>

          {/* Line Items Table */}
          {invoiceToView.items && invoiceToView.items.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Item & Description</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Disc %</th>
                    <th className="py-2.5 px-3 text-right">Tax %</th>
                    <th className="py-2.5 px-3 text-right">Amount ({company.currencySymbol})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoiceToView.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{item.itemName}</td>
                      <td className="py-2 px-3 text-right font-mono">{item.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono">{item.rate.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-mono">{item.discountPercent}%</td>
                      <td className="py-2 px-3 text-right font-mono">{item.taxRate}%</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Non-item voucher journal entries preview */
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Ledger Account</th>
                    <th className="py-2.5 px-3 text-right">Debit ({company.currencySymbol})</th>
                    <th className="py-2.5 px-3 text-right">Credit ({company.currencySymbol})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoiceToView.journalEntries.map((line, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{line.ledgerName || line.ledgerId}</td>
                      <td className="py-2 px-3 text-right font-mono">{line.debit ? line.debit.toFixed(2) : '-'}</td>
                      <td className="py-2 px-3 text-right font-mono">{line.credit ? line.credit.toFixed(2) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Subtotal & Summary */}
          <div className="flex justify-between items-start pt-2">
            <div className="w-1/2 text-slate-600 text-[11px]">
              <span className="font-semibold block text-slate-800 mb-1">Narration / Terms:</span>
              <p className="italic bg-slate-50 p-2.5 rounded border border-slate-200">{invoiceToView.narration}</p>
            </div>

            <div className="w-2/5 space-y-1.5 text-right text-xs">
              {invoiceToView.subtotal !== undefined && (
                <div className="flex justify-between py-0.5 text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{company.currencySymbol} {invoiceToView.subtotal.toFixed(2)}</span>
                </div>
              )}
              {invoiceToView.taxTotal !== undefined && (
                <div className="flex justify-between py-0.5 text-slate-600">
                  <span>Total Tax (GST/VAT):</span>
                  <span className="font-mono">{company.currencySymbol} {invoiceToView.taxTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="font-mono">{company.currencySymbol} {invoiceToView.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signature and footer */}
          <div className="pt-8 flex justify-between items-end border-t border-slate-200 text-[11px] text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">ApexERP Van POS System</p>
              <p>Generated computer-certified invoice.</p>
            </div>
            <div className="text-right">
              <div className="w-40 border-b border-slate-400 mb-1"></div>
              <p className="font-medium text-slate-700">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
