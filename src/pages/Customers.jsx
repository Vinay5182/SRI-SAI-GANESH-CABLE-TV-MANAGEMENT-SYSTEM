import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateCustomerPDF } from '../utils/pdfExport';
import {
  Plus, Search, Edit2, Trash2, X, Eye, Download, Receipt, CheckCircle,
} from 'lucide-react';

const defaultPrices = {
  'Remote': 120,
  'Patch Card': 150,
  'Bullet': 100,
  'Fiber Wire': 500,
  'AV Jack': 70,
  'HDMI Cable': 100,
};

const installationItems = Object.keys(defaultPrices);
const emptyExpense = { item: '', quantity: 1, cost: 0 };

const emptyCustomer = {
  name: '',
  address: '',
  phone: '',
  email: '',
  connectionType: 'Digital',
  status: 'Active',
  planId: '',
  startDate: new Date().toISOString().split('T')[0],
  renewalDate: '',
  installationExpenses: [
    { item: 'Remote', quantity: 1, cost: 120 },
    { item: 'Patch Card', quantity: 0, cost: 150 },
    { item: 'Bullet', quantity: 0, cost: 100 },
    { item: 'Fiber Wire', quantity: 0, cost: 500 },
    { item: 'AV Jack', quantity: 0, cost: 70 },
    { item: 'HDMI Cable', quantity: 0, cost: 100 },
  ],
};

