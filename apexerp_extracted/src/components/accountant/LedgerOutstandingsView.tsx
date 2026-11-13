import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { CustomerOutstandingsView } from '../sales/CustomerOutstandingsView';
import { SupplierOutstandingsView } from '../purchase/SupplierOutstandingsView';
import { Clock, Users, Building } from 'lucide-react';

export const LedgerOutstandingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Bill-Wise Ledger Outstandings (Customers & Suppliers)
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'customers'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customer Receivables Aging</span>
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'suppliers'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Supplier Payables Aging</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'customers' ? <CustomerOutstandingsView /> : <SupplierOutstandingsView />}
    </div>
  );
};
