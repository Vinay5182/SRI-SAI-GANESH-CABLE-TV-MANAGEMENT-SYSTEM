import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { technicians } from '../data';
import { Plus, Search, X, Wrench, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function Services() {
  const { serviceRequests, customers, addServiceRequest, updateServiceRequest, getCustomerName } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    customerId: '', type: 'Complaint', description: '', status: 'Open',
    technician: null, createdDate: new Date().toISOString().split('T')[0], resolvedDate: null,
  });

  const filtered = serviceRequests.filter((sr) => {
    const name = getCustomerName(sr.customerId).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || sr.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || sr.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const sorted = [...filtered].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

  const openCount = serviceRequests.filter((sr) => sr.status === 'Open').length;
  const inProgressCount = serviceRequests.filter((sr) => sr.status === 'In Progress').length;
  const resolvedCount = serviceRequests.filter((sr) => sr.status === 'Resolved').length;

  const openAdd = () => {
    setForm({
      customerId: '', type: 'Complaint', description: '', status: 'Open',
      technician: null, createdDate: new Date().toISOString().split('T')[0], resolvedDate: null,
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (sr) => {
    setForm({ ...sr });
    setEditId(sr.id);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      technician: form.technician || null,
      resolvedDate: form.status === 'Resolved' ? (form.resolvedDate || new Date().toISOString().split('T')[0]) : null,
    };
    if (editId) {
      updateServiceRequest(editId, data);
    } else {
      addServiceRequest(data);
    }
    setShowModal(false);
  };

  const statusStyle = (status) => {
    switch (status) {
      case 'Open': return { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/15' };
      case 'In Progress': return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/15' };
      case 'Resolved': return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15' };
      default: return { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-500/15' };
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Service Management</h1>
          <p className="text-slate-400 text-sm">Track complaints and service requests</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary" id="add-service-btn">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="summary-card blue">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{openCount}</p>
              <p className="text-xs text-slate-400">Open Requests</p>
            </div>
          </div>
        </div>
        <div className="summary-card amber">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{inProgressCount}</p>
              <p className="text-xs text-slate-400">In Progress</p>
            </div>
          </div>
        </div>
        <div className="summary-card green">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{resolvedCount}</p>
              <p className="text-xs text-slate-400">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search by customer or description..." className="form-input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} id="service-search" />
        </div>
        <select className="form-input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} id="service-status-filter">
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Service Request Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((sr) => {
          const style = statusStyle(sr.status);
          const Icon = style.icon;
          return (
            <div key={sr.id} className="glass-card p-5 cursor-pointer hover:border-blue-500/30 transition-all" onClick={() => openEdit(sr)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${style.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{getCustomerName(sr.customerId)}</p>
                    <p className="text-[11px] text-slate-500">{sr.createdDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge badge-${sr.status === 'In Progress' ? 'inprogress' : sr.status.toLowerCase()}`}>
                    {sr.status}
                  </span>
                  <span className="text-[10px] bg-slate-700/50 px-2 py-0.5 rounded-md text-slate-400 font-medium">
                    {sr.type}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-3">{sr.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{sr.technician ? `👨‍🔧 ${sr.technician}` : '⏳ Unassigned'}</span>
                {sr.resolvedDate && <span>Resolved: {sr.resolvedDate}</span>}
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="col-span-2 glass-card p-12 text-center text-slate-500">No service requests found.</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{editId ? 'Update Request' : 'New Service Request'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Customer</label>
                  <select className="form-input" required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                    <option value="">Select customer</option>
                    {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="Complaint">Complaint</option>
                    <option value="Service Request">Service Request</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue or request..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Assign Technician</label>
                  <select className="form-input" value={form.technician || ''} onChange={(e) => setForm({ ...form, technician: e.target.value || null })}>
                    <option value="">Unassigned</option>
                    {technicians.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              {form.status === 'Resolved' && (
                <div>
                  <label className="form-label">Resolved Date</label>
                  <input type="date" className="form-input" value={form.resolvedDate || ''} onChange={(e) => setForm({ ...form, resolvedDate: e.target.value })} />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Wrench className="w-4 h-4" /> {editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
