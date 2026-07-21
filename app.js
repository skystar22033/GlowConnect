const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
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

// ============================================
// 🏠 ROOT ROUTE - ADD THIS!
// ============================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to GlowConnect API!',
    version: '1.0.0',
    status: '🚀 Server is running',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      users: {
        profile: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        search: 'GET /api/users/search?q='
      }
    },
    documentation: 'https://github.com/yourusername/GlowConnect',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Health check
// ============================================
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'GlowConnect API is running',
    database: 'Connected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 + centralized error handler (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;