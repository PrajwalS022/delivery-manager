-- ============================================================================
-- DELIVERY MANAGER - COMPLETE SUPABASE DATABASE SCHEMA
-- ============================================================================
-- This is the complete SQL to set up your entire Supabase backend
-- 
-- HOW TO USE:
-- 1. Go to https://app.supabase.com
-- 2. Click your project
-- 3. Go to SQL Editor (left sidebar)
-- 4. Click "New Query"
-- 5. Copy and paste ALL of this content
-- 6. Click "Run" or press Ctrl+Enter
-- 7. Wait for success message
--
-- This script will:
-- ✅ Create the orders table
-- ✅ Add all indexes for performance
-- ✅ Set up automatic timestamps
-- ✅ Enable Row Level Security (RLS)
-- ✅ Create access policies
-- ✅ Add documentation
-- ============================================================================

-- ============================================================================
-- SECTION 1: SETUP EXTENSIONS
-- ============================================================================
-- Enable UUID support for generating unique IDs

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 2: SAFETY CHECK
-- ============================================================================
-- Check if table already exists - if it does, we'll skip creation

-- Note: If you need to reset the database, run these commands separately:
-- DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders CASCADE;
-- DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
-- DROP TABLE IF EXISTS public.orders CASCADE;

-- ============================================================================
-- SECTION 3: CREATE ORDERS TABLE
-- ============================================================================
-- This is the main table storing all delivery orders
-- Uses IF NOT EXISTS to prevent errors if table already exists

