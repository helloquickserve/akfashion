# Complete Application Build Prompt: AK Fashion House - Retail POS System

## Project Overview
Create a comprehensive Point of Sale (POS) and Retail Management System for "AK Fashion House" with role-based access control, real-time analytics, inventory management, and receipt printing capabilities.

---

## TECH STACK (MANDATORY)

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Database**: MongoDB (Motor async driver)
- **Authentication**: JWT (python-jose with cryptography)
- **Password Hashing**: bcrypt
- **Validation**: Pydantic v2
- **Server**: Uvicorn (ASGI)

### Frontend
- **Framework**: React 18 with React Router v6
- **Styling**: Tailwind CSS
- **Component Library**: Shadcn/UI (Radix UI based)
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Notifications**: Sonner (toast notifications)
- **Date Handling**: date-fns
- **Build Tool**: Create React App with CRACO

### Database Schema
- **Collections**: users, products, sales, settings
- **NoSQL**: Document-based storage
- **Async Operations**: Motor driver

---

## USER CREDENTIALS (DEFAULT DATA)

### Admin User
- Username: `akfashionhouse`
- Password: `admin1234` (bcrypt hashed)
- Role: `admin`

### Cashier Users
1. Username: `cashier1` / Password: `cashier123` / Role: `cashier`
2. Username: `cashier2` / Password: `cashier234` / Role: `cashier`

**IMPORTANT**: On login screen, display ONLY cashier credentials (not admin).

---

## DATABASE MODELS

### 1. User Model
```python
{
    "id": str (UUID),
    "username": str (unique),
    "password_hash": str (bcrypt hashed),
    "role": str ("admin" or "cashier")
}
```

### 2. Product Model
```python
{
    "id": str (UUID),
    "name": str,
    "barcode": str (unique identifier),
    "category": str,
    "price": float,
    "purchase_price": float,
    "stock": int,
    "created_at": str (ISO datetime)
}
```

### 3. Sale Model
```python
{
    "id": str (UUID),
    "items": [
        {
            "product_id": str,
            "product_name": str,
            "barcode": str,
            "quantity": int,
            "price": float,
            "total": float
        }
    ],
    "subtotal": float,
    "gst_amount": float (18% of subtotal),
    "total_amount": float (subtotal + gst),
    "cashier_id": str,
    "cashier_name": str,
    "created_at": str (ISO datetime)
}
```

### 4. Settings Model
```python
{
    "id": "settings" (fixed),
    "business_name": str (default: "AK Fashion House"),
    "business_type": str (default: "Retail"),
    "gst_number": str,
    "business_address": str,
    "printer_name": str (default: "EPSON TM-T82"),
    "paper_size": str (default: "80mm", options: "58mm", "80mm", "A4"),
    "auto_print": bool (default: false)
}
```

---

## BACKEND API ENDPOINTS

### Base URL: `/api`

### Authentication
**POST /api/auth/login**
- Body: `{"username": str, "password": str}`
- Response: `{"token": str, "user": {"id": str, "username": str, "role": str}}`
- Authentication: None required
- Logic: Verify bcrypt password, generate JWT token

### Dashboard
**GET /api/dashboard/metrics**
- Response: `{"total_sales": float, "monthly_sales": float}`
- Authentication: Required (any role)
- Logic: 
  - total_sales: Sum all sales.total_amount
  - monthly_sales: Sum sales.total_amount for current month

### Products
**GET /api/products**
- Response: List[Product]
- Authentication: Required (any role)

**GET /api/products/barcode/{barcode}**
- Response: Product
- Authentication: Required (any role)
- Logic: Find product by barcode

**POST /api/products**
- Body: ProductCreate
- Response: Product
- Authentication: Admin only
- Logic: Check barcode uniqueness, create product

**PUT /api/products/{product_id}**
- Body: ProductUpdate
- Response: Product
- Authentication: Admin only
- Logic: Update product, validate barcode uniqueness if changed

**DELETE /api/products/{product_id}**
- Response: `{"message": "Product deleted successfully"}`
- Authentication: Admin only

**POST /api/products/import-csv**
- Body: File upload (multipart/form-data)
- Response: `{"message": str, "imported": int, "skipped": int}`
- Authentication: Admin only
- CSV Format: Product Name, Barcode, Category, Price, Purchase Price, Stock
- Logic: Parse CSV, skip duplicates, validate fields

