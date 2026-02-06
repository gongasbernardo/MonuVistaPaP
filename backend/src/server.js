const path = require('path');
// Load .env from backend/ first, fall back to project root
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.JWT_SECRET) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
}
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');

// Initialize express
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible to controllers
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-group', (groupId) => {
    socket.join(groupId);
    console.log(`Socket ${socket.id} joined group ${groupId}`);
  });

  socket.on('leave-group', (groupId) => {
    socket.leave(groupId);
    console.log(`Socket ${socket.id} left group ${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/album', require('./routes/album'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
