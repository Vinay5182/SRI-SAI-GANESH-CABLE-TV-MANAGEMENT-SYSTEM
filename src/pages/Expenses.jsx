import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { expenseCategories } from '../data';
import { generateExpenseRevenuePDF } from '../utils/pdfExport';
import {
  Plus, Search, X, Edit2, Trash2, Download, TrendingDown, Package, Calendar,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const categoryColors = {
  'Installation Materials': '#3b82f6',
  'Infrastructure': '#8b5cf6',
  'Equipment': '#10b981',
  'Maintenance': '#f59e0b',
  'Utilities': '#f43f5e',
  'Transport': '#06b6d4',
  'Miscellaneous': '#64748b',
};

const emptyExpense = {
  date: new Date().toISOString().split('T')[0],
  category: 'Installation Materials',
  item: '',
  quantity: 1,
  unitCost: 0,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
        <p className="text-slate-300 text-xs font-semibold mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-xs" style={{ color: entry.color || entry.fill }}>
            {entry.name}: ₹{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Expenses() {
  const {
    expenses, invoices, customers, plans,
    addExpense, updateExpense, deleteExpense,
  } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyExpense);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Get unique months from expenses
  const months = useMemo(() => {
    const m = [...new Set(expenses.map((e) => {
      const d = new Date(e.date);
      return `${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`;
    }))];
    return m;
  }, [expenses]);

  // Filter expenses
  const filtered = useMemo(() => {
    return expenses
      .filter((e) => {
        const matchSearch = e.item.toLowerCase().includes(search.toLowerCase()) ||
          e.category.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === 'All' || e.category === categoryFilter;
        const expMonth = (() => {
          const d = new Date(e.date);
          return `${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`;
        })();
        const matchMonth = monthFilter === 'All' || expMonth === monthFilter;
        return matchSearch && matchCategory && matchMonth;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, search, categoryFilter, monthFilter]);

  // Category breakdown for pie chart
  const categoryBreakdown = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      if (!map[e.category]) map[e.category] = 0;
      map[e.category] += e.totalCost;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#64748b',
    }));
  }, [expenses]);

  // Monthly expense totals for bar chart
  const monthlyExpenses = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = d.toLocaleString('en-US', { month: 'short' });
      if (!map[key]) map[key] = 0;
      map[key] += e.totalCost;
    });
    return Object.entries(map).map(([month, total]) => ({ month, total }));
  }, [expenses]);

  const totalExpenses = expenses.reduce((s, e) => s + e.totalCost, 0);
  const thisMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, e) => s + e.totalCost, 0);

  const openAdd = () => {
    setForm(emptyExpense);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (expense) => {
    setForm({
      date: expense.date,
      category: expense.category,
      item: expense.item,
      quantity: expense.quantity,
      unitCost: expense.unitCost,
    });
    setEditingId(expense.id);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      quantity: Number(form.quantity),
      unitCost: Number(form.unitCost),
    };
    if (editingId) {
      updateExpense(editingId, data);
    } else {
      addExpense(data);
    }
    setShowModal(false);
  };

  const handleDownloadReport = () => {
    generateExpenseRevenuePDF(expenses, invoices, customers, plans);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Expenses Management</h1>
          <p className="text-slate-400 text-sm">Track all operational and installation costs</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownloadReport} className="btn btn-ghost" id="download-expense-report">
            <Download className="w-4 h-4" /> Export Report PDF
          </button>
          <button onClick={openAdd} className="btn btn-primary" id="add-expense-btn">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="summary-card rose">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">₹{totalExpenses.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Total Expenses</p>
            </div>
          </div>
        </div>
        <div className="summary-card amber">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">₹{thisMonthExpenses.toLocaleString()}</p>
              <p className="text-xs text-slate-400">This Month</p>
            </div>
          </div>
        </div>
        <div className="summary-card blue">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{expenses.length}</p>
              <p className="text-xs text-slate-400">Total Entries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-1">Monthly Expenses</h2>
          <p className="text-xs text-slate-400 mb-6">Total spending per month</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-1">Category Breakdown</h2>
          <p className="text-xs text-slate-400 mb-6">Expenses by category</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${value.toLocaleString()}`}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '10px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search by item or category..." className="form-input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} id="expense-search" />
        </div>
        <select className="form-input w-auto" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} id="expense-category-filter">
          <option value="All">All Categories</option>
          {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-input w-auto" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} id="expense-month-filter">
          <option value="All">All Months</option>
          {months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp) => (
                <tr key={exp.id}>
                  <td className="text-sm">{exp.date}</td>
                  <td>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{
                      background: `${categoryColors[exp.category] || '#64748b'}20`,
                      color: categoryColors[exp.category] || '#64748b',
                    }}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="font-medium text-white text-sm">{exp.item}</td>
                  <td className="text-sm">{exp.quantity}</td>
                  <td className="text-sm">₹{exp.unitCost.toLocaleString()}</td>
                  <td className="font-semibold text-white">₹{exp.totalCost.toLocaleString()}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(exp)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-amber-400 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(exp.id)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-rose-400 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="text-center py-12 text-slate-500">No expenses found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Expense' : 'Add New Expense'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Item Name</label>
                <input type="text" className="form-input" required value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="e.g. Remote, Fiber Wire, Electricity Bill" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" required min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Unit Cost (₹)</label>
                  <input type="number" className="form-input" required min="0" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Total Cost (₹)</label>
                  <div className="form-input bg-slate-800/80 cursor-not-allowed text-white font-semibold">
                    ₹{(Number(form.quantity) * Number(form.unitCost)).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'} Expense</button>
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
            <p className="text-sm text-slate-400 mb-6">Are you sure you want to delete this expense entry?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={() => { deleteExpense(deleteConfirm); setDeleteConfirm(null); }} className="btn btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
