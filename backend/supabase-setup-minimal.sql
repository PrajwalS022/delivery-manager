-- MINIMAL Supabase Setup - Use this if other versions fail
-- This is the absolute bare minimum to get started

-- 1. Create table only
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(255) NOT NULL UNIQUE,
  restaurants JSONB,
  items JSONB,
  total_amount DECIMAL(10, 2),
  delivery_agent VARCHAR(255),
  payment_status VARCHAR(50),
  date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Allow all access (for development)
CREATE POLICY "all_select" ON public.orders FOR SELECT USING (true);
CREATE POLICY "all_insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "all_update" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "all_delete" ON public.orders FOR DELETE USING (true);

-- Done! Your table is ready
SELECT 'orders table created' as status;