export default function Customers() {
  const {
    customers, plans, invoices, serviceRequests,
    addCustomer, updateCustomer, deleteCustomer,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCustomer);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setForm(emptyCustomer);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (customer) => {
    setForm({ ...customer });
    setEditingId(customer.id);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out zero-quantity installation items
    const expenses = form.installationExpenses.filter(
      (exp) => exp.quantity > 0 && exp.cost > 0
    );
    const data = { ...form, installationExpenses: expenses };

    if (editingId) {
      updateCustomer(editingId, data);
    } else {
      addCustomer(data);
    }
    setShowModal(false);
  };

  const updateExpense = (index, field, value) => {
    const updated = [...form.installationExpenses];
    let newCost = updated[index].cost;
    
    // Auto-fill price if item changes
    if (field === 'item') {
      newCost = defaultPrices[value] || 0;
    }

    updated[index] = { 
      ...updated[index], 
      [field]: field === 'item' ? value : Number(value),
      cost: field === 'item' ? newCost : (field === 'cost' ? Number(value) : updated[index].cost)
    };
    
    setForm({ ...form, installationExpenses: updated });
  };

  const addExpenseRow = () => {
    setForm({
      ...form,
      installationExpenses: [...form.installationExpenses, { ...emptyExpense }],
    });
  };

  const removeExpenseRow = (index) => {
    const updated = form.installationExpenses.filter((_, i) => i !== index);
    setForm({ ...form, installationExpenses: updated });
  };

  const totalInstallCost = (expenses) =>
    expenses.reduce((sum, e) => sum + (e.quantity * e.cost), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Customers</h1>
          <p className="text-slate-400 text-sm">Manage your customer base</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary" id="add-customer-btn">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            className="form-input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="customer-search"
          />
        </div>
        <select
          className="form-input w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          id="customer-status-filter"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Disconnected">Disconnected</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Connection</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => {
                const plan = plans.find((p) => p.id === customer.planId);
                const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
                const unpaidInvoices = customerInvoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue');
                const overdueAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                const isExpanded = showDetail === customer.id;

                return (
                  <React.Fragment key={customer.id}>
                    <tr 
                      className={`group cursor-pointer transition-colors ${isExpanded ? 'bg-blue-500/10' : 'hover:bg-slate-700/20'}`} 
                      onClick={() => setShowDetail(isExpanded ? null : customer.id)}
                    >
                      <td>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white text-sm">{customer.name}</p>
                            {overdueAmount > 0 && (
                              <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-full font-bold border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                                DUE: ₹{overdueAmount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{customer.email}</p>
                        </div>
                      </td>
                      <td className="text-sm font-medium text-slate-300">{customer.phone}</td>
                      <td>
                        <span className="text-xs font-bold bg-slate-700/50 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-600/30">
                          {customer.connectionType}
                        </span>
                      </td>
                      <td className="text-sm font-semibold text-blue-400">{plan?.name || '—'}</td>
                      <td>
                        <span className={`badge badge-${customer.status.toLowerCase()} shadow-sm`}>
                          {customer.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setShowDetail(isExpanded ? null : customer.id)}
                            className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-slate-700/50 text-slate-400 hover:text-blue-400'}`}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => generateCustomerPDF(customer, plan, invoices, serviceRequests)}
                            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-emerald-400 transition-all"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(customer)}
                            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-amber-400 transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(customer.id)}
                            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-rose-400 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Inline Expandable Detail Row */}
                    {isExpanded && (
                      <tr key={`detail-${customer.id}`}>
                        <td colSpan="6" className="p-0 border-none">
                          <div className="bg-slate-900/60 p-5 animate-[slideDown_0.2s_ease-out] border-x border-b border-slate-700/30 rounded-b-lg mx-2 mb-2 shadow-inner">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                              {/* Contact Section */}
                              <div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                  Contact Info
                                </h3>
                                <div className="space-y-3">
                                  <div className="bg-slate-800/20 p-2.5 rounded-lg border border-slate-700/30">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Address</p>
                                    <p className="text-xs text-white font-medium leading-relaxed">📍 {customer.address || 'No address provided'}</p>
                                  </div>
                                  <div className="flex gap-3">
                                    <div className="bg-slate-800/20 p-2.5 rounded-lg border border-slate-700/30 flex-1">
                                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Phone</p>
                                      <p className="text-xs text-white font-bold">📞 {customer.phone || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-800/20 p-2.5 rounded-lg border border-slate-700/30 flex-1">
                                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Type</p>
                                      <p className="text-xs text-white font-bold">{customer.connectionType}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Subscription Section */}
                              <div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                  Subscription
                                </h3>
                                <div className="space-y-3">
                                  <div className="bg-slate-800/20 p-2.5 rounded-lg border border-slate-700/30 border-l-4 border-l-purple-500/50">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Current Plan</p>
                                    <p className="text-sm text-white font-bold">{plan?.name || 'No active plan'}</p>
                                    {plan && <p className="text-[10px] text-purple-400 font-bold mt-0.5">₹{plan.monthlyPrice}/month</p>}
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-800/20 p-2.5 rounded-lg border border-slate-700/30">
                                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Start</p>
                                      <p className="text-xs text-white font-semibold">{customer.startDate || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-800/20 p-2.5 rounded-lg border border-slate-700/30 border-b-2 border-b-emerald-500/30">
                                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Renewal</p>
                                      <p className="text-xs text-emerald-400 font-bold">{customer.renewalDate || '—'}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Due Statement Section */}
                              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/50 lg:col-span-2 shadow-xl relative overflow-hidden">
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                  <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                                    Due Statement
                                  </h3>
                                  <div className="text-right">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Total Outstanding</p>
                                    <p className="text-2xl font-black text-rose-500 tracking-tight">₹{(overdueAmount || 0).toLocaleString()}</p>
                                  </div>
                                </div>

                                {unpaidInvoices && unpaidInvoices.length > 0 ? (
                                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                    {unpaidInvoices.map((inv) => (
                                      <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/20 hover:border-rose-500/30 transition-all">
                                        <div className="flex items-center gap-3">
                                          <div className="w-7 h-7 rounded-md bg-slate-700/50 flex items-center justify-center">
                                            <Receipt className="w-3.5 h-3.5 text-slate-400" />
                                          </div>
                                          <div>
                                            <p className="text-[11px] font-bold text-white">{inv.month}</p>
                                            <p className="text-[9px] text-slate-500">Ref: {inv.id.toUpperCase()}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-black text-white">₹{inv.amount}</p>
                                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${inv.status === 'Overdue' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {inv.status}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Account Clear</p>
                                  </div>
                                )}

                                {/* Installation Recap */}
                                <div className="mt-6 pt-4 border-t border-slate-800 relative z-10">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Installation Items</h4>
                                    <div className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold text-slate-300">
                                      Total: ₹{totalInstallCost(customer.installationExpenses || []).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                    {(customer.installationExpenses || []).map((exp, i) => (
                                      <div key={i} className="flex justify-between items-center text-[10px]">
                                        <span className="text-slate-400">{exp.item} <span className="text-slate-600">×{exp.quantity}</span></span>
                                        <span className="text-slate-200 font-bold">₹{(exp.quantity * exp.cost).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-600 bg-slate-800/20">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">No customers found</p>
                    <p className="text-xs opacity-50 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="form-label">Connection Type</label>
                  <select
                    className="form-input"
                    value={form.connectionType}
                    onChange={(e) => setForm({ ...form, connectionType: e.target.value })}
                  >
                    <option value="Digital">Digital</option>
                    <option value="Analog">Analog</option>
                    <option value="Fiber">Fiber</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Enter full address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Disconnected">Disconnected</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Plan</label>
                  <select
                    className="form-input"
                    value={form.planId}
                    onChange={(e) => setForm({ ...form, planId: e.target.value })}
                  >
                    <option value="">Select a plan</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.monthlyPrice}/mo
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Installation Expenses (Fixed List) */}
              <div className="border-t border-slate-700/50 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Installation Items & Pricing
                  </h3>
                  <span className="text-[10px] text-blue-400 font-black uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Fixed Pricing</span>
                </div>
                
                <div className="space-y-2 bg-slate-900/40 p-3 rounded-lg border border-slate-700/30">
                  <div className="grid grid-cols-4 gap-4 text-[10px] text-slate-500 font-black uppercase px-2 mb-1">
                    <span className="col-span-1">Item</span>
                    <span className="text-center">Qty</span>
                    <span className="text-center">Price</span>
                    <span className="text-right">Total</span>
                  </div>
                  
                  {installationItems.map((itemName) => {
                    const price = defaultPrices[itemName];
                    const exp = form.installationExpenses.find(e => e.item === itemName) || { quantity: 0, cost: price };
                    const total = exp.quantity * price;
                    
                    return (
                      <div key={itemName} className="grid grid-cols-4 gap-4 items-center bg-slate-800/40 p-2 rounded-md border border-slate-700/20 transition-all">
                        <span className="text-xs font-bold text-slate-200 truncate pr-1" title={itemName}>{itemName}</span>
                        <div className="flex justify-center">
                          <input
                            type="number"
                            className="form-input text-xs py-1 h-8 w-14 text-center font-bold no-spinner"
                            min="0"
                            value={exp.quantity}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 0;
                              const updated = [...form.installationExpenses];
                              const idx = updated.findIndex(e => e.item === itemName);
                              if (idx > -1) {
                                updated[idx] = { ...updated[idx], quantity: qty };
                              } else {
                                updated.push({ item: itemName, quantity: qty, cost: price });
                              }
                              setForm({ ...form, installationExpenses: updated });
                            }}
                          />
                        </div>
                        <div className="text-center text-xs font-medium text-slate-400">
                          ₹{price}
                        </div>
                        <div className="text-right text-xs font-bold text-white">
                          ₹{total.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-between mt-4 bg-blue-500/5 p-3 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Total Materials</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-white tracking-tight">
                      ₹{totalInstallCost(form.installationExpenses).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>


              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-2">Confirm Delete</h2>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete this customer? This will also remove all related invoices and service requests.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost">
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCustomer(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
