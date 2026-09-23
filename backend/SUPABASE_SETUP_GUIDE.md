# Supabase Setup Guide for Delivery Manager

Complete guide to set up your Delivery Manager backend on Supabase.

## What You Need

- Active Supabase account (https://supabase.com)
- Your Supabase project created
- The SQL setup files provided

## SQL Setup Files

We've created 2 SQL files for you:

1. **supabase-setup.sql** - Complete version with cleanup
2. **supabase-setup-simple.sql** - Simple version (use if first one has issues)

## Step-by-Step Setup

### Step 1: Copy SQL Content

Choose one of these two approaches:

**Option A: Using the Complete Version**
```
1. Open: d:\callcenter\backend\supabase-setup.sql
2. Select ALL content (Ctrl+A)
3. Copy (Ctrl+C)
```

**Option B: Using the Simple Version**
```
1. Open: d:\callcenter\backend\supabase-setup-simple.sql
2. Select ALL content (Ctrl+A)
3. Copy (Ctrl+C)
```

### Step 2: Go to Supabase SQL Editor

1. Open https://app.supabase.com
2. Click on your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query** or **+** button

### Step 3: Paste and Run SQL

1. Paste the SQL content (Ctrl+V)
2. Click **Run** button (or Ctrl+Enter)
3. Wait for completion (should be quick, under 5 seconds)

### Step 4: Verify Success

You should see output like:
```
status
Setup Complete!
```

And tables showing:
- ✅ Table Info: orders table
- ✅ Indexes: 5-6 indexes created
- ✅ RLS Policies: 4 policies enabled

## If You Get an Error

### Error: "relation 'orders' does not exist"

**Solution:** Use the **Simple Version** (supabase-setup-simple.sql)
- This uses `IF NOT EXISTS` to prevent conflicts
- Won't fail if table already exists

### Error: "Permission denied"

**Solution:** You need admin access
- Go to Supabase Dashboard
- Check your user role has database creation permissions
- Try in an incognito window if already logged in

### Error: "Syntax error"

**Solution:** Make sure you copied the ENTIRE file
- Check for incomplete pastes
- Try copying section by section
- Use the Simple Version

## What Gets Created

### Orders Table Structure

```
id              → UUID (primary key, auto-generated)
order_id        → Text (unique, human-readable)
restaurants     → JSON array
items           → JSON array
total_amount    → Decimal number
delivery_agent  → Text
payment_status  → 'cash' | 'account' | 'pending'
date            → Timestamp
created_at      → Timestamp (auto-set)
updated_at      → Timestamp (auto-updates on change)
```

### Automatic Features

- ✅ `updated_at` auto-updates on every row change
- ✅ 5-6 indexes for fast queries
- ✅ Row Level Security (RLS) enabled
- ✅ Unrestricted access policies (development mode)

## Test the Database

After setup, test with this query in SQL Editor:

```sql
-- This should return an empty table (0 rows initially)
SELECT * FROM public.orders;

-- This should show table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'orders' ORDER BY ordinal_position;
```

## Configure Your Backend

Once SQL setup is complete, update your backend `.env.local`:

### Get Supabase Credentials

1. Go to Supabase Dashboard
2. Click **Settings** (gear icon)
3. Click **Database**
4. Copy the connection details:

```env
DB_HOST=your-project.postgres.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<your-password-shown-during-project-creation>
```

### Update .env.local

Edit `d:\callcenter\backend\.env.local`:

```env
# Database Configuration - Supabase
DB_HOST=your-project.postgres.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password

# Server Configuration
PORT=5000
NODE_ENV=production
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

### Start Your Backend

```powershell
cd d:\callcenter\backend
npm run test-db    # Verify connection
npm run dev        # Start development server
```

Expected output:
```
✓ Database connection successful
✓ Server running on http://localhost:5000
```

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        orders                           │
├─────────────────────────────────────────────────────────┤
│ id (UUID)                     [PRIMARY KEY]             │
│ order_id (VARCHAR)            [UNIQUE]                  │
│ restaurants (JSONB)           [Array of restaurants]    │
│ items (JSONB)                 [Array of items]          │
│ total_amount (DECIMAL)        [Order total]             │
│ delivery_agent (VARCHAR)      [Delivery person name]    │
│ payment_status (VARCHAR)      [cash/account/pending]    │
│ date (TIMESTAMP)              [Order date]              │
│ created_at (TIMESTAMP)        [Auto: NOW()]             │
│ updated_at (TIMESTAMP)        [Auto: NOW() on update]   │
├─────────────────────────────────────────────────────────┤
│ Indexes:                                                │
│ - idx_orders_created_at (DESC)                         │
│ - idx_orders_delivery_agent                            │
│ - idx_orders_payment_status                            │
│ - idx_orders_date (DESC)                               │
│ - idx_orders_order_id                                  │
└─────────────────────────────────────────────────────────┘
```

## Security Considerations

### Current Setup (Development)

The current RLS policies allow **unrestricted access**:
```sql
CREATE POLICY "Enable read access for all users" ON orders FOR SELECT USING (true);
```

### For Production

Replace with authentication-based policies:

```sql
-- Only authenticated users can read
CREATE POLICY "Users can view orders" ON orders
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can only update their own orders
CREATE POLICY "Users can update their orders" ON orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

(You'll need to add a `user_id` column for this to work)

## Common Queries

### Get all orders
```sql
SELECT * FROM public.orders ORDER BY created_at DESC;
```

### Get orders by delivery agent
```sql
SELECT * FROM public.orders 
WHERE delivery_agent ILIKE '%John%' 
ORDER BY date DESC;
```

### Get pending payments
```sql
SELECT * FROM public.orders 
WHERE payment_status = 'pending' 
ORDER BY date DESC;
```

### Update order payment status
```sql
UPDATE public.orders 
SET payment_status = 'cash' 
WHERE id = 'your-uuid-here';
```

### Count orders by agent
```sql
SELECT delivery_agent, COUNT(*) as total 
FROM public.orders 
GROUP BY delivery_agent 
ORDER BY total DESC;
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "relation 'orders' does not exist" | Use simple version, check table name case |
| "Permission denied" | Check your Supabase user role |
| "Unique constraint violation on order_id" | Each order_id must be unique |
| Slow queries | Check indexes are created (`idx_orders_*`) |
| RLS policies not working | Disable and re-enable RLS |

## Next Steps

1. ✅ SQL setup in Supabase
2. ✅ Backend .env.local configured
3. ✅ Backend running (`npm run dev`)
4. 📝 Test creating orders in the app
5. 📝 Monitor performance with Supabase dashboard
6. 📝 Set up backups (Supabase does this automatically)
7. 📝 For production: Add authentication-based RLS policies

## Support Resources

- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- SQL Examples: See "Common Queries" section above
- Issues: Check Supabase dashboard for error logs

## Verification Checklist

- [ ] SQL ran successfully in Supabase
- [ ] `orders` table visible in Supabase Table Editor
- [ ] 5 indexes created
- [ ] 4 RLS policies enabled
- [ ] Backend `.env.local` updated with Supabase credentials
- [ ] `npm run test-db` shows connection successful
- [ ] Backend starts with `npm run dev`
- [ ] Frontend .env.local has `VITE_API_URL=http://localhost:5000/api`
- [ ] Can create orders in the app
- [ ] Orders appear in Supabase table

You're all set! 🎉
