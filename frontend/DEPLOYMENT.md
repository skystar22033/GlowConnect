# Deploying the Frontend to Vercel

## 1. Push the frontend to GitHub
```bash
cd glowconnect-frontend
git init
git add .
git commit -m "Initial commit: GlowConnect frontend"
git branch -M main
git remote add origin https://github.com/<your-username>/glowconnect-frontend.git
git push -u origin main
```

## 2. Import the project on Vercel
1. Go to https://vercel.com/new and import the `glowconnect-frontend` GitHub repo.
2. Vercel auto-detects Vite. Confirm these settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

## 3. Set the environment variable
Under **Settings → Environment Variables**, add:

| Key | Value |
|---|---|
| `VITE_API_URL` | your deployed Render backend URL + `/api`, e.g. `https://glowconnect-api.onrender.com/api` |

Apply it to all environments (Production, Preview, Development).

## 4. Deploy
Click **Deploy**. Vercel builds and hosts the app, giving you a URL like:
```
https://glowconnect.vercel.app
```

## 5. Connect the two halves
Go back to your Render backend's environment variables and set:
```
CLIENT_URL=https://glowconnect.vercel.app
```
Then trigger a redeploy on Render so the new CORS origin takes effect.

## 6. Verify end-to-end
Open your Vercel URL, register a new account, create a post with an image, and confirm it appears in the feed — this exercises the frontend, backend, MongoDB, and Cloudinary all at once.

## Redeploys
Vercel automatically redeploys on every push to `main`, and creates preview deployments for pull requests / other branches.

## Custom domain (optional)
Under **Settings → Domains**, add your own domain and follow Vercel's DNS instructions.