**GET /api/products/export-csv**
- Query Params: start_date (optional), end_date (optional)
- Response: CSV file download
- Authentication: Admin only
- CSV Format: Product Name, Barcode, Category, Price, Purchase Price, Stock

### Sales
**GET /api/sales**
- Response: List[Sale] (sorted by created_at descending)
- Authentication: Required (any role)

**POST /api/sales**
- Body: `{"items": List[SaleItem]}`
- Response: Sale
- Authentication: Required (any role)
- Logic:
  1. Calculate subtotal (sum of item totals)
  2. Calculate GST (18% of subtotal)
  3. Calculate total (subtotal + gst)
  4. Deduct stock for each item
  5. Save sale with cashier info

**DELETE /api/sales/{sale_id}**
- Response: `{"message": "Sale deleted and stock restored"}`
- Authentication: Admin only
- Logic: Restore stock for all items, delete sale

**GET /api/sales/export-csv**
- Query Params: start_date (optional), end_date (optional)
- Response: CSV file download (item-level)
- Authentication: Required (any role)
- CSV Format: Sale ID (8 chars), Date, Item Name, Barcode, Quantity, Unit Price, Total
- Logic: Each item appears as separate row with same Sale ID

### Analytics
**GET /api/analytics/sales-overview**
- Response: `{"daily_sales": [{"date": str, "sales": float}]}`
- Authentication: Required (any role)
- Logic: Last 7 days daily sales

**GET /api/analytics/monthly-sales**
- Response: `{"monthly_sales": [{"month": str, "sales": float}]}`
- Authentication: Required (any role)
- Logic: All historical months with sales data

**GET /api/analytics/last-four-months**
- Response: `{"last_four_months": [{"month": str, "sales": float}]}`
- Authentication: Required (any role)
- Logic: Last 4 months sales data

**GET /api/analytics/top-products**
- Response: `{"top_products": [{"name": str, "quantity": int, "revenue": float}]}`
- Authentication: Required (any role)
- Logic: Top 5 products by revenue

### Reports
**GET /api/reports/item-sales**
- Query Params: start_date (optional), end_date (optional)
- Response: `{"items": [{"item_name": str, "barcode": str, "quantity_sold": int, "revenue": float}]}`
- Authentication: Required (any role)
- Logic: Aggregate sales by item, sort by revenue descending

**GET /api/reports/item-sales/export-csv**
- Query Params: start_date (optional), end_date (optional)
- Response: CSV file download
- Authentication: Required (any role)
- CSV Format: Item, Barcode, Quantity Sold, Revenue

### Settings
**GET /api/settings**
- Response: Settings
- Authentication: Required (any role - cashiers need for printing)

**PUT /api/settings**
- Body: SettingsUpdate
- Response: Settings
- Authentication: Admin only

---

## FRONTEND PAGES & ROUTING

### Navigation Structure
```
/ (Dashboard)
/billing
/products
/sales
/analytics
/item-sales-report
/settings (admin only)
```

### Page Components

#### 1. Login Page (`/login`)
**Design:**
- Split-screen layout (2 columns on large screens)
- Left side: Fashion boutique image background with gradient overlay
- Right side: Login form on slate-50 background

**UI Elements:**
- Card with logo (indigo-700 circle with ShoppingBag icon)
- Title: "AK Fashion House" (Outfit font, bold, 3xl)
- Subtitle: "Retail Management System"
- Username input (data-testid="username-input")
- Password input (data-testid="password-input")
- Sign In button (data-testid="login-button", indigo-700 bg)
- Demo credentials section showing ONLY cashier credentials:
  - "Cashier 1: cashier1 / cashier123"
  - "Cashier 2: cashier2 / cashier234"
- Error alert if login fails

**Background Image:**
- Use Unsplash image: modern fashion boutique interior
- Search query: "modern fashion boutique interior store"

#### 2. Dashboard Page (`/`)
**Layout:**
- Page title: "Dashboard" (Outfit, bold, 4xl)
- Subtitle: "Overview of your store performance"

**Metrics Cards (2 columns):**
1. Total Sales (All Time)
   - Icon: DollarSign
   - Value: ₹{total_sales}
   - data-testid="total-sales-card"

2. Monthly Sales (Current Month)
   - Icon: TrendingUp
   - Value: ₹{monthly_sales}
   - data-testid="monthly-sales-card"

