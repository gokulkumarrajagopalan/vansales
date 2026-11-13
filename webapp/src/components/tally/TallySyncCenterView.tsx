import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  RotateCw,
  CheckCircle,
  AlertTriangle,
  Server,
  FileCode,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
  Zap,
  Key,
  Copy,
  Check,
} from 'lucide-react';

export const TallySyncCenterView: React.FC = () => {
  const { orders, syncOrderToTally, themeColor } = useErp();

  const [tallyHost, setTallyHost] = useState('http://localhost:9000');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [xmlPreviewOrder, setXmlPreviewOrder] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const tallyApiKey = 'VB-API-KEY-998877';
  const tallyEndpoint = 'http://localhost:8080/api/tally';

  const copyTallyCredentials = () => {
    navigator.clipboard.writeText(`TalliffyApiUrl: "${tallyEndpoint}"\nTalliffyApiKey: "${tallyApiKey}"\nTalliffyUser: "tally_connector"\nTalliffyPass: "StrongPassword123!"`);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const approvedOrders = orders.filter(o => o.status === 'approved');
  const pendingSync = approvedOrders.filter(o => o.tallySyncStatus !== 'synced');
  const syncedOrders = approvedOrders.filter(o => o.tallySyncStatus === 'synced');

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      pendingSync.forEach(o => syncOrderToTally(o.id));
      setIsSyncingAll(false);
      setLastSyncTime(new Date().toLocaleTimeString('en-IN'));
    }, 1500);
  };

  const generateSampleXml = (orderNumber: string) => {
    return `<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>20261031</DATE>
            <VOUCHERNUMBER>${orderNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>Sundry Debtors</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Invoice View</PERSISTEDVIEW>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Agro Sales Account</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>15000.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
  };

  return (
    <div className="p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl text-white shadow-sm" style={{ backgroundColor: themeColor }}>
              <Server className="w-5 h-5" />
            </span>
            TallyPrime ERP Sync Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized XML Gateway synchronizing approved field bills, credit notes, and collection vouchers to TallyPrime.
          </p>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={isSyncingAll || pendingSync.length === 0}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: themeColor }}
        >
          <RotateCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
          <span>Sync All Pending ({pendingSync.length})</span>
        </button>
      </div>

      {/* TDL Connector One-Time API Key Credentials Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-lg">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Tally TDL API Gateway Key & Secret (One-Time Setup)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Paste these static credentials once into <code className="text-blue-300 font-mono">talliffy_sync.tdl</code> or inside Tally Gateway Configuration.
              </p>
            </div>
          </div>
          <button
            onClick={copyTallyCredentials}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? 'Credentials Copied!' : 'Copy TDL Config'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">API Endpoint URL</span>
            <code className="text-blue-300 font-mono truncate block text-[11px]">{tallyEndpoint}</code>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Tally API Key</span>
            <code className="text-emerald-300 font-mono block text-[11px] font-bold">{tallyApiKey}</code>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Connector User</span>
            <code className="text-amber-300 font-mono block text-[11px]">tally_connector</code>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Connector Password</span>
            <code className="text-purple-300 font-mono block text-[11px]">StrongPassword123!</code>
          </div>
        </div>
      </div>

      {/* Connectivity & Gateway Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tally XML Port</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Connected (Port 9000)
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">{tallyHost}</div>
          <div className="text-[11px] text-slate-400 mt-1">TallyPrime Release 4.x / 5.x Ready</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sync Status</span>
            <span className="text-[11px] text-slate-400">Last: {lastSyncTime}</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {syncedOrders.length} / {approvedOrders.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Approved Invoices Posted to Ledgers</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Voucher Queue</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              {pendingSync.length} In Queue
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {pendingSync.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting Transmission to Tally</div>
        </div>
      </div>

      {/* Sync Queue Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Approved Order Voucher Transmission Register
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-semibold uppercase text-[11px] border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 px-3">Order Number</th>
                <th className="py-2.5 px-3">Customer / Retailer</th>
                <th className="py-2.5 px-3 text-right">Invoice Amount</th>
                <th className="py-2.5 px-3 text-center">Transmission Status</th>
                <th className="py-2.5 px-3">Tally Voucher Ref</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {approvedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No approved bills ready for Tally transmission.
                  </td>
                </tr>
              ) : (
                approvedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {order.vendorShopName}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                      ₹{order.finalTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {order.tallySyncStatus === 'synced' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          <span>Synced</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <RotateCw className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {order.tallyVoucherNumber || '-'}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => setXmlPreviewOrder(order.orderNumber)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="View XML Payload"
                      >
                        <FileCode className="w-4 h-4 inline" />
                      </button>

                      {order.tallySyncStatus !== 'synced' && (
                        <button
                          onClick={() => syncOrderToTally(order.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[10px] shadow-xs"
                        >
                          Sync Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* XML PREVIEW MODAL */}
      {xmlPreviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-500" />
                Tally XML Request Payload (Voucher #{xmlPreviewOrder})
              </h3>
              <button
                onClick={() => setXmlPreviewOrder(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-96">
              {generateSampleXml(xmlPreviewOrder)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
