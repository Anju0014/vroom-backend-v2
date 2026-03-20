import { Server, Socket } from 'socket.io';

export default function notificationSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined notifications (socket: ${socket.id})`);
    }

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from notifications`);
    });
  });
}
