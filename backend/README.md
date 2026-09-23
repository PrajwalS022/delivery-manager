# Delivery Manager Backend API

A Node.js/Express backend for managing delivery orders with PostgreSQL database.

## Features

- RESTful API for order management (CRUD operations)
- PostgreSQL database with optimized indexes
- Input validation and error handling
- Pagination and filtering support
- CORS enabled for frontend integration
- Security headers (Helmet)
- Request logging (Morgan)
- Response compression

## Prerequisites

- Node.js 18+ (or just npm/yarn)
- PostgreSQL 12+ (or use Supabase for hosted PostgreSQL)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure your database connection:
```env
# Local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=delivery_manager
DB_USER=postgres
DB_PASSWORD=your_password

# Or use Supabase PostgreSQL
DB_HOST=your-project.postgres.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
```

4. Initialize the database:
```bash
npm run migrate
```

## Running the Server

Development mode with hot reload:
```bash
npm run dev
```

Production build and start:
```bash
npm run build
npm start
```

Server will run on `http://localhost:5000`

Health check: `http://localhost:5000/health`

## API Endpoints

### Orders

#### GET /api/orders
Get all orders with pagination and filtering

Query parameters:
- `page` (number, default: 1)
- `pageSize` (number, default: 10, max: 100)
- `sortBy` (string: 'createdAt', 'date', 'totalAmount')
- `sortOrder` (string: 'ASC', 'DESC')
- `deliveryAgent` (string, optional)
- `paymentStatus` (string: 'cash', 'account', 'pending', optional)
- `startDate` (ISO8601 date, optional)
- `endDate` (ISO8601 date, optional)

Example:
```bash
GET /api/orders?page=1&pageSize=20&sortBy=createdAt&sortOrder=DESC&paymentStatus=pending
```

#### GET /api/orders/:id
Get a single order by ID

#### POST /api/orders
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

#### PUT /api/orders/:id
Update an existing order

#### DELETE /api/orders/:id
Delete an order

#### GET /api/orders/agent/:agent
Get all orders for a specific delivery agent

#### GET /api/orders/status/:status
Get all orders with a specific payment status

## Response Format

All responses follow a standard format:

Success response:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2026-09-23T10:30:00Z"
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-09-23T10:30:00Z"
}
```

Paginated response:
```json
{
  "success": true,
  "data": [],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "totalPages": 10,
  "timestamp": "2026-09-23T10:30:00Z"
}
```

## Database Schema

### orders table
- `id` (UUID, primary key)
- `order_id` (VARCHAR, unique)
- `restaurants` (JSONB)
- `items` (JSONB)
- `total_amount` (DECIMAL)
- `delivery_agent` (VARCHAR)
- `payment_status` (VARCHAR: 'cash', 'account', 'pending')
- `date` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

Indexes:
- idx_orders_created_at
- idx_orders_delivery_agent
- idx_orders_payment_status
- idx_orders_date

## Environment Variables

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

# Frontend
FRONTEND_URL=http://localhost:5173
```

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 404: Not Found
- 409: Conflict (e.g., duplicate order ID)
- 500: Internal Server Error

## Security Features

- CORS configured for specific origins
- Helmet for security headers
- Input validation using express-validator
- SQL injection prevention via parameterized queries
- Request size limits

## Development

### Structure
```
src/
├── config/        # Database configuration
├── middleware/    # Express middleware
├── routes/        # API routes
├── services/      # Business logic
├── types/         # TypeScript types
└── server.ts      # Entry point
```

### Running Tests
```bash
npm test
```

## Troubleshooting

### Connection refused
- Check PostgreSQL is running
- Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env
- Test with: `pg_isready -h localhost -p 5432`

### Port already in use
- Change PORT in .env or: `PORT=5001 npm run dev`

### Unique constraint violation
- Each order_id must be unique
- Ensure you're not creating duplicate order_ids

## License

MIT
