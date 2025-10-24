import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';
import type { WsClientToServer, WsServerToClient } from '@shared/ws/messages';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(ENV.WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return socket;
};

export const sendMessage = (msg: WsClientToServer) => {
  const ws = getSocket();
  ws.emit(msg.t, msg);
};

export const onMessage = <T extends WsServerToClient['t']>(
  type: T,
  handler: (data: Extract<WsServerToClient, { t: T }>) => void,
) => {
  const ws = getSocket();
  const wrappedHandler = (msg: WsServerToClient) => {
    if (msg.t === type) {
      handler(msg as Extract<WsServerToClient, { t: T }>);
    }
  };
  ws.on('message', wrappedHandler);
  return () => ws.off('message', wrappedHandler);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
