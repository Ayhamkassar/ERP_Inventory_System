# ERP Inventory System - Frontend 🚀

A modern and scalable frontend application for an **ERP Inventory Management System**.

This project provides a complete user interface for managing inventory operations, including products, warehouses, purchases, sales, transfers, suppliers, reports, and dashboard analytics.

Built with a modular architecture to ensure maintainability, scalability, and a clean development experience.

---

## 📌 Overview

The ERP Inventory System Frontend is the client-side application for an Enterprise Resource Planning inventory solution.

It provides a responsive dashboard with role-based access and integrates with backend APIs to manage daily inventory workflows.

---

## ✨ Features

### 🔐 Authentication
- User login system
- Protected routes
- Authentication context management

### 📊 Dashboard
- Inventory statistics
- Business overview
- Real-time data visualization

### 📦 Products Management
- Create and manage products
- Product information handling
- Product listing and filtering

### 🏢 Warehouse Management
- Manage warehouses
- Track inventory locations

### 🛒 Purchases
- Create purchase orders
- View purchase details
- Manage suppliers

### 💰 Sales
- Create sales transactions
- View sales details
- Track sales operations

### 🔄 Stock Transfers
- Create inventory transfers
- Manage warehouse-to-warehouse movements

### 📑 Reports
- Generate inventory reports
- View business insights

### 🎨 UI & UX
- Responsive design
- Dark/Light theme support
- Reusable UI components
- Modern dashboard interface

### ⚡ Real-Time Communication
- SignalR integration for real-time inventory updates

---

# 🛠️ Technologies

## Frontend

- React.js
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- SignalR Client

## UI Components

- Custom reusable components
- Shadcn/UI inspired components
- Radix UI components

## Development Tools

- npm
- Git
- GitHub

---

# 📂 Project Structure

```
src/
│
├── api/                 # API client and endpoints
│
├── app/                 # Application root and UI components
│
├── components/          # Shared reusable components
│
├── context/             # Global contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── features/            # Business modules
│   ├── categories/
│   ├── dashboard/
│   ├── products/
│   ├── purchases/
│   ├── reports/
│   ├── sales/
│   ├── suppliers/
│   ├── transfers/
│   └── warehouses/
│
├── hooks/               # Custom React hooks
│
├── layouts/             # Application layouts
│
├── pages/               # Main pages
│
├── routes/              # Routing configuration
│
├── services/            # API service layer
│
├── signalr/             # Real-time communication
│
├── styles/              # Global styles and themes
│
├── types/               # TypeScript definitions
│
└── utils/               # Helper utilities
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

- Node.js
- npm

Check versions:

```bash
node -v
npm -v
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Ayhamkassar/ERP_Inventory_System.git
```

Navigate to frontend branch:

```bash
git checkout frontend
```

Install dependencies:

```bash
npm install
```

---

## Environment Configuration

Create a `.env` file:

```
VITE_API_URL=your_backend_api_url
```

Example:

```
VITE_API_URL=https://localhost:7000/api
```

---

## Run Development Server

```bash
npm run dev
```

The application will run on:

```
http://localhost:5173
```

---

# 🔗 Backend Integration

The frontend communicates with the ERP backend through REST APIs.

API communication is organized through:

```
src/api
src/services
```

Real-time updates are handled using:

```
src/signalr/inventoryHub.ts
```

---

# 🌱 Branches

| Branch | Description |
|---|---|
| main | Main project branch |
| frontend | React frontend application |

---

# 👨‍💻 Author

**Ayham Kassar**

GitHub:

https://github.com/Ayhamkassar

---

# 📄 License

This project is developed for educational and professional purposes.