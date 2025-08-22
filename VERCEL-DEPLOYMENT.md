# Vercel Frontend Deployment Guide

## Steps to Deploy Frontend to Vercel

Now that your backend is successfully deployed to Railway, follow these steps to deploy your Frontend to Vercel:

### 1. Prepare Your Frontend Code

✅ I've already updated your code:
- Modified `Frontend/src/services/api.js` to use environment variables
- Created `Frontend/vercel.json` for SPA routing

### 2. Push Changes to GitHub

```bash
cd "C:\Users\NEERAJ\Desktop\AI-PSM - Copy"
git add Frontend/src/services/api.js Frontend/vercel.json
git commit -m "Update API config for production and add Vercel config"
git push
```

### 3. Sign Up/Login to Vercel

- Go to [vercel.com](https://vercel.com)
- Sign up or log in (GitHub login recommended)

### 4. Import Your Repository

- Click "Add New..." → "Project"
- Connect your GitHub account if not already connected
- Find and select your repository
- If you don't see it, click "Configure GitHub App" to grant access

### 5. Configure Project Settings

- **Framework Preset**: Select "Vite"
- **Root Directory**: Set to `Frontend` (very important!)
- **Build Command**: Leave as default (`npm run build`)
- **Output Directory**: Leave as default (`dist`)

### 6. Configure Environment Variables

Add this environment variable:
- **Name**: `VITE_API_URL`
- **Value**: `https://angelic-unity.up.railway.app/api` (your Railway backend URL + /api)

### 7. Deploy

- Click "Deploy"
- Wait for the build and deployment to complete

### 8. Test Your Deployed Frontend

- Once deployed, Vercel will provide a URL (like `https://your-project.vercel.app`)
- Open the URL and test that your frontend can connect to your Railway backend
- Check browser console for any API connection errors

### 9. Add Custom Domain (Optional)

- In your Vercel project dashboard, go to "Settings" → "Domains"
- Add your custom domain if you have one

### 10. Update Railway Backend CORS Settings

After your frontend is deployed, update your Railway backend environment variables:
- Add `FRONTEND_URL=https://your-project.vercel.app` (your Vercel URL)
- Set `ALLOW_ALL_ORIGINS=false` (once testing is complete)

## Troubleshooting

### API Connection Issues
- Check browser console for CORS errors
- Verify `VITE_API_URL` is set correctly in Vercel
- Ensure your Railway backend has the correct CORS settings

### Build Errors
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Verify the root directory is set to `Frontend`

### Routing Issues
- The `vercel.json` file should handle SPA routing
- If you get 404s on refresh, check that `rewrites` are configured correctly

## Next Steps After Deployment

- Set up a custom domain if needed
- Configure automatic deployments from GitHub
- Set up preview deployments for pull requests
