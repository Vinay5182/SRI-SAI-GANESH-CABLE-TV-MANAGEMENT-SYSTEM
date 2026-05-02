import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { revenueData } from '../data';
import { generateExpenseRevenuePDF } from '../utils/pdfExport';
import {
  Users, Tv, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Download,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
        <p className="text-slate-300 text-xs font-semibold mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: ₹{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const categoryColors = {
  'Installation Materials': '#3b82f6',
  'Infrastructure': '#8b5cf6',
  'Equipment': '#10b981',
  'Maintenance': '#f59e0b',
  'Utilities': '#f43f5e',
  'Transport': '#06b6d4',
  'Miscellaneous': '#64748b',
};

export default function Dashboard() {
  const { customers, invoices, plans, expenses } = useApp();

  const activeCustomers = customers.filter((c) => c.status === 'Active').length;
  const totalCustomers = customers.length;

  // Calculate monthly revenue from active customers
  const monthlyRevenue = customers
    .filter((c) => c.status === 'Active')
    .reduce((sum, c) => {
      const plan = plans.find((p) => p.id === c.planId);
      return sum + (plan?.monthlyPrice || 0);
    }, 0);

  const pendingDues = invoices
    .filter((i) => i.status === 'Unpaid' || i.status === 'Overdue')
    .reduce((sum, i) => sum + i.amount, 0);

  // Total expenses from tracked expense entries
  const totalMonthlyExpenses = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, e) => s + e.totalCost, 0);
  }, [expenses]);

  const totalAllExpenses = expenses.reduce((s, e) => s + e.totalCost, 0);
  const totalCollected = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const netProfitLoss = totalCollected - totalAllExpenses;

  // Category breakdown from real expenses
  const expenseBreakdownData = useMemo(() => {
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

  // Monthly revenue vs expense comparison from real data
  const monthlyComparison = useMemo(() => {
    const revenueMap = {};
    invoices.filter((i) => i.status === 'Paid').forEach((inv) => {
      const key = inv.month.split(' ')[0].substring(0, 3); // "April 2026" -> "Apr"
      if (!revenueMap[key]) revenueMap[key] = 0;
      revenueMap[key] += inv.amount;
    });

    const expenseMap = {};
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = d.toLocaleString('en-US', { month: 'short' });
      if (!expenseMap[key]) expenseMap[key] = 0;
      expenseMap[key] += e.totalCost;
    });

    const allMonths = [...new Set([...Object.keys(revenueMap), ...Object.keys(expenseMap)])];
    return allMonths.map((month) => ({
      month,
      revenue: revenueMap[month] || 0,
      expenses: expenseMap[month] || 0,
    }));
  }, [invoices, expenses]);

  const summaryCards = [
    {
      label: 'Total Customers',
      value: totalCustomers,
      icon: Users,
      color: 'blue',
      detail: `${activeCustomers} active`,
    },
    {
      label: 'Active Subscriptions',
      value: activeCustomers,
      icon: Tv,
      color: 'green',
      detail: `${((activeCustomers / totalCustomers) * 100).toFixed(0)}% of total`,
    },
    {
      label: 'Monthly Revenue',
      value: `₹${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'purple',
      detail: 'From active plans',
    },
    {
      label: 'Monthly Expenses',
      value: `₹${totalMonthlyExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: 'rose',
      detail: 'Current month spend',
    },
    {
      label: 'Pending Dues',
      value: `₹${pendingDues.toLocaleString()}`,
      icon: AlertTriangle,
      color: 'amber',
      detail: `${invoices.filter((i) => i.status !== 'Paid').length} invoices`,
    },
    {
      label: 'Net Profit/Loss',
      value: `${netProfitLoss >= 0 ? '' : '-'}₹${Math.abs(netProfitLoss).toLocaleString()}`,
      icon: TrendingUp,
      color: netProfitLoss >= 0 ? 'green' : 'rose',
      detail: netProfitLoss >= 0 ? 'Overall Profit' : 'Overall Loss',
    },
  ];

  const handleDownloadReport = () => {
    generateExpenseRevenuePDF(expenses, invoices, customers, plans);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-slate-400 text-sm">Welcome back! Here's your business overview.</p>
        </div>
        <button onClick={handleDownloadReport} className="btn btn-ghost" id="dashboard-export-pdf">
          <Download className="w-4 h-4" /> Export Report PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`summary-card ${card.color}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  card.color === 'blue' ? 'bg-blue-500/15 text-blue-400' :
                  card.color === 'green' ? 'bg-emerald-500/15 text-emerald-400' :
                  card.color === 'purple' ? 'bg-purple-500/15 text-purple-400' :
                  card.color === 'amber' ? 'bg-amber-500/15 text-amber-400' :
                  card.color === 'rose' ? 'bg-rose-500/15 text-rose-400' :
                  'bg-slate-500/15 text-slate-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-0.5">{card.value}</p>
              <p className="text-xs text-slate-400 font-medium">{card.label}</p>
              <p className="text-[11px] text-slate-500 mt-1">{card.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend Line Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-white mb-1">Revenue Trend</h2>
          <p className="text-xs text-slate-400 mb-6">Historical performance (sample data)</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#1e293b' }}
                activeDot={{ r: 6, fill: '#60a5fa', stroke: '#1e293b', strokeWidth: 2 }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#f43f5e"
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ fill: '#f43f5e', r: 4, strokeWidth: 2, stroke: '#1e293b' }}
                activeDot={{ r: 6, fill: '#fb7185', stroke: '#1e293b', strokeWidth: 2 }}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown Pie Chart - from real data */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-1">Expense Breakdown</h2>
          <p className="text-xs text-slate-400 mb-6">By category (all tracked expenses)</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={expenseBreakdownData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {expenseBreakdownData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${value.toLocaleString()}`}
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#e2e8f0',
                }}
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

      {/* Revenue vs Expenses Bar Chart - from real invoice + expense data */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-white mb-1">Revenue vs Expenses</h2>
        <p className="text-xs text-slate-400 mb-6">Monthly comparison (from invoices & tracked expenses)</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyComparison.length > 0 ? monthlyComparison : revenueData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Revenue" />
            <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
