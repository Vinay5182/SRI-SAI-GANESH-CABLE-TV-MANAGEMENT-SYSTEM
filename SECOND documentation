# Sri Sai Ganesh Cable TV Management System - Documentation

## 1. Overview
The **Sri Sai Ganesh Cable TV Management System** is a comprehensive, modern web application designed to manage the daily operations of a cable TV business. It provides a centralized platform for tracking customers, managing subscription plans, handling billing, and tracking service requests or complaints. The application features a rich, responsive dashboard with data visualization and a premium dark-themed "glassmorphism" user interface.

## 2. Technology Stack
*   **Core Framework**: React 19 (via Vite)
*   **Routing**: React Router DOM (v7)
*   **Styling**: Tailwind CSS v4 + Custom CSS (`index.css`)
*   **Icons**: Lucide React
*   **Data Visualization**: Recharts
*   **State Management**: React Context API (`AppContext`)
*   **Build Tool**: Vite

## 3. Architecture & State Management
The application uses a **Context-based local state management** architecture to simulate a database. This allows for realistic interactions without requiring a backend server.

*   **`src/data.js`**: Serves as the initial "database state", exporting realistic dummy data for customers, plans, invoices, service requests, and chart metrics.
*   **`src/context/AppContext.jsx`**: The core data provider. It initializes state using the dummy data and exposes CRUD (Create, Read, Update, Delete) functions for every entity:
    *   `customers`: `addCustomer`, `updateCustomer`, `deleteCustomer`
    *   `plans`: `addPlan`, `updatePlan`, `deletePlan`, `assignPlan`
    *   `invoices`: `addInvoice`, `updateInvoice`, `markInvoicePaid`
    *   `serviceRequests`: `addServiceRequest`, `updateServiceRequest`
*   Components consume this data using the custom `useApp()` hook.

## 4. Project Structure
```text
/src
├── assets/             # Static assets (if any)
├── components/
│   └── Layout.jsx      # Main layout wrapper with sidebar navigation
├── context/
│   └── AppContext.jsx  # Global state provider
├── pages/
│   ├── Dashboard.jsx   # Analytics and summary metrics
│   ├── Customers.jsx   # Customer CRUD and installation expenses
│   ├── Plans.jsx       # Subscription packages management
│   ├── Billing.jsx     # Invoice generation and payment tracking
│   └── Services.jsx    # Complaint and service request handling
├── App.jsx             # Root component with routing configuration
├── data.js             # Seed data for the application
├── index.css           # Global styles, variables, and custom UI classes
└── main.jsx            # React entry point
```

## 5. Feature Implementation Details

### 5.1. Dashboard (`/`)
*   **Summary Cards**: Displays top-level metrics dynamically calculated from the global state: Total Customers, Active Subscriptions, Monthly Revenue, Pending Dues, and Net Profit/Loss.
*   **Charts**: Uses `recharts` for visual analytics:
    *   *Revenue Trend*: A Line chart showing revenue vs. expenses over the last 7 months.
    *   *Expense Breakdown*: A Pie chart detailing operational costs (Infrastructure, Equipment, Maintenance, Utilities).
    *   *Comparison*: A Bar chart for quick monthly revenue vs. expense comparison.

### 5.2. Customers Management (`/customers`)
*   **List View**: Displays a tabular view of all customers with quick actions. Features a search bar and a status filter.
*   **Expandable Details**: Clicking the 'Eye' icon expands a row to show detailed contact info, current subscription details, and an itemized list of installation expenses.
*   **Installation Expenses Form**: When adding a new customer, the form dynamically allows adding/removing line items for equipment used during installation (Remote, Patch Card, Bullet, Fiber Wire, AV Jack, HDMI Cable), calculating the total installation cost automatically.

### 5.3. Subscription Plans (`/plans`)
*   **Plan Cards**: Visually distinct cards for "Basic", "Standard", and "Premium" packages, showing price, channel count, and features.
*   **Distribution Tracking**: A table showing which customer is on which plan, along with start and renewal dates.
*   **Plan Assignment**: A dedicated modal allowing administrators to change or assign plans to existing customers, updating their billing cycle dates.

### 5.4. Billing & Payments (`/billing`)
*   **Financial Overview**: Three summary cards highlighting Total Collected, Pending Payments, and Overdue Amounts.
*   **Invoice Generation**: A modal to generate new invoices. Selecting a customer auto-fills the amount based on their currently assigned active plan.
*   **Payment Tracking**: Lists all invoices with status badges. Unpaid/Overdue invoices have a one-click "Mark Paid" action button that updates the status and records the payment date.

### 5.5. Service Management (`/services`)
*   **Ticket Tracking**: Manages "Complaints" and "Service Requests".
*   **Status Workflow**: Tickets flow through "Open", "In Progress", and "Resolved" states.
*   **Technician Assignment**: Administrators can assign available technicians (from a predefined list) to specific tickets. When a ticket is marked "Resolved", it prompts for a resolution date.

## 6. UI/UX & Design System
The UI was built with a strong focus on premium aesthetics, specifically utilizing a **Dark Glassmorphism** theme.
*   **CSS Variables**: `index.css` defines a comprehensive color palette tailored for dark mode (Slate background, vivid accents for badges).
*   **Glass Effects**: `.glass-card` uses `backdrop-filter: blur(20px)` over semi-transparent dark backgrounds to create depth.
*   **Micro-animations**: Hover states on cards, smooth transitions on modal openings (`@keyframes slideUp`), and subtle pulsing indicators for system status.
*   **Responsive**: Layouts use Tailwind's grid and flexbox utilities to ensure usability across desktop and tablet views. Sidebar navigation provides persistent, intuitive access to all modules.
