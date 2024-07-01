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
app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
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

const rooms = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('create-room', (roomId) => {
    rooms[roomId] = { offer: null, candidates: [], viewers: [] };
    socket.join(roomId);
    console.log(`Room ${roomId} created`);
    socket.emit('room-created', roomId);
  });

  socket.on('join-room', (roomId) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].viewers.push(socket.id);
      console.log(`Client joined room ${roomId}`);
      io.to(roomId).emit('viewer-joined', rooms[roomId].viewers);

      if (rooms[roomId].offer) {
        console.log(`Sending existing offer to new client in room ${roomId}`);
        socket.emit('offer', rooms[roomId].offer);
      }
      // Send all stored candidates to the newly joined client
      rooms[roomId].candidates.forEach(candidate => {
        console.log(`Sending stored candidate to new client in room ${roomId}`);
        socket.emit('candidate', candidate);
      });
    } else {
      socket.emit('room-not-found');
    }
  });

  socket.on('offer', ({ roomId, offer }) => {
    rooms[roomId].offer = offer;
    console.log(`Offer stored for room ${roomId}`);
    socket.to(roomId).emit('offer', offer);
  });

  socket.on('answer', ({ roomId, answer }) => {
    console.log(`Answer received for room ${roomId}`);
    socket.to(roomId).emit('answer', answer);
  });

  socket.on('candidate', ({ roomId, candidate }) => {
    rooms[roomId].candidates.push(candidate);
    console.log(`Candidate stored for room ${roomId}`);
    socket.to(roomId).emit('candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    for (const roomId in rooms) {
      const index = rooms[roomId].viewers.indexOf(socket.id);
      if (index !== -1) {
        rooms[roomId].viewers.splice(index, 1);
        io.to(roomId).emit('viewer-left', rooms[roomId].viewers);
      }
    }
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Server running on port ${port}`));