CREATE TABLE IF NOT EXISTS public.orders (
  -- Primary Identifier
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Order Information
  order_id VARCHAR(255) NOT NULL UNIQUE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Restaurant and Items (Stored as JSON)
  restaurants JSONB NOT NULL DEFAULT '[]'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Financial Information
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  
  -- Delivery Information
  delivery_agent VARCHAR(255) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (payment_status IN ('cash', 'account', 'pending')),
  
  -- Timestamps (Automatically managed)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 4: CREATE TABLE COMMENTS (DOCUMENTATION)
-- ============================================================================
-- These help developers understand what each column does
-- Note: Some comments may fail if table already exists - this is OK

BEGIN;

COMMENT ON TABLE public.orders IS 
'Stores all delivery orders with restaurant, item, and payment information';

COMMENT ON COLUMN public.orders.id IS 
'Unique identifier for the order (auto-generated UUID)';

COMMENT ON COLUMN public.orders.order_id IS 
'Human-readable order ID (e.g., ORD-12345) - must be unique';

COMMENT ON COLUMN public.orders.date IS 
'The date and time when the order should be delivered';

COMMENT ON COLUMN public.orders.restaurants IS 
'JSON array containing restaurant information: [{"id": "1", "name": "Pizza Place"}]';

COMMENT ON COLUMN public.orders.items IS 
'JSON array containing ordered items: [{"id": "1", "name": "Margherita", "quantity": 2, "price": 12.99}]';

COMMENT ON COLUMN public.orders.total_amount IS 
'Total order amount in decimal format (e.g., 25.98). Must be positive.';

COMMENT ON COLUMN public.orders.delivery_agent IS 
'Name of the person delivering the order';

COMMENT ON COLUMN public.orders.payment_status IS 
'Payment status: "cash" (paid in cash), "account" (on account), "pending" (not paid yet)';

COMMENT ON COLUMN public.orders.created_at IS 
'Timestamp when the order was created (auto-set)';

COMMENT ON COLUMN public.orders.updated_at IS 
'Timestamp when the order was last updated (auto-updated on any change)';

COMMIT;

-- ============================================================================
-- SECTION 5: CREATE INDEXES
-- ============================================================================
-- Indexes speed up database queries significantly
-- These are optimized for common query patterns
-- Uses IF NOT EXISTS to prevent errors if indexes already exist

-- Index for primary key lookups by created_at (most recent first)
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON public.orders(created_at DESC);

-- Index for filtering by delivery agent name
CREATE INDEX IF NOT EXISTS idx_orders_delivery_agent 
ON public.orders(delivery_agent);

-- Index for filtering by payment status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status 
ON public.orders(payment_status);

-- Index for filtering by order date (most recent first)
CREATE INDEX IF NOT EXISTS idx_orders_date 
ON public.orders(date DESC);

-- Combined index for filtering by agent and date (common query pattern)
CREATE INDEX IF NOT EXISTS idx_orders_agent_date 
ON public.orders(delivery_agent, date DESC);

-- Unique index on order_id (ensures uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_id_unique 
ON public.orders(order_id);

-- ============================================================================
-- SECTION 6: CREATE AUTO-UPDATE FUNCTION
-- ============================================================================
-- This function automatically updates the updated_at timestamp

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Set updated_at to current timestamp
  NEW.updated_at = CURRENT_TIMESTAMP;
  -- Return the modified row
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 7: CREATE TRIGGER FOR AUTO-UPDATE
-- ============================================================================
-- This trigger calls the function before any UPDATE operation

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SECTION 8: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- RLS protects data by controlling who can access what

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 9: CREATE RLS POLICIES
-- ============================================================================
-- These policies control access to the orders table
-- Currently set to allow unrestricted access (good for development)
-- For production, replace with authentication-based policies

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.orders;

-- Policy: Allow anyone to SELECT (read) all orders
CREATE POLICY "Enable read access for all users" ON public.orders
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow anyone to INSERT (create) new orders
CREATE POLICY "Enable insert access for all users" ON public.orders
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow anyone to UPDATE (modify) orders
CREATE POLICY "Enable update access for all users" ON public.orders
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anyone to DELETE (remove) orders
CREATE POLICY "Enable delete access for all users" ON public.orders
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING (true);

-- ============================================================================
-- SECTION 10: GRANT PERMISSIONS
-- ============================================================================
-- Grant permissions to the anon (public) role so anyone can access the table

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO service_role;

-- ============================================================================
-- SECTION 11: VERIFICATION QUERIES
-- ============================================================================
-- These queries verify that everything was set up correctly

-- Display success message
SELECT 
  '✅ SETUP COMPLETE!' as status,
  'All tables, indexes, and policies created successfully' as message,
  NOW() as completed_at;

-- Show table information
SELECT 
  'TABLE CREATED' as check_name,
  table_name,
  table_schema,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'orders';

-- Show all indexes
SELECT 
  'INDEXES CREATED' as check_name,
  COUNT(*) as index_count,
  STRING_AGG(indexname, ', ' ORDER BY indexname) as indexes
FROM pg_indexes
WHERE tablename = 'orders' AND schemaname = 'public';

-- Show table structure
SELECT 
  'TABLE STRUCTURE' as check_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
ORDER BY ordinal_position;

-- Show RLS policies
SELECT 
  'RLS POLICIES' as check_name,
  policyname,
  cmd as operation,
  permissive,
  qual as condition
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- ============================================================================
-- SECTION 12: SUCCESS INDICATORS
-- ============================================================================
-- If you see all green checkmarks above, your setup was successful!
--
-- ✅ Table 'orders' exists
-- ✅ 6 indexes created
-- ✅ Auto-update trigger configured
-- ✅ 4 RLS policies enabled
-- ✅ Full CRUD access granted
--
-- Your database is ready to use!

-- ============================================================================
-- SECTION 13: NEXT STEPS
-- ============================================================================
-- 
-- 1. Get your Supabase connection details:
--    - Settings → Database → Connection String
--    - Copy the Host, Port, Database, User, Password
--
-- 2. Update your backend .env.local:
--    DB_HOST=your-project.postgres.supabase.co
--    DB_PORT=5432
--    DB_NAME=postgres
--    DB_USER=postgres
--    DB_PASSWORD=your_supabase_password
--
-- 3. Start your backend:
--    cd d:\callcenter\backend
--    npm run dev
--
-- 4. Start your frontend:
--    cd d:\callcenter\delivery-app
--    npm run dev
--
-- 5. Test by creating an order in the app!
--
-- ============================================================================
-- COMPLETE! Your Supabase database is ready for the Delivery Manager app
-- ============================================================================
