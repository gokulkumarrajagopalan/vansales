import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { CropAdvisory } from '../../types/erp';
import {
  Sprout,
  Search,
  Plus,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  FileText,
  X,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export const CropAdvisoryDeskView: React.FC = () => {
  const { cropAdvisories, resolveAdvisory, addAdvisory, themeColor } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdvisory, setSelectedAdvisory] = useState<CropAdvisory | null>(null);
  const [solutionNotes, setSolutionNotes] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  // New ticket state
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newCropName, setNewCropName] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const filteredAdvisories = cropAdvisories.filter(a => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      a.farmerName.toLowerCase().includes(q) ||
      a.cropName.toLowerCase().includes(q) ||
      a.district.toLowerCase().includes(q) ||
      a.issueDescription.toLowerCase().includes(q)
    );
  });

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdvisory || !solutionNotes.trim()) return;
    resolveAdvisory(selectedAdvisory.id, solutionNotes.trim());
    setSelectedAdvisory(null);
    setSolutionNotes('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName.trim() || !newCropName.trim() || !newDescription.trim()) return;

    addAdvisory({
      farmerName: newFarmerName.trim(),
      mobileNumber: newMobile.trim() || '+91 98000 00000',
      cropName: newCropName.trim(),
      district: newDistrict.trim() || 'Central Belt',
      issueDescription: newDescription.trim(),
    });

    setNewFarmerName('');
    setNewMobile('');
    setNewCropName('');
    setNewDistrict('');
    setNewDescription('');
    setShowNewModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl text-white shadow-sm" style={{ backgroundColor: themeColor }}>
              <Sprout className="w-5 h-5" />
            </span>
            Field Support Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resolve field retailer inquiries, product feedback, and route delivery support tickets.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition flex items-center gap-1.5"
          style={{ backgroundColor: themeColor }}
        >
          <Plus className="w-4 h-4" />
          <span>New Consultation Ticket</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Farmer, Crop, District, Disease..."
            className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing {filteredAdvisories.length} Advisory Requests
        </div>
      </div>

      {/* Advisory Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAdvisories.map(advisory => {
          const isResolved = advisory.status === 'Resolved';
          return (
            <div
              key={advisory.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                      🌾 {advisory.cropName}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 animate-pulse'
                    }`}
                  >
                    {isResolved ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{advisory.status}</span>
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {advisory.farmerName}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{advisory.mobileNumber}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{advisory.district}</span>
                  </span>
                </div>

                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Reported Issue:</span>
                  <p className="line-clamp-3">{advisory.issueDescription}</p>
                </div>

                {advisory.solutionNotes && (
                  <div className="mt-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold block text-[10px] uppercase">Prescribed Agro Solution:</span>
                    <p>{advisory.solutionNotes}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {new Date(advisory.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>

                {!isResolved ? (
                  <button
                    onClick={() => {
                      setSelectedAdvisory(advisory);
                      setSolutionNotes('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition flex items-center gap-1 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Provide Advisory</span>
                  </button>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Resolved</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW CONSULTATION TICKET MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                  New Field Consultation Ticket
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Register a retailer/farmer crop advisory request or product feedback.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Farmer / Retailer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFarmerName}
                    onChange={e => setNewFarmerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newMobile}
                    onChange={e => setNewMobile(e.target.value)}
                    placeholder="e.g. +91 98450 12345"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Crop / Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCropName}
                    onChange={e => setNewCropName(e.target.value)}
                    placeholder="e.g. Pomegranate / Tomato"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    District / Route Belt <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDistrict}
                    onChange={e => setNewDistrict(e.target.value)}
                    placeholder="e.g. Bengaluru Rural / Hebbal"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue / Query Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Describe leaf yellowing, pest attack, dosage query, or delivery inquiry..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
                  style={{ backgroundColor: themeColor }}
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE ADVISORY MODAL */}
      {selectedAdvisory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                  Prescribe Crop Solution
                </h3>
                <p className="text-xs text-slate-500">{selectedAdvisory.farmerName} • {selectedAdvisory.cropName}</p>
              </div>
              <button
                onClick={() => setSelectedAdvisory(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-4 text-xs space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Reported Farmer Issue:</span>
              <p className="text-slate-600 dark:text-slate-300">{selectedAdvisory.issueDescription}</p>
            </div>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Agronomic Recommendation / Dosage Notes <span className="text-emerald-500">*</span>
                </label>
                <textarea
                  value={solutionNotes}
                  onChange={e => setSolutionNotes(e.target.value)}
                  rows={4}
                  required
                  placeholder="e.g. Recommend Bio-Fungicide 2ml/Ltr foliar spray along with Zinc Chelate 1g/Ltr. Repeat after 10 days if symptoms persist."
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAdvisory(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition"
                  style={{ backgroundColor: themeColor }}
                >
                  Save & Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