**Last 4 Months Sales Chart:**
- Card with title: "Last 4 Months Sales"
- Bar chart (Recharts) with emerald-600 bars
- Shows last 4 months (e.g., December, January, February, March)
- Responsive height: 250px
- data-testid="last-four-months-card"

#### 3. Billing Page (`/billing`)
**Layout:** 
- Grid: 8 columns for cart, 4 columns for summary (on large screens)

**Barcode Scanner Section:**
- Auto-focus input (ref: barcodeInputRef)
- Label: "Scan Product" with Scan icon
- Input: barcode-input class, monospace font
- Add button (Plus icon, indigo-700)
- data-testid="barcode-input", "add-product-button"

**Cart Section:**
- Title: "Cart Items ({count})" with ShoppingCart icon
- Empty state: Icon + "No items in cart. Scan a product to begin."
- Table columns: Product, Price, Quantity, Total, Actions
- Quantity input for each item (data-testid="quantity-input-{index}")
- Remove button (Trash2 icon, rose-600)
- Max quantity validation against stock

**Bill Summary (Sticky Card):**
- Subtotal row (data-testid="subtotal-row")
- GST (18%) row (data-testid="gst-row")
- Total row (data-testid="total-row", bold, indigo-700)
- Process Sale button (emerald-600, data-testid="process-sale-button")

**Logic:**
- On barcode submit: Fetch product, add to cart or increase quantity
- Stock validation: Cannot exceed available stock
- Process sale: POST to /api/sales, trigger auto-print if enabled, clear cart

#### 4. Products Page (`/products`)
**Admin View:**
- Add Product button (Plus icon, indigo-700, data-testid="add-product-button")
- Download Template button (Download icon)
- Import CSV button (Upload icon, triggers file input)
- Export CSV button (Download icon, data-testid="export-csv-button")

**Date Filter Section (Admin Only):**
- Start Date input (data-testid="start-date-input")
- End Date input (data-testid="end-date-input")
- Clear Filter button

**Table Columns:**
- Admin: Product Name, Barcode, Category, Price, Purchase Price, Stock, Actions
- Cashier: Product Name, Barcode, Category, Price, Stock (NO Purchase Price, NO Actions)

**Product Dialog (Admin Only):**
- Fields: Name, Barcode, Category, Price, Purchase Price, Stock
- All fields required
- Barcode validation: Must be unique
- data-testid: "product-dialog", "product-name-input", etc.

**CSV Import:**
- Accept .csv files only
- Validate headers: Product Name, Barcode, Category, Price, Purchase Price, Stock
- Skip duplicates (by barcode)
- Show success message with count

**CSV Export:**
- Download as products_export.csv
- Respect date filter if applied

#### 5. Sales History Page (`/sales`)
**Layout:**
- Export CSV button in header (Download icon, indigo-700)

**Date Filter:**
- Start Date input (data-testid="sales-start-date-input")
- End Date input (data-testid="sales-end-date-input")
- Clear Filter button

**Sales List:**
- Expandable cards for each sale
- Display: Sale ID (8 chars), Date, Total, Cashier
- Summary: Items count, Subtotal, GST
- Click to expand: Show item-level details in table
- Admin only: Delete Sale button (restores stock)

**Delete Confirmation:**
- AlertDialog: "This will delete the sale and restore the stock for all items"
- data-testid="delete-sale-dialog", "confirm-delete-sale-button"

#### 6. Analytics Page (`/analytics`)
**Monthly Sales Overview (New - Top Section):**
- Card with title: "Monthly Sales Overview" (BarChart3 icon)
- Bar chart (Recharts) with indigo-700 bars
- Shows all historical months (e.g., "January 2026", "February 2026")
- Height: 300px
- data-testid="monthly-sales-card"

**Sales Trend (Last 7 Days):**
- Card with title: "Sales Trend (Last 7 Days)" (TrendingUp icon)
- Line chart with indigo-700 line
- Height: 300px

**Top 5 Products by Revenue:**
- Bar chart with emerald-600 bars
- Shows product name and revenue

**Detailed Product Performance:**
- List of top products with:
  - Product name and quantity sold
  - Revenue (emerald-600, bold)
- data-testid="top-product-{index}"

#### 7. Item Sales Report Page (`/item-sales-report`) - NEW
**Layout:**
- Page title: "Item Sales Report" (Outfit, bold, 4xl)
- Subtitle: "Track individual product performance"
- Export CSV button in header (Download icon, indigo-700)

