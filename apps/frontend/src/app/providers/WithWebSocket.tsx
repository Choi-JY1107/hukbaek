import { useEffect } from 'react';
import { useAppStore } from '../store.js';
import { onMessage } from '../ws.js';

export const WithWebSocket: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setView, updateGameTurn, updateScore, setGame } = useAppStore();

  useEffect(() => {
    const unsubGameStart = onMessage('game_start', (data) => {
      console.log('Game started:', data);
    });

    const unsubTurnInfo = onMessage('turn_info', (data) => {
      updateGameTurn(data.yourTurn, data.round);
    });

    const unsubScore = onMessage('score', (data) => {
      updateScore(data.me, data.opp, data.need);
    });

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
      unsubGameStart();
      unsubTurnInfo();
      unsubScore();
      unsubMatchResult();
      unsubError();
    };
  }, [updateGameTurn, updateScore, setGame, setView]);

  return <>{children}</>;
};
