# Backend Integration Guide

This guide explains how the frontend and backend are now integrated, and how to get everything running.

## Architecture Overview

The delivery manager app now uses a **three-tier fallback strategy** for data persistence:

```
┌─────────────────────────────┐
│   Frontend (React + Vite)   │
└──────────────┬──────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌────────────┐  ┌────────────────┐
│ Backend    │  │  Supabase      │
│ API        │  │  (Fallback)    │
│ (Primary)  │  │                │
└────────────┘  └────────────────┘
       │                │
       └────────┬───────┘
                ▼
        ┌──────────────┐
        │ Local Storage│
        │ (Offline)    │
        └──────────────┘
```

### Data Flow

1. **Backend API (Primary)**: Express/Node.js server with PostgreSQL
   - Main data store
   - Persistent storage
   - Real-time API endpoints
   
2. **Supabase (Fallback)**: Cloud PostgreSQL with built-in API
   - Used if backend is unavailable
   - Automatic sync
   - Optional for hybrid setups
   
3. **Local Storage (Offline)**: Browser storage
   - Enables offline functionality
   - Automatic sync when online
   - Used as last resort

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- PostgreSQL 12+ (local) OR Supabase account OR Docker

### Step 1: Setup Backend

1. Navigate to backend directory:
```bash
cd d:\callcenter\backend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Configure database (choose one option):

   **Option A: Local PostgreSQL**
   ```bash
   # Copy and edit .env.local
   cp .env.example .env.local
   
   # Edit .env.local with your PostgreSQL credentials:
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=delivery_manager
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

   **Option B: Docker PostgreSQL**
   ```bash
   docker-compose up -d
   # .env.local already configured for Docker
   ```

   **Option C: Supabase**
   ```bash
   # Edit .env.local:
   DB_HOST=your-project.postgres.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_supabase_password
   ```

4. Test database connection:
```bash
npm run test-db
# Should see: "✓ Connection successful!"
```

5. Start the backend server:
```bash
npm run dev
# Should see: "✓ Server running on http://localhost:5000"
```

Server will be available at: `http://localhost:5000`
Health check: `http://localhost:5000/health`
API base: `http://localhost:5000/api`

### Step 2: Setup Frontend

1. Navigate to frontend directory:
```bash
cd d:\callcenter\delivery-app
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Update .env.local (already done, but verify):
```env
VITE_API_URL=http://localhost:5000/api

# Optional: Supabase configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

4. Start the frontend development server:
```bash
npm run dev
# Should see: "Local: http://localhost:5173"
```

### Step 3: Verify Integration

1. Open frontend in browser: `http://localhost:5173`

2. Open browser DevTools Console (F12)

3. Create a test order:
   - Fill in order form
   - Click "Create Order"
   
4. Check console logs:
   - Should see: `✓ Backend API: Order created successfully`
   - If backend unavailable: `✓ LocalStorage: Order saved locally`

5. Verify API directly:
```bash
# In a new terminal, test the API:
curl http://localhost:5000/api/orders
# Should return paginated list of orders
```

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Orders Endpoints

#### GET /orders
Get all orders with pagination and filtering

Query parameters:
- `page` (default: 1)
- `pageSize` (default: 10, max: 100)
- `sortBy` ('createdAt', 'date', 'totalAmount')
- `sortOrder` ('ASC', 'DESC')
- `deliveryAgent` (optional)
- `paymentStatus` ('cash', 'account', 'pending')
- `startDate` (ISO8601)
- `endDate` (ISO8601)

Example:
```bash
curl "http://localhost:5000/api/orders?page=1&pageSize=20&paymentStatus=pending"
```

#### POST /orders
Create a new order

Request body:
```json
{
  "orderId": "ORD-12345",
  "restaurants": [
    { "id": "rest-1", "name": "Pizza Place" }
  ],
  "items": [
    { "id": "item-1", "name": "Margherita", "quantity": 2, "price": 12.99 }
  ],
  "totalAmount": 25.98,
  "deliveryAgent": "John Doe",
  "paymentStatus": "pending",
  "date": "2026-09-23T10:30:00Z"
}
```

#### PUT /orders/:id
Update an existing order