**Date Filter Section:**
- Start Date input (data-testid="item-report-start-date")
- End Date input (data-testid="item-report-end-date")
- Apply Filter button (emerald-600, data-testid="apply-filter-button")
- Clear Filter button

**Summary Cards (3 columns):**
1. Total Items
2. Total Quantity Sold (indigo-700)
3. Total Revenue (emerald-600)

**Item Sales Table:**
- Columns: Item, Barcode, Quantity Sold, Revenue
- Sorted by revenue (highest first)
- Revenue in emerald-600
- data-testid="item-row-{index}"

**Logic:**
- On Apply Filter: Fetch report with date range
- Aggregate items: One row per unique item/barcode
- Update summary cards with filtered totals
- Export respects date filter

#### 8. Settings Page (`/settings`) - Admin Only
**Access Control:**
- Route guard: Show "Access Denied" for non-admin users
- Hidden from cashier sidebar navigation

**Business Information Section:**
- Card with Building2 icon
- Fields:
  - Business Name (data-testid="business-name-input")
  - Business Type (data-testid="business-type-input")
  - GST Number (data-testid="gst-number-input")
  - Business Address (data-testid="business-address-input")

**Printer Settings Section:**
- Card with Printer icon
- Fields:
  - Printer Name (data-testid="printer-name-input")
  - Paper Size dropdown (58mm, 80mm, A4) (data-testid="paper-size-select")
  - Auto-print toggle switch (data-testid="auto-print-toggle")

**Save Button:**
- Indigo-700, Save icon
- data-testid="save-settings-button"

---

## SIDEBAR NAVIGATION

**Header:**
- Logo: Indigo-700 rounded square with ShoppingBag icon
- Title: "AK Fashion"
- Subtitle: "Retail POS"

**Menu Items (All Users):**
1. Dashboard (LayoutDashboard icon) - data-testid="nav-dashboard"
2. Billing (ShoppingCart icon) - data-testid="nav-billing"
3. Products (Package icon) - data-testid="nav-products"
4. Sales History (Receipt icon) - data-testid="nav-sales-history"
5. Analytics (BarChart3 icon) - data-testid="nav-analytics"
6. Item Report (FileText icon) - data-testid="nav-item-report" (NEW)
7. Settings (Settings icon) - Admin only - data-testid="nav-settings"

**Footer:**
- User info: username and role (capitalized)
- Logout button (LogOut icon) - data-testid="logout-button"

**Active State:**
- Indigo-50 background, indigo-700 text

---

## DESIGN SYSTEM

### Typography
**Fonts (Google Fonts):**
- Headings: Outfit (weights: 400, 500, 600, 700)
- Body: Public Sans (weights: 300, 400, 500, 600)

**Font Classes:**
- `.font-heading` - Outfit
- `.font-body` - Public Sans

**Text Sizes:**
- Page titles: text-4xl (Outfit, bold)
- Card titles: text-xl (Outfit)
- Body text: text-base (Public Sans)
- Small text: text-sm or text-xs

### Colors
**Primary:** Indigo
- Main: #4338ca (indigo-700)
- Hover: indigo-800
- Light: indigo-50

**Accent:** Emerald
- Main: #10b981 (emerald-600)
- Hover: emerald-700

**Neutral:**
- Background: slate-50
- Text: slate-900, slate-700, slate-600, slate-500
- Borders: slate-200, slate-300
- Hover: slate-100

**Destructive:** Rose
- Main: rose-600
- Hover: rose-700
- Light: rose-50

### Components
**Cards:**
- White background
- Border: slate-200
- Shadow: shadow-sm
- Hover: shadow-md transition

**Buttons:**
- Primary: indigo-700 bg, white text
- Secondary: emerald-600 bg, white text
- Outline: border-slate-300
- Ghost: hover bg-slate-100
- Height: h-11 or h-12 for important actions
- Transition: transition-all
- Active state: active:scale-95

**Inputs:**
- Height: h-11
- Border: slate-300
- Focus: border-indigo-500, ring-indigo-500

**Tables:**
- Header: bg-slate-50, text-slate-700, font-semibold
- Row hover: hover:bg-slate-50
- Cell padding: appropriate spacing

### Layout
**Max Width:** max-w-7xl mx-auto (most pages)
**Padding:** p-8 (main content)
**Spacing:** space-y-6 (vertical sections)
**Grid:** Responsive grid-cols-1 md:grid-cols-2

---

## ROLE-BASED ACCESS CONTROL (CRITICAL)

