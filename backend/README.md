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

Server starts onn `http://localhost:5000` by default. Health check: `GET /api/health`.

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

---

# Phase 2: Core Features APIs

Adds posts, comments, likes, follow/unfollow, personalized feed, and Cloudinary image uploads.

## New Files

```
config/cloudinary.js          # Cloudinary SDK config
middleware/upload.js          # multer + Cloudinary storage (5MB limit, images only)
models/Post.js
models/Comment.js
controllers/postController.js
controllers/commentController.js
routes/postRoutes.js
routes/commentRoutes.js
validators/postValidators.js
```
`userController.js` gained `toggleFollow`; `userRoutes.js` gained `POST /:id/follow`.

## Additional Setup

Fill in the Cloudinary variables in `.env` (free tier is enough for development):
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Get these from your [Cloudinary dashboard](https://cloudinary.com/console) after creating a free account.

## API Reference — Phase 2

### Posts

| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/posts` | Private | `multipart/form-data`: `content` (text) + optional `image` (file) |
| GET | `/api/posts/:id` | Public | Populated author + comments |
| PUT | `/api/posts/:id` | Private (owner) | Same fields as create; replaces image if a new one is sent |
| DELETE | `/api/posts/:id` | Private (owner) | Also deletes its comments + Cloudinary image |
| GET | `/api/posts/feed?page=1&limit=10` | Private | Own posts + posts from followed users, newest first, paginated |
| GET | `/api/posts/user/:userId?page=1&limit=10` | Public | All posts by a specific user, paginated |
| POST | `/api/posts/:id/like` | Private | Toggles like/unlike |

### Comments

| Method | Route | Access |
|---|---|---|
| POST | `/api/posts/:id/comments` | Private — body: `{ content }` |
| DELETE | `/api/comments/:id` | Private (owner only) |

### Follow

| Method | Route | Access |
|---|---|---|
| POST | `/api/users/:id/follow` | Private — toggles follow/unfollow |

**Create a post with an image (curl example):**
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer <token>" \
  -F "content=Hello GlowConnect!" \
  -F "image=@/path/to/photo.jpg"
```

**Get your feed:**
```bash
curl http://localhost:5000/api/posts/feed?page=1&limit=10 \
  -H "Authorization: Bearer <token>"
```

## Testing This Phase

1. Register/login two users (User A and User B).
2. As User A, create a post (with and without an image).
3. As User B, follow User A, then `GET /api/posts/feed` — User A's post should now appear.
4. As User B, like the post, then unlike it (call the same endpoint twice) and check `likesCount`.
5. As User B, add a comment; as User A, confirm `GET /api/posts/:id` shows the populated comment.
6. Try deleting someone else's post/comment — should return `403`.
7. Delete your own post — confirm its comments are removed too (`GET /api/posts/:id` → `404`).
