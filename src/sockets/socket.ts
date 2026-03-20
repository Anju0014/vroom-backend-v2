import { Server } from 'socket.io';
import http from 'http';
import bookingSocket from '@sockets/bookingSocket';
import chatSocket from '@sockets/chatSocket';
import notificationSocket from '@sockets/notificationSocket';
import videoCallSocket from './videoCallSockets';

let io: Server;

export const initSockets = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  bookingSocket(io);
  chatSocket(io);
  notificationSocket(io);
  videoCallSocket(io);

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
