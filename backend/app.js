const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const followRoutes = require('./routes/followRoutes');
const feedRoutes = require('./routes/feedRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes'); // ✅ Already imported
const savedRoutes = require('./routes/savedRoutes');
const hashtagRoutes = require('./routes/hashtagRoutes');
const pollRoutes = require('./routes/pollRoutes');
const reactionRoutes = require('./routes/reactionRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const highlightRoutes = require('./routes/highlightRoutes');
const groupRoutes = require('./routes/groupRoutes');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS - restrict to the configured frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic rate limiting to slow down brute-force / abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', apiLimiter);

// Tighter limiter specifically on auth endpoints to slow credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
});
app.use('/api/auth', authLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'GlowConnect API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', chatRoutes); // ✅ ADD THIS LINE
app.use('/api/posts', savedRoutes);
app.use('/api/hashtags', hashtagRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/posts', scheduleRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/groups', groupRoutes);

// 404 + centralized error handler (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;