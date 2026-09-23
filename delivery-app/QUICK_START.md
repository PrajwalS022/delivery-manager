# Quick Start Guide - Delivery Service Manager

## What You Have

A mobile-friendly delivery order management app with cloud storage.

## Installation & Running

### First Time Setup

1. **Navigate to app folder**
   ```bash
   cd delivery-app
   ```

2. **Install dependencies** (already done, but if needed)
   ```bash
   npm install
   ```

3. **Create `.env.local` file** (in delivery-app folder)
   ```
   VITE_SUPABASE_URL=your_url_here
   VITE_SUPABASE_ANON_KEY=your_key_here
   ```
   (See SETUP_DATABASE.md for how to get these keys)

4. **Start the app** (development)
   ```bash
   npm run dev
   ```
   - Opens at http://localhost:5173

### Production Build

```bash
npm run build
```
- Creates optimized files in `dist/` folder
- Deploy these files to your server/hosting

## Usage for Employees

### On Mobile

1. **Open in browser**
   - Chrome, Safari, or Edge
   - Go to your app URL

2. **Create Order**
   - Tap "+ Create Order"
   - Fill form on phone
   - Save

3. **View Orders**
   - Scroll through cards
   - Grouped by date automatically

4. **Export to PDF**
   - Scroll to export section
   - Select date
   - Tap "Generate PDF"
   - Download or print

### On Desktop

1. Same as mobile, or use keyboard shortcuts
2. Wider view shows more data
3. Better for detailed reporting

## File Structure

```
delivery-app/
├── src/
│   ├── components/          # UI components
│   ├── services/           # Database service layer
│   ├── config/            # Supabase config
│   ├── types.ts           # TypeScript types
│   ├── App.tsx            # Main app
│   └── styles/            # CSS files
├── .env.local             # Environment variables (create this)
├── .env.example           # Example env file
├── SETUP_DATABASE.md      # Database setup guide
├── README.md              # Full documentation
└── index.html             # Main HTML file
```

## Key Features

✅ **Cloud Storage** - Data synced to cloud instantly
✅ **Mobile Friendly** - Works perfectly on phones
✅ **Offline Ready** - Falls back to local storage if no internet
✅ **PDF Export** - Professional table-format PDFs
✅ **Multi-user** - All employees see same data
✅ **No Setup** - Works out of box (with env vars)
✅ **Free** - Uses free tier Supabase

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGc...` |

Get these from: https://supabase.com → Your Project → Settings → API

## Common Tasks

### Update an Order
1. Find the order card
2. Click/tap "Edit"
3. Modify fields
4. Save

### Delete an Order
1. Find the order card
2. Click/tap "Delete"
3. Confirm

### Filter Orders
1. Use filters at top:
   - Date
   - Restaurant
   - Delivery Agent
   - Payment Status
2. Click "Clear Filters" to reset

### Export Multiple Days
1. Generate PDF for each date separately
2. Or use date range in filter (if added)

## Troubleshooting

### No internet? 
✓ App still works - uses local storage
✓ Data syncs to cloud when online again

### Lost data?
→ Check if `.env.local` exists
→ Check internet connection
→ Data might be in cloud already

### App very slow?
→ Check internet speed
→ Free tier Supabase may be slow
→ Try upgrading database plan

### PDF won't download?
→ Allow pop-ups in browser
→ Try different browser
→ Check storage space

## Next Steps

1. **Set up database** - Follow SETUP_DATABASE.md
2. **Create `.env.local`** - Add your Supabase keys
3. **Test with mock data** - Create a few test orders
4. **Deploy to production** - Use Vercel or Netlify (free)
5. **Share with employees** - Send URL to team

## Need Help?

- **Database issues?** → See SETUP_DATABASE.md
- **Features?** → See README.md
- **Development?** → Check component files in `src/`
- **Supabase help?** → https://supabase.com/docs

## Performance Tips

1. **Keep database clean** - Archive old orders monthly
2. **Use filters** - Don't scroll through all orders
3. **Regular backups** - Supabase auto-backs up, but export PDFs
4. **Monitor storage** - Watch free tier limits

---

**You're all set!** 🚀 Your employees can now manage orders from anywhere.
