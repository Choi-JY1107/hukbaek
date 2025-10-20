import { WithWebSocket } from './providers/WithWebSocket';
import { Routes } from './routes';
import './styles/app.scss';

export const App: React.FC = () => {
  return (
    <WithWebSocket>
      <Routes />
    </WithWebSocket>
  );
};
