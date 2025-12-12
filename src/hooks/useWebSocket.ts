import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketData {
  type: 'sensor' | 'location' | 'notification';
  data: any;
  petId?: string;
  collarId?: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketData | null;
  sendMessage: (message: any) => void;
}

const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'https://biodiversity-management-assumptions-december.trycloudflare.com';

export const useWebSocket = (petId?: string): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketData | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (petId) {
        socket.emit('join-pet-room', petId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('sensor-update', (data) => {
      setLastMessage({ type: 'sensor', data });
    });

    socket.on('location-update', (data) => {
      setLastMessage({ type: 'location', data });
    });

    socket.on('notification', (data) => {
      setLastMessage({ type: 'notification', data });
    });

    return () => {
      socket.disconnect();
    };
  }, [petId]);

  const sendMessage = (message: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message', message);
    }
  };

  return { isConnected, lastMessage, sendMessage };
};