import React, { useState, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import { VoucherType, VoucherLineItem, JournalEntryLine, BillAllocation } from '../../types/erp';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  MapPin,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';

export const VoucherModal: React.FC = () => {
  const {
    activeVoucherModal,
    closeVoucherModal,
    addVoucher,
    customers,
    suppliers,
    ledgers,
    items,
    locations,
    vehicles,
    drivers,
    company,
    vouchers,
  } = useErp();

  if (!activeVoucherModal.isOpen) return null;

  const voucherType: VoucherType = activeVoucherModal.initialType || 'sales';
  const isViewOnly = !!activeVoucherModal.viewOnlyVoucher;
  const existingVoucher = activeVoucherModal.viewOnlyVoucher;

  const [date, setDate] = useState<string>(existingVoucher?.date || '2026-10-26');
  const [voucherNumber, setVoucherNumber] = useState<string>(
    existingVoucher?.voucherNumber || `${voucherType.toUpperCase().slice(0, 4)}-${Date.now().toString().slice(-5)}`
  );
  const [partyType, setPartyType] = useState<'customer' | 'supplier' | 'ledger'>(
    existingVoucher?.partyType || (voucherType === 'purchase' || voucherType === 'debit_note' ? 'supplier' : 'customer')
  );
  const [partyId, setPartyId] = useState<string>(existingVoucher?.partyId || activeVoucherModal.partyId || '');
  const [locationId, setLocationId] = useState<string>(existingVoucher?.locationId || activeVoucherModal.locationId || 'loc_main');
  const [referenceNumber, setReferenceNumber] = useState<string>(existingVoucher?.referenceNumber || '');
  const [narration, setNarration] = useState<string>(existingVoucher?.narration || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Line items for item vouchers (sales, purchase, credit_note, debit_note, orders)
  const isItemVoucher = ['sales', 'purchase', 'credit_note', 'debit_note', 'sales_order', 'purchase_order'].includes(voucherType);

  const [lineItems, setLineItems] = useState<VoucherLineItem[]>(() => {
    if (existingVoucher?.items && existingVoucher.items.length > 0) return existingVoucher.items;
    if (isItemVoucher && items.length > 0) {
      const firstItem = items[0];
      const rate = voucherType === 'purchase' ? firstItem.costPrice : firstItem.sellingPrice;
      const taxAmt = (rate * 1 * firstItem.taxRate) / 100;
      return [
        {
          itemId: firstItem.id,
          itemName: firstItem.name,
          unitId: firstItem.unitId,
          quantity: 10,
          rate,
          discountPercent: 0,
          taxRate: firstItem.taxRate,
          taxAmount: taxAmt * 10,
          amount: (rate * 10) + (taxAmt * 10),
        },
      ];
    }
    return [];
  });

  // Manual Journal Lines (Strict Double-Entry)
  const [journalLines, setJournalLines] = useState<JournalEntryLine[]>(() => {
    if (existingVoucher?.journalEntries) return existingVoucher.journalEntries;

    if (voucherType === 'sales') {
      return [
        { ledgerId: 'led_ar', ledgerName: 'Accounts Receivable (Sundry Debtors)', debit: 0, credit: 0 },
        { ledgerId: 'led_sales', ledgerName: 'Direct Sales Account', debit: 0, credit: 0 },
        { ledgerId: 'led_tax_payable', ledgerName: 'GST Output Tax Payable', debit: 0, credit: 0 },
      ];
    }
    if (voucherType === 'purchase') {
      return [
        { ledgerId: 'led_purchase', ledgerName: 'Direct Purchase Account (COGS)', debit: 0, credit: 0 },
        { ledgerId: 'led_tax_payable', ledgerName: 'GST Input/Output Tax', debit: 0, credit: 0 },
        { ledgerId: 'led_ap', ledgerName: 'Accounts Payable (Sundry Creditors)', debit: 0, credit: 0 },
      ];
    }
    if (voucherType === 'receipt') {
      return [
        { ledgerId: 'led_cash', ledgerName: 'Cash in Hand', debit: 10000, credit: 0 },
        { ledgerId: 'led_ar', ledgerName: 'Accounts Receivable (Sundry Debtors)', debit: 0, credit: 10000 },
      ];
    }
    if (voucherType === 'payment') {
      return [
        { ledgerId: 'led_ap', ledgerName: 'Accounts Payable (Sundry Creditors)', debit: 10000, credit: 0 },
        { ledgerId: 'led_bank_hdfc', ledgerName: 'HDFC Bank - Current A/c 50100', debit: 0, credit: 10000 },
      ];
    }
    if (voucherType === 'contra') {
      return [
        { ledgerId: 'led_bank_icici', ledgerName: 'ICICI Bank - POS Collection A/c 90211', debit: 5000, credit: 0 },
        { ledgerId: 'led_cash', ledgerName: 'Cash in Hand', debit: 0, credit: 5000 },
      ];
    }
    // generic journal
    return [
      { ledgerId: ledgers[0]?.id || 'led_cash', debit: 1000, credit: 0 },
      { ledgerId: ledgers[1]?.id || 'led_sales', debit: 0, credit: 1000 },
    ];
  });

  // Automatically recalculate journal entries whenever line items change for sales/purchase/credit/debit notes
  useEffect(() => {
    if (!isItemVoucher || isViewOnly) return;

    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate * (1 - item.discountPercent / 100)), 0);
    const taxTotal = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = subtotal + taxTotal;

    if (voucherType === 'sales') {
      setJournalLines([
        { ledgerId: 'led_ar', ledgerName: 'Accounts Receivable (Sundry Debtors)', debit: Math.round(total * 100) / 100, credit: 0 },
        { ledgerId: 'led_sales', ledgerName: 'Direct Sales Account', debit: 0, credit: Math.round(subtotal * 100) / 100 },
        { ledgerId: 'led_tax_payable', ledgerName: 'GST Output Tax Payable', debit: 0, credit: Math.round(taxTotal * 100) / 100 },
      ]);
    } else if (voucherType === 'purchase') {
      setJournalLines([
        { ledgerId: 'led_purchase', ledgerName: 'Direct Purchase Account (COGS)', debit: Math.round(subtotal * 100) / 100, credit: 0 },
        { ledgerId: 'led_tax_payable', ledgerName: 'GST Input/Output Tax', debit: Math.round(taxTotal * 100) / 100, credit: 0 },
        { ledgerId: 'led_ap', ledgerName: 'Accounts Payable (Sundry Creditors)', debit: 0, credit: Math.round(total * 100) / 100 },
      ]);
    } else if (voucherType === 'credit_note') {
      setJournalLines([
        { ledgerId: 'led_sales', ledgerName: 'Direct Sales Account', debit: Math.round(subtotal * 100) / 100, credit: 0 },
        { ledgerId: 'led_tax_payable', ledgerName: 'GST Output Tax Payable', debit: Math.round(taxTotal * 100) / 100, credit: 0 },
        { ledgerId: 'led_ar', ledgerName: 'Accounts Receivable (Sundry Debtors)', debit: 0, credit: Math.round(total * 100) / 100 },
      ]);
    } else if (voucherType === 'debit_note') {
      setJournalLines([
        { ledgerId: 'led_ap', ledgerName: 'Accounts Payable (Sundry Creditors)', debit: Math.round(total * 100) / 100, credit: 0 },
        { ledgerId: 'led_purchase', ledgerName: 'Direct Purchase Account (COGS)', debit: 0, credit: Math.round(subtotal * 100) / 100 },
        { ledgerId: 'led_tax_payable', ledgerName: 'GST Input/Output Tax', debit: 0, credit: Math.round(taxTotal * 100) / 100 },
      ]);
    }
  }, [lineItems, voucherType, isItemVoucher, isViewOnly]);

  // Derived calculation of totals
  const totalDebit = journalLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = journalLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.02;

  // Selected Location details
  const selectedLoc = locations.find(l => l.id === locationId);
  const matchedVehicle = vehicles.find(v => v.locationId === locationId || v.id === selectedLoc?.assignedVehicleId);
  const matchedDriver = matchedVehicle ? drivers.find(d => d.id === matchedVehicle.assignedDriverId) : undefined;

  // Handlers for Line Items
  const handleItemChange = (index: number, itemId: string) => {
    const itm = items.find(i => i.id === itemId);
    if (!itm) return;
    const rate = voucherType === 'purchase' ? itm.costPrice : itm.sellingPrice;
    const next = [...lineItems];
    const qty = next[index]?.quantity || 1;
    const discount = next[index]?.discountPercent || 0;
    const taxable = qty * rate * (1 - discount / 100);
    const taxAmount = (taxable * itm.taxRate) / 100;

    next[index] = {
      itemId: itm.id,
      itemName: itm.name,
      unitId: itm.unitId,
      quantity: qty,
      rate,
      discountPercent: discount,
      taxRate: itm.taxRate,
      taxAmount: Math.round(taxAmount * 100) / 100,
      amount: Math.round((taxable + taxAmount) * 100) / 100,
    };
    setLineItems(next);
  };

  const handleLineQtyRateDiscount = (index: number, field: 'quantity' | 'rate' | 'discountPercent', value: number) => {
    const next = [...lineItems];
    const row = { ...next[index], [field]: value };
    const itm = items.find(i => i.id === row.itemId);
    const taxRate = itm ? itm.taxRate : row.taxRate;
    const taxable = row.quantity * row.rate * (1 - (row.discountPercent || 0) / 100);
    const taxAmount = (taxable * taxRate) / 100;

    row.taxAmount = Math.round(taxAmount * 100) / 100;
    row.amount = Math.round((taxable + taxAmount) * 100) / 100;
    next[index] = row;
    setLineItems(next);
  };

  const addLineItem = () => {
    if (items.length === 0) return;
    const first = items[0];
    const rate = voucherType === 'purchase' ? first.costPrice : first.sellingPrice;
    const taxAmount = (rate * 1 * first.taxRate) / 100;
    setLineItems(prev => [
      ...prev,
      {
        itemId: first.id,
        itemName: first.name,
        unitId: first.unitId,
        quantity: 1,
        rate,
        discountPercent: 0,
        taxRate: first.taxRate,
        taxAmount,
        amount: rate + taxAmount,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  // Handlers for Journal lines
  const handleJournalLineChange = (index: number, field: 'ledgerId' | 'debit' | 'credit', value: any) => {
    const next = [...journalLines];
    next[index] = { ...next[index], [field]: value };
    setJournalLines(next);
  };

  const addJournalLine = () => {
    setJournalLines(prev => [...prev, { ledgerId: ledgers[0]?.id || '', debit: 0, credit: 0 }]);
  };

  const removeJournalLine = (index: number) => {
    if (journalLines.length <= 2) return;
    setJournalLines(prev => prev.filter((_, i) => i !== index));
  };

  // Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isBalanced) {
      setErrorMsg(`Cannot post voucher: Debit total (${totalDebit.toFixed(2)}) must equal Credit total (${totalCredit.toFixed(2)}).`);
      return;
    }

    const partyObj = partyType === 'customer'
      ? customers.find(c => c.id === partyId)
      : partyType === 'supplier'
      ? suppliers.find(s => s.id === partyId)
      : undefined;

    const subtotal = lineItems.reduce((sum, i) => sum + (i.quantity * i.rate * (1 - i.discountPercent / 100)), 0);
    const taxTotal = lineItems.reduce((sum, i) => sum + i.taxAmount, 0);

    const result = addVoucher({
      voucherNumber,
      voucherType,
      date,
      partyType,
      partyId,
      partyName: partyObj?.name,
      locationId,
      locationName: selectedLoc?.name,
      vehicleId: matchedVehicle?.id,
      driverId: matchedDriver?.id,
      referenceNumber,
      narration: narration || `Transaction posted via ${voucherType.toUpperCase()} voucher`,
      items: isItemVoucher ? lineItems : undefined,
      subtotal: isItemVoucher ? subtotal : undefined,
      taxTotal: isItemVoucher ? taxTotal : undefined,
      totalAmount: totalDebit,
      journalEntries: journalLines.map(j => ({
        ...j,
        ledgerName: ledgers.find(l => l.id === j.ledgerId)?.name || 'General Ledger',
      })),
      status: 'posted',
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to post voucher');
    } else {
      closeVoucherModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 capitalize tracking-tight flex items-center gap-2">
                <span>{isViewOnly ? 'View Voucher Details' : `New ${voucherType.replace('_', ' ')} Voucher`}</span>
                <span className="text-xs font-mono font-normal text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {voucherNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Strict Double-Entry Accounting Rule: Debits must balance Credits.
              </p>
            </div>
          </div>
          <button
            onClick={closeVoucherModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Top metadata grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Voucher Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  disabled={isViewOnly}
                  onChange={e => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-indigo-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Godown / Location (Van)
              </label>
              <select
                value={locationId}
                disabled={isViewOnly}
                onChange={e => setLocationId(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-indigo-600"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.type === 'van' ? '🚐' : '🏢'}
                  </option>
                ))}
              </select>
              {matchedVehicle && (
                <div className="text-[10px] text-indigo-700 mt-1 font-medium">
                  {matchedVehicle.regNumber} ({matchedDriver?.name || 'Driver assigned'})
                </div>
              )}
            </div>

            {(voucherType === 'sales' || voucherType === 'receipt' || voucherType === 'credit_note' || voucherType === 'sales_order') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Customer Party
                </label>
                <select
                  value={partyId}
                  disabled={isViewOnly}
                  onChange={e => setPartyId(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-indigo-600"
                  required
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(voucherType === 'purchase' || voucherType === 'payment' || voucherType === 'debit_note' || voucherType === 'purchase_order') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Supplier Party
                </label>
                <select
                  value={partyId}
                  disabled={isViewOnly}
                  onChange={e => setPartyId(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-indigo-600"
                  required
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Reference / Order #
              </label>
              <input
                type="text"
                value={referenceNumber}
                disabled={isViewOnly}
                placeholder="e.g. PO-8821 / SPOT-90"
                onChange={e => setReferenceNumber(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-indigo-600"
              />
            </div>
          </div>

          {/* If Item Voucher: Line items table */}
          {isItemVoucher && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>Inventory Item Line Details</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Auto-updates Godown / Van Stock & Debits/Credits)
                  </span>
                </h3>
                {!isViewOnly && (
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Row</span>
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3 w-4/12">Item Description</th>
                      <th className="py-2 px-3 w-2/12 text-right">Quantity</th>
                      <th className="py-2 px-3 w-2/12 text-right">Rate ({company.currencySymbol})</th>
                      <th className="py-2 px-3 w-1/12 text-right">Disc %</th>
                      <th className="py-2 px-3 w-1/12 text-right">Tax %</th>
                      <th className="py-2 px-3 w-2/12 text-right">Total ({company.currencySymbol})</th>
                      {!isViewOnly && <th className="py-2 px-2 w-10 text-center"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lineItems.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2">
                          {isViewOnly ? (
                            <span className="font-medium text-slate-800">{line.itemName}</span>
                          ) : (
                            <select
                              value={line.itemId}
                              onChange={e => handleItemChange(idx, e.target.value)}
                              className="w-full text-xs p-1.5 border border-slate-300 rounded-md bg-white focus:outline-indigo-600"
                            >
                              {items.map(it => (
                                <option key={it.id} value={it.id}>
                                  {it.name} ({it.sku})
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          {isViewOnly ? (
                            <span className="font-mono">{line.quantity}</span>
                          ) : (
                            <input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={e => handleLineQtyRateDiscount(idx, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-20 text-xs text-right p-1.5 border border-slate-300 rounded-md font-mono"
                            />
                          )}
                        </td>
                        <td className="p-2 text-right">
                          {isViewOnly ? (
                            <span className="font-mono">{line.rate.toFixed(2)}</span>
                          ) : (
                            <input
                              type="number"
                              step="0.1"
                              value={line.rate}
                              onChange={e => handleLineQtyRateDiscount(idx, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-24 text-xs text-right p-1.5 border border-slate-300 rounded-md font-mono"
                            />
                          )}
                        </td>
                        <td className="p-2 text-right">
                          {isViewOnly ? (
                            <span className="font-mono">{line.discountPercent}%</span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={line.discountPercent}
                              onChange={e => handleLineQtyRateDiscount(idx, 'discountPercent', parseFloat(e.target.value) || 0)}
                              className="w-16 text-xs text-right p-1.5 border border-slate-300 rounded-md font-mono"
                            />
                          )}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-600">
                          {line.taxRate}%
                        </td>
                        <td className="p-2 text-right font-mono font-semibold text-slate-900">
                          {line.amount.toFixed(2)}
                        </td>
                        {!isViewOnly && (
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeLineItem(idx)}
                              disabled={lineItems.length === 1}
                              className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Double-Entry Journal Lines (Strict Accounting) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>Double-Entry General Ledger Postings</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  (Standard Tally & Zoho debit/credit ledger validation)
                </span>
              </h3>
              {!isViewOnly && !isItemVoucher && (
                <button
                  type="button"
                  onClick={addJournalLine}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Ledger Row</span>
                </button>
              )}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2 px-3 w-6/12">Ledger Account</th>
                    <th className="py-2 px-3 w-3/12 text-right">Debit ({company.currencySymbol})</th>
                    <th className="py-2 px-3 w-3/12 text-right">Credit ({company.currencySymbol})</th>
                    {!isViewOnly && !isItemVoucher && <th className="py-2 px-2 w-10"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {journalLines.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        {isViewOnly ? (
                          <span className="font-semibold text-slate-800">{entry.ledgerName || entry.ledgerId}</span>
                        ) : (
                          <select
                            value={entry.ledgerId}
                            disabled={isItemVoucher}
                            onChange={e => handleJournalLineChange(idx, 'ledgerId', e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-300 rounded-md bg-white focus:outline-indigo-600 disabled:bg-slate-100 disabled:text-slate-700"
                          >
                            {ledgers.map(l => (
                              <option key={l.id} value={l.id}>
                                {l.name} [{l.type.toUpperCase()}]
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        {isViewOnly ? (
                          <span className="font-mono font-medium">{entry.debit ? entry.debit.toFixed(2) : '-'}</span>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={entry.debit || ''}
                            disabled={isItemVoucher}
                            onChange={e => handleJournalLineChange(idx, 'debit', parseFloat(e.target.value) || 0)}
                            className="w-32 text-xs text-right p-1.5 border border-slate-300 rounded-md font-mono disabled:bg-slate-100"
                          />
                        )}
                      </td>
                      <td className="p-2 text-right">
                        {isViewOnly ? (
                          <span className="font-mono font-medium">{entry.credit ? entry.credit.toFixed(2) : '-'}</span>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={entry.credit || ''}
                            disabled={isItemVoucher}
                            onChange={e => handleJournalLineChange(idx, 'credit', parseFloat(e.target.value) || 0)}
                            className="w-32 text-xs text-right p-1.5 border border-slate-300 rounded-md font-mono disabled:bg-slate-100"
                          />
                        )}
                      </td>
                      {!isViewOnly && !isItemVoucher && (
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeJournalLine(idx)}
                            disabled={journalLines.length <= 2}
                            className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-mono text-xs font-bold text-slate-800">
                  <tr>
                    <td className="p-2.5">Total</td>
                    <td className="p-2.5 text-right">{totalDebit.toFixed(2)}</td>
                    <td className="p-2.5 text-right">{totalCredit.toFixed(2)}</td>
                    {!isViewOnly && !isItemVoucher && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Invariant indicator bar */}
            <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
              isBalanced
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">
                  {isBalanced
                    ? 'Double-Entry Invariant Satisfied: Debit equals Credit.'
                    : `Double-Entry Validation Failed: Unbalanced difference of ${company.currencySymbol} ${difference.toFixed(2)}.`}
                </span>
              </div>
              <div className="font-mono text-[11px] font-semibold">
                Debit: {totalDebit.toFixed(2)} | Credit: {totalCredit.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Narration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Voucher Narration / Remarks
            </label>
            <textarea
              rows={2}
              value={narration}
              disabled={isViewOnly}
              onChange={e => setNarration(e.target.value)}
              placeholder="Enter accounting narration (e.g., Sold on spot delivery against Order #892)..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-indigo-600"
            />
          </div>
        </form>

        {/* Footer actions */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-xl">
          <div className="text-xs text-slate-500">
            {isViewOnly ? 'Posting Status: Posted & Audited' : 'Press "Post Voucher" to save into General Ledger & Inventory Matrix.'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeVoucherModal}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {isViewOnly ? 'Close' : 'Cancel'}
            </button>
            {!isViewOnly && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isBalanced}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Post Voucher</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