### Admin Permissions (username: akfashionhouse)
✅ Full access to all features
✅ All 7 navigation tabs visible
✅ Products: See ALL columns including Purchase Price
✅ Products: CRUD operations (Add, Edit, Delete)
✅ Products: CSV Import/Export
✅ Products: Date Filter
✅ Sales: Can delete sales
✅ Settings: Full access

### Cashier Permissions (username: cashier1, cashier2)
✅ 6 navigation tabs visible (no Settings)
✅ Dashboard: View only
✅ Billing: Full access (create sales)
✅ Products: Read-only view
✅ Products: See LIMITED columns (NO Purchase Price)
✅ Products: NO Add/Edit/Delete buttons
✅ Products: NO CSV Import/Export
✅ Products: NO Date Filter
✅ Sales History: View only (cannot delete)
✅ Analytics: View only
✅ Item Report: Full access (view and export)
❌ Settings: Tab hidden, route blocked with "Access Denied"

### Implementation Notes:
- Frontend: Conditional rendering based on user.role
- Backend: Endpoint-level authorization with require_admin decorator
- Settings GET: Allow all users (needed for printer settings in billing)
- Settings PUT: Admin only

---

## RECEIPT PRINTING

### Receipt Generator (`/frontend/src/utils/receiptPrinter.js`)

**Function: generateReceipt(saleData, settings)**
- Input: Sale object, Settings object
- Output: HTML string

**Receipt Format (Thermal Printer - 80mm):**
```
================================
      AK FASHION HOUSE
     123 Fashion Street
    GST: 27XXXXX1234X1Z5
================================

Date: 2026-03-12 15:30:45
Cashier: cashier1

--------------------------------
Item            Qty  Price  Total
--------------------------------
T-Shirt Black    2   799   1598
Jeans Blue       1  1899   1899
--------------------------------

              Subtotal:  ₹3497
              GST (18%):  ₹629
--------------------------------
                 TOTAL:  ₹4126
================================

   Thank you for shopping!
      Visit again soon

================================
```

**Styling:**
- ALL text: font-weight: bold (everywhere)
- Font: Courier New, monospace
- Font size: 11px-12px
- Width: 80mm (adjustable based on settings.paper_size)
- Borders: Dashed lines (2px)
- Alignment: Center for header/footer, tabular for items

**Print Styles:**
```css
@page {
  size: 80mm auto;
  margin: 0;
}
body {
  margin: 0;
  padding: 0;
  font-weight: bold;
}
* {
  font-weight: bold !important;
}
```

**Function: printReceipt(receiptHTML, settings)**
- Create hidden iframe
- Write HTML with print styles
- Trigger window.print()
- Remove iframe after printing

**Function: handleAutoPrint(saleData, settings)**
- Check if settings.auto_print is enabled
- Generate receipt HTML
- Print receipt
- Return success/failure boolean

**Integration in Billing:**
- After successful sale POST
- Fetch settings from /api/settings
- Call handleAutoPrint
- Show toast: "Receipt sent to printer"

**Important:**
- NO "Made with Emergent" or any branding text
- ALL text must be bold
- Support paper sizes: 58mm, 80mm, A4

---

## CSV FORMATS

### Products Import/Export
**Headers:** Product Name, Barcode, Category, Price, Purchase Price, Stock

**Example:**
```csv
Product Name,Barcode,Category,Price,Purchase Price,Stock
Men's T-Shirt Black,8901234567890,Clothing,799,400,50
Denim Jeans Blue,8901234567906,Clothing,1899,950,30
Women's Kurti Red,8901234567913,Clothing,1299,650,40
```

### Sales Export (Item-Level)
**Headers:** Sale ID, Date, Item Name, Barcode, Quantity, Unit Price, Total

**Example:**
```csv
Sale ID,Date,Item Name,Barcode,Quantity,Unit Price,Total
ab58d1f5,2026-03-12 15:30:45,Men's T-Shirt Black,8901234567890,2,799,1598
ab58d1f5,2026-03-12 15:30:45,Denim Jeans Blue,8901234567906,1,1899,1899
5faf5e68,2026-03-12 16:20:10,Women's Kurti Red,8901234567913,1,1299,1299
```

**Note:** Each item in a sale appears as separate row with same Sale ID

### Item Sales Report Export
**Headers:** Item, Barcode, Quantity Sold, Revenue

