import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, X, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';

export default function Billing() {
  const { invoices, customers, plans, addInvoice, markInvoicePaid, getCustomerName } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customerId: '', amount: '', dueDate: '', month: '', status: 'Unpaid' });

  const filtered = invoices.filter((inv) => {
    const name = getCustomerName(inv.customerId).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || inv.id.includes(search);
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const sorted = [...filtered].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const totalUnpaid = invoices.filter((i) => i.status === 'Unpaid').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    addInvoice({ ...form, amount: Number(form.amount), paidDate: null });
    setShowModal(false);
    setForm({ customerId: '', amount: '', dueDate: '', month: '', status: 'Unpaid' });
  };

  const handleAutoFill = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    const plan = plans.find((p) => p.id === customer?.planId);
    setForm({ ...form, customerId, amount: plan?.monthlyPrice || '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Billing & Payments</h1>
          <p className="text-slate-400 text-sm">Track invoices, payments, and outstanding dues</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" id="generate-invoice-btn">
          <Plus className="w-4 h-4" /> Generate Invoice
        </button>
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="summary-card green">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">₹{totalPaid.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Total Collected</p>
            </div>
          </div>
        </div>
        <div className="summary-card amber">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">₹{totalUnpaid.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Pending Payments</p>
            </div>
          </div>
        </div>
        <div className="summary-card rose">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">₹{totalOverdue.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Overdue Amount</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search by customer or invoice ID..." className="form-input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} id="billing-search" />
        </div>
        <select className="form-input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} id="billing-status-filter">
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Invoice</th><th>Customer</th><th>Month</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Paid Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {sorted.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs text-slate-400">{inv.id.toUpperCase()}</td>
                  <td className="font-medium text-white text-sm">{getCustomerName(inv.customerId)}</td>
                  <td className="text-sm">{inv.month}</td>
                  <td className="font-semibold text-white">₹{inv.amount.toLocaleString()}</td>
                  <td className="text-sm">{inv.dueDate}</td>
                  <td>
                    <span className={`badge badge-${inv.status.toLowerCase()}`}>{inv.status}</span>
                  </td>
                  <td className="text-sm">{inv.paidDate || '—'}</td>
                  <td>
                    {inv.status !== 'Paid' && (
                      <button onClick={() => markInvoicePaid(inv.id)} className="btn btn-success text-xs py-1.5 px-3">
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr><td colSpan="8" className="text-center py-12 text-slate-500">No invoices found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Generate Invoice</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Customer</label>
                <select className="form-input" required value={form.customerId} onChange={(e) => handleAutoFill(e.target.value)}>
                  <option value="">Select customer</option>
                  {customers.filter((c) => c.status === 'Active').map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className="form-input" required min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label">Billing Month</label>
                <input type="text" className="form-input" required value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} placeholder="e.g. May 2026" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary"><FileText className="w-4 h-4" /> Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
