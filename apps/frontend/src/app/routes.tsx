import { LobbyPage } from '@/pages/lobby/LobbyPage';
import { RoomPage } from '@/pages/room/RoomPage';
import { GamePage } from '@/pages/game/GamePage';
import { useAppStore } from './model/store';

export const Routes: React.FC = () => {
  const { view, setView } = useAppStore();

  if (view === 'lobby') {
    return <LobbyPage onNavigateToRoom={() => setView('room')} />;
  }

  if (view === 'room') {
    return (
      <RoomPage
        onNavigateToLobby={() => setView('lobby')}
        onNavigateToGame={() => setView('game')}
      />
    );
  }

  if (view === 'game') {
    return <GamePage />;
  }

  return null;
};