**Example:**
```csv
Item,Barcode,Quantity Sold,Revenue
Men's T-Shirt Black,8901234567890,85,67915
Denim Jeans Blue,8901234567906,42,79758
Women's Kurti Red,8901234567913,37,48063
```

**Note:** Aggregated data, sorted by revenue descending

---

## DATA FLOW EXAMPLES

### Example 1: Processing a Sale
1. Cashier scans barcode "8901234567890"
2. Frontend: POST to /api/products/barcode/8901234567890
3. Backend: Returns product details
4. Frontend: Adds to cart with quantity 1
5. Cashier adjusts quantity to 2
6. Cashier scans another barcode
7. Cashier clicks "Process Sale"
8. Frontend: Calculates totals:
   - Subtotal: Sum of item totals
   - GST: Subtotal × 0.18
   - Total: Subtotal + GST
9. Frontend: POST to /api/sales with items array
10. Backend: 
    - Creates sale record
    - Deducts stock for each item
    - Returns sale object
11. Frontend: 
    - Fetches settings
    - Generates receipt HTML
    - Prints if auto_print enabled
    - Clears cart
    - Shows success toast

### Example 2: Deleting a Sale (Admin)
1. Admin clicks delete on a sale
2. Confirmation dialog appears
3. Admin confirms
4. Frontend: DELETE to /api/sales/{sale_id}
5. Backend:
   - Finds sale by ID
   - For each item in sale:
     - Increases product stock by item.quantity
   - Deletes sale record
6. Frontend: Refreshes sales list, shows success toast

### Example 3: Item Sales Report with Filter
1. User navigates to Item Report
2. Frontend: GET /api/reports/item-sales (no params)
3. Backend: Aggregates all-time sales by item
4. Frontend: Displays table and summary cards
5. User selects date range: March 1-31, 2026
6. User clicks "Apply Filter"
7. Frontend: GET /api/reports/item-sales?start_date=2026-03-01&end_date=2026-03-31
8. Backend: Aggregates sales within date range
9. Frontend: Updates table and summary cards
10. User clicks "Export CSV"
11. Frontend: GET /api/reports/item-sales/export-csv with same params
12. Backend: Generates CSV, returns as download
13. Frontend: Triggers browser download

---

## TESTING REQUIREMENTS

### Manual Testing Checklist

**Authentication:**
- [ ] Login with admin credentials
- [ ] Login with cashier credentials
- [ ] Login with wrong credentials (should fail)
- [ ] Logout and verify redirect to login
- [ ] Verify token stored in localStorage

**Dashboard:**
- [ ] Verify total sales metric displays correctly
- [ ] Verify monthly sales metric displays correctly
- [ ] Verify last 4 months chart shows data
- [ ] Create sale and verify metrics update

**Billing:**
- [ ] Scan/enter valid barcode
- [ ] Product added to cart
- [ ] Scan same barcode (quantity increases)
- [ ] Modify quantity manually
- [ ] Verify subtotal, GST, total calculations (GST = 18%)
- [ ] Remove item from cart
- [ ] Process sale with empty cart (should show error)
- [ ] Process sale successfully
- [ ] Verify cart cleared after sale
- [ ] Verify stock deducted in products
- [ ] Scan barcode with 0 stock (should show error)
- [ ] Verify receipt prints if auto_print enabled

**Products (Admin):**
- [ ] View all products with purchase price column
- [ ] Add new product
- [ ] Add product with duplicate barcode (should fail)
- [ ] Edit product
- [ ] Delete product
- [ ] Date filter: Select range, verify filtering
- [ ] Clear filter: Verify all products shown
- [ ] Download CSV template
- [ ] Import valid CSV file
- [ ] Import CSV with duplicates (should skip)
- [ ] Export CSV without filter
- [ ] Export CSV with date filter

**Products (Cashier):**
- [ ] View products
- [ ] Verify purchase price column hidden
- [ ] Verify no Add/Edit/Delete buttons
- [ ] Verify no CSV Import/Export buttons
- [ ] Verify no date filter section

**Sales History:**
- [ ] View all sales
- [ ] Click on sale to expand items
- [ ] Apply date filter
- [ ] Export CSV without filter
- [ ] Export CSV with date filter
- [ ] Verify CSV has item-level details
- [ ] Admin: Delete sale
- [ ] Verify stock restored after deletion
- [ ] Cashier: Verify no delete button

