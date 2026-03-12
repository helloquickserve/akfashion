# AK Fashion House - Retail POS System

A comprehensive Point of Sale (POS) and retail management system built with React, FastAPI, and MongoDB.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

### Core Functionality
- **User Authentication**: Role-based access control (Admin & Cashier)
- **Dashboard**: Real-time sales metrics and analytics
- **Billing/POS**: Barcode scanner, cart management, automatic calculations
- **Product Management**: Full CRUD with CSV import/export
- **Sales History**: Transaction tracking with date filtering
- **Analytics**: Charts and graphs for business insights
- **Item Sales Report**: Detailed product performance tracking
- **Settings**: Business info and printer configuration

### Advanced Features
- **Auto-Print Receipts**: Thermal printer support with bold formatting
- **Date Filtering**: Filter reports by custom date ranges
- **CSV Exports**: Item-level transaction details
- **Stock Management**: Automatic stock deduction and restoration
- **GST Calculation**: Automatic 18% GST on all sales
- **Monthly Analytics**: Sales trends and top products

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ak-fashion-house)

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for 5-minute deployment guide.

## 💻 Local Development

### Prerequisites
- Node.js 16+ and Yarn
- Python 3.9+
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ak-fashion-house.git
cd ak-fashion-house
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "MONGO_URL=mongodb://localhost:27017/" > .env
echo "DB_NAME=akfashion_pos" >> .env
echo "JWT_SECRET_KEY=your-secret-key" >> .env
echo "CORS_ORIGINS=http://localhost:3000" >> .env

# Start backend
uvicorn server:app --reload --port 8001
```

3. **Frontend Setup**
```bash
cd frontend
yarn install

# Create .env file
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env

# Start frontend
yarn start
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/docs

## 🔐 Default Credentials

### Admin Account
- Username: `akfashionhouse`
- Password: `admin1234`

### Cashier Accounts
- Cashier 1: `cashier1` / `cashier123`
- Cashier 2: `cashier2` / `cashier234`

**⚠️ Change these passwords in production!**

## 📁 Project Structure

```
ak-fashion-house/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   └── utils/        # Utility functions
│   ├── package.json      # Node dependencies
│   └── .env             # Frontend env variables
├── vercel.json          # Vercel deployment config
└── README.md           # This file
```

## 🎨 Tech Stack

### Frontend
- **React** 18 - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Sonner** - Toast notifications

### Backend
- **FastAPI** - Python web framework
- **Motor** - Async MongoDB driver
- **PyJWT** - JWT authentication
- **Bcrypt** - Password hashing
- **Pydantic** - Data validation

### Database
- **MongoDB** - NoSQL database
- **MongoDB Atlas** - Cloud hosting (production)

## 📊 Features by Role

### Admin Features
✅ Full product management (CRUD)
✅ CSV import/export
✅ Delete sales
✅ View purchase prices
✅ Access all reports
✅ Configure settings

### Cashier Features
✅ Process sales (billing)
✅ View products (read-only)
✅ View sales history
✅ Access analytics
✅ Export reports

## 🛠️ Configuration

### Environment Variables

**Backend (.env)**
```env
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=akfashion_pos
JWT_SECRET_KEY=your-secret-key-here
CORS_ORIGINS=*
```

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=https://your-api-url.com
```

## 📈 API Documentation

When running locally, visit:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

### Main Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/dashboard/metrics` - Dashboard data
- `GET /api/products` - List products
- `POST /api/sales` - Process sale
- `GET /api/reports/item-sales` - Item sales report

## 📦 Deployment

### Vercel (Recommended)
See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

### Other Platforms
- **Railway**: Python + Node.js support
- **Render**: Good for FastAPI apps
- **Heroku**: Classic choice for full-stack apps
- **AWS/GCP**: For enterprise deployments

## 🔒 Security

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- CORS protection
- Input validation with Pydantic
- MongoDB injection prevention

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for deployment help
- Review [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for quick start

---

**Made with ❤️ for AK Fashion House**
