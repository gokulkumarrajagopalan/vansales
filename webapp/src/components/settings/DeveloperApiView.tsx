import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Code,
  Key,
  Copy,
  Check,
  Send,
  Server,
  Smartphone,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const DeveloperApiView: React.FC = () => {
  const { company, locations, vehicles, currentUser, setCurrentView } = useErp();

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Mobile Sync API credentials and integration endpoints are strictly restricted to <strong>System Administrators</strong>.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const [apiKey, setApiKey] = useState('tlf_live_api_8921df09bbca41808381920ac');
  const [copied, setCopied] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('sync_invoice');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = [
    {
      id: 'sync_invoice',
      method: 'POST',
      path: '/api/v1/sync/invoices',
      title: 'Sync Van Spot Invoice',
      desc: 'Sync sales invoices generated on the driver mobile app to backend ERP with automatic double-entry and van stock deduction.',
      curl: `curl -X POST http://localhost:8080/api/v1/sync/invoices \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "vehicleId": "veh_1",
    "locationId": "loc_van1",
    "customerId": "cust_2",
    "invoiceDate": "2026-10-26",
    "items": [
      { "itemId": "item_coke_500", "quantity": 24, "rate": 40.0, "taxRate": 18 },
      { "itemId": "item_goodday_100", "quantity": 50, "rate": 30.0, "taxRate": 12 }
    ],
    "paymentCollected": 1500.0,
    "paymentMode": "cash"
  }'`,
      response: `{
  "status": "success",
  "voucherNumber": "SINV-2026-009",
  "totalAmount": 2724.0,
  "balanceOutstanding": 1224.0,
  "doubleEntryPosted": true,
  "vanStockUpdated": true,
  "timestamp": "2026-10-26T20:15:00Z"
}`,
    },
    {
      id: 'get_van_stock',
      method: 'GET',
      path: '/api/v1/vans/{vanLocationId}/stock',
      title: 'Fetch Live Van Stock',
      desc: 'Mobile app downloads current available inventory on the van for offline spot sales validation.',
      curl: `curl -X GET http://localhost:8080/api/v1/vans/loc_van1/stock \\
  -H "Authorization: Bearer ${apiKey}"`,
      response: `{
  "vanLocationId": "loc_van1",
  "vehicleRegNumber": "KA-01-EA-1024",
  "items": [
    { "itemId": "item_coke_500", "sku": "BEV-COKE-500", "quantity": 180, "sellingPrice": 40.0 },
    { "itemId": "item_redbull_250", "sku": "BEV-RDBL-250", "quantity": 60, "sellingPrice": 125.0 },
    { "itemId": "item_goodday_100", "sku": "CONF-GDAY-100", "quantity": 240, "sellingPrice": 30.0 }
  ],
  "lastSyncedAt": "2026-10-26T20:00:00Z"
}`,
    },
    {
      id: 'sync_collection',
      method: 'POST',
      path: '/api/v1/sync/collections',
      title: 'Sync Payment Receipt',
      desc: 'Record cash or UPI payments collected by driver against customer invoices.',
      curl: `curl -X POST http://localhost:8080/api/v1/sync/collections \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerId": "cust_1",
    "amount": 10000.0,
    "paymentMode": "upi",
    "upiRef": "UPI-88910249",
    "invoiceAllocation": [
      { "invoiceNumber": "SINV-2026-001", "amount": 10000.0 }
    ]
  }'`,
      response: `{
  "status": "success",
  "receiptNumber": "RCPT-2026-008",
  "allocatedAmount": 10000.0,
  "customerRemainingOutstanding": 38500.0
}`,
    },
    {
      id: 'get_customers',
      method: 'GET',
      path: '/api/v1/routes/{routeId}/customers',
      title: 'Fetch Route Customers & Credit Limits',
      desc: 'Downloads route stores, credit limits, credit days, and phone numbers for offline route planning.',
      curl: `curl -X GET http://localhost:8080/api/v1/routes/route_1/customers \\
  -H "Authorization: Bearer ${apiKey}"`,
      response: `{
  "route": "Route 1 - North Belt",
  "customers": [
    { "id": "cust_1", "name": "Metro Hypermarket", "outstanding": 48500.0, "creditLimit": 150000.0, "creditDays": 30 },
    { "id": "cust_2", "name": "Green Basket Mart", "outstanding": 32000.0, "creditLimit": 80000.0, "creditDays": 15 }
  ]
}`,
    },
  ];

  const currentEp = endpoints.find(e => e.id === selectedEndpoint) || endpoints[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Mobile Sync API</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              REST v1 OpenAPI
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Connect your React Native / Android field sales application to this Talliffy API instance.
          </p>
        </div>
      </div>

      {/* API Key Box */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Talliffy Production API Bearer Token</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Live & Authorised</span>
        </div>

        <div className="mt-3 flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
          <span className="text-indigo-300 truncate flex-1">{apiKey}</span>
          <button
            onClick={() => copyToClipboard(apiKey)}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-sans font-semibold flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Pass this token in header: <code className="text-indigo-300 font-mono">Authorization: Bearer &lt;TOKEN&gt;</code> for all mobile syncing calls.
        </p>
      </div>

      {/* Interactive API Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block px-1">
            Available Synchronization Endpoints:
          </span>
          {endpoints.map(ep => (
            <button
              key={ep.id}
              onClick={() => setSelectedEndpoint(ep.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                selectedEndpoint === ep.id
                  ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500/30 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                  ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {ep.method}
                </span>
                <span className="text-xs font-bold text-slate-900">{ep.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">{ep.path}</p>
            </button>
          ))}
        </div>

        {/* Selected Endpoint Documentation */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                currentEp.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {currentEp.method}
              </span>
              <span className="font-mono text-sm font-bold text-slate-900">{currentEp.path}</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-2">{currentEp.title}</h2>
            <p className="text-xs text-slate-600 mt-1">{currentEp.desc}</p>
          </div>

          {/* cURL Snippet */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">cURL Request Example</span>
              <button
                onClick={() => copyToClipboard(currentEp.curl)}
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3 h-3" />
                <span>Copy cURL</span>
              </button>
            </div>
            <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {currentEp.curl}
            </pre>
          </div>

          {/* Response Payload */}
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Expected 200 OK JSON Response</span>
            <pre className="bg-slate-900 text-emerald-300 p-4 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {currentEp.response}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
