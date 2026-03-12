# AK Fashion House - Retail POS System Requirements

## Overview
Build a Point of Sale (POS) system for a retail fashion store with inventory management, sales tracking, reporting, and receipt printing.

---

## User Accounts & Login

### Three User Accounts (Create by default):
1. **Admin Account**
   - Username: akfashionhouse
   - Password: admin1234

2. **Cashier 1**
   - Username: cashier1
   - Password: cashier123

3. **Cashier 2**
   - Username: cashier2
   - Password: cashier234

### Login Screen:
- Split screen design with fashion store image on left side
- Login form on right side with white background
- Show business name "AK Fashion House" with logo
- Display ONLY the two cashier credentials on login page (don't show admin credentials)
- Show error message if login fails

---

## Application Tabs/Pages

### For Cashiers: 6 tabs visible
1. Dashboard
2. Billing
3. Products
4. Sales History
5. Analytics
6. Item Report

### For Admin: 7 tabs visible (all of above + Settings)

---

## 1. DASHBOARD PAGE

### What to Show:
- Two big metric cards at the top:
  - **Total Sales (All Time)**: Show total rupees earned since beginning
  - **Monthly Sales**: Show total rupees earned in current month only

- One chart below the cards:
  - **Last 4 Months Sales**: Bar chart showing sales for last 4 months
  - Example: December, January, February, March with amount for each month

### Colors:
- Use green color for the bar chart
- Use indigo/blue for main buttons and highlights

---

## 2. BILLING PAGE (Point of Sale)

### Layout:
- Left side: Product scanner and cart
- Right side: Bill summary with total

### Left Side - Barcode Scanner:
- Input box to type or scan product barcode
- "Add" button next to it
- When barcode entered, find that product and add to cart
- If same product scanned again, increase quantity instead of adding duplicate

### Left Side - Shopping Cart:
- Show table with columns: Product Name, Price, Quantity, Total, Remove Button
- Allow changing quantity for each item
- Don't allow quantity more than available stock
- Show "Remove" button to delete item from cart
- If cart empty, show message "No items in cart. Scan a product to begin."

### Right Side - Bill Summary Card:
- Show Subtotal (sum of all items)
- Show GST at 18% (calculate 18% of subtotal)
- Show Total Amount (Subtotal + GST) in big bold numbers
- "Process Sale" button at bottom (green color)

### What Happens When "Process Sale" Clicked:
1. Save the sale to database
2. Reduce stock quantity for each product sold
3. Clear the cart
4. If auto-print is enabled in settings, print receipt automatically
5. Show success message

---

## 3. PRODUCTS PAGE

### Admin View (Full Access):

**Top Buttons:**
- "Add Product" button
- "Download Template" button (downloads sample CSV file)
- "Import CSV" button (upload CSV file with products)
- "Export CSV" button (download all products as CSV)

**Date Filter Section:**
- Start Date picker
- End Date picker
- "Clear Filter" button
- When dates selected, show only products created in that date range

**Products Table with Columns:**
1. Product Name
2. Barcode
3. Category
4. Price
5. Purchase Price (cost price)
6. Stock (quantity available)
7. Actions (Edit and Delete buttons)

**Add/Edit Product Form (Opens in popup):**
- Product Name (required)
- Barcode (required, must be unique)
- Category (required)
- Price (required, selling price)
- Purchase Price (required, cost price)
- Stock (required, number)
- Save button

**CSV Import:**
- Accept only .csv files
- Required columns: Product Name, Barcode, Category, Price, Purchase Price, Stock
- Skip products with duplicate barcodes
- Show success message with count of imported products

**CSV Export:**
- Download file named "products_export.csv"
- Include columns: Product Name, Barcode, Category, Price, Purchase Price, Stock
- If date filter applied, export only filtered products

### Cashier View (Read Only):

**Show Products Table with Limited Columns:**
1. Product Name
2. Barcode
3. Category
4. Price
5. Stock

**Hidden from Cashiers:**
- Purchase Price column (they should not see cost price)
- Add Product button
- Edit/Delete buttons
- CSV Import/Export buttons
- Date Filter section

---

## 4. SALES HISTORY PAGE

### Top Section:
- "Export CSV" button to download sales data

### Date Filter:
- Start Date picker
- End Date picker
- "Clear Filter" button
- When dates selected, show only sales in that date range

### Sales List:
- Show each sale as an expandable card
- Display on card: Sale ID (first 8 characters), Date & Time, Total Amount, Cashier Name
- Show summary: Number of items, Subtotal, GST amount
- Click on card to expand and see item-by-item details in table

### Admin Only:
- Show "Delete Sale" button on each sale
- When deleted, restore the stock quantity back to products
- Show confirmation dialog before deleting

### Cashiers:
- Can view all sales
- Cannot delete sales (no delete button visible)

### CSV Export:
**Important: Export in Item-Level Format**
- Each row = one item from a sale
- Columns: Sale ID, Date, Item Name, Barcode, Quantity, Unit Price, Total
- If one sale has 3 items, create 3 rows with same Sale ID
- Example:
  ```
  Sale ID    | Date                | Item Name     | Barcode  | Quantity | Unit Price | Total
  ab58d1f5   | 2026-03-12 15:30:45 | T-Shirt      | 123456   | 2        | 500        | 1000
  ab58d1f5   | 2026-03-12 15:30:45 | Jeans        | 789012   | 1        | 1500       | 1500
  ```

---

## 5. ANALYTICS PAGE

### Three Chart Sections:

**1. Monthly Sales Overview (Top):**
- Bar chart showing total sales for each month
- Show all historical months with sales data
- Example: January 2026, February 2026, March 2026, etc.
- Use indigo/blue color for bars

**2. Sales Trend (Last 7 Days):**
- Line chart showing daily sales for last 7 days
- Use indigo/blue color for line

**3. Top 5 Products by Revenue:**
- Bar chart showing top 5 best-selling products
- Use green color for bars
- Sort by total revenue (not quantity)

**4. Detailed Product Performance:**
- List view below chart
- Show product name, quantity sold, and total revenue
- Use green color for revenue numbers

---

## 6. ITEM SALES REPORT PAGE (NEW)

### Top Section:
- Page title: "Item Sales Report"
- Subtitle: "Track individual product performance"
- "Export CSV" button

### Date Filter:
- Start Date picker
- End Date picker
- "Apply Filter" button (green color)
- "Clear Filter" button
- User must click "Apply Filter" for dates to take effect

### Summary Cards (3 cards across):
1. **Total Items**: Count of unique products sold
2. **Total Quantity Sold**: Sum of all quantities
3. **Total Revenue**: Sum of all sales (in green color)

### Items Table:
- Columns: Item Name, Barcode, Quantity Sold, Revenue
- Show one row per unique product (aggregate all sales of that product)
- Sort by revenue (highest first)
- Revenue column in green color

### How It Works:
- When page loads, show all-time data
- When user applies date filter, show only data for that period
- Summary cards update based on filtered data

### CSV Export:
- Download as "item_sales_report_YYYY-MM-DD.csv"
- Columns: Item, Barcode, Quantity Sold, Revenue
- One row per unique product (aggregated data)
- Respect date filter if applied
- Example:
  ```
  Item          | Barcode  | Quantity Sold | Revenue
  T-Shirt Black | 123456   | 85           | 67915
  Jeans Blue    | 789012   | 42           | 79758
  ```

---

## 7. SETTINGS PAGE (ADMIN ONLY)

### Access:
- Only admin can access this page
- Tab completely hidden from cashiers in sidebar
- If cashier tries to access directly, show "Access Denied" message

### Business Information Section:
- Business Name (default: "AK Fashion House")
- Business Type (default: "Retail")
- GST Number (empty by default, can be filled)
- Business Address (empty by default, can be filled)

### Printer Settings Section:
- Printer Name (default: "EPSON TM-T82")
- Paper Size dropdown with 3 options:
  - 58mm
  - 80mm (default)
  - A4
- Auto-print receipts toggle (ON/OFF switch, default OFF)
  - When ON: Automatically print receipt after each sale
  - When OFF: Don't print automatically

### Save Button:
- Save all changes to database
- Show success message when saved

---

## RECEIPT PRINTING

### When Receipt Prints:
- After successful sale if auto-print is enabled in settings
- Or manually triggered by cashier

### Receipt Format (Thermal Printer Style):
```
================================
      AK FASHION HOUSE
     [Business Address if set]
    GST: [GST Number if set]
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

### Receipt Requirements:
- ALL TEXT MUST BE BOLD (very important)
- Width adjusts based on paper size setting (58mm, 80mm, or A4)
- No branding like "Made with..." at bottom
- Business name from settings
- Business address from settings (if filled)
- GST number from settings (if filled)
- Show each item with quantity, price, and total
- Calculate and show Subtotal, GST (18%), and Total
- Show date/time and cashier name

---

## BUSINESS RULES

### Stock Management:
- When sale is processed, reduce stock for each product sold
- When sale is deleted (admin only), add stock back to products
- If product has 0 stock, cannot add to cart (show error message)
- Cannot sell more quantity than available stock

### GST Calculation:
- Always 18% of subtotal
- Formula: GST Amount = Subtotal × 0.18
- Total Amount = Subtotal + GST Amount

### Barcode Rules:
- Each product must have unique barcode
- Cannot create two products with same barcode
- When importing CSV, skip rows with duplicate barcodes

### Date Filters:
- When start and end date selected, filter records in that date range
- Include both start and end dates
- Clear filter button removes date filter and shows all records

---

## DESIGN & COLORS

### Fonts:
- Use "Outfit" font for all headings (page titles, card titles)
- Use "Public Sans" font for body text

### Colors:
- **Primary Color**: Indigo/Blue (#4338ca)
  - Use for main buttons, active menu items, highlights
- **Secondary Color**: Green/Emerald (#10b981)
  - Use for success actions, Process Sale button, revenue numbers
- **Background**: Light gray/slate
- **Text**: Dark gray/black for readability
- **Destructive Actions**: Red/Rose color (for delete buttons)

### Layout:
- Clean, professional business look
- Cards with subtle shadows
- Proper spacing between elements
- Tables with alternating row colors on hover

### Sidebar:
- Logo at top with "AK Fashion" text
- Menu items with icons
- Active page highlighted in indigo color
- User info at bottom with logout button
- Menu items:
  1. Dashboard (home icon)
  2. Billing (shopping cart icon)
  3. Products (package icon)
  4. Sales History (receipt icon)
  5. Analytics (chart icon)
  6. Item Report (file icon)
  7. Settings (gear icon) - admin only

---

## PERMISSIONS SUMMARY

### Admin Can:
✅ View all 7 tabs
✅ Add, edit, delete products
✅ See purchase price in products table
✅ Import/export CSV files
✅ Use date filters on products
✅ Delete sales
✅ Access settings page
✅ View all reports and analytics

### Cashier Can:
✅ View 6 tabs (no Settings tab)
✅ Process sales (billing)
✅ View products (read-only, no purchase price shown)
✅ View sales history (cannot delete)
✅ View analytics and reports
✅ Export reports
❌ Cannot add/edit/delete products
❌ Cannot import/export product CSV
❌ Cannot use date filter on products
❌ Cannot delete sales
❌ Cannot access settings

---

## DATA STRUCTURE

### Product Information:
- Product Name
- Barcode (unique)
- Category
- Price (selling price to customer)
- Purchase Price (cost price, admin only)
- Stock (quantity available)
- Created Date

### Sale Information:
- Sale ID
- List of items sold (product name, barcode, quantity, price, total)
- Subtotal
- GST Amount (18%)
- Total Amount
- Cashier Name
- Date and Time

### Settings Information:
- Business Name
- Business Type
- GST Number
- Business Address
- Printer Name
- Paper Size
- Auto-print toggle (ON/OFF)

---

## CSV FILE FORMATS

### Product Import CSV:
**Columns:** Product Name, Barcode, Category, Price, Purchase Price, Stock

**Example:**
```
Product Name,Barcode,Category,Price,Purchase Price,Stock
Men's T-Shirt Black,8901234567890,Clothing,799,400,50
Denim Jeans Blue,8901234567906,Clothing,1899,950,30
Women's Kurti Red,8901234567913,Clothing,1299,650,40
```

**Rules:**
- First row must be headers exactly as shown above
- All columns are required
- Barcode must be unique (skip duplicates)
- Price and Purchase Price are numbers with decimals
- Stock is whole number

### Sales Export CSV (Item-Level):
**Columns:** Sale ID, Date, Item Name, Barcode, Quantity, Unit Price, Total

**Example:**
```
Sale ID,Date,Item Name,Barcode,Quantity,Unit Price,Total
ab58d1f5,2026-03-12 15:30:45,Men's T-Shirt Black,8901234567890,2,799,1598
ab58d1f5,2026-03-12 15:30:45,Denim Jeans Blue,8901234567906,1,1899,1899
```

**Important:** Each item in a sale gets its own row with the same Sale ID

### Item Sales Report CSV:
**Columns:** Item, Barcode, Quantity Sold, Revenue

**Example:**
```
Item,Barcode,Quantity Sold,Revenue
Men's T-Shirt Black,8901234567890,85,67915
Denim Jeans Blue,8901234567906,42,79758
```

**Note:** One row per product, aggregated data

---

## ERROR MESSAGES

### Login Errors:
- "Invalid credentials" - when username/password wrong

### Billing Errors:
- "Product not found" - when barcode doesn't exist
- "Product out of stock" - when trying to add product with 0 stock
- "Cannot exceed available stock" - when quantity more than stock
- "Cart is empty" - when trying to process sale with no items

### Product Errors:
- "Product with this barcode already exists" - when adding duplicate barcode
- "All fields are required" - when any field is empty

### CSV Import Errors:
- "File must be a CSV" - when wrong file type uploaded
- "Invalid CSV format" - when columns don't match
- Show count of imported and skipped products

### Permission Errors:
- "Access Denied" - when cashier tries to access settings
- "Admin access required" - when cashier tries admin-only action

---

## SUCCESS MESSAGES

- "Login successful" - after successful login
- "Product added to cart" - when product scanned
- "Sale completed successfully!" - after processing sale
- "Product saved successfully" - after adding/editing product
- "Product deleted successfully" - after deleting product
- "Sale deleted and stock restored" - after deleting sale
- "Settings saved successfully" - after saving settings
- "Products exported successfully" - after CSV export
- "Import completed. X products imported, Y skipped" - after CSV import

---

## SPECIAL NOTES

### Important Features:
1. **Auto-focus on barcode input** - After adding product or completing sale, cursor should automatically go back to barcode input box
2. **Real-time updates** - When sale is processed, dashboard metrics should update immediately
3. **Stock warnings** - Show error before allowing overselling
4. **Date formats** - Show dates in readable format like "March 12, 2026 3:30 PM"
5. **Currency** - Always show rupee symbol (₹) with amounts
6. **Expandable sales** - Click on sale card to see item details

### Login Screen Special Requirement:
- Show cashier credentials on screen so they can easily login
- DO NOT show admin credentials on login screen (admin knows their password)
- This helps cashiers find their login info easily

### Receipt Printing Special Requirement:
- Text must be bold throughout entire receipt
- No company branding at bottom
- Use business information from settings
- Adapt to paper size selected in settings

---

## EXPECTED WORKFLOW EXAMPLES

### Example 1: Cashier Processing a Sale
1. Cashier logs in with cashier1/cashier123
2. Clicks on "Billing" tab
3. Scans barcode 123456 (or types it)
4. Product "T-Shirt" added to cart with quantity 1
5. Scans same barcode again - quantity changes to 2
6. Scans another barcode 789012
7. Product "Jeans" added to cart with quantity 1
8. Sees bill summary: Subtotal ₹2500, GST ₹450, Total ₹2950
9. Clicks "Process Sale"
10. Receipt prints if auto-print enabled
11. Cart clears
12. Success message shown
13. Stock reduced: T-Shirt stock -2, Jeans stock -1

### Example 2: Admin Adding Products via CSV
1. Admin logs in with akfashionhouse/admin1234
2. Goes to Products tab
3. Clicks "Download Template" button
4. Opens template, fills with product data
5. Saves as CSV file
6. Clicks "Import CSV" button
7. Selects the saved CSV file
8. System validates and imports products
9. Shows message "Import completed. 10 products imported, 2 skipped"
10. Products table shows newly imported products

### Example 3: Admin Viewing Item Sales Report
1. Admin goes to "Item Report" tab
2. Sees all-time sales data for all products
3. Summary shows: 15 items, 250 quantity, ₹125,000 revenue
4. Selects date range: March 1 to March 31
5. Clicks "Apply Filter"
6. Table updates to show only March sales
7. Summary updates: 8 items, 100 quantity, ₹50,000 revenue
8. Clicks "Export CSV"
9. CSV file downloads with filtered data
10. Opens CSV to see product-wise sales data

### Example 4: Admin Deleting a Sale
1. Admin goes to "Sales History" tab
2. Sees list of all sales
3. Clicks on a sale to expand and see items
4. Clicks "Delete Sale" button
5. Confirmation dialog appears
6. Confirms deletion
7. Sale is removed from list
8. Stock is restored: Each product gets its sold quantity back

---

## FINAL CHECKLIST

The application is complete when:

✅ All 3 users can login
✅ Admin sees 7 tabs, cashiers see 6 tabs
✅ Dashboard shows sales metrics and 4-month chart
✅ Billing allows scanning, cart management, and sale processing
✅ Products page shows full features for admin, limited for cashier
✅ Sales history shows all sales with item-level CSV export
✅ Analytics shows 3 different charts
✅ Item Report shows product-wise sales with filtering
✅ Settings page only accessible by admin
✅ Receipt prints with bold text and no branding
✅ Stock reduces when sale made
✅ Stock restores when sale deleted
✅ GST calculated at 18% on all sales
✅ Date filters work on all pages
✅ CSV import/export works correctly
✅ All error messages show appropriately
✅ Colors match specification (indigo primary, green secondary)
✅ Professional, clean design throughout

---

**This is everything needed to build the complete AK Fashion House POS system. Give this entire document to any developer or AI system to recreate the application exactly as specified.**
