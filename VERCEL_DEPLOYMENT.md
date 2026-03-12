# AK Fashion House - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
3. **GitHub Repository**: Push your code to GitHub (optional but recommended)

---

## Step 1: Prepare MongoDB Atlas

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign in or create a free account
3. Create a new cluster (Free M0 Sandbox tier is sufficient)
4. Wait for cluster to be created (takes 3-5 minutes)

### 1.2 Configure Network Access

1. In Atlas dashboard, go to **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - This allows Vercel serverless functions to connect
4. Click **Confirm**

### 1.3 Create Database User

1. Go to **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `akfashion` (or your choice)
5. Password: Generate a secure password (save it!)
6. Database User Privileges: **Atlas Admin**
7. Click **Add User**

### 1.4 Get Connection String

1. Go to **Database** → **Connect**
2. Click **Connect your application**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://akfashion:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Save this connection string for later

---

## Step 2: Deploy to Vercel

### Method A: Deploy via GitHub (Recommended)

#### 2.1 Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Vercel deployment"

# Create repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/ak-fashion-house.git
git branch -M main
git push -u origin main
```

#### 2.2 Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your GitHub repository
4. Click **Import**

### Method B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

---

## Step 3: Configure Environment Variables

### 3.1 In Vercel Dashboard

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `MONGO_URL` | Your MongoDB Atlas connection string | All |
| `DB_NAME` | `akfashion_pos` | All |
| `JWT_SECRET_KEY` | Generate random string (e.g., use: `openssl rand -hex 32`) | All |
| `CORS_ORIGINS` | `*` | All |

**Example JWT Secret Generation:**
```bash
# On Mac/Linux
openssl rand -hex 32

# Or use online generator
# https://www.grc.com/passwords.htm
```

### 3.2 Frontend Environment Variables

The frontend needs to know the backend URL. Add:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `REACT_APP_BACKEND_URL` | Your Vercel deployment URL | All |

**Note**: After first deployment, Vercel gives you a URL like `https://your-project.vercel.app`. Use this as `REACT_APP_BACKEND_URL`.

---

## Step 4: Configure Build Settings

### 4.1 Root Directory Configuration

In Vercel dashboard:
1. Go to **Settings** → **General**
2. Set **Root Directory** to `.` (current directory)

### 4.2 Build Settings

Vercel should auto-detect:
- **Framework Preset**: Create React App
- **Build Command**: `cd frontend && yarn vercel-build`
- **Output Directory**: `frontend/build`

If not auto-detected, set these manually in **Settings** → **Build & Development Settings**

---

## Step 5: Deploy and Test

### 5.1 Trigger Deployment

1. Click **Deployments** tab
2. Click **Redeploy** or push a new commit to GitHub
3. Wait for build to complete (takes 2-5 minutes)

### 5.2 Update Frontend Environment Variable

After first successful deployment:
1. Copy your Vercel deployment URL (e.g., `https://ak-fashion-house.vercel.app`)
2. Go to **Settings** → **Environment Variables**
3. Update `REACT_APP_BACKEND_URL` with your deployment URL
4. Redeploy the project

### 5.3 Test the Application

1. Visit your Vercel URL
2. Test login with credentials:
   - **Cashier**: `cashier1` / `cashier123`
   - **Admin**: `akfashionhouse` / `admin1234`
3. Test all features:
   - Dashboard metrics
   - Billing and sales
   - Products management
   - Reports and exports

---

## Step 6: Initialize Default Data

The application will automatically initialize:
- 3 default users (admin, cashier1, cashier2)
- Default business settings

On first deployment, these will be created automatically when you first access the API.

---

## Troubleshooting

### Issue: MongoDB Connection Failed

**Solution:**
- Verify MongoDB Atlas connection string is correct
- Check that IP whitelist includes 0.0.0.0/0
- Ensure database user has correct permissions
- Replace `<password>` in connection string with actual password

### Issue: API Routes Not Working

**Solution:**
- Ensure `vercel.json` is at root directory
- Check that `/api/*` routes are configured correctly
- Verify backend environment variables are set

### Issue: Frontend Build Fails

**Solution:**
- Check that `REACT_APP_BACKEND_URL` is set
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Issue: CORS Errors

**Solution:**
- Set `CORS_ORIGINS=*` in Vercel environment variables
- Or set specific origin: `CORS_ORIGINS=https://your-app.vercel.app`

### Issue: JWT Authentication Fails

**Solution:**
- Ensure `JWT_SECRET_KEY` is set in environment variables
- Must be the same across all function invocations
- Redeploy after setting environment variables

---

## Custom Domain (Optional)

### Add Your Own Domain

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `pos.akfashion.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

---

## Environment-Specific Configurations

### Production
- Set `CORS_ORIGINS` to your specific domain
- Use strong `JWT_SECRET_KEY`
- Enable MongoDB Atlas advanced security features

### Development
- Use separate MongoDB database or cluster
- Can use broader CORS settings for testing

---

## Maintenance

### Updating the Application

**Via GitHub:**
```bash
git add .
git commit -m "Update message"
git push origin main
```
Vercel will automatically deploy the changes.

**Via Vercel CLI:**
```bash
vercel --prod
```

### Monitoring

1. Go to Vercel dashboard → **Analytics**
2. Monitor:
   - Request count
   - Error rates
   - Response times
3. Check **Logs** for debugging

### Database Backups

1. MongoDB Atlas provides automatic backups
2. Go to Atlas → **Backup**
3. Configure backup schedule and retention

---

## Cost Considerations

### Free Tier Limits (Vercel)
- 100 GB bandwidth per month
- Unlimited requests
- Serverless function execution: 100 GB-hours

### Free Tier Limits (MongoDB Atlas)
- 512 MB storage
- Shared CPU
- Suitable for small to medium retail operations

### Scaling Up
- Vercel Pro: $20/month (team features)
- MongoDB Atlas M10: $57/month (dedicated cluster)

---

## Security Best Practices

1. **Regular Updates**: Keep dependencies updated
2. **Strong Passwords**: Use complex JWT secrets
3. **IP Whitelisting**: Restrict MongoDB access if possible
4. **HTTPS Only**: Vercel provides automatic SSL
5. **Environment Variables**: Never commit secrets to git
6. **Database Backups**: Regular backups in Atlas
7. **Rate Limiting**: Consider adding rate limiting for API routes

---

## Support

For issues:
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas Docs: [docs.atlas.mongodb.com](https://www.mongodb.com/docs/atlas/)
- GitHub Issues: Create issues in your repository

---

## Quick Reference

### Essential URLs
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- GitHub: https://github.com

### Default Credentials
- Admin: `akfashionhouse` / `admin1234`
- Cashier 1: `cashier1` / `cashier123`
- Cashier 2: `cashier2` / `cashier234`

### Environment Variables Summary
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=akfashion_pos
JWT_SECRET_KEY=your-secret-key-here
CORS_ORIGINS=*
REACT_APP_BACKEND_URL=https://your-app.vercel.app
```

---

## Success Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Connection string obtained
- [ ] Code pushed to GitHub
- [ ] Project imported to Vercel
- [ ] All environment variables configured
- [ ] First deployment successful
- [ ] `REACT_APP_BACKEND_URL` updated
- [ ] Redeployed after URL update
- [ ] Login tested successfully
- [ ] All features working
- [ ] Custom domain configured (optional)

---

**Congratulations! Your AK Fashion House POS system is now live on Vercel! 🎉**
