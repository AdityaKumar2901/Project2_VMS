# Local Vendor Marketplace

A production-ready multi-vendor marketplace platform connecting local shops and customers with location-based discovery.

## Architecture Overview

### Tech Stack
- **Backend**: Node.js (Express), SQLite 3 (file-based DB), JWT authentication
- **Frontend**: React 18 + Vite, React Router v6, CSS Modules
- **Charts**: Recharts (admin analytics)

### Key Features
- Multi-tenant marketplace with vendor management
- Location-based vendor/product discovery (5km prioritization)
- Role-based access control (Admin, Vendor, Customer)
- Public browsing with gated checkout
- Cart and order management
- Product and vendor reviews
- Haversine distance calculation for nearby vendors

### System Architecture
```
┌─────────────┐         ┌──────────────┐         ┌──────────┐
│   React     │ ◄─HTTP─►│   Express    │ ◄─SQL──►│  SQLite  │
│  Frontend   │         │   Backend    │         │ (File DB)│
│  (Port 5173)│         │  (Port 5000) │         │          │
└─────────────┘         └──────────────┘         └──────────┘
```

## Prerequisites

- Node.js 18+ and npm
- Git
- **No database server required!** (Uses SQLite file database)

## Setup Instructions

### 1. Clone Repository
```bash
cd c:\Aditya\Projects\VendorMgtSys
```

### 2. Database Setup

**✨ No manual setup required!**  
The SQLite database is automatically created and seeded when you first run the backend server.  
Database file location: `backend/data/marketplace.db`

**Optional**: To manually reinitialize the database:
```bash
# Delete existing database
rm backend/data/marketplace.db

# Restart server (database will be recreated)
cd backend
npm run dev
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Configure environment variables in `.env`:

# Database (SQLite - auto-created)
DB_PATH=./data/marketplace.db

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORSr_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
```

Start backend server:
```bash
npm run dev
```

Backend runs on: http://localhost:5000

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend development server:
```bash
npm run dev
```

Frontend runs on: http://localhost:5173

## Default Users (from seed data)

### Admin
- Email: admin@marketplace.com
- Password: Admin@123

### Vendor (Sample)
- Email: spicemart@vendor.com
- Password: Vendor@123

### Customer (Sample)
- Email: john.customer@email.com
- Password: Customer@123

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - Register new user (customer/vendor)
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user profile

### Public Endpoints
- `GET /public/vendors` - List vendors with location filtering
- `GET /public/vendors/:id` - Get vendor details
- `GET /public/products` - Search/filter products
- `GET /public/products/:id` - Get product details
- `GET /public/categories` - List all categories

### Customer Endpoints (Authenticated)
- `GET /cart` - Get current cart
- `POST /cart/items` - Add item to cart
- `DELETE /cart/items/:id` - Remove cart item
- `POST /orders` - Create order from cart
- `GET /orders` - List customer orders
- `GET /orders/:id` - Get order details
- `POST /reviews/product/:productId` - Review product
- `POST /reviews/vendor/:vendorId` - Review vendor

### Vendor Endpoints (Authenticated)
- `GET /vendor/me` - Get vendor profile
- `PUT /vendor/me` - Update vendor profile
- `GET /vendor/products` - List vendor products
- `POST /vendor/products` - Create product
- `PUT /vendor/products/:id` - Update product
- `DELETE /vendor/products/:id` - Delete product
- `GET /vendor/orders` - List vendor orders
- `PUT /vendor/orders/:id/status` - Update order status
- `GET /vendor/reviews` - Get vendor reviews

