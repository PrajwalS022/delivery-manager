# Deployment & Sharing Guide

Get your app live on the internet so employees can use it from anywhere!

## Prerequisites

✅ Supabase configured (from SETUP_DATABASE.md)
✅ `.env.local` file with your API keys
✅ App builds successfully (`npm run build`)

## Option 1: Deploy to Vercel (Recommended - Easiest)

**Time needed**: 5 minutes
**Cost**: Free

### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
   (Create GitHub repo and push if not already)

2. **Go to Vercel**
   - Visit https://vercel.com
   - Click "Sign up" (use GitHub account)

3. **Create new project**
   - Click "New Project"
   - Select your GitHub repo
   - Click "Import"

4. **Configure environment**
   - You should see "Environment Variables" section
   - Add your variables:
     - Name: `VITE_SUPABASE_URL`
     - Value: Your Supabase URL
   - Click "Add Another"
     - Name: `VITE_SUPABASE_ANON_KEY`
     - Value: Your Supabase key
   - Click "Deploy"

5. **Wait for deployment**
   - Vercel builds and deploys
   - Takes ~2-3 minutes
   - Shows green checkmark when done

6. **Get your URL**
   - Vercel gives you a URL like `https://delivery-app-xyz.vercel.app`
   - Share this with employees!

### Update After Changes

```bash
git add .
git commit -m "Update feature"
git push
```
Vercel automatically rebuilds!

## Option 2: Deploy to Netlify

**Time needed**: 5 minutes
**Cost**: Free

### Steps

1. **Go to Netlify**
   - Visit https://netlify.com
   - Click "Sign up" (use GitHub)

2. **Create new site**
   - Click "New site from Git"
   - Select your repo

3. **Configure build**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Show advanced"

4. **Add environment variables**
   - Key: `VITE_SUPABASE_URL`
   - Value: Your Supabase URL
   - Add new:
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: Your key

5. **Deploy**
   - Click "Deploy site"
   - Wait 2-3 minutes

6. **Get URL**
   - Netlify gives you a URL
   - Share with team!

## Option 3: Self-Hosted (More Control)

**Requirements**: VPS/Server with Node.js

### On Your Server

```bash
# Clone your repo
git clone your-repo

# Navigate to folder
cd delivery-app

# Install dependencies
npm install

# Build
npm run build

# Install production server
npm install -g serve

# Start server
serve -s dist -l 3000
```

Then access at `http://your-server-ip:3000`

**Or use Docker** for easier deployment.

## Option 4: Docker (DevOps)

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

### Build and Run

```bash
docker build -t delivery-app .
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  delivery-app
```

## Getting Your Own Domain (Optional)

### Using Free Domain

1. Get free domain from Freenom or similar
2. Point to your Vercel/Netlify deployment
3. Set up DNS records

### Using Paid Domain

1. Buy from GoDaddy, Namecheap, etc.
2. Configure DNS to point to Vercel/Netlify
3. Set up HTTPS (automatic)

**Cost**: $10-15/year

## Sharing with Employees

### Option A: Direct URL
```
https://delivery-app-xyz.vercel.app
```
→ Share via:
- Email
- WhatsApp
- Slack
- SMS
- QR code

### Option B: Custom Domain
```
https://delivery.yourcompany.com
```
→ More professional
→ Costs $10-15/year

### Option C: QR Code
Generate QR code pointing to your app URL → Employees scan with phone

## Testing Before Going Live

1. **Test on desktop**
   ```
   npm run dev
   ```

2. **Test on mobile**
   - Use phone browser on same network
   - Or test deployed version

3. **Create test order**
   - Verify it saves to cloud
   - Check Supabase dashboard

4. **Test export PDF**
   - Generate and download PDF

5. **Test from multiple devices**
   - Create order on phone
   - See it on desktop
   - Verify real-time sync

## Monitoring

### Check App Status

1. **Vercel**: https://vercel.com/dashboard
   - Shows deploy status
   - View logs
   - Rollback if issues

2. **Netlify**: https://netlify.com/sites
   - Deploy history
   - Build logs
   - Analytics

3. **Supabase**: https://supabase.com
   - Database size
   - Query performance
   - Backups

### Monitor Performance

- Check browser console for errors
- Monitor database query speed
- Watch storage usage monthly

## Troubleshooting Deployment

### "Cannot find environment variables"

```
❌ Problem: App shows error about missing Supabase
✅ Solution: 
   1. Go to your hosting dashboard
   2. Find "Environment Variables"
   3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   4. Redeploy
```

### "Build failed"

```
❌ Problem: Deployment shows red error
✅ Solution:
   1. Check build logs
   2. Run npm run build locally
   3. Fix errors locally
   4. Push to GitHub
   5. Redeploy
```

### "Orders not saving"

```
❌ Problem: App works but data doesn't appear in Supabase
✅ Solution:
   1. Check if .env.local has correct keys
   2. Verify Supabase table exists
   3. Check browser console for errors
   4. Test on deployed version
```

### "App is slow"

```
❌ Problem: Takes long to load/save
✅ Solution:
   1. Check internet speed
   2. Check Supabase query performance
   3. Consider upgrading Supabase plan
   4. Optimize database queries (advanced)
```

## Version Updates

### Deploy New Version

1. Make changes locally
2. Test with `npm run dev`
3. Build: `npm run build`
4. Push to GitHub:
   ```bash
   git add .
   git commit -m "New feature: xyz"
   git push
   ```
5. Vercel/Netlify auto-deploys!

### Rollback to Previous Version

**Vercel**:
1. Go to Deployments
2. Find previous version
3. Click "Promote to Production"

**Netlify**:
1. Go to Deploys
2. Find previous version
3. Click "Publish deploy"

## Security Checklist

- ✅ `.env.local` is in `.gitignore` (never commit secrets)
- ✅ Only use `anon` key (not service role key)
- ✅ Enable HTTPS (automatic on Vercel/Netlify)
- ✅ Regular Supabase backups (automatic)
- ✅ Monitor database usage

## Scaling

### If You Get Lots of Users

1. **Upgrade Supabase plan**
   - Free: 500MB, enough for ~200k orders
   - Pro: 1GB, enough for ~400k orders

2. **Add caching**
   - Reduces database queries
   - Faster response

3. **Add real-time sync**
   - Multiple employees see updates instantly
   - Already built-in Supabase

4. **Add authentication**
   - For larger teams
   - Prevent unauthorized access

## Maintenance Schedule

### Daily
- Employees use app
- Orders auto-save to cloud

### Weekly
- Monitor storage (no action usually needed)
- Check deployment status

### Monthly
- Export data backup
- Review error logs
- Check costs

### Yearly
- Plan for growth
- Consider feature additions
- Budget for domain renewal

## Getting Help

- **Vercel issues**: https://vercel.com/support
- **Netlify issues**: https://netlify.com/support
- **Supabase issues**: https://supabase.com/docs
- **App issues**: Check SETUP_DATABASE.md

## Next Steps

1. Choose hosting (Vercel recommended)
2. Deploy app
3. Share URL with employees
4. Monitor usage
5. Celebrate! 🎉

---

**Your app is now live and accessible from anywhere!**

Employees can use on:
- ✅ Phones (iOS/Android via browser)
- ✅ Tablets
- ✅ Laptops
- ✅ Desktops

All synced to cloud in real-time! 🚀
