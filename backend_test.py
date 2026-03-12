import requests
import sys
import json
from datetime import datetime
import io

class AKFashionHouseAPITester:
    def __init__(self, base_url="https://fashion-house-pos.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.cashier1_token = None
        self.cashier2_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_products = []
        self.created_sales = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        if files:
            # Remove Content-Type for file uploads
            headers.pop('Content-Type', None)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_authentication(self):
        """Test authentication for all users"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION")
        print("="*50)
        
        # Test admin login
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "akfashionhouse", "password": "admin1234"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin user: {response['user']}")
        else:
            print("❌ Admin login failed - stopping tests")
            return False

        # Test cashier1 login
        success, response = self.run_test(
            "Cashier1 Login",
            "POST",
            "auth/login",
            200,
            data={"username": "cashier1", "password": "cashier123"}
        )
        if success and 'token' in response:
            self.cashier1_token = response['token']
            print(f"   Cashier1 user: {response['user']}")
        else:
            print("❌ Cashier1 login failed")
            return False

        # Test cashier2 login
        success, response = self.run_test(
            "Cashier2 Login",
            "POST",
            "auth/login",
            200,
            data={"username": "cashier2", "password": "cashier234"}
        )
        if success and 'token' in response:
            self.cashier2_token = response['token']
            print(f"   Cashier2 user: {response['user']}")
        else:
            print("❌ Cashier2 login failed")
            return False

        # Test invalid credentials
        success, _ = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"username": "invalid", "password": "wrong"}
        )

        return True

    def test_dashboard_metrics(self):
        """Test dashboard metrics endpoint"""
        print("\n" + "="*50)
        print("TESTING DASHBOARD METRICS")
        print("="*50)
        
        # Test with admin token
        success, response = self.run_test(
            "Dashboard Metrics (Admin)",
            "GET",
            "dashboard/metrics",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Total Sales: ₹{response.get('total_sales', 0)}")
            print(f"   Monthly Sales: ₹{response.get('monthly_sales', 0)}")

        # Test with cashier token
        success, response = self.run_test(
            "Dashboard Metrics (Cashier)",
            "GET",
            "dashboard/metrics",
            200,
            token=self.cashier1_token
        )

        return True

    def test_products_crud(self):
        """Test product CRUD operations"""
        print("\n" + "="*50)
        print("TESTING PRODUCTS CRUD")
        print("="*50)
        
        # Test get products (should work for all users)
        success, products = self.run_test(
            "Get Products (Cashier)",
            "GET",
            "products",
            200,
            token=self.cashier1_token
        )
        print(f"   Found {len(products)} existing products")

        # Test create product (admin only)
        test_product = {
            "name": "Test T-Shirt",
            "barcode": "TEST123456",
            "category": "Clothing",
            "price": 500.0,
            "purchase_price": 250.0,
            "stock": 10
        }
        
        success, product = self.run_test(
            "Create Product (Admin)",
            "POST",
            "products",
            200,
            data=test_product,
            token=self.admin_token
        )
        if success:
            self.created_products.append(product['id'])
            print(f"   Created product ID: {product['id']}")

        # Test create product with cashier (should fail)
        success, _ = self.run_test(
            "Create Product (Cashier - Should Fail)",
            "POST",
            "products",
            403,
            data=test_product,
            token=self.cashier1_token
        )

        # Test duplicate barcode (should fail)
        success, _ = self.run_test(
            "Create Duplicate Barcode (Should Fail)",
            "POST",
            "products",
            400,
            data=test_product,
            token=self.admin_token
        )

        # Test get product by barcode
        success, product = self.run_test(
            "Get Product by Barcode",
            "GET",
            "products/barcode/TEST123456",
            200,
            token=self.cashier1_token
        )

        # Test update product (admin only)
        if self.created_products:
            product_id = self.created_products[0]
            update_data = {"price": 600.0, "stock": 15}
            success, _ = self.run_test(
                "Update Product (Admin)",
                "PUT",
                f"products/{product_id}",
                200,
                data=update_data,
                token=self.admin_token
            )

            # Test update with cashier (should fail)
            success, _ = self.run_test(
                "Update Product (Cashier - Should Fail)",
                "PUT",
                f"products/{product_id}",
                403,
                data=update_data,
                token=self.cashier1_token
            )

        return True

    def test_sales_operations(self):
        """Test sales operations"""
        print("\n" + "="*50)
        print("TESTING SALES OPERATIONS")
        print("="*50)
        
        # First create a test product if none exists
        if not self.created_products:
            test_product = {
                "name": "Sale Test Product",
                "barcode": "SALE123",
                "category": "Test",
                "price": 100.0,
                "purchase_price": 50.0,
                "stock": 20
            }
            success, product = self.run_test(
                "Create Product for Sale Test",
                "POST",
                "products",
                200,
                data=test_product,
                token=self.admin_token
            )
            if success:
                self.created_products.append(product['id'])

        # Test create sale
        if self.created_products:
            product_id = self.created_products[0]
            sale_data = {
                "items": [
                    {
                        "product_id": product_id,
                        "product_name": "Test Product",
                        "barcode": "TEST123456",
                        "quantity": 2,
                        "price": 500.0,
                        "total": 1000.0
                    }
                ]
            }
            
            success, sale = self.run_test(
                "Create Sale (Cashier)",
                "POST",
                "sales",
                200,
                data=sale_data,
                token=self.cashier1_token
            )
            if success:
                self.created_sales.append(sale['id'])
                print(f"   Sale ID: {sale['id']}")
                print(f"   Subtotal: ₹{sale['subtotal']}")
                print(f"   GST: ₹{sale['gst_amount']}")
                print(f"   Total: ₹{sale['total_amount']}")

        # Test get sales
        success, sales = self.run_test(
            "Get Sales",
            "GET",
            "sales",
            200,
            token=self.cashier1_token
        )
        if success:
            print(f"   Found {len(sales)} sales")

        # Test delete sale (admin only)
        if self.created_sales:
            sale_id = self.created_sales[0]
            
            # Test delete with cashier (should fail)
            success, _ = self.run_test(
                "Delete Sale (Cashier - Should Fail)",
                "DELETE",
                f"sales/{sale_id}",
                403,
                token=self.cashier1_token
            )
            
            # Test delete with admin (should work)
            success, _ = self.run_test(
                "Delete Sale (Admin)",
                "DELETE",
                f"sales/{sale_id}",
                200,
                token=self.admin_token
            )

        return True

    def test_settings(self):
        """Test settings operations"""
        print("\n" + "="*50)
        print("TESTING SETTINGS")
        print("="*50)
        
        # Test get settings (admin only)
        success, settings = self.run_test(
            "Get Settings (Admin)",
            "GET",
            "settings",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Business Name: {settings.get('business_name')}")
            print(f"   GST Number: {settings.get('gst_number')}")

        # Test get settings with cashier (should fail)
        success, _ = self.run_test(
            "Get Settings (Cashier - Should Fail)",
            "GET",
            "settings",
            403,
            token=self.cashier1_token
        )

        # Test update settings (admin only)
        update_data = {
            "gst_number": "27XXXXX1234X1Z5",
            "business_address": "123 Fashion Street, Mumbai"
        }
        success, _ = self.run_test(
            "Update Settings (Admin)",
            "PUT",
            "settings",
            200,
            data=update_data,
            token=self.admin_token
        )

        return True

    def test_analytics(self):
        """Test analytics endpoints"""
        print("\n" + "="*50)
        print("TESTING ANALYTICS")
        print("="*50)
        
        # Test sales overview
        success, overview = self.run_test(
            "Sales Overview",
            "GET",
            "analytics/sales-overview",
            200,
            token=self.cashier1_token
        )
        if success:
            print(f"   Daily sales data points: {len(overview.get('daily_sales', []))}")

        # Test monthly sales (NEW FEATURE)
        success, monthly = self.run_test(
            "Monthly Sales Overview",
            "GET",
            "analytics/monthly-sales",
            200,
            token=self.cashier1_token
        )
        if success:
            monthly_data = monthly.get('monthly_sales', [])
            print(f"   Monthly sales data points: {len(monthly_data)}")
            if monthly_data:
                print(f"   Sample month: {monthly_data[0].get('month')} - ₹{monthly_data[0].get('sales', 0)}")

        # Test last four months (NEW FEATURE)
        success, last_four = self.run_test(
            "Last Four Months Sales",
            "GET",
            "analytics/last-four-months",
            200,
            token=self.cashier1_token
        )
        if success:
            four_months_data = last_four.get('last_four_months', [])
            print(f"   Last 4 months data points: {len(four_months_data)}")
            if four_months_data:
                for month in four_months_data:
                    print(f"   {month.get('month')}: ₹{month.get('sales', 0)}")

        # Test top products
        success, top_products = self.run_test(
            "Top Products",
            "GET",
            "analytics/top-products",
            200,
            token=self.cashier1_token
        )
        if success:
            print(f"   Top products count: {len(top_products.get('top_products', []))}")

        return True

    def test_csv_operations(self):
        """Test CSV import/export operations"""
        print("\n" + "="*50)
        print("TESTING CSV OPERATIONS")
        print("="*50)
        
        # Test CSV export (admin only)
        success, csv_data = self.run_test(
            "Export Products CSV (Admin)",
            "GET",
            "products/export-csv",
            200,
            token=self.admin_token
        )
        if success:
            print("   CSV export successful")

        # Test CSV export with cashier (should fail)
        success, _ = self.run_test(
            "Export Products CSV (Cashier - Should Fail)",
            "GET",
            "products/export-csv",
            403,
            token=self.cashier1_token
        )

        # Test CSV import (admin only)
        csv_content = """Product Name,Barcode,Category,Price,Purchase Price,Stock
Test CSV Product,CSV123,Test Category,200,100,5"""
        
        files = {'file': ('test_products.csv', io.StringIO(csv_content), 'text/csv')}
        success, response = self.run_test(
            "Import Products CSV (Admin)",
            "POST",
            "products/import-csv",
            200,
            files=files,
            token=self.admin_token
        )
        if success:
            print(f"   Import result: {response.get('message')}")

        return True

    def cleanup(self):
        """Clean up created test data"""
        print("\n" + "="*50)
        print("CLEANING UP TEST DATA")
        print("="*50)
        
        # Delete created products
        for product_id in self.created_products:
            success, _ = self.run_test(
                f"Delete Product {product_id}",
                "DELETE",
                f"products/{product_id}",
                200,
                token=self.admin_token
            )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting AK Fashion House API Tests")
        print(f"Base URL: {self.base_url}")
        
        try:
            # Authentication tests
            if not self.test_authentication():
                return 1
            
            # Dashboard tests
            self.test_dashboard_metrics()
            
            # Product tests
            self.test_products_crud()
            
            # Sales tests
            self.test_sales_operations()
            
            # Settings tests
            self.test_settings()
            
            # Analytics tests
            self.test_analytics()
            
            # CSV operations tests
            self.test_csv_operations()
            
            # Cleanup
            self.cleanup()
            
        except Exception as e:
            print(f"\n❌ Test suite failed with error: {str(e)}")
            return 1
        
        # Print final results
        print("\n" + "="*50)
        print("TEST RESULTS SUMMARY")
        print("="*50)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = AKFashionHouseAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())