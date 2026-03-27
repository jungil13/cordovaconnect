const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./src/config/db');
const express = require('express');
const path = require('path');

require('dotenv').config();

connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Serve all static uploaded files (profiles, events, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this for production to frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
