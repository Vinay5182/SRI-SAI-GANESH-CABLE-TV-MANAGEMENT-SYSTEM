import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Plans from './pages/Plans';
import Billing from './pages/Billing';
import Services from './pages/Services';
import Expenses from './pages/Expenses';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/services" element={<Services />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
