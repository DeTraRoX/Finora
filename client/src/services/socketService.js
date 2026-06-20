import { io } from 'socket.io-client';

let socket = null;

/**
 * Establish Socket.io connection using current JWT
 * @param {string} token - User JWT
 * @param {function} onNotificationReceived - Callback for real-time messages
 */
export const connectSocket = (token, onNotificationReceived) => {
  if (socket) {
    if (socket.connected) return socket;
    socket.connect();
    return socket;
  }

  // Connect to the base origin (proxied during dev, direct in production)
  const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
  socket = io(socketUrl, {
    auth: { token },
    // Use websocket transport predominantly
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Real-time notification engine online.');
  });

  socket.on('notification', (data) => {
    console.log('Real-time Event:', data);
    if (onNotificationReceived) {
      onNotificationReceived(data);
    }
  });

  socket.on('disconnect', () => {
    console.log('Real-time connection closed.');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

/**
 * Disconnect socket connection on logout
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Real-time connection terminated.');
  }
};

/**
 * Get active socket instance
 */
export const getSocket = () => socket;