**Analytics:**
- [ ] View monthly sales overview chart
- [ ] View sales trend (last 7 days)
- [ ] View top products chart
- [ ] Verify detailed product performance

**Item Sales Report:**
- [ ] View report (all-time by default)
- [ ] Verify summary cards (Total Items, Quantity, Revenue)
- [ ] Verify table sorted by revenue
- [ ] Apply date filter
- [ ] Verify summary cards update
- [ ] Clear filter
- [ ] Export CSV without filter
- [ ] Export CSV with date filter
- [ ] Verify CSV format matches spec

**Settings (Admin):**
- [ ] View settings page
- [ ] Update business information
- [ ] Update GST number
- [ ] Change printer name
- [ ] Change paper size
- [ ] Toggle auto-print
- [ ] Save settings
- [ ] Refresh page, verify changes persisted

**Settings (Cashier):**
- [ ] Verify Settings tab hidden in sidebar
- [ ] Try navigating to /settings directly
- [ ] Verify "Access Denied" message shown

**Stock Management:**
- [ ] Note product stock (e.g., 10 units)
- [ ] Create sale with 3 units
- [ ] Verify stock reduced to 7
- [ ] Delete the sale
- [ ] Verify stock restored to 10

---

## ERROR HANDLING

### Backend Errors
- 401: Invalid/expired token → Clear localStorage, redirect to login
- 403: Insufficient permissions → Show error toast
- 404: Resource not found → Show error toast
- 400: Validation error → Show specific error message
- 500: Server error → Show generic error message

### Frontend Validation
- Empty cart: "Cart is empty"
- Duplicate barcode: "Product with this barcode already exists"
- Stock exceeded: "Cannot exceed available stock"
- Out of stock: "Product out of stock"
- Invalid CSV: "Error processing CSV: [details]"
- Network error: "Failed to connect. Please check your connection."

### User Feedback
- Success toasts (green) for: Login, Product saved, Sale processed, etc.
- Error toasts (red) for: Failures, validation errors
- Info toasts (blue) for: Item removed, Filter cleared
- Loading states: "Loading...", "Processing...", "Saving..."

---

## PERFORMANCE REQUIREMENTS

### Frontend
- Initial load: < 3 seconds
- Page transitions: Instant (React Router)
- API calls: < 1 second response
- Chart rendering: < 500ms
- Auto-focus on barcode input after sale

### Backend
- API response time: < 200ms (average)
- Database queries: Indexed on barcode, created_at
- CSV export: < 5 seconds for 1000 records
- Concurrent users: Support 10+ simultaneous

### Database
- Indexes:
  - users.username (unique)
  - products.barcode (unique)
  - sales.created_at
- Connection pooling: Enabled
- Async operations: All database calls

---

## DEPLOYMENT CONFIGURATION

### Environment Variables

**Backend (.env):**
```env
MONGO_URL=mongodb://localhost:27017/ (or MongoDB Atlas URI)
DB_NAME=akfashion_pos
JWT_SECRET_KEY=your-secret-key-32-chars-or-more
CORS_ORIGINS=http://localhost:3000 (or * for production)
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:8001 (or production URL)
```

