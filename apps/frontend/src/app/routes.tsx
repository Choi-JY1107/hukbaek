import { useAppStore } from './store';
import { LobbyPage } from '../pages/lobby/LobbyPage';
import { RoomPage } from '../pages/room/RoomPage';
import { GamePage } from '../pages/game/GamePage';

export const Routes: React.FC = () => {
  const view = useAppStore((state) => state.view);

  switch (view) {
    case 'lobby':
      return <LobbyPage />;
    case 'room':
      return <RoomPage />;
    case 'game':
      return <GamePage />;
    default:
      return <LobbyPage />;
  }
};
