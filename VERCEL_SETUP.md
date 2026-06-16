# Vercel Deployment Guide

Since Vercel is detecting Python files in the repo, here's the recommended approach:

## Option 1: Deploy Dashboard Folder Only (Recommended)

1. Go to https://vercel.com/new
2. Select "Other" template
3. Paste this GitHub repo URL: `https://github.com/a-r-a-n/OllamaPlaylist`
4. In the settings:
   - **Root Directory**: `dashboard`
   - **Build Command**: `echo 'static'`
   - **Install Command**: `echo 'skip'`
5. Deploy

This deploys ONLY the HTML dashboard without trying to build the Python backend.

## Option 2: Move Python Backend Elsewhere

Keep the repo GitHub-only for the backend code, and deploy just the dashboard folder:

```bash
# Clone just the dashboard folder
git clone --sparse https://github.com/a-r-a-n/OllamaPlaylist
cd OllamaPlaylist
git sparse-checkout set dashboard
# Then deploy from Vercel UI
```

## Option 3: Deploy Backend Separately

Deploy the Python backend (for `/api/data` endpoint) to Vercel Functions if you need live history.json data:

```bash
# Create an api/ folder with Node.js function to serve history.json
vercel deploy --prod
```

## Current Status

- ✅ GitHub: Code pushed to `github.com/a-r-a-n/OllamaPlaylist`
- ✅ Dashboard: Fully functional (available in `/dashboard` folder)
- ⏳ Vercel: Needs manual configuration (Vercel detects Python files)

## Next Step

Visit https://vercel.com/new and select "Other" → paste your GitHub repo → set Root Directory to `dashboard`
