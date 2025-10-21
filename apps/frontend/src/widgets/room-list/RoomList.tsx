import { useEffect, useState } from 'react';
import { api } from '@/shared/api/endpoints';
import { RoomInfo } from '@shared/types/room';
import { FORMAT_LABELS } from '@shared/constants/index';
import s from './RoomList.module.scss';

type Props = {
  onJoinRoom: (room: RoomInfo) => void;
};

export const RoomList: React.FC<Props> = ({ onJoinRoom }) => {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const data = await api.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  const handleJoinRoom = (room: RoomInfo) => {
    if (room.playerCount >= 2) return;
    onJoinRoom(room);
  };

  return (
    <div className={s['room-list']}>
      {rooms.length === 0 ? (
        <div className={s['room-list__empty']}>방이 없습니다. 새로운 방을 만들어보세요!</div>
      ) : (
        <ul className={s['room-list__items']}>
          {rooms
            .sort((a, b) => {
              if (a.playerCount >= 2 && b.playerCount < 2) return 1;
              if (a.playerCount < 2 && b.playerCount >= 2) return -1;
              return 0;
            })
            .map((room) => (
              <li
                key={room.id}
                className={`${s['room-list__card']} ${room.locked ? s['room-list__card--locked'] : ''} ${room.playerCount >= 2 ? s['room-list__card--full'] : ''}`}
                onClick={() => handleJoinRoom(room)}
                style={{ cursor: room.playerCount >= 2 ? 'not-allowed' : 'pointer' }}
              >
                <div className={s['room-list__card-title']}>
                  {room.locked && <span className={s['room-list__lock-icon']}>🔒</span>}
                  {room.title}
                  {room.playerCount >= 2 && <span className={s['room-list__full-badge']}>만석</span>}
                </div>
                <div className={s['room-list__card-info']}>
                  <span className={s['room-list__format']}>{FORMAT_LABELS[room.format]}</span>
                  {room.overtime && <span className={s['room-list__overtime']}>연장</span>}
                  <span className={s['room-list__players']}>{room.playerCount}/2</span>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};
