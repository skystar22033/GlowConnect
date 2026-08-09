require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  // ✅ Create HTTP server
  const server = http.createServer(app);
  
  // ✅ Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // ✅ Socket.io connection handler
  io.on('connection', (socket) => {
    console.log('🔗 New client connected:', socket.id);

    // Get user from token
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        console.log('👤 User authenticated:', decoded.id);
      } catch (error) {
        console.log('❌ Invalid token');
      }
    }

    // Join user's room for private messages
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
      console.log(`📢 User ${socket.userId} joined their room`);
    }

    // Handle sending messages
    socket.on('send-message', (data) => {
      console.log('📨 Message received:', data);
      // Emit to recipient's room
      io.to(`user_${data.recipient}`).emit('new-message', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  // ✅ Store io instance for use in controllers
  app.set('io', io);

  // ✅ Start server
  server.listen(PORT, () => {
    console.log(`GlowConnect API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();

// Guard against unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});