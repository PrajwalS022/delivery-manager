-- ============================================================================
-- Delivery Manager - Supabase Setup (Simple Version)
-- ============================================================================
-- Use this if the full version has issues
-- Copy and paste everything below into Supabase SQL Editor and run

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_agent ON public.orders(delivery_agent);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(date DESC);

-- Create auto-update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER IF NOT EXISTS update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Enable read access" ON public.orders FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert access" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update access" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable delete access" ON public.orders FOR DELETE USING (true);

-- Verify setup
SELECT 'Setup Complete!' as status;
