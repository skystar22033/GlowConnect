# GlowConnect Backend — Phase 1: Backend Foundation

Authentication + user management APIs for the GlowConnect social media app.

## Folder Structure

```
glowconnect-backend/
├── config/
│   └── db.js                  # Mongoose connection
├── controllers/
│   ├── authController.js      # register, login, verify, me
│   └── userController.js      # get/update profile, search
├── middleware/
│   ├── auth.js                # JWT "protect" middleware
│   ├── errorHandler.js        # centralized error + 404 handler
│   └── validate.js            # express-validator result handler
├── models/
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── userRoutes.js
├── validators/
│   ├── authValidators.js
│   └── userValidators.js
├── utils/
│   ├── apiResponse.js         # success()/error() response helpers
│   ├── ApiError.js            # custom error class
│   └── generateToken.js
├── app.js                     # Express app (middleware + routes)
├── server.js                  # entry point, connects DB, starts app
├── .env.example
└── package.json
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then fill in:
   - `MONGO_URI` — your MongoDB Atlas connection string (or local `mongodb://localhost:27017/glowconnect`)
   - `JWT_SECRET` — any long random string (e.g. generate with `openssl rand -hex 32`)
   - `CLIENT_URL` — your frontend origin, for CORS (`http://localhost:3000` in dev)
   - Cloudinary vars are not used until Phase 2, but you can leave placeholders for now.

3. **Run in development** (auto-restarts on file changes)
   ```bash
   npm run dev
   ```

4. **Run in production**
   ```bash
   npm start
   ```

Server starts on `http://localhost:5000` by default. Health check: `GET /api/health`.

## API Reference

All responses follow this shape:
```json
{ "success": true, "message": "...", "data": { ... } }
{ "success": false, "message": "...", "errors": [ ... ] }
```

### Auth

| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/api/auth/register` | Public | `{ username, email, password, fullName }` |
| POST | `/api/auth/login` | Public | `{ email, password }` |
| GET | `/api/auth/verify` | Private | — (Bearer token) |
| GET | `/api/auth/me` | Private | — (Bearer token) |

**Register example**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ayesha","email":"ayesha@example.com","password":"password123","fullName":"Ayesha Altaf"}'
```
Response includes `data.token` — send it on subsequent requests as:
`Authorization: Bearer <token>`

**Login example**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ayesha@example.com","password":"password123"}'
```

### Users

| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/api/users/search?q=aye` | Public | Searches username & fullName |
| GET | `/api/users/:id` | Public | Includes followers/following + counts |
| PUT | `/api/users/:id` | Private (owner only) | Body: any of `fullName`, `bio`, `profileImage` |

## Security Notes

- Passwords are hashed with bcrypt (`select: false` on the schema so they're never returned by default).
- JWT tokens expire per `JWT_EXPIRES_IN` (default 7 days).
- `helmet` sets standard security headers; CORS is locked to `CLIENT_URL`.
- Rate limiting: 300 req/15min globally, 20 req/15min on `/api/auth` to slow brute-force attempts.
- Profile updates are restricted to the token owner and use a field whitelist (no mass-assignment).
- Mongoose schema validation + `express-validator` run on all write endpoints.

## Testing This Phase

1. Start the server (`npm run dev`).
2. Hit `GET /api/health` — should return `200`.
3. Register a user, then log in with the same credentials.
4. Use the returned token to call `GET /api/auth/me` and `GET /api/auth/verify`.
5. Try `GET /api/users/:id` with the id from step 3.
6. Try `PUT /api/users/:id` as the owner (should succeed) and as a different logged-in user (should return `403`).
7. Try `GET /api/users/search?q=<part of username>`.

A Postman collection will be included in Phase 4 once all endpoints exist.

## What's Next — Phase 2

Post/Comment models, feed with pagination, likes, follow/unfollow, and Cloudinary image uploads.

---
✅ **Phase 1 complete.** Let me know when you'd like me to proceed to Phase 2, or if you'd like any changes to this phase first.
