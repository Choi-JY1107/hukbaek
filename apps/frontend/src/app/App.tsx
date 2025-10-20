import { WithWebSocket } from './providers/WithWebSocket.js';
import { Routes } from './routes.js';
import './styles/app.scss';

export const App: React.FC = () => {
  return (
    <WithWebSocket>
      <Routes />
    </WithWebSocket>
  );
};