#### DELETE /orders/:id
Delete an order

#### GET /orders/:id
Get order by ID

#### GET /orders/agent/:agent
Get all orders for a delivery agent

#### GET /orders/status/:status
Get all orders by payment status

## Environment Variables

### Frontend (.env.local)
```env
# Backend API URL (required)
VITE_API_URL=http://localhost:5000/api

# Supabase configuration (optional, used as fallback)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (.env.local)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=delivery_manager
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Frontend Service Updates

The `src/services/orderService.ts` has been updated with:

1. **Primary Backend API Integration**
   - All CRUD operations now go to backend first
   - Automatic timeout handling (10 seconds)
   - Error logging with helpful messages

2. **Fallback Strategy**
   - If backend unavailable, tries Supabase
   - If Supabase unavailable, uses local storage
   - Seamless failover with console logging

3. **Data Synchronization**
   - Orders saved to local storage as backup
   - Automatic sync when backend becomes available
   - No data loss on network issues

## Troubleshooting

### "Failed to connect to database"
**Backend not running or database down**
```bash
# Check backend server
curl http://localhost:5000/health

# If response is 404 or timeout:
cd d:\callcenter\backend
npm run dev

# Check database connection
npm run test-db
```

### "Backend API failed" in console logs
**Backend may be unavailable, fallback activated**
1. Check backend is running: `npm run dev` in backend folder
2. Check VITE_API_URL in frontend .env.local is correct
3. Check CORS settings in backend/src/server.ts allow frontend URL
4. Data still saved locally, will sync when backend is back

### "Cannot POST /api/orders"
**Backend routes not loading**
```bash
# Ensure TypeScript compiled correctly
cd d:\callcenter\backend
npm run build
npm start
```

### Orders not persisting
**Check fallback sources**
1. Refresh browser and check local storage
2. If backend is down, data saved locally
3. Once backend is back, new orders go to database
4. Previously local orders still available

### Port already in use
**Backend or frontend port conflict**
```bash
# Change backend port:
PORT=5001 npm run dev

# Change frontend port:
npm run dev -- --port 5174
```

## Production Deployment

### Backend Deployment

For production, use a managed PostgreSQL service:

1. **Supabase** (Recommended for quick setup)
   ```env
   DB_HOST=your-project.postgres.supabase.co
   NODE_ENV=production
   ```

2. **AWS RDS / Azure Database / DigitalOcean**
   - Follow provider's PostgreSQL setup
   - Update DB_* environment variables
   - Enable SSL/TLS encryption

3. **Deploy server to:**
   - Heroku (free tier available)
   - AWS Lambda / EC2
   - DigitalOcean / Linode
   - Your own VPS

### Frontend Deployment

1. Build for production:
```bash
npm run build
```

2. Update API URL for production:
```env
VITE_API_URL=https://your-backend.com/api
```

3. Deploy to:
   - Vercel (recommended for Vite)
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

## Development Commands

### Backend
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Run production build
npm run test-db      # Test database connection
npm run migrate      # Initialize database schema
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter (if configured)
```

## Architecture Benefits

1. **Reliability**
   - Three-tier fallback ensures data is never lost
   - Works offline with local storage
   - Automatic sync when connection restored

2. **Performance**
   - Backend handles heavy queries
   - Local storage provides instant access
   - Pagination prevents loading too much data

3. **Flexibility**
   - Can use local PostgreSQL, Supabase, or managed DB
   - Easy to switch between services
   - Optional Supabase for real-time features

4. **Scalability**
   - Backend can scale independently
   - Database queries optimized with indexes
   - Ready for multi-user deployments

## Next Steps

1. ✅ Backend running on http://localhost:5000
2. ✅ Frontend running on http://localhost:5173
3. ✅ API integration active
4. 📝 Add real-time updates (WebSockets)
5. 📝 Add user authentication
6. 📝 Add data export/import features
7. 📝 Set up automated backups

## Support

For issues or questions:
1. Check console logs in browser DevTools (F12)
2. Check backend server logs
3. Review this integration guide
4. See `SETUP_DATABASE.md` for database-specific help
5. See `backend/README.md` for API documentation
