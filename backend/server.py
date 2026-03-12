from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import csv
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    role: str  # 'admin' or 'cashier'

class UserLogin(BaseModel):
    username: str
    password: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    barcode: str
    category: str
    price: float
    purchase_price: float
    stock: int
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProductCreate(BaseModel):
    name: str
    barcode: str
    category: str
    price: float
    purchase_price: float
    stock: int

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    barcode: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    purchase_price: Optional[float] = None
    stock: Optional[int] = None

class SaleItem(BaseModel):
    product_id: str
    product_name: str
    barcode: str
    quantity: int
    price: float
    total: float

class Sale(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[SaleItem]
    subtotal: float
    gst_amount: float
    total_amount: float
    cashier_id: str
    cashier_name: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SaleCreate(BaseModel):
    items: List[SaleItem]

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "settings"
    business_name: str = "AK Fashion House"
    business_type: str = "Retail"
    gst_number: str = ""
    business_address: str = ""
    printer_name: str = "EPSON TM-T82"
    paper_size: str = "80mm"
    auto_print: bool = False

class SettingsUpdate(BaseModel):
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    gst_number: Optional[str] = None
    business_address: Optional[str] = None
    printer_name: Optional[str] = None
    paper_size: Optional[str] = None
    auto_print: Optional[bool] = None

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"username": username}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# Initialize default data
async def init_db():
    # Create users if they don't exist
    users_count = await db.users.count_documents({})
    if users_count == 0:
        default_users = [
            {
                "id": str(uuid.uuid4()),
                "username": "akfashionhouse",
                "password_hash": hash_password("admin1234"),
                "role": "admin"
            },
            {
                "id": str(uuid.uuid4()),
                "username": "cashier1",
                "password_hash": hash_password("cashier123"),
                "role": "cashier"
            },
            {
                "id": str(uuid.uuid4()),
                "username": "cashier2",
                "password_hash": hash_password("cashier234"),
                "role": "cashier"
            }
        ]
        await db.users.insert_many(default_users)
        logger.info("Default users created")
    
    # Create default settings if they don't exist
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    if not settings:
        default_settings = Settings().model_dump()
        await db.settings.insert_one(default_settings)
        logger.info("Default settings created")

# Auth Routes
@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["username"]})
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "role": user["role"]
        }
    }

# Dashboard Routes
@api_router.get("/dashboard/metrics")
async def get_dashboard_metrics(user: User = Depends(get_current_user)):
    # Get total sales
    sales = await db.sales.find({}, {"_id": 0}).to_list(None)
    total_sales = sum(sale.get("total_amount", 0) for sale in sales)
    
    # Get monthly sales (current month)
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_sales = 0
    
    for sale in sales:
        sale_date = datetime.fromisoformat(sale["created_at"])
        if sale_date >= month_start:
            monthly_sales += sale.get("total_amount", 0)
    
    return {
        "total_sales": round(total_sales, 2),
        "monthly_sales": round(monthly_sales, 2)
    }

# Product Routes
@api_router.get("/products", response_model=List[Product])
async def get_products(user: User = Depends(get_current_user)):
    products = await db.products.find({}, {"_id": 0}).to_list(None)
    return products

