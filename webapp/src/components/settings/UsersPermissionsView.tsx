import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { UserAccount } from '../../types/erp';
import { Users, Shield, Plus, CheckCircle2, X, Trash2 } from 'lucide-react';

export const UsersPermissionsView: React.FC = () => {
  const { users, addUser, deleteUser, locations, currentUser } = useErp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'salesman_pos' | 'accountant' | 'warehouse_manager'>('salesman_pos');
  const [assignedLocationId, setAssignedLocationId] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    addUser({
      name,
      email,
      role,
      active: true,
      assignedLocationId: assignedLocationId || undefined,
    });
    setShowAddModal(false);
    setName('');
    setEmail('');
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">System Admin</span>;
      case 'salesman_pos':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">Van POS / Salesman</span>;
      case 'accountant':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Accountant / Auditor</span>;
      case 'warehouse_manager':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">Warehouse Manager</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Users &amp; Role Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure role-based access for Administrators, Van Sales Reps, Accountants, and Warehouse Managers.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add User Account</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
            <tr>
              <th className="py-3 px-4">User Name</th>
              <th className="py-3 px-4">Email / Login Username</th>
              <th className="py-3 px-4">Access Role</th>
              <th className="py-3 px-4">Assigned Location (Van/Depot)</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => {
              const loc = locations.find(l => l.id === u.assignedLocationId);
              const isSelf = currentUser?.id === u.id || u.id === 'usr_admin1';
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {u.name[0]}
                      </div>
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                  <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                  <td className="py-3 px-4 text-slate-600">{loc?.name || 'All Locations (Full Access)'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {!isSelf ? (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete user account "${u.name}" (${u.email})?`)) {
                            deleteUser(u.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Protected</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add User Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kumar"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email / Username</label>
                <input
                  type="email"
                  required
                  placeholder="anand@talliffy.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Access Role & Permissions</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="salesman_pos">Salesman / Van POS (Restricted to Van Billing)</option>
                  <option value="accountant">Accountant (Daybook, Statements, Final Accounts)</option>
                  <option value="warehouse_manager">Warehouse Manager (Stock Inward, Godowns)</option>
                  <option value="admin">System Administrator (Full Global Access)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Godown / Van Location</label>
                <select
                  value={assignedLocationId}
                  onChange={e => setAssignedLocationId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Full Access (All Locations)</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.type === 'van' ? '🚐' : '🏢'}
                    </option>
                  ))}
                </select>
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
