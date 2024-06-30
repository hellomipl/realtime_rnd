const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const allowedOrigins = ['http://localhost:4200', 'http://192.168.1.21:4200'];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

const rooms = {}; // Object to store users in each room

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('create-room', (callback) => {
    const roomId = uuidv4();
    rooms[roomId] = [];
    socket.join(roomId);
    console.log(`Room created with ID: ${roomId}`);
    callback(roomId);
  });

  socket.on('join-room', (roomId, userId) => {
    console.log(`User ${userId} joining room: ${roomId}`);
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    if (!rooms[roomId].includes(userId)) {
      rooms[roomId].push(userId);
    }
    socket.join(roomId);
    console.log(`Room ${roomId} now has users: ${rooms[roomId].join(', ')}`);
    io.to(roomId).emit('user-connected', { userId, users: rooms[roomId] });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from room: ${roomId}`);
      rooms[roomId] = rooms[roomId].filter(id => id !== userId);
      console.log(`Room ${roomId} now has users: ${rooms[roomId].join(', ')}`);
      socket.to(roomId).emit('user-disconnected', { userId, users: rooms[roomId] });
    });

    socket.on('signal', (data) => {
      console.log(`Signal received from ${data.userId} in room ${data.room}`);
      io.to(data.room).emit('signal', data);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
