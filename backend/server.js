require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// ✅ Store online users
const onlineUsers = new Map();

const startServer = async () => {
  await connectDB();
  
  const server = http.createServer(app);
  
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('🔗 New client connected:', socket.id);

    const token = socket.handshake.auth.token;
    let userId = null;

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        socket.userId = userId;
        
        // ✅ Add user to online users
        onlineUsers.set(userId, socket.id);
        
        // ✅ Broadcast online status to all users
        io.emit('user-online', { userId, isOnline: true });
        
        console.log('👤 User authenticated:', userId);
        console.log('📊 Online users:', Array.from(onlineUsers.keys()));
      } catch (error) {
        console.log('❌ Invalid token');
      }
    }

    // Join user's room
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`📢 User ${userId} joined their room`);
    }

    // Handle sending messages
    socket.on('send-message', (data) => {
      console.log('📨 Message received:', data);
      io.to(`user_${data.recipient?._id || data.recipient}`).emit('new-message', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
      
      // ✅ Remove user from online users
      if (userId) {
        onlineUsers.delete(userId);
        io.emit('user-offline', { userId, isOnline: false });
        console.log('📊 Online users:', Array.from(onlineUsers.keys()));
      }
    });
  });

  // ✅ Make io and onlineUsers available to routes
  app.set('io', io);
  app.set('onlineUsers', onlineUsers);

  server.listen(PORT, () => {
    console.log(`GlowConnect API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});