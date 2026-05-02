import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus, Edit2, Trash2, X, Check, Tv, Crown, Zap, Star,
} from 'lucide-react';

const emptyPlan = {
  name: '',
  channels: 0,
  monthlyPrice: 0,
  description: '',
  features: [''],
};

const planIcons = {
  Basic: Tv,
  Standard: Star,
  Premium: Crown,
};

const planGradients = {
  Basic: 'from-blue-500/20 to-cyan-500/10',
  Standard: 'from-purple-500/20 to-pink-500/10',
  Premium: 'from-amber-500/20 to-orange-500/10',
};

const planBorders = {
  Basic: 'border-blue-500/30',
  Standard: 'border-purple-500/30',
  Premium: 'border-amber-500/30',
};

const planAccents = {
  Basic: 'text-blue-400',
  Standard: 'text-purple-400',
  Premium: 'text-amber-400',
};

export default function Plans() {
  const { plans, customers, addPlan, updatePlan, deletePlan, assignPlan } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [assignForm, setAssignForm] = useState({
    customerId: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    renewalDate: '',
  });

  const openAdd = () => {
    setForm(emptyPlan);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setForm({ ...plan, features: [...plan.features] });
    setEditingId(plan.id);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      channels: Number(form.channels),
      monthlyPrice: Number(form.monthlyPrice),
      features: form.features.filter((f) => f.trim()),
    };
    if (editingId) {
      updatePlan(editingId, data);
    } else {
      addPlan(data);
    }
    setShowModal(false);
  };

  const handleAssign = (e) => {
    e.preventDefault();
    assignPlan(
      assignForm.customerId,
      assignForm.planId,
      assignForm.startDate,
      assignForm.renewalDate
    );
    setShowAssign(false);
  };

  const updateFeature = (index, value) => {
    const updated = [...form.features];
    updated[index] = value;
    setForm({ ...form, features: updated });
  };

  const addFeature = () => {
    setForm({ ...form, features: [...form.features, ''] });
  };

  const removeFeature = (index) => {
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  };

  const subscriberCount = (planId) =>
    customers.filter((c) => c.planId === planId && c.status === 'Active').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Subscription Plans</h1>
          <p className="text-slate-400 text-sm">Manage cable TV packages and assign to customers</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAssign(true)} className="btn btn-ghost" id="assign-plan-btn">
            <Zap className="w-4 h-4" /> Assign/Change Plan
          </button>
          <button onClick={openAdd} className="btn btn-primary" id="add-plan-btn">
            <Plus className="w-4 h-4" /> Add Plan
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const Icon = planIcons[plan.name] || Tv;
          const gradient = planGradients[plan.name] || 'from-slate-500/20 to-slate-600/10';
          const border = planBorders[plan.name] || 'border-slate-500/30';
          const accent = planAccents[plan.name] || 'text-slate-400';
          const subs = subscriberCount(plan.id);

          return (
            <div
              key={plan.id}
              className={`glass-card p-6 bg-gradient-to-br ${gradient} border ${border} relative group`}
            >
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(plan)}
                  className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 ${accent}`}>
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-white">₹{plan.monthlyPrice}</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>

              <div className="flex items-center gap-4 mb-5 text-sm">
                <span className="text-slate-300">
                  <span className="font-bold text-white">{plan.channels}</span> channels
                </span>
                <span className={`${accent} font-semibold`}>
                  {subs} subscriber{subs !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className={`w-4 h-4 ${accent} flex-shrink-0`} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Subscribers Table */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-white mb-4">Customer Plan Distribution</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Current Plan</th>
                <th>Price</th>
                <th>Start Date</th>
                <th>Renewal Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const plan = plans.find((p) => p.id === customer.planId);
                return (
                  <tr key={customer.id}>
                    <td className="font-medium text-white">{customer.name}</td>
                    <td>
                      <span className={`text-sm font-semibold ${
                        plan?.name === 'Premium' ? 'text-amber-400' :
                        plan?.name === 'Standard' ? 'text-purple-400' :
                        'text-blue-400'
                      }`}>
                        {plan?.name || '—'}
                      </span>
                    </td>
                    <td>₹{plan?.monthlyPrice || 0}/mo</td>
                    <td>{customer.startDate}</td>
                    <td>{customer.renewalDate}</td>
                    <td>
                      <span className={`badge badge-${customer.status.toLowerCase()}`}>
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Plan Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Plan Name</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Basic, Standard"
                  />
                </div>
                <div>
                  <label className="form-label">Channels</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min="1"
                    value={form.channels}
                    onChange={(e) => setForm({ ...form, channels: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Monthly Price (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min="0"
                    value={form.monthlyPrice}
                    onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the plan"
                />
              </div>

              <div>
                <label className="form-label mb-2">Features</label>
                <div className="space-y-2">
                  {form.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        className="form-input"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Feature name"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 rounded-lg hover:bg-rose-500/15 text-slate-500 hover:text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addFeature} className="btn btn-ghost text-xs mt-2">
                  <Plus className="w-3 h-3" /> Add Feature
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign/Change Plan Modal */}
      {showAssign && (
        <div className="modal-overlay" onClick={() => setShowAssign(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Assign / Change Plan</h2>
              <button onClick={() => setShowAssign(false)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="form-label">Customer</label>
                <select
                  className="form-input"
                  required
                  value={assignForm.customerId}
                  onChange={(e) => setAssignForm({ ...assignForm, customerId: e.target.value })}
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {plans.find((p) => p.id === c.planId)?.name || 'No plan'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">New Plan</label>
                <select
                  className="form-input"
                  required
                  value={assignForm.planId}
                  onChange={(e) => setAssignForm({ ...assignForm, planId: e.target.value })}
                >
                  <option value="">Select plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.monthlyPrice}/mo
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={assignForm.startDate}
                    onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Renewal Date</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={assignForm.renewalDate}
                    onChange={(e) => setAssignForm({ ...assignForm, renewalDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                <button type="button" onClick={() => setShowAssign(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
