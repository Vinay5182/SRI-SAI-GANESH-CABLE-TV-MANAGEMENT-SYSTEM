import React, { createContext, useContext, useState } from 'react';
import {
  initialCustomers,
  initialPlans,
  initialInvoices,
  initialServiceRequests,
  initialExpenses,
} from '../data';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [plans, setPlans] = useState(initialPlans);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [serviceRequests, setServiceRequests] = useState(initialServiceRequests);
  const [expenses, setExpenses] = useState(initialExpenses);

  // Customer CRUD
  const addCustomer = (customer) => {
    const newCustomer = { ...customer, id: `cust-${Date.now()}` };
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id, updates) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCustomer = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setInvoices((prev) => prev.filter((i) => i.customerId !== id));
    setServiceRequests((prev) => prev.filter((sr) => sr.customerId !== id));
  };

  // Plan CRUD
  const addPlan = (plan) => {
    const newPlan = { ...plan, id: `plan-${Date.now()}` };
    setPlans((prev) => [...prev, newPlan]);
  };

  const updatePlan = (id, updates) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePlan = (id) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // Assign/change plan for customer
  const assignPlan = (customerId, planId, startDate, renewalDate) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, planId, startDate, renewalDate } : c
      )
    );
  };

  // Invoice CRUD
  const addInvoice = (invoice) => {
    const newInvoice = { ...invoice, id: `inv-${Date.now()}` };
    setInvoices((prev) => [...prev, newInvoice]);
  };

  const updateInvoice = (id, updates) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  const markInvoicePaid = (id) => {
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'Paid', paidDate: new Date().toISOString().split('T')[0] }
          : i
      )
    );
  };

  // Service requests CRUD
  const addServiceRequest = (sr) => {
    const newSR = { ...sr, id: `sr-${Date.now()}` };
    setServiceRequests((prev) => [...prev, newSR]);
  };

  const updateServiceRequest = (id, updates) => {
    setServiceRequests((prev) =>
      prev.map((sr) => (sr.id === id ? { ...sr, ...updates } : sr))
    );
  };

  // Expenses CRUD
  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
      totalCost: expense.quantity * expense.unitCost,
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const updateExpense = (id, updates) => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...updates };
          updated.totalCost = updated.quantity * updated.unitCost;
          return updated;
        }
        return e;
      })
    );
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Helper: get plan details for a customer
  const getCustomerPlan = (planId) => plans.find((p) => p.id === planId);
  const getCustomerName = (customerId) =>
    customers.find((c) => c.id === customerId)?.name || 'Unknown';

  const value = {
    customers,
    plans,
    invoices,
    serviceRequests,
    expenses,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addPlan,
    updatePlan,
    deletePlan,
    assignPlan,
    addInvoice,
    updateInvoice,
    markInvoicePaid,
    addServiceRequest,
    updateServiceRequest,
    addExpense,
    updateExpense,
    deleteExpense,
    getCustomerPlan,
    getCustomerName,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
