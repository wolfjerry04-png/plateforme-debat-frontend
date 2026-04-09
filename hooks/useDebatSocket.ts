import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') 
  || 'https://plateforme-debat-backend.onrender.com';

interface DebatSocketOptions {
  debatId: string;
  onNouveauMessage?:  (message: any)  => void;
  onVotesMisAJour?:   (stats: any)    => void;
  onStatutDebat?:     (data: any)     => void;
  onSpectateurs?:     (data: { count: number }) => void;
}

export function useDebatSocket({
  debatId,
  onNouveauMessage,
  onVotesMisAJour,
  onStatutDebat,
  onSpectateurs,
}: DebatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!debatId) return;

    // Connexion au namespace /debats
    const socket = io(`${API_URL}/debats`, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('rejoindre-debat', debatId);
    });

    if (onNouveauMessage)  socket.on('nouveau-message',   onNouveauMessage);
    if (onVotesMisAJour)   socket.on('votes-mis-a-jour',  onVotesMisAJour);
    if (onStatutDebat)     socket.on('statut-debat',      onStatutDebat);
    if (onSpectateurs)     socket.on('spectateurs',       (d) => onSpectateurs(d));

    return () => {
      socket.emit('quitter-debat', debatId);
      socket.disconnect();
    };
  }, [debatId]);

  const envoyerEvenement = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { envoyerEvenement };
}
