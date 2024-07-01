const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const allowedOrigins = ['http://localhost:4200', 'http://192.168.1.21:4200'];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('create-room', (roomId) => {
    rooms[roomId] = { offer: null, candidates: {}, viewers: [] };
    socket.join(roomId);
    console.log(`Room ${roomId} created by ${socket.id}`);
    socket.emit('room-created', roomId);
  });

  socket.on('join-room', ({ roomId, viewerId }) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].viewers.push(viewerId);
      rooms[roomId].candidates[viewerId] = [];
      console.log(`Client ${viewerId} joined room ${roomId}`);
      io.to(roomId).emit('viewer-joined', { viewers: rooms[roomId].viewers, viewerId });

      if (rooms[roomId].offer) {
        console.log(`Sending stored offer to viewer ${viewerId}`);
        socket.emit('offer', { viewerId, offer: rooms[roomId].offer });
      }

      rooms[roomId].candidates[viewerId].forEach(candidate => {
        console.log(`Sending stored candidate to viewer ${viewerId}`);
        socket.emit('candidate', { viewerId, candidate });
      });
    } else {
      console.log(`Room not found: ${roomId}`);
      socket.emit('room-not-found');
    }
  });

  socket.on('offer', ({ roomId, viewerId, offer }) => {
    rooms[roomId].offer = offer;
    console.log(`Received offer from ${socket.id} for viewer ${viewerId} in room ${roomId}`);
    io.to(viewerId).emit('offer', { viewerId, offer });
  });

  socket.on('answer', ({ roomId, viewerId, answer }) => {
    console.log(`Received answer from viewer ${viewerId} in room ${roomId}`);
    io.to(roomId).emit('answer', { viewerId, answer });
  });

  socket.on('candidate', ({ roomId, viewerId, candidate }) => {
    rooms[roomId].candidates[viewerId].push(candidate);
    console.log(`Received candidate from ${socket.id} for viewer ${viewerId} in room ${roomId}`);
    io.to(viewerId).emit('candidate', { viewerId, candidate });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
    for (const roomId in rooms) {
      const index = rooms[roomId].viewers.indexOf(socket.id);
      if (index !== -1) {
        rooms[roomId].viewers.splice(index, 1);
        delete rooms[roomId].candidates[socket.id];
        io.to(roomId).emit('viewer-left', rooms[roomId].viewers);
      }
    }
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Server running on port ${port}`));