@api_router.get("/products/barcode/{barcode}")
async def get_product_by_barcode(barcode: str, user: User = Depends(get_current_user)):
    product = await db.products.find_one({"barcode": barcode}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, user: User = Depends(require_admin)):
    # Check if barcode already exists
    existing = await db.products.find_one({"barcode": product.barcode}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Product with this barcode already exists")
    
    product_obj = Product(**product.model_dump())
    await db.products.insert_one(product_obj.model_dump())
    return product_obj

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductUpdate, user: User = Depends(require_admin)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check barcode uniqueness if barcode is being updated
    if product_update.barcode and product_update.barcode != product["barcode"]:
        existing = await db.products.find_one({"barcode": product_update.barcode}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Product with this barcode already exists")
    
    update_data = {k: v for k, v in product_update.model_dump().items() if v is not None}
    if update_data:
        await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: User = Depends(require_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@api_router.post("/products/import-csv")
async def import_products_csv(file: UploadFile = File(...), user: User = Depends(require_admin)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        contents = await file.read()
        csv_text = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_text))
        
        required_fields = ['Product Name', 'Barcode', 'Category', 'Price', 'Purchase Price', 'Stock']
        
        imported_count = 0
        skipped_count = 0
        
        for row in csv_reader:
            # Validate required fields
            if not all(field in row for field in required_fields):
                skipped_count += 1
                continue
            
            # Check if barcode already exists
            existing = await db.products.find_one({"barcode": row['Barcode']}, {"_id": 0})
            if existing:
                skipped_count += 1
                continue
            
            try:
                product = Product(
                    name=row['Product Name'],
                    barcode=row['Barcode'],
                    category=row['Category'],
                    price=float(row['Price']),
                    purchase_price=float(row['Purchase Price']),
                    stock=int(row['Stock'])
                )
                await db.products.insert_one(product.model_dump())
                imported_count += 1
            except (ValueError, KeyError):
                skipped_count += 1
                continue
        
        return {
            "message": f"Import completed. {imported_count} products imported, {skipped_count} skipped.",
            "imported": imported_count,
            "skipped": skipped_count
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")

@api_router.get("/products/export-csv")
async def export_products_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user: User = Depends(require_admin)
):
    query = {}
    if start_date and end_date:
        query["created_at"] = {
            "$gte": start_date,
            "$lte": end_date
        }
    
    products = await db.products.find(query, {"_id": 0}).to_list(None)
    
    # Create CSV
    output = io.StringIO()
    fieldnames = ['Product Name', 'Barcode', 'Category', 'Price', 'Purchase Price', 'Stock']
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    for product in products:
        writer.writerow({
            'Product Name': product['name'],
            'Barcode': product['barcode'],
            'Category': product['category'],
            'Price': product['price'],
            'Purchase Price': product['purchase_price'],
            'Stock': product['stock']
        })
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products_export.csv"}
    )

# Sales Routes
@api_router.get("/sales", response_model=List[Sale])
async def get_sales(user: User = Depends(get_current_user)):
    sales = await db.sales.find({}, {"_id": 0}).sort("created_at", -1).to_list(None)
    return sales

@api_router.post("/sales", response_model=Sale)
async def create_sale(sale_create: SaleCreate, user: User = Depends(get_current_user)):
    # Calculate totals
    subtotal = sum(item.total for item in sale_create.items)
    gst_amount = subtotal * 0.18
    total_amount = subtotal + gst_amount
    
    # Create sale
    sale = Sale(
        items=[item.model_dump() for item in sale_create.items],
        subtotal=round(subtotal, 2),
        gst_amount=round(gst_amount, 2),
        total_amount=round(total_amount, 2),
        cashier_id=user.id,
        cashier_name=user.username
    )
    
    # Deduct stock
    for item in sale_create.items:
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"stock": -item.quantity}}
        )
    
    await db.sales.insert_one(sale.model_dump())
    return sale

@api_router.delete("/sales/{sale_id}")
async def delete_sale(sale_id: str, user: User = Depends(require_admin)):
    sale = await db.sales.find_one({"id": sale_id}, {"_id": 0})
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Restore stock
    for item in sale["items"]:
        await db.products.update_one(
            {"id": item["product_id"]},
            {"$inc": {"stock": item["quantity"]}}
        )
    
    await db.sales.delete_one({"id": sale_id})
    return {"message": "Sale deleted and stock restored"}

# Settings Routes
@api_router.get("/settings", response_model=Settings)
async def get_settings(user: User = Depends(require_admin)):
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    if not settings:
        settings = Settings().model_dump()
    return Settings(**settings)

