import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { Permission } from '../../types/erp';
import {
  ShieldCheck,
  Plus,
  Search,
  Key,
  X,
  CheckCircle,
  Lock,
} from 'lucide-react';

export const PermissionsRegistryView: React.FC = () => {
  const { permissions, addPermission, themeColor } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('🌱 User Operations');
  const [newDescription, setNewDescription] = useState('');

  // Group permissions by groupName
  const groupedPermissions = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const map = new Map<string, Permission[]>();

    permissions.forEach(p => {
      const matchesSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(q) ||
        p.groupName.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      if (matchesSearch) {
        if (!map.has(p.groupName)) {
          map.set(p.groupName, []);
        }
        map.get(p.groupName)!.push(p);
      }
    });

    return map;
  }, [permissions, searchTerm]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addPermission(newName.trim().toLowerCase().replace(/\s+/g, '-'), newGroup, newDescription.trim());
    setShowAddModal(false);
    setNewName('');
    setNewDescription('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl text-white shadow-sm" style={{ backgroundColor: themeColor }}>
              <ShieldCheck className="w-5 h-5" />
            </span>
            Role Permissions Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise access control matrix across sales, inventory, orders, and accounting modules.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition flex items-center gap-1.5"
          style={{ backgroundColor: themeColor }}
        >
          <Plus className="w-4 h-4" />
          <span>Register New Permission</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search permissions or groups..."
            className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Total Active System Privileges: <span className="font-bold text-slate-900 dark:text-white">{permissions.length}</span>
        </div>
      </div>

      {/* Permissions Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from(groupedPermissions.entries()).map(([groupName, items]) => (
          <div
            key={groupName}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{groupName}</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {items.length} Rules
                </span>
              </div>

              <div className="space-y-2.5">
                {items.map(p => (
                  <div
                    key={p.id}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Key className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                          {p.name}
                        </span>
                      </div>
                      {p.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {p.description}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      web
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD PERMISSION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  Register Custom Permission
                </h3>
                <p className="text-xs text-slate-500">Define a new system privilege tag</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Permission Identifier (Slug) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. discount-override, crop-export"
                  required
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Domain Category Group
                </label>
                <select
                  value={newGroup}
                  onChange={e => setNewGroup(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="🌱 User Operations">🌱 User Operations</option>
                  <option value="🌱 Role Operations">🌱 Role Operations</option>
                  <option value="🌱 Permission Operations">🌱 Permission Operations</option>
                  <option value="🌱 Agro Products">🌱 Agro Products</option>
                  <option value="🌱 Orders & Billing">🌱 Orders & Billing</option>
                  <option value="🌱 Analytics & Reports">🌱 Analytics & Reports</option>
                  <option value="🌱 Crop Advisory Desk">🌱 Crop Advisory Desk</option>
                  <option value="🌱 Agro Categories">🌱 Agro Categories</option>
                  <option value="🌱 Vendors Master">🌱 Vendors Master</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Privilege Description
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="e.g. Allows field manager to override max discount"
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition"
                  style={{ backgroundColor: themeColor }}
                >
                  Register Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
