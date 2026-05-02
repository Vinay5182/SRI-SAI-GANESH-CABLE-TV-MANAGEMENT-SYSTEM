import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Customer History PDF ───────────────────────────────────────────
export function generateCustomerPDF(customer, plan, invoices, serviceRequests) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Sri Sai Ganesh Cable TV', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Customer History Report', 14, 26);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 33);

  let y = 50;

  // Customer Details
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details', 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const details = [
    ['Name', customer.name],
    ['Phone', customer.phone],
    ['Email', customer.email],
    ['Address', customer.address],
    ['Connection Type', customer.connectionType],
    ['Status', customer.status],
    ['Current Plan', plan?.name || 'None'],
    ['Monthly Price', plan ? `Rs. ${plan.monthlyPrice}` : 'N/A'],
    ['Start Date', customer.startDate],
    ['Renewal Date', customer.renewalDate || 'N/A'],
  ];

  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${label}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(String(value), 60, y);
    y += 6;
  });

  y += 6;

  // Installation Expenses
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Installation Expenses', 14, y);
  y += 4;

  if (customer.installationExpenses && customer.installationExpenses.length > 0) {
    const installTotal = customer.installationExpenses.reduce(
      (sum, e) => sum + e.quantity * e.cost, 0
    );

    autoTable(doc, {
      startY: y,
      head: [['Item', 'Quantity', 'Unit Cost (Rs.)', 'Total (Rs.)']],
      body: [
        ...customer.installationExpenses.map((e) => [
          e.item,
          e.quantity,
          e.cost.toLocaleString('en-IN'),
          (e.quantity * e.cost).toLocaleString('en-IN'),
        ]),
        ['', '', 'Grand Total', `Rs. ${installTotal.toLocaleString('en-IN')}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [71, 85, 105] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 10;
  } else {
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('No installation expenses recorded.', 14, y);
    y += 10;
  }

  // Payment History
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Payment History', 14, y);
  y += 4;

  const custInvoices = invoices.filter((i) => i.customerId === customer.id);
  if (custInvoices.length > 0) {
    const totalPaid = custInvoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
    const totalDue = custInvoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0);

    autoTable(doc, {
      startY: y,
      head: [['Invoice', 'Month', 'Amount (Rs.)', 'Due Date', 'Status', 'Paid Date']],
      body: custInvoices.map((inv) => [
        inv.id.toUpperCase(),
        inv.month,
        inv.amount.toLocaleString('en-IN'),
        inv.dueDate,
        inv.status,
        inv.paidDate || '—',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [71, 85, 105] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Total Paid: Rs. ${totalPaid.toLocaleString('en-IN')}`, 14, y);
    doc.text(`Outstanding: Rs. ${totalDue.toLocaleString('en-IN')}`, 100, y);
    y += 10;
  } else {
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('No payment records found.', 14, y);
    y += 10;
  }

  // Service Requests
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Service Requests', 14, y);
  y += 4;

  const custSRs = serviceRequests.filter((sr) => sr.customerId === customer.id);
  if (custSRs.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Type', 'Description', 'Status', 'Technician', 'Created', 'Resolved']],
      body: custSRs.map((sr) => [
        sr.type,
        sr.description,
        sr.status,
        sr.technician || 'Unassigned',
        sr.createdDate,
        sr.resolvedDate || '—',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [71, 85, 105] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
      columnStyles: { 1: { cellWidth: 55 } },
    });
  } else {
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('No service requests found.', 14, y);
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Sri Sai Ganesh Cable TV  |  Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(`Customer_${customer.name.replace(/\s+/g, '_')}_History.pdf`);
}

// ─── Expense & Revenue Report PDF ───────────────────────────────────
export function generateExpenseRevenuePDF(expenses, invoices, customers, plans) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Sri Sai Ganesh Cable TV', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Expense & Revenue Report', 14, 26);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 33);

  let y = 50;

  // Monthly Revenue (from active subscriptions)
  const monthlyRevenue = customers
    .filter((c) => c.status === 'Active')
    .reduce((sum, c) => {
      const plan = plans.find((p) => p.id === c.planId);
      return sum + (plan?.monthlyPrice || 0);
    }, 0);

  // Total collected from invoices
  const totalCollected = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices
    .filter((i) => i.status !== 'Paid')
    .reduce((s, i) => s + i.amount, 0);

  // Total expenses
  const totalExpenses = expenses.reduce((s, e) => s + e.totalCost, 0);

  // Net Profit/Loss
  const netProfitLoss = totalCollected - totalExpenses;

  // ── Summary Section ──
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Financial Summary', 14, y);
  y += 8;

  const summaryData = [
    ['Monthly Subscription Revenue', `Rs. ${monthlyRevenue.toLocaleString('en-IN')}`],
    ['Total Revenue Collected (All Time)', `Rs. ${totalCollected.toLocaleString('en-IN')}`],
    ['Total Pending Dues', `Rs. ${totalPending.toLocaleString('en-IN')}`],
    ['Total Expenses (All Time)', `Rs. ${totalExpenses.toLocaleString('en-IN')}`],
    ['Net Profit / Loss', `Rs. ${netProfitLoss.toLocaleString('en-IN')} (${netProfitLoss >= 0 ? 'Profit' : 'Loss'})`],
  ];

  autoTable(doc, {
    startY: y,
    body: summaryData,
    theme: 'plain',
    bodyStyles: { fontSize: 10, textColor: [71, 85, 105] },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [30, 41, 59], cellWidth: 100 },
      1: { halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 12;

  // ── Monthly Breakdown ──
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Monthly Revenue Breakdown (from Invoices)', 14, y);
  y += 4;

  // Group invoices by month
  const monthlyMap = {};
  invoices.forEach((inv) => {
    if (!monthlyMap[inv.month]) {
      monthlyMap[inv.month] = { collected: 0, pending: 0, total: 0 };
    }
    monthlyMap[inv.month].total += inv.amount;
    if (inv.status === 'Paid') {
      monthlyMap[inv.month].collected += inv.amount;
    } else {
      monthlyMap[inv.month].pending += inv.amount;
    }
  });

  autoTable(doc, {
    startY: y,
    head: [['Month', 'Total Billed (Rs.)', 'Collected (Rs.)', 'Pending (Rs.)']],
    body: Object.entries(monthlyMap).map(([month, data]) => [
      month,
      data.total.toLocaleString('en-IN'),
      data.collected.toLocaleString('en-IN'),
      data.pending.toLocaleString('en-IN'),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [71, 85, 105] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 12;

  // ── Expense by Category ──
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Expense Summary by Category', 14, y);
  y += 4;

  const categoryMap = {};
  expenses.forEach((e) => {
    if (!categoryMap[e.category]) categoryMap[e.category] = 0;
    categoryMap[e.category] += e.totalCost;
  });

  autoTable(doc, {
    startY: y,
    head: [['Category', 'Total Amount (Rs.)']],
    body: [
      ...Object.entries(categoryMap).map(([cat, amt]) => [
        cat,
        amt.toLocaleString('en-IN'),
      ]),
      ['Grand Total', totalExpenses.toLocaleString('en-IN')],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [71, 85, 105] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 12;

  // ── Itemized Expense List ──
  if (y > 200) { doc.addPage(); y = 20; }
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Itemized Expense List', 14, y);
  y += 4;

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Category', 'Item', 'Qty', 'Unit Cost (Rs.)', 'Total (Rs.)']],
    body: sortedExpenses.map((e) => [
      e.date,
      e.category,
      e.item,
      e.quantity,
      e.unitCost.toLocaleString('en-IN'),
      e.totalCost.toLocaleString('en-IN'),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 7, textColor: [71, 85, 105] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
    columnStyles: { 1: { cellWidth: 35 } },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Sri Sai Ganesh Cable TV  |  Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save('Expense_Revenue_Report.pdf');
}