@api_router.put("/settings", response_model=Settings)
async def update_settings(settings_update: SettingsUpdate, user: User = Depends(require_admin)):
    update_data = {k: v for k, v in settings_update.model_dump().items() if v is not None}
    if update_data:
        await db.settings.update_one(
            {"id": "settings"},
            {"$set": update_data},
            upsert=True
        )
    
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    return Settings(**settings)

# Analytics Routes
@api_router.get("/analytics/sales-overview")
async def get_sales_overview(user: User = Depends(get_current_user)):
    sales = await db.sales.find({}, {"_id": 0}).to_list(None)
    
    # Group by date
    daily_sales = {}
    for sale in sales:
        date = sale["created_at"][:10]  # Get YYYY-MM-DD
        if date not in daily_sales:
            daily_sales[date] = 0
        daily_sales[date] += sale["total_amount"]
    
    # Get last 7 days
    chart_data = []
    for i in range(6, -1, -1):
        date = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
        chart_data.append({
            "date": date,
            "sales": round(daily_sales.get(date, 0), 2)
        })
    
    return {"daily_sales": chart_data}

@api_router.get("/analytics/monthly-sales")
async def get_monthly_sales(user: User = Depends(get_current_user)):
    sales = await db.sales.find({}, {"_id": 0}).to_list(None)
    
    # Group by month
    monthly_sales = {}
    for sale in sales:
        sale_date = datetime.fromisoformat(sale["created_at"])
        month_key = sale_date.strftime("%Y-%m")  # Format: "2024-03"
        month_name = sale_date.strftime("%B %Y")  # Format: "March 2024"
        
        if month_key not in monthly_sales:
            monthly_sales[month_key] = {
                "month": month_name,
                "sales": 0
            }
        monthly_sales[month_key]["sales"] += sale["total_amount"]
    
    # Sort by month and format
    sorted_months = sorted(monthly_sales.items())
    chart_data = [
        {
            "month": value["month"],
            "sales": round(value["sales"], 2)
        }
        for key, value in sorted_months
    ]
    
    return {"monthly_sales": chart_data}

@api_router.get("/analytics/last-four-months")
async def get_last_four_months_sales(user: User = Depends(get_current_user)):
    sales = await db.sales.find({}, {"_id": 0}).to_list(None)
    
    # Get last 4 months
    now = datetime.now(timezone.utc)
    last_four_months = []
    
    for i in range(3, -1, -1):
        month_date = now - timedelta(days=30 * i)
        month_key = month_date.strftime("%Y-%m")
        month_name = month_date.strftime("%B")
        last_four_months.append({
            "key": month_key,
            "month": month_name,
            "sales": 0
        })
    
    # Calculate sales for each month
    for sale in sales:
        sale_date = datetime.fromisoformat(sale["created_at"])
        sale_month = sale_date.strftime("%Y-%m")
        
        for month_data in last_four_months:
            if sale_month == month_data["key"]:
                month_data["sales"] += sale["total_amount"]
    
    # Format response
    chart_data = [
        {
            "month": m["month"],
            "sales": round(m["sales"], 2)
        }
        for m in last_four_months
    ]
    
    return {"last_four_months": chart_data}

@api_router.get("/analytics/top-products")
async def get_top_products(user: User = Depends(get_current_user)):
    sales = await db.sales.find({}, {"_id": 0}).to_list(None)
    
    product_sales = {}
    for sale in sales:
        for item in sale["items"]:
            product_id = item["product_id"]
            if product_id not in product_sales:
                product_sales[product_id] = {
                    "name": item["product_name"],
                    "quantity": 0,
                    "revenue": 0
                }
            product_sales[product_id]["quantity"] += item["quantity"]
            product_sales[product_id]["revenue"] += item["total"]
    
    # Sort by revenue and get top 5
    top_products = sorted(
        product_sales.values(),
        key=lambda x: x["revenue"],
        reverse=True
    )[:5]
    
    return {"top_products": top_products}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()