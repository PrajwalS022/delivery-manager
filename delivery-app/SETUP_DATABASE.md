# Cloud Database Setup Guide

This app uses **Supabase** for permanent cloud storage. Follow these steps to set up your database.

## What is Supabase?

Supabase is a free, open-source Firebase alternative that provides:
- ✅ Cloud database (PostgreSQL)
- ✅ Real-time updates
- ✅ Automatic backups
- ✅ Free tier with 500MB storage
- ✅ Up to 50,000 row limits

## Step 1: Create a Supabase Account

1. Go to https://supabase.com
2. Click "Start your project for free"
3. Sign up with email or GitHub
4. Create a new organization
5. Create a new project
   - Project name: `delivery-app`
   - Database password: Create a strong password
   - Region: Choose closest to you
   - Click "Create new project" (wait 2-3 minutes)

## Step 2: Create the Database Table

Once your project is created:

1. Click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Paste this SQL code:

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  restaurants JSONB NOT NULL,
  items JSONB NOT NULL,
  totalAmount DECIMAL NOT NULL,
  deliveryAgent TEXT NOT NULL,
  paymentStatus TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  createdAt TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_orders_date ON orders(date);
CREATE INDEX idx_orders_delivery_agent ON orders(deliveryAgent);
CREATE INDEX idx_orders_payment_status ON orders(paymentStatus);
```

4. Click "Run" button
5. You should see "Success" message

## Step 3: Get Your API Keys

1. Click on "Settings" in the left sidebar
2. Click "API"
3. You'll see:
   - **Project URL** - Copy this (it's your SUPABASE_URL)
   - **anon (public)** - Copy this (it's your SUPABASE_ANON_KEY)

## Step 4: Configure the App

### Option A: Using .env file (Recommended)

1. In the `delivery-app` folder, create a file called `.env.local`
2. Add these lines:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace with your actual keys from Step 3
4. Save the file

### Option B: Using .env in production

If deploying to production:

1. Copy contents of `.env.local` to your hosting provider's environment variables
2. (See deployment section below for specific providers)

## Step 5: Rebuild the App

```bash
cd delivery-app
npm run build
```

## Step 6: Test It!

1. Start the dev server: `npm run dev`
2. Open http://localhost:5173
3. Create a new order
4. Refresh the page - the order should still be there!
5. Go to Supabase > SQL Editor > Select table "orders" - you'll see your data

## Verify It's Working

To check if cloud database is connected:

1. Create an order in the app
2. Go to https://supabase.com and login
3. Navigate to your project
4. Click "Table Editor" → "orders"
5. You should see your order in the table ✅

## Fallback to Local Storage

If Supabase is not configured:
- App automatically uses **localStorage** (browser storage)
- Data still persists but only on that device/browser
- Good for development/testing

## Data Privacy & Security

- ✅ Passwords are **never stored** in database
- ✅ Data is encrypted in transit (HTTPS)
- ✅ Supabase provides automatic backups
- ✅ Public API key only allows reading/writing orders table
- ⚠️ In production, add authentication (see Advanced section)

## Troubleshooting

### "Failed to load orders" error

1. Check your `.env.local` file exists
2. Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
3. Check internet connection
4. App will fallback to localStorage automatically

### Orders not appearing in Supabase

1. Check if `.env.local` is in the root `delivery-app` folder
2. Restart dev server: `npm run dev`
3. Create a new order
4. Check browser console for errors

### Database connection slow

- This is normal on free tier
- Supabase free tier may have slight delays
- Upgrade plan for faster performance

## Storage Limits

**Free Tier:**
- 500 MB storage
- ~200,000 orders (depending on data size)
- Sufficient for most small businesses

**To upgrade:** Go to Supabase dashboard > Billing > Upgrade Plan

## Automatic Backups

Supabase automatically backs up your data:
- Daily backups (free tier)
- 7-day retention
- Can manually export anytime

## Deploy to Production

### Deploy with Vercel (Free)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
5. Deploy!

### Deploy with Netlify (Free)

1. Push code to GitHub
2. Go to https://netlify.com
3. Select your repo
4. Add build command: `npm run build`
5. Add output directory: `dist`
6. Add environment variables (same as above)
7. Deploy!

## Advanced: Add Authentication

For team access control, add authentication:

1. In Supabase, click "Authentication" → "Providers"
2. Enable "Email"
3. Update app to require login before accessing data

(Contact support for help with this)

## Support

- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: Create an issue in your repo
- **Community**: https://discord.supabase.io

---

**Next Step**: Once configured, your data is safe in the cloud forever! 🎉
