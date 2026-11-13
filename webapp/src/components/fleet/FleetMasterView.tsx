import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Vehicle } from '../../types/erp';
import { Truck, Plus, CheckCircle2, AlertCircle, Wrench, Calendar, X, Eye } from 'lucide-react';

export const FleetMasterView: React.FC = () => {
  const { vehicles, addVehicle, updateVehicle, drivers, locations, setCurrentView, setSelectedFleetId } = useErp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [regNumber, setRegNumber] = useState('');
  const [model, setModel] = useState('');
  const [make, setMake] = useState('Tata Motors');
  const [capacityKg, setCapacityKg] = useState<number>(1200);
  const [fuelType, setFuelType] = useState<'Diesel' | 'Petrol' | 'EV' | 'CNG'>('Diesel');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  const [locationId, setLocationId] = useState(locations.find(l => l.type === 'van')?.id || 'loc_van1');
  const [insuranceExpiry, setInsuranceExpiry] = useState('2027-04-15');
  const [status, setStatus] = useState<'on_field' | 'in_depot' | 'maintenance'>('on_field');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber || !model) return;
    addVehicle({
      regNumber,
      model,
      make,
      capacityKg,
      fuelType,
      assignedDriverId,
      locationId,
      insuranceExpiry,
      status,
    });
    setShowAddModal(false);
    setRegNumber('');
    setModel('');
  };

  const handleStatusChange = (veh: Vehicle, newStatus: any) => {
    updateVehicle({ ...veh, status: newStatus });
  };

  const openFleetReport = (vehId: string) => {
    setSelectedFleetId(vehId);
    setCurrentView('fleet_wise_report');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fleet Vehicle Master</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registration numbers, load capacity, fuel specifications, assigned driver, and live field status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Delivery Vehicle</span>
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.map(v => {
          const driver = drivers.find(d => d.id === v.assignedDriverId);
          const loc = locations.find(l => l.id === v.locationId);

          return (
            <div
              key={v.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-mono tracking-tight text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {v.regNumber}
                  </span>
                  <select
                    value={v.status}
                    onChange={e => handleStatusChange(v, e.target.value)}
                    className={`text-xs font-bold rounded-full px-2.5 py-0.5 border cursor-pointer ${
                      v.status === 'on_field'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : v.status === 'in_depot'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <option value="on_field">● On Field</option>
                    <option value="in_depot">● In Depot</option>
                    <option value="maintenance">● Maintenance</option>
                  </select>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-bold text-slate-900">{v.model}</h3>
                  <p className="text-xs text-slate-500">{v.make} · {v.fuelType}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Driver:</span>
                    <span className="font-semibold text-slate-800">{driver?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Linked Van Location:</span>
                    <span className="font-semibold text-slate-800">{loc?.name || 'Central'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payload Capacity:</span>
                    <span className="font-mono font-medium">{v.capacityKg} KG</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Insurance Expiry:</span>
                    <span className="font-mono text-slate-700">{v.insuranceExpiry}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => openFleetReport(v.id)}
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Fleet Dashboard</span>
                </button>
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
              <h3 className="text-sm font-bold text-slate-900">Add Fleet Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registration Plate Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-EA-1024"
                  value={regNumber}
                  onChange={e => setRegNumber(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata Ace Gold"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={make}
                    onChange={e => setMake(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payload Capacity (KG)</label>
                  <input
                    type="number"
                    value={capacityKg}
                    onChange={e => setCapacityKg(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="EV">Electric (EV)</option>
                    <option value="Petrol">Petrol</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Driver / Salesman</label>
                <select
                  value={assignedDriverId}
                  onChange={e => setAssignedDriverId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Select Driver --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.routeArea})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Insurance Expiry Date</label>
                <input
                  type="date"
                  value={insuranceExpiry}
                  onChange={e => setInsuranceExpiry(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
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
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
