const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;
const userSockets = new Map(); // Maps userId -> Set of socketIds for multiple tabs

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*', // Allow all origins for dev simplicity
      methods: ['GET', 'POST'],
    },
  });

  // Authentication Middleware for Socket Connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'finora_super_secret_jwt_key_12345_67890');
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User connected to socket: ${userId} (${socket.id})`);

    // Join user-specific room
    socket.join(userId);

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    socket.on('disconnect', () => {
      console.log(`User disconnected from socket: ${userId} (${socket.id})`);
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Send real-time notification to a specific user
const sendNotification = (userId, type, payload) => {
  if (io) {
    const targetRoom = String(userId);
    io.to(targetRoom).emit('notification', {
      type,
      payload,
      timestamp: new Date(),
    });
    console.log(`Socket notification sent to user ${userId} (${type})`);
  }
};

module.exports = {
  initSocket,
  getIO,
  sendNotification,
};
