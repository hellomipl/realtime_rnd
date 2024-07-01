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
  console.log('New client connected');

  socket.on('create-room', (roomId) => {
    rooms[roomId] = { offer: null, candidates: {}, viewers: [] };
    socket.join(roomId);
    console.log(`Room ${roomId} created`);
    socket.emit('room-created', roomId);
  });

  socket.on('join-room', (roomId) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].viewers.push(socket.id);
      console.log(`Client joined room ${roomId}`);
      io.to(roomId).emit('viewer-joined', socket.id);
    } else {
      socket.emit('room-not-found');
    }
  });

  socket.on('offer', ({ roomId, viewerId, offer }) => {
    rooms[roomId].offer = offer;
    console.log(`Offer stored for room ${roomId} to viewer ${viewerId}`);
    socket.to(viewerId).emit('offer', offer);
  });

  socket.on('answer', ({ roomId, viewerId, answer }) => {
    console.log(`Answer received for room ${roomId} from viewer ${viewerId}`);
    socket.to(roomId).emit('answer', { viewerId, answer });
  });

  socket.on('candidate', ({ roomId, viewerId, candidate }) => {
    if (!rooms[roomId].candidates[viewerId]) {
      rooms[roomId].candidates[viewerId] = [];
    }
    rooms[roomId].candidates[viewerId].push(candidate);
    console.log(`Candidate stored for room ${roomId} and viewer ${viewerId}`);
    socket.to(viewerId).emit('candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    for (const roomId in rooms) {
      const index = rooms[roomId].viewers.indexOf(socket.id);
      if (index !== -1) {
        rooms[roomId].viewers.splice(index, 1);
        io.to(roomId).emit('viewer-left', socket.id);
      }
    }
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Server running on port ${port}`));
