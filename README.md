# Sales Manager - Business Logic Documentation

## Overview

This Sales Manager system is designed to handle the complete business flow of a distribution company that:
- **Purchases products** from providers (suppliers)
- **Distributes products** to zones (retail outlets/distributors)
- **Manages inventory** automatically
- **Handles returns** from zones when products don't sell
- **Tracks payments** and calculates effective balances

## Core Business Entities

### 1. **Providers** (Suppliers)
- Companies that supply products to your business
- Example: A manufacturer who sells you electronics

### 2. **Products**
- Items that you buy from providers and sell to zones
- Each product has: name, price, SKU, description

### 3. **Zones** (Distributors/Retailers)
- Your customers who buy products from you to resell
- Example: Retail shops, regional distributors

### 4. **Inventory**
- Tracks how many products you currently have in stock
- Automatically updated when you buy from providers or sell to zones

## Business Flow Explained

### Step 1: Purchasing from Providers

```
Provider → Your Company
```

**What happens:**
1. You create a **Provider Invoice** for products you're buying
2. Example: Buy 100 smartphones from Samsung for $500 each
3. **System automatically adds 100 smartphones to your inventory**
4. **Inventory Transaction** is recorded as "PURCHASE"

**Real-world scenario:**
- You run a electronics distribution business
- Samsung delivers 100 phones to your warehouse
- You create an invoice in the system
- Your inventory now shows: "100 Samsung phones available"

### Step 2: Distributing to Zones

```
Your Company → Zone (Retailer)
```

**What happens:**
1. You create a **Zone Invoice** for products you're selling
2. Example: Sell 30 smartphones to "Downtown Electronics" for $600 each
3. **System automatically deducts 30 smartphones from your inventory**
4. **Inventory Transaction** is recorded as "DISTRIBUTION"
5. **System prevents over-selling** (can't sell more than you have)

**Real-world scenario:**
- Downtown Electronics orders 30 phones
- You create a zone invoice for $18,000 (30 × $600)
- Your inventory now shows: "70 Samsung phones available"
- Downtown Electronics owes you $18,000

### Step 3: Zone Returns (The Smart Part)

```
Zone → Your Company (Returning unsold products)
```

**The Problem:** Zones don't always sell everything you give them.

**Example Scenario:**
- You sold 30 phones to Downtown Electronics for $18,000
- They only sold 20 phones to customers
- They want to return 10 unsold phones
- They want to pay $12,000 for the 20 phones they sold

**What the system does:**
1. **Original Invoice Stays Unchanged** ($18,000 for 30 phones)
2. **Return Record Created** (10 phones worth $6,000)
3. **Payment Record Created** ($12,000 for phones actually sold)
4. **Inventory Updated** (10 phones added back to your stock)

**Final Calculation:**
- Original Amount: $18,000
- Less: Returns: $6,000 (10 phones returned)
- Less: Payments: $12,000 (payment for 20 phones sold)
- **Effective Balance: $0** ✅ Account settled!

## Key Business Rules

### 1. **Immutable Invoices**
- Original invoices are **never changed**
- Returns and payments are tracked separately
- This maintains proper accounting records

### 2. **Automatic Inventory Management**
- **Provider invoices** → Add to inventory
- **Zone invoices** → Deduct from inventory  
- **Approved returns** → Add back to inventory
- **No manual inventory adjustments needed**

### 3. **Return Approval Workflow**
- Returns start as "PENDING"
- Manager can "APPROVE" or "REJECT"
- Inventory only updates when return is APPROVED

### 4. **Partial Payments with Returns**
- Zones can pay for sold items while returning unsold items
- One transaction handles both payment and return
- Simplifies the settlement process

## Inventory Dashboard Features

### 1. **Current Stock View**
- See all products and quantities available
- Grouped by provider
- Real-time updates

### 2. **Transaction History**
- Complete audit trail of all inventory movements
- Filter by product, date, transaction type
- See exactly when and why inventory changed

### 3. **Low Stock Alerts**
- Automatically identifies products running low
- Helps prevent stockouts
- Configurable thresholds

### 4. **Financial Overview**
- Total inventory value
- Recent transaction counts
- Key performance metrics

## Benefits of This System

### For Business Owners:
- **Real-time inventory tracking** - Always know what you have
- **Automatic calculations** - No manual inventory management
- **Complete audit trail** - Track every product movement
- **Flexible returns** - Handle partial sales easily

### For Zones (Your Customers):
- **Flexible payment options** - Pay for what you sell
- **Easy returns process** - Return unsold products
- **Clear account status** - See exactly what you owe

### For Accounting:
- **Immutable records** - Original invoices never change
- **Separate tracking** - Returns and payments tracked independently
- **Accurate reporting** - Always know true financial position

## Example Complete Business Cycle

1. **Purchase**: Buy 1000 phones from Samsung for $500,000
2. **Distribute**: Sell 300 phones to 3 different zones for $600,000
3. **Returns**: Zones return 50 unsold phones worth $60,000
4. **Payments**: Zones pay $540,000 for phones they actually sold
5. **Result**: 
   - Inventory: 750 phones remaining (1000 - 300 + 50)
   - Revenue: $540,000 received
   - Outstanding: $0 (all accounts settled)

This system ensures accurate inventory tracking, flexible customer relationships, and proper financial management for distribution businesses.
