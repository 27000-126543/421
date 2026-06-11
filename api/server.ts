import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  socket.on('battle_action', (data: { battleId: string; action: string }) => {
    io.to(data.battleId).emit('battle_update', {
      battleId: data.battleId,
      action: data.action,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('dream_event', (data: { dreamId: string; event: string }) => {
    io.to(data.dreamId).emit('dream_event', data);
  });

  socket.on('market_update', () => {
    io.emit('market_updated', { timestamp: new Date().toISOString() });
  });

  socket.on('notification', (data: { playerId: string; message: string }) => {
    io.to(`player_${data.playerId}`).emit('notification', {
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
  console.log(`Socket.IO ready for real-time communication`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { io };
export default app;