### Admin Endpoints (Authenticated)
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/vendors` - List all vendors
- `PUT /admin/vendors/:id/verify` - Verify vendor
- `GET /admin/categories` - List categories
- `POST /admin/categories` - Create category
- `PUT /admin/categories/:id` - Update category
- `DELETE /admin/categories/:id` - Delete category
- `GET /admin/reviews` - List all reviews (moderation)
- `DELETE /admin/reviews/:id` - Delete review
- `GET /admin/orders` - List all orders

## Project Structure

```
VendorMgtSys/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── public.routes.js
│   │   │   ├── customer.routes.js
│   │   │   ├── vendor.routes.js
│   │   │   └── admin.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── public.controller.js
│   │   │   ├── customer.controller.js
│   │   │   ├── vendor.controller.js
│   │   │   └── admin.controller.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── distance.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── VendorCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── auth/
│   │   │   ├── customer/
│   │   │   ├── vendor/
│   │   │   └── admin/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
├── database/
│   ├── schema.sql
│   └── seed.sql
└── README.md
```

## Features by Role

### Customer
- Browse products and vendors without login
- Location-based discovery (nearby vendors within 5km prioritized)
- Search and filter products by category, price, rating
- Add products to cart (checkout requires login)
- Place orders with cash on delivery
- Track order status
- Review products and vendors
- View order history

### Vendor
- Create and manage vendor profile (shop name, location, contact)
- Add/edit/delete products with inventory management
- Receive and manage customer orders
- Update order status (pending → accepted → packed → out_for_delivery → delivered)
- View and respond to reviews
- Access vendor dashboard with statistics

### Admin
- Platform-wide dashboard with analytics
- Manage and verify vendors
- Create/edit/delete product categories
- Moderate reviews (delete inappropriate content)
- View all orders across platform
- Platform statistics and reporting

## Location-Based Features

### Distance Calculation
- Uses Haversine formula for accurate distance calculation
- Vendors within 5km are prioritized in search results
- Distance displayed on vendor/product cards

### Geolocation Flow
1. Browser requests user's location permission
2. If granted, coordinates are used for distance sorting
3. If denied, users can manually enter city/ZIP (fallback sorting)
4. All vendors display distance from user's location

## Security Features

- JWT access tokens (15min) + refresh tokens (7 days)
- Refresh tokens hashed and stored in database
- Token rotation on refresh
- Role-based access control middleware
- Bcrypt password hashing (10 rounds)
- Parameterized SQL queries (SQL injection prevention)
- Input validation on all endpoints
- CORS configuration
- Error handling without sensitive data exposure

## Development

### Backend Development
```bash
cd backend
npm run dev
```

Uses nodemon for auto-reload on file changes.

### Frontend Development
```bash
cd frontend
npm run dev
```

Vite HMR for instant updates.

### Database Migrations

To reset database:
```bash
mysql -u root -p vendor_marketplace < database/schema.sql
mysql -u root -p vendor_marketplace < database/seed.sql
```

## Testing the Application

### 1. Browse as Guest
- Visit http://localhost:5173
- Browse products and vendors
- Search and filter products
- View product details

### 2. Customer Flow
- Register as customer or login with john.customer@email.com
- Add products to cart
- Proceed to checkout
- Place order with delivery address
- View order in order history
- Leave product review

### 3. Vendor Flow
- Login as vendor (spicemart@vendor.com)
- Update vendor profile with location
- Add new products
- Manage inventory
- View incoming orders
- Update order status
- View reviews

### 4. Admin Flow
- Login as admin (admin@marketplace.com)
- View dashboard analytics
- Verify new vendors
- Manage categories
- Moderate reviews
- View all platform orders

## Production Deployment Checklist

- [ ] Change all default secrets in .env
- [ ] Use environment-specific database credentials
- [ ] Enable MySQL SSL connections
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Set up reverse proxy (nginx) for backend
- [ ] Enable HTTPS with SSL certificates
- [ ] Set up database backups
- [ ] Configure logging (Winston/Morgan)
- [ ] Add rate limiting middleware
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Optimize database indexes
- [ ] Add database connection pooling
- [ ] Implement caching (Redis)
- [ ] Set up CDN for static assets
- [ ] Add image upload service (AWS S3, Cloudinary)

## Troubleshooting

### Backend not starting
- Check MySQL is running: `mysql -u root -p`
- Verify database exists: `SHOW DATABASES;`
- Check .env configuration
- Verify Node.js version: `node --version`

### Frontend not connecting
- Verify backend is running on port 5000
- Check VITE_API_URL in frontend/.env
- Check browser console for CORS errors

### Location not working
- Ensure browser location permission is granted
- Check vendor coordinates are properly seeded
- Verify Haversine calculation in backend

## License

MIT License - feel free to use for commercial projects.

## Support

For issues or questions, please refer to the API documentation above or check the code comments.
