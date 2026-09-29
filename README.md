# 📊 CSV-to-Dashboard: Production-Grade E-Commerce Analytics Engine

A 100% dynamic, production-grade E-Commerce Analytics Web Application built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Framer Motion**, **PapaParse**, and **Recharts**. Inspired by Blinkit's Deep Forest Emerald theme and Power BI design standards.

---

## 🌟 Key Features & Directives

### 1. 🔒 Zero Hardcoding & Strict Initial Blank State
- **100% Unrendered Initial State**: The application launches strictly with `dataset = null` and renders **only** the CSV Upload Portal.
- **No Mock Arrays or Pre-rendered Figures**: Zero hardcoded arrays or default revenue figures exist in memory or UI until a CSV file is uploaded and verified.
- **Memory Purge**: Reset button wipes dataset state and returns to the initial upload portal.

### 2. 🎨 Design & Brand Aesthetics (Blinkit Deep Green Theme)
- **Sidebar**: Deep Forest Emerald Green (`#022B14` / `#053B1E`) with vibrant Lime Green (`#84CC16` / `#22C55E`) badges and active states.
- **Canvas Workspace**: Soft neutral slate (`#F8FAFC`) with pure white card surfaces (`#FFFFFF`) and slate metrics (`#0F172A`).
- **Adaptive Header & Dynamic Branding**: Automatically detects domain from uploaded filename/data:
  - **Grocery / Food**: Blinkit-style `ShoppingBag` badge.
  - **Fashion / Apparel**: `Shirt` badge.
  - **Electronics / Tech**: `Laptop` badge.
  - **General Store**: Modern `Store` badge.

### 3. 🧹 Automated Data Cleaning & Sanitization Pipeline
- **PapaParse In-Memory Parsing**:
  - **Deduplication**: Identifies and purges duplicate rows and transaction IDs.
  - **Null & Missing Resolution**: Strips whitespace, `"null"`, `"N/A"`, `undefined`, substituting missing categorical fields with `"Uncategorized"`.
  - **Currency Sanitization**: Strips `₹`, `$`, `€`, `£`, and commas, converting numeric strings to pure floats.
  - **Date Normalization**: Standardizes timestamps into `YYYY-MM-DD` strings.
- **Data Health Audit Bar**: Dismissible top banner providing live audit stats:
  `Dataset Verified: [X] clean rows loaded | [Y] duplicates purged | [Z] null values resolved`

### 4. 📈 Dynamic Column Detection & Power BI Visuals
Fuzzy regex matching automatically detects headers:
- `Revenue / Sales`: `[sales, revenue, total, amount, grand_total, net_sales, price]`
- `Orders / Transactions`: `[order_id, transaction_id, invoice_id, orders, id]`
- `Customers`: `[customer_id, customer_name, client_id, user_id, buyer]`
- `Date`: `[date, order_date, created_at, timestamp, invoice_date]`
- `Category`: `[category, department, product_type, segment]`
- `Products`: `[product, product_name, item, sku, title]`
- `Locations`: `[city, state, region, zone, country]`
- `Quantity`: `[quantity, qty, units, items_count]`

#### Visual Rules & Missing Column Policy:
- **KPI Metric Cards**: Revenue, Total Orders, Customers, AOV, Units Sold.
- **Timeline Trend**: Area Chart for sales/orders over time.
- **Category Share**: Radial Donut Chart with center total.
- **Leaderboard**: Horizontal Bar Chart for top products/cities.
- **Missing Column Placeholder Tile**: If a required column is missing, renders a Power BI placeholder tile stating:
  > *"Data Not Found: Required column '[Field Name]' is missing in the uploaded CSV."*

### 5. ✨ Micro-Interactions & Glassmorphic Tooltips
- **Animated Counter**: Numbers animate up from 0 to final target amount.
- **Radial Wipe Donut**: Slices expand outward on hover with a glow shadow.
- **Interactive Leaderboard**: Hovered bar brightens while unhovered bars smoothly dim (`opacity: 0.45`).
- **Glassmorphic Floating Tooltip**: Dark card (`bg-slate-900/95 border border-slate-700 backdrop-blur-md`) displaying entity label, color dot, formatted value, and percentage contribution.

---

## 🛠️ Quick Start & Installation

```bash
# Clone the repository
git clone https://github.com/Nandhan-17/CSV-to-Dashboard.git

# Navigate to directory
cd CSV-to-Dashboard

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 🧪 Built With

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Framer Motion**
- **Recharts**
- **PapaParse**
- **Lucide React**
