'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');
const { connectDB } = require('./db');

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'], credentials: true },
  pingTimeout: 60000,
});

// Ensure dirs
['uploads','outputs','data'].forEach(d => fs.ensureDirSync(path.join(__dirname, d)));

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 300 }));

// Static outputs
app.use('/outputs', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'outputs')));

// Routes
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/image', require('./routes/image'));
app.use('/api/document', require('./routes/document'));
app.use('/api/tools', require('./routes/tools'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/seo', require('./routes/seo'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/chat', require('./routes/chat')(io));

// ✅ Root route (404 fix)
app.get('/', (req, res) => {
  res.send('Backend running 🚀');
});

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  time: new Date().toISOString(),
  mongo: process.env.MONGO_URI ? '✓ set' : '✗ not set',
}));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// Socket.io
io.on('connection', (socket) => {
  socket.on('join_chat', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('admin_join', () => {
    socket.join('admin_room');
  });

  socket.on('admin_reply', ({ userId, message }) => {
    io.to(`user_${userId}`).emit('admin_message', {
      message,
      fromAdmin: true,
      timestamp: new Date()
    });
  });
});

// Start server
(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.log("❌ MongoDB Error:", err.message);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})();

module.exports = { app, io };