import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Tv,
  CreditCard,
  Receipt,
  Wrench,
  Cable,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/plans', icon: Tv, label: 'Plans' },
  { to: '/billing', icon: CreditCard, label: 'Billing' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/services', icon: Wrench, label: 'Services' },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Cable className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Sri Sai Ganesh</h1>
              <p className="text-[11px] text-slate-400 font-medium">Cable TV System</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="glass-card p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <p className="text-xs font-semibold text-slate-300 mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-icon"></span>
              <span className="text-xs text-emerald-400 font-medium">All Systems Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