### Vercel Deployment
- **vercel.json**: Configure routes for /api/* → backend, /* → frontend
- **Build Command**: cd frontend && yarn build
- **Output Directory**: frontend/build
- **Python Runtime**: @vercel/python for serverless functions

### MongoDB Atlas
- Free M0 tier sufficient for small operations
- Enable 0.0.0.0/0 in IP whitelist for serverless
- Create database user with read/write permissions

---

## ADDITIONAL FEATURES & POLISH

### Auto-Focus Behavior
- Barcode input auto-focused on page load
- Barcode input refocused after adding product
- Barcode input refocused after processing sale

### Keyboard Shortcuts
- Barcode input: Press Enter to add product
- Modals: Press Escape to close

### Responsive Design
- Mobile: Single column layouts
- Tablet: 2-column grids
- Desktop: Multi-column layouts with sidebar
- Sidebar: Collapsible on mobile (optional enhancement)

### Animations
- Button hover: Scale and color transitions
- Card hover: Shadow increase
- Toast notifications: Slide in from top-right
- Modal: Fade in overlay, scale up content
- Active nav item: Background color transition

### Data Validation
- Barcode: String, non-empty
- Price/Purchase Price: Positive float
- Stock: Non-negative integer
- Quantity: Positive integer, <= available stock
- Date filters: Valid date format

### Edge Cases
- Empty states: Show helpful messages with icons
- No results: "No [items] found" messages
- Future dates: Handle gracefully in filters
- Large datasets: Pagination (optional enhancement)
- Concurrent edits: Last write wins (acceptable for MVP)

---

## INITIALIZATION LOGIC

### On Application Startup (Backend)
```python
async def init_db():
    # Create default users if none exist
    if users_count == 0:
        create admin, cashier1, cashier2 with bcrypt hashed passwords
    
    # Create default settings if none exist
    if settings not found:
        create settings with default values
```

### Default Settings Values
```python
{
    "business_name": "AK Fashion House",
    "business_type": "Retail",
    "gst_number": "",
    "business_address": "",
    "printer_name": "EPSON TM-T82",
    "paper_size": "80mm",
    "auto_print": false
}
```

---

## CODE QUALITY STANDARDS

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints
- Async/await for all database operations
- Pydantic models for validation
- Descriptive function names
- Error handling with try/except
- HTTP status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)

### JavaScript (Frontend)
- Use functional components with hooks
- Destructuring for props and state
- Async/await for API calls
- Error handling with try/catch
- Descriptive variable names
- Comments for complex logic
- data-testid on all interactive elements

### File Organization
**Backend:**
```
backend/
├── server.py (all code in single file for simplicity)
├── requirements.txt
└── .env
```

**Frontend:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.js
│   │   ├── Sidebar.js
│   │   └── ui/ (Shadcn components)
│   ├── pages/
│   │   ├── Login.js
│   │   ├── DashboardPage.js
│   │   ├── BillingPage.js
│   │   ├── ProductsPage.js
│   │   ├── SalesPage.js
│   │   ├── AnalyticsPage.js
│   │   ├── ItemSalesReport.js
│   │   └── SettingsPage.js
│   ├── utils/
│   │   └── receiptPrinter.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── .env
```

---

## FINAL CHECKLIST

Before considering the application complete, verify:

**Functionality:**
- [ ] All 3 users can login
- [ ] Admin sees 7 tabs, cashiers see 6 tabs
- [ ] Dashboard shows correct metrics
- [ ] Billing: Can scan, add to cart, process sale
- [ ] Products: Admin has full CRUD, cashier has read-only
- [ ] Sales: Can view, filter, export, admin can delete
- [ ] Analytics: All charts display data
- [ ] Item Report: Shows aggregated data, can filter and export
- [ ] Settings: Admin can update, cashier cannot access
- [ ] Receipt prints with bold text, no branding

**Design:**
- [ ] Outfit font for headings
- [ ] Public Sans for body text
- [ ] Indigo primary color
- [ ] Emerald accent color
- [ ] Professional business style
- [ ] Hover states on buttons
- [ ] Proper spacing and alignment
- [ ] Icons from Lucide React

**Data Integrity:**
- [ ] Stock deducted on sale
- [ ] Stock restored on sale deletion
- [ ] GST calculated correctly (18%)
- [ ] Barcode uniqueness enforced
- [ ] Date filters work correctly
- [ ] CSV exports match filtered data

**Error Handling:**
- [ ] Invalid login shows error
- [ ] Out of stock prevents sale
- [ ] Duplicate barcode prevented
- [ ] Network errors handled gracefully
- [ ] All errors show user-friendly messages

**Performance:**
- [ ] Pages load quickly
- [ ] No console errors
- [ ] Charts render smoothly
- [ ] CSV exports complete without timeout

**Security:**
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens used for authentication
- [ ] Admin-only routes protected
- [ ] No sensitive data in frontend code

---

## NOTES FOR IMPLEMENTATION

1. **Start with Backend:**
   - Set up FastAPI with all endpoints
   - Create Pydantic models
   - Implement authentication
   - Test with Swagger UI

2. **Then Frontend:**
   - Set up React with routing
   - Create all page components
   - Implement API calls
   - Test each feature

3. **Integration:**
   - Connect frontend to backend
   - Test end-to-end flows
   - Verify role-based access
   - Test with real data

4. **Polish:**
   - Add all data-testids
   - Verify design matches specs
   - Test error scenarios
   - Optimize performance

5. **Deployment:**
   - Set up MongoDB Atlas
   - Deploy to Vercel
   - Configure environment variables
   - Test production deployment

---

**This prompt contains every detail needed to build the complete AK Fashion House POS system from scratch. Follow each section carefully to ensure all requirements are met.**
