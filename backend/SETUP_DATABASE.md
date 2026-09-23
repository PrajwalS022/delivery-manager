# Database Setup Guide

This guide will help you set up PostgreSQL for the Delivery Manager Backend.

## Option 1: Local PostgreSQL Installation (Windows)

### Prerequisites
- Windows 10 or later
- Administrator access (for installation)

### Installation Steps

1. **Download PostgreSQL Installer**
   - Go to https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15 or later
   - Run the installer

2. **Installation Configuration**
   - Choose installation directory (default is fine)
   - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools
   - Set a password for postgres user (remember this!)
   - Keep port as 5432
   - Choose locale

3. **Verify Installation**
   ```powershell
   # Open Command Prompt or PowerShell and test connection:
   psql -U postgres -c "SELECT version();"
   ```

4. **Create Database and User**
   ```powershell
   # Connect as postgres user
   psql -U postgres
   
   # In psql, run:
   CREATE DATABASE delivery_manager;
   CREATE USER delivery_user WITH PASSWORD 'delivery_password';
   ALTER ROLE delivery_user SET client_encoding TO 'utf8';
   ALTER ROLE delivery_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE delivery_user SET default_transaction_deferrable TO on;
   ALTER ROLE delivery_user SET default_transaction_read_only TO off;
   GRANT ALL PRIVILEGES ON DATABASE delivery_manager TO delivery_user;
   \q
   ```

5. **Update .env.local**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=delivery_manager
   DB_USER=delivery_user
   DB_PASSWORD=delivery_password
   ```

6. **Test Connection**
   ```powershell
   cd d:\callcenter\backend
   npm run dev
   # Check console for "✓ Database connection successful" message
   ```

---

## Option 2: Supabase (Cloud PostgreSQL - Recommended)

Supabase provides a free hosted PostgreSQL database with automatic backups.

### Setup Steps

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up with email or GitHub
   - Create a new project

2. **Get Connection Details**
   - In Supabase dashboard, go to Settings → Database
   - Copy the Connection String (or individual details)
   - Note the password (shown only once during project creation)

3. **Update .env.local**
   ```env
   DB_HOST=your-project.postgres.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_supabase_password
   NODE_ENV=production
   ```

4. **Initialize Database**
   ```powershell
   cd d:\callcenter\backend
   npm run migrate
   ```

5. **Verify**
   ```powershell
   npm run dev
   # Should see database tables created and server running
   ```

### Supabase Features
- Free tier: 500MB database, suitable for small projects
- SSL/TLS encryption by default
- Automatic daily backups
- Web dashboard for SQL queries
- Real-time subscriptions (optional)

---

## Option 3: Docker (Containerized PostgreSQL)

### Prerequisites
- Docker Desktop installed (https://www.docker.com/products/docker-desktop)

### Setup Steps

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15-alpine
       container_name: delivery_db
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
         POSTGRES_DB: delivery_manager
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U postgres"]
         interval: 10s
         timeout: 5s
         retries: 5

   volumes:
     postgres_data:
   ```

2. **Start PostgreSQL Container**
   ```powershell
   # Navigate to backend folder
   cd d:\callcenter\backend
   
   # Start the container
   docker-compose up -d
   
   # Check status
   docker-compose ps
   ```

3. **Update .env.local**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=delivery_manager
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

4. **Stop Container**
   ```powershell
   docker-compose down
   ```

---

## Testing Database Connection

### Quick Test
```powershell
cd d:\callcenter\backend

# Start the dev server
npm run dev

# In another terminal, check the API
curl http://localhost:5000/health
```

### Expected Response
```json
{
  "status": "OK",
  "timestamp": "2026-09-23T10:30:00.000Z"
}
```

### Troubleshooting

**Error: "connect ECONNREFUSED 127.0.0.1:5432"**
- PostgreSQL service is not running
- Windows: Start PostgreSQL from Services (services.msc)
- Docker: Run `docker-compose up -d`
- Check DB_HOST and DB_PORT in .env.local

**Error: "role 'postgres' does not exist"**
- Default postgres user not created during installation
- Try creating a new user with `createuser` command
- Or reinstall PostgreSQL

**Error: "database 'delivery_manager' does not exist"**
- Run the database creation script from Option 1 step 4
- Or the backend will auto-create on first run if user has permissions

**Error: "permission denied for schema public"**
- Grant permissions to user:
  ```sql
  GRANT ALL ON SCHEMA public TO delivery_user;
  ```

---

## Database Schema

The backend automatically creates the following schema:

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(255) NOT NULL UNIQUE,
  restaurants JSONB NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_agent VARCHAR(255) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_delivery_agent ON orders(delivery_agent);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_date ON orders(date);
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| DB_HOST | Database server hostname | localhost |
| DB_PORT | Database server port | 5432 |
| DB_NAME | Database name | delivery_manager |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | secure_password |
| PORT | Backend API port | 5000 |
| NODE_ENV | Environment | development, production |
| FRONTEND_URL | Frontend application URL | http://localhost:5173 |

---

## Next Steps

1. Choose your preferred setup (Local, Supabase, or Docker)
2. Configure .env.local with your database details
3. Run `npm run dev` to start the backend
4. Verify with `curl http://localhost:5000/health`
5. Update your frontend to use the new backend API

For production deployment:
- Use Supabase or managed PostgreSQL (AWS RDS, Azure Database, etc.)
- Set NODE_ENV=production
- Use strong passwords
- Enable SSL/TLS
- Set up database backups
