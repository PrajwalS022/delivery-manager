-- ============================================================================
-- Delivery Manager Backend - Complete Supabase Setup SQL
-- ============================================================================
-- This script sets up the complete database schema for the delivery manager
-- Run this in your Supabase SQL Editor at: https://app.supabase.com
--
-- Steps:
-- 1. Open your Supabase project
-- 2. Go to SQL Editor (left sidebar)
-- 3. Click "New Query"
-- 4. Copy and paste ALL of this content
-- 5. Click "Run"
-- ============================================================================

-- Step 1: Enable required extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgsodium" SCHEMA extensions;

-- Step 2: Drop existing objects if they exist (clean slate)
-- ============================================================================
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP TABLE IF EXISTS public.orders;

-- Step 3: Create the orders table
-- ============================================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(255) NOT NULL UNIQUE,
  restaurants JSONB NOT NULL DEFAULT '[]'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_agent VARCHAR(255) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('cash', 'account', 'pending')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create indexes for performance
-- ============================================================================
CREATE INDEX idx_orders_order_id ON public.orders(order_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_delivery_agent ON public.orders(delivery_agent);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_date ON public.orders(date DESC);
CREATE INDEX idx_orders_delivery_agent_date ON public.orders(delivery_agent, date DESC);

-- Step 5: Create function to auto-update the updated_at column
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to call the function
-- ============================================================================
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 7: Add table comments (documentation)
-- ============================================================================
COMMENT ON TABLE public.orders IS 'Stores delivery orders with restaurant and item details';
COMMENT ON COLUMN public.orders.id IS 'Unique order identifier (UUID)';
COMMENT ON COLUMN public.orders.order_id IS 'Human-readable order ID (must be unique)';
COMMENT ON COLUMN public.orders.restaurants IS 'JSON array of restaurants in this order';
COMMENT ON COLUMN public.orders.items IS 'JSON array of items ordered';
COMMENT ON COLUMN public.orders.total_amount IS 'Total order amount in decimal format';
COMMENT ON COLUMN public.orders.delivery_agent IS 'Name of the delivery person';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: cash, account, or pending';
COMMENT ON COLUMN public.orders.date IS 'Order date and time';
COMMENT ON COLUMN public.orders.created_at IS 'Timestamp when order was created';
COMMENT ON COLUMN public.orders.updated_at IS 'Timestamp when order was last updated';

-- Step 8: Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS Policies for unrestricted access
-- ============================================================================
-- Note: These policies allow anyone to perform CRUD operations
-- For production, implement proper authentication-based policies

-- Policy: Allow SELECT for all users
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
CREATE POLICY "Enable read access for all users" ON public.orders
  FOR SELECT
  USING (true);

-- Policy: Allow INSERT for all users
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.orders;
CREATE POLICY "Enable insert access for all users" ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow UPDATE for all users
DROP POLICY IF EXISTS "Enable update access for all users" ON public.orders;
CREATE POLICY "Enable update access for all users" ON public.orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow DELETE for all users
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.orders;
CREATE POLICY "Enable delete access for all users" ON public.orders
  FOR DELETE
  USING (true);

-- Step 10: Verification queries
-- ============================================================================
-- Run these to verify the setup was successful

SELECT 
  'Setup Complete!' as status,
  NOW() as timestamp;

-- Check if table exists
SELECT 
  'Table Info' as check_type,
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'orders';

-- Check indexes
SELECT 
  'Indexes' as check_type,
  indexname,
  tablename
FROM pg_indexes
WHERE tablename = 'orders'
ORDER BY indexname;

-- Check RLS policies
SELECT 
  'RLS Policies' as check_type,
  policyname,
  tablename,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- ============================================================================
-- SUCCESS! Your Supabase database is now ready for the Delivery Manager app
-- ============================================================================
-- Next steps:
-- 1. Update your backend .env.local with Supabase credentials:
--    DB_HOST=your-project.postgres.supabase.co
--    DB_PORT=5432
--    DB_NAME=postgres
--    DB_USER=postgres
--    DB_PASSWORD=your_password
--
-- 2. Update your frontend .env.local:
--    VITE_API_URL=http://localhost:5000/api
--
-- 3. Start your backend: npm run dev
-- 4. Start your frontend: npm run dev
-- 5. Test by creating an order in the app!
-- ============================================================================
