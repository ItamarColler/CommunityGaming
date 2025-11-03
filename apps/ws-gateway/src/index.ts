import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    // Handle realtime messages (presence, matchmaking, chat)
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;

server.listen(PORT, () => {
  console.log(`WebSocket Gateway running on port ${PORT}`);
});
