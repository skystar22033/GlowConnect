# Deploying the Backend to Render

## 1. Push the backend to GitHub
```bash
cd glowconnect-backend
git init
git add .
git commit -m "Initial commit: GlowConnect backend"
git branch -M main
git remote add origin https://github.com/<your-username>/glowconnect-backend.git
git push -u origin main
```

## 2. Create a MongoDB Atlas cluster (if you haven't already)
1. Go to https://www.mongodb.com/cloud/atlas and create a free (M0) cluster.
2. Under **Database Access**, create a user with a strong password.
3. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) so Render can connect.
4. Get your connection string from **Connect → Drivers** — it looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/glowconnect?retryWrites=true&w=majority`

## 3. Create the Web Service on Render
1. Go to https://dashboard.render.com → **New → Web Service**.
2. Connect your GitHub repo (`glowconnect-backend`).
3. Configure:
   - **Name:** `glowconnect-api` (or anything you like)
   - **Region:** closest to your users
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (fine for development/demo)

## 4. Set environment variables
In the Render dashboard, go to **Environment** and add every variable from `.env.example`:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render sets this automatically, but you can leave it — the app reads `process.env.PORT`) |
| `MONGO_URI` | your Atlas connection string |
| `JWT_SECRET` | a long random string — generate with `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | from your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | from your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | from your Cloudinary dashboard |
| `CLIENT_URL` | your deployed Vercel frontend URL (e.g. `https://glowconnect.vercel.app`) — set this **after** you deploy the frontend in the next step |

## 5. Deploy
Click **Create Web Service**. Render will build and deploy automatically. Once live, your API will be reachable at something like:
```
https://glowconnect-api.onrender.com
```

Verify it's working:
```bash
curl https://glowconnect-api.onrender.com/api/health
```

## 6. Redeploying
Render auto-deploys on every push to `main`. To trigger a manual redeploy (e.g. after changing env vars), use the **Manual Deploy** button in the dashboard.

## Notes
- Free-tier Render services spin down after inactivity and take ~30-60s to wake on the next request — expected on the free tier, not a bug.
- Update `CLIENT_URL` any time your frontend's deployed URL changes, or CORS will block requests.
