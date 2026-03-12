# Quick Vercel Deployment Guide

## 🚀 Fast Track Deployment (5 Minutes)

### Step 1: MongoDB Atlas Setup (2 minutes)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Sign up (free)
2. Create Cluster → Choose **Free M0 Sandbox**
3. **Network Access** → Add IP: `0.0.0.0/0` (Allow all)
4. **Database Access** → Add User: 
   - Username: `akfashion`
   - Password: (generate strong password)
5. **Connect** → Get connection string:
   ```
   mongodb+srv://akfashion:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/
   ```

### Step 2: Deploy to Vercel (2 minutes)
1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/ak-fashion-pos.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → Import Project → Select Repository

### Step 3: Environment Variables (1 minute)
In Vercel → Settings → Environment Variables, add:

```
MONGO_URL = mongodb+srv://akfashion:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/
DB_NAME = akfashion_pos
JWT_SECRET_KEY = (generate: openssl rand -hex 32)
CORS_ORIGINS = *
```

After first deployment, add:
```
REACT_APP_BACKEND_URL = https://your-app-name.vercel.app
```

Then **Redeploy**.

### Step 4: Done! ✅
Visit: `https://your-app-name.vercel.app`

Login:
- Cashier: `cashier1` / `cashier123`
- Admin: `akfashionhouse` / `admin1234`

---

## Build Configuration

Vercel should auto-detect these settings. If not, set manually:

**Framework Preset**: Create React App
**Root Directory**: `./`
**Build Command**: 
```bash
cd frontend && yarn install && yarn build
```
**Output Directory**: `frontend/build`
**Install Command**: 
```bash
cd frontend && yarn install
```

---

## Troubleshooting

### "Build failed"
- Check that `frontend/package.json` exists
- Ensure all dependencies are listed
- Check build logs for specific errors

### "API not working"
- Verify environment variables are set
- Check MongoDB connection string
- Ensure `/api` routes are configured in `vercel.json`

### "Database connection failed"
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check username and password in connection string
- Test connection string locally first

---

## Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| `MONGO_URL` | MongoDB Atlas connection string | ✅ Yes |
| `DB_NAME` | Database name (e.g., `akfashion_pos`) | ✅ Yes |
| `JWT_SECRET_KEY` | Random secret (32+ chars) | ✅ Yes |
| `CORS_ORIGINS` | `*` or your domain | ✅ Yes |
| `REACT_APP_BACKEND_URL` | Your Vercel URL | ✅ Yes (after first deploy) |

---

## Important Notes

1. **First deployment**: App may not work immediately. After getting Vercel URL, add it as `REACT_APP_BACKEND_URL` and redeploy.

2. **MongoDB Atlas**: Free tier (M0) is sufficient for small to medium operations.

3. **Custom Domain**: Add in Vercel → Settings → Domains after deployment.

4. **Auto Deploy**: Every push to GitHub main branch triggers automatic deployment.

---

For detailed instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
