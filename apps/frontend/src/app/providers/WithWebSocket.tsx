import { useEffect } from 'react';
import { useAppStore } from '../model/store';
import { useGameStore } from '@/entities/game/store';
import { onMessage } from '@/shared/lib/websocket';

export const WithWebSocket: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setView } = useAppStore();
  const { setGame } = useGameStore();

  useEffect(() => {
    const unsubMatchResult = onMessage('match_result', (data) => {
      console.log('Match result:', data.result);
      setTimeout(() => {
        setGame(null);
        setView('lobby');
      }, 3000);
    });

    const unsubError = onMessage('error', (data) => {
      console.error('WebSocket error:', data.message);
    });

    return () => {
      unsubMatchResult();
      unsubError();
    };
  }, [setGame, setView]);

  return <>{children}</>;
};
