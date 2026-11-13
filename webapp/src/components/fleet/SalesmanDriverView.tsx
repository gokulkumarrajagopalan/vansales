import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { SalesmanDriver } from '../../types/erp';
import { UserCheck, Plus, Phone, Truck, Target, Award, X } from 'lucide-react';

export const SalesmanDriverView: React.FC = () => {
  const { drivers, addDriver, vehicles, company } = useErp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [code, setCode] = useState(`SM-00${drivers.length + 1}`);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [assignedVehicleId, setAssignedVehicleId] = useState('');
  const [routeArea, setRouteArea] = useState('Route 1 - North Belt');
  const [monthlyTarget, setMonthlyTarget] = useState<number>(400000);
  const [commissionPercentage, setCommissionPercentage] = useState<number>(2.5);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    addDriver({
      code,
      name,
      phone,
      licenseNumber,
      assignedVehicleId,
      routeArea,
      monthlyTarget,
      commissionPercentage,
      status: 'active',
    });
    setShowAddModal(false);
    setName('');
    setPhone('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Salesman & Driver Master Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Van salesmen, driver contacts, DL credentials, assigned route territories, sales targets, and commissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Salesman / Driver</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {drivers.map(drv => {
          const veh = vehicles.find(v => v.id === drv.assignedVehicleId || v.assignedDriverId === drv.id);

          return (
            <div
              key={drv.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {drv.code}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active Driver
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    {drv.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{drv.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{drv.phone}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Van:</span>
                    <span className="font-mono font-bold text-slate-800">{veh?.regNumber || 'Not Linked'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Route Area:</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[180px] truncate">{drv.routeArea}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Target:</span>
                    <span className="font-mono font-bold text-indigo-950">
                      {company.currencySymbol} {drv.monthlyTarget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Commission Rate:</span>
                    <span className="font-mono font-semibold text-emerald-700">{drv.commissionPercentage}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                DL: {drv.licenseNumber}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add Salesman / Van Driver</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98800..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Driving License No.</label>
                  <input
                    type="text"
                    required
                    placeholder="KA01-2020-001928"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Vehicle</label>
                <select
                  value={assignedVehicleId}
                  onChange={e => setAssignedVehicleId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Select Van --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.regNumber} ({v.model})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Route Belt Area</label>
                <input
                  type="text"
                  value={routeArea}
                  onChange={e => setRouteArea(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Target ({company.currencySymbol})</label>
                  <input
                    type="number"
                    value={monthlyTarget}
                    onChange={e => setMonthlyTarget(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commission %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={commissionPercentage}
                    onChange={e => setCommissionPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Salesman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
