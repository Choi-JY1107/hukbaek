import { useEffect, useState } from 'react';
import { useAppStore } from '../../app/store.js';
import { api } from '../../shared/api/endpoints.js';
import { RoomInfo } from '@shared/types/room.js';
import s from './LobbyPage.module.scss';

export const LobbyPage: React.FC = () => {
  const { setView } = useAppStore();
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [showModal, setShowModal] = useState(false);

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

  const handleCreateRoom = () => {
    setShowModal(true);
  };

  const handleJoinRoom = (roomId: string) => {
    console.log('Join room:', roomId);
    setView('room');
  };

  return (
    <div className={s.lobby}>
      <header className={s['lobby__header']}>
        <h1 className={s['lobby__title']}>흑과백</h1>
        <button className={s['lobby__create-btn']} onClick={handleCreateRoom}>
          방 만들기
        </button>
      </header>

      <div className={s['lobby__content']}>
        {rooms.length === 0 ? (
          <div className={s['lobby__empty']}>방이 없습니다. 새로운 방을 만들어보세요!</div>
        ) : (
          <ul className={s['lobby__list']}>
            {rooms.map((room) => (
              <li
                key={room.id}
                className={`${s['lobby__card']} ${room.locked ? s['lobby__card--locked'] : ''}`}
                onClick={() => handleJoinRoom(room.id)}
              >
                <div className={s['lobby__card-title']}>
                  {room.locked && <span className={s['lobby__lock-icon']}>🔒</span>}
                  {room.title}
                </div>
                <div className={s['lobby__card-info']}>
                  <span className={s['lobby__format']}>{room.format.toUpperCase()}</span>
                  {room.overtime && <span className={s['lobby__overtime']}>연장</span>}
                  <span className={s['lobby__players']}>{room.playerCount}/2</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showModal && (
        <div className={s.modal} onClick={() => setShowModal(false)}>
          <div className={s['modal__content']} onClick={(e) => e.stopPropagation()}>
            <h2 className={s['modal__title']}>방 만들기</h2>
            <p className={s['modal__placeholder']}>방 만들기 폼 구현 필요</p>
            <button className={s['modal__close']} onClick={() => setShowModal(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
