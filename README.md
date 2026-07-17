# Inventory Management System

A production-quality Inventory Module built as part of an ERP technical assessment.

The project follows **Clean Architecture**, applies **SOLID principles**, uses **Entity Framework Core** with **SQL Server**, supports **real-time notifications with SignalR**, and implements **Optimistic Concurrency** to guarantee stock accuracy.

---

# Tech Stack

- ASP.NET Core Web API (.NET 10)
- Entity Framework Core
- SQL Server Express
- SignalR
- xUnit
- Moq
- FluentAssertions
- Swagger

---

# Architecture

The solution follows Clean Architecture.

```
InventorySystem
│
├── Inventory.Domain
│     Entities
│     Enums
│
├── Inventory.Application
│     DTOs
│     Interfaces
│     Services
│
├── Inventory.Infrastructure
│     Persistence
│     Repositories
│     Configurations
│
└── Inventory.API
      Controllers
      SignalR
      Dependency Injection
```

Responsibilities:

- **Domain**
  - Business entities
  - Enums
  - Core business rules

- **Application**
  - Business services
  - DTOs
  - Repository contracts
  - Service contracts

- **Infrastructure**
  - Entity Framework Core
  - SQL Server
  - Repository implementations
  - Configurations
  - Unit Of Work

- **API**
  - REST Controllers
  - Swagger
  - SignalR Hub
  - Dependency Injection

---

# Business Problems & Solutions

## Problem 1

### Tracking the Source of Sold Products

### Challenge

The same product may be purchased multiple times from different suppliers.

When selling a product, the client must know:

- Which purchase supplied the sold quantity
- Which supplier originally supplied it
- Remaining quantity from each shipment

### Solution

Implemented **Stock Batch Tracking**.

Flow:

```
Supplier
    │
Purchase
    │
PurchaseItem
    │
StockBatch
    │
SaleItemAllocation
```

Each StockBatch stores:

- PurchaseItem
- Supplier (through Purchase)
- Product
- Warehouse
- Unit Cost
- Original Quantity
- Remaining Quantity

During sales:

- Oldest available batches are consumed first (FIFO)
- Every sold quantity is linked to its StockBatch
- Complete traceability is maintained

This allows answering questions like:

- How much Product X was sold from Supplier Y?
- How much inventory remains from a specific shipment?

---

## Problem 2

### Concurrent Sales

### Challenge

Multiple users may sell the same stock simultaneously.

Without concurrency protection:

```
Stock = 10

Cashier A sells 10

Cashier B sells 10

Result

Stock = -10
```

### Solution

Implemented:

- Optimistic Concurrency
- SQL Server RowVersion
- Transactions

Stock entity contains:

```csharp
public byte[] RowVersion { get; set; }
```

Configuration:

```csharp
builder.Property(x => x.RowVersion)
       .IsRowVersion();
```

EF Core automatically throws:

```
DbUpdateConcurrencyException
```

when two users modify the same stock simultaneously.

This guarantees stock accuracy.

---

## Problem 3

### Warehouse Transfers

### Challenge

Moving inventory between warehouses must be atomic.

Failure during transfer should never leave inconsistent inventory.

### Solution

Transfer Service uses:

- Database Transactions
- Unit Of Work

Transfer flow:

```
Start Transaction

↓

Validate Source Stock

↓

Decrease Source

↓

Increase Destination

↓

Save

↓

Commit
```

If any step fails:

```
Rollback
```

No warehouse is left with inconsistent quantities.

---

## Problem 4

### Real-Time Inventory Updates

Implemented using SignalR.

Clients receive notifications immediately after:

- Purchase
- Sale
- Transfer

Low stock notifications are also pushed automatically.

SignalR Events:

- StockUpdated
- LowStock

Managers can monitor inventory without refreshing the page.

---

## Problem 5

### Reporting

Implemented reporting endpoints supporting filters by:

- Warehouse
- Supplier
- Category
- Product
- Date Range

Reports include:

- Sales Report
- Top Selling Products
- Supplier Sales
- Remaining Stock by Batch

---

# Database Design

Main Entities

- Products
- Categories
- Suppliers
- Warehouses
- Purchases
- PurchaseItems
- Sales
- SaleItems
- Stock
- StockBatch
- StockMovement
- SaleItemAllocation
- Transfers
- TransferItems

---

# Inventory Flow

Purchase

```
Purchase

↓

PurchaseItem

↓

StockBatch

↓

Stock
```

Sale

```
Sale

↓

SaleItem

↓

Allocate From StockBatch

↓

Decrease RemainingQuantity

↓

Update Stock

↓

StockMovement
```

Transfer

```
Warehouse A

↓

Decrease Stock

↓

Increase Warehouse B

↓

Commit Transaction
```

---

# Soft Delete

Soft Delete implemented using:

```
IsDeleted
```

Global Query Filters exclude deleted records automatically.

---

# Audit Fields

Relevant entities contain:

- CreatedAt
- CreatedBy
- ModifiedAt
- ModifiedBy

---

# Repository Pattern

Repositories abstract database access.

Examples:

- ProductRepository
- PurchaseRepository
- SaleRepository
- StockRepository
- TransferRepository

Business logic remains inside Application layer.

---

# Unit Of Work

Implemented to:

- Save changes
- Begin Transaction
- Commit
- Rollback

---

# SignalR

Hub:

```
InventoryHub
```

Notifications:

- Stock Updated
- Low Stock

---

# API Endpoints

## Purchases

```
POST /api/purchases
```

---

## Sales

```
POST /api/sales
```

---

## Transfers

```
POST /api/transfers
```

---

## Reports

```
GET /api/reports/sales
```

```
GET /api/reports/top-selling
```

---

# Testing

Implemented tests using:

- xUnit
- Moq
- FluentAssertions

Covered services:

- PurchaseService
- SaleService
- TransferService

Additional concurrency test verifies SQL Server RowVersion behavior.

---

# Database Indexes

Indexes created for performance:

Stock

```
(ProductId, WarehouseId)
```

Unique index.

Reason:

Fast stock lookup.

---

StockBatch

```
(ProductId, WarehouseId)
```

Reason:

Fast FIFO allocation.

---

Sales

```
SaleDate
```

Reason:

Reporting.

---

Purchases

```
PurchaseDate
```

Reason:

Reporting.

---

# Assumptions

The following assumptions were made:

- FIFO inventory allocation
- One stock record per Product + Warehouse
- Transfers are atomic
- Sales cannot exceed available stock
- RowVersion guarantees optimistic concurrency
- Managers receive real-time inventory updates through SignalR

---

# Running the Project

Clone the repository

```
git clone https://github.com/Ayhamkassar/ERP_Inventory_System.git
```

Restore packages

```
dotnet restore
```

Run migrations

```
dotnet ef database update \
--project Inventory.Infrastructure \
--startup-project Inventory.API
```

Run the API

```
dotnet run --project Inventory.API
```

Swagger

```
https://localhost:<port>/swagger
```

---

# Future Improvements

- Authentication & Authorization
- Background Jobs
- Distributed Cache
- CQRS
- Event Bus
- Docker Support
- Integration Tests
- Inventory Forecasting

---

# Design Decisions

## Why StockBatch?

Provides full inventory traceability and supplier tracking.

---

## Why RowVersion?

Guarantees stock consistency without pessimistic locking.

---

## Why Transactions?

Ensures atomic warehouse transfers.

---

## Why SignalR?

Provides real-time inventory visibility.

---

# Author

Developed as a technical assessment implementing production-oriented ERP inventory management principles using ASP.NET Core, EF Core, SQL Server, Clean Architecture, and SignalR.