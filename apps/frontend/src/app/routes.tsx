import { useAppStore } from './store.js';
import { LobbyPage } from '../pages/lobby/LobbyPage.js';
import { RoomPage } from '../pages/room/RoomPage.js';
import { GamePage } from '../pages/game/GamePage.js';

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
