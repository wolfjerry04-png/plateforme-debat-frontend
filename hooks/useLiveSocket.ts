import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')
  || 'https://plateforme-debat-backend.onrender.com';

export function useLiveSocket(liveId: string | null) {
  const socketRef   = useRef<Socket | null>(null);
  const [spectateurs, setSpectateurs] = useState(0);

  useEffect(() => {
    if (!liveId) return;

    const socket = io(`${API_URL}/debats`, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('rejoindre-debat', `live:${liveId}`);
    });

    socket.on('spectateurs', (data: { count: number }) => {
      setSpectateurs(data.count);
    });

    // Simuler incrémentation locale tant que le socket n'a pas de données
    const sim = setInterval(() => {
      setSpectateurs(p => Math.max(1, p + Math.floor(Math.random() * 5) - 2));
    }, 4000);

    return () => {
      clearInterval(sim);
      socket.emit('quitter-debat', `live:${liveId}`);
      socket.disconnect();
    };
  }, [liveId]);

  return { spectateurs };
}
