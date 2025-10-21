import { useState } from 'react';
import { RoomList } from '@/widgets/room-list/RoomList';
import { RoomCreateModal } from '@/features/room-create/RoomCreateModal';
import { RoomJoinModal } from '@/features/room-join/RoomJoinModal';
import { RoomInfo } from '@shared/types/room';
import s from './LobbyPage.module.scss';

type Props = {
  onNavigateToRoom: () => void;
};

export const LobbyPage: React.FC<Props> = ({ onNavigateToRoom }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);

  const handleJoinRoom = (room: RoomInfo) => {
    setSelectedRoom(room);
    setShowJoinModal(true);
  };

  return (
    <div className={s.lobby}>
      <header className={s['lobby__header']}>
        <h1 className={s['lobby__title']}>흑과백</h1>
        <button className={s['lobby__create-btn']} onClick={() => setShowCreateModal(true)}>
          방 만들기
        </button>
      </header>

      <div className={s['lobby__content']}>
        <RoomList onJoinRoom={handleJoinRoom} />
      </div>

      <RoomCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={onNavigateToRoom}
      />

      <RoomJoinModal
        room={selectedRoom}
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={onNavigateToRoom}
      />
    </div>
  );
};
