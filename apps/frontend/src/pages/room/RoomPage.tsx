import { useEffect, useState } from 'react';
import { useAppStore } from '../../app/store.js';
import { sendMessage, onMessage } from '../../app/ws.js';
import s from './RoomPage.module.scss';

export const RoomPage: React.FC = () => {
  const { room, me, setView, setGame } = useAppStore();
  const [ready, setReady] = useState(false);
  const [players, setPlayers] = useState<number>(1);
  const [readyStates, setReadyStates] = useState<[boolean, boolean]>([false, false]);

  useEffect(() => {
    const unsubRoomUpdated = onMessage('room_updated', (data) => {
      setPlayers(data.players);
      setReadyStates(data.readyStates);
    });

    const unsubGameStart = onMessage('game_start', (data) => {
      setGame({
        round: 1,
        starterId: data.starterId,
        myTurn: me?.id === data.starterId,
        score: { me: 0, opp: 0, need: 3 },
      });
      setView('game');
    });

    return () => {
      unsubRoomUpdated();
      unsubGameStart();
    };
  }, [me, setGame, setView]);

  const handleReady = () => {
    if (!room) return;
    const newReady = !ready;
    setReady(newReady);
    sendMessage({ t: 'set_ready', roomId: room.id, ready: newReady });
  };

  const handleLeave = () => {
    setView('lobby');
  };

  if (!room) {
    return <div>방 정보가 없습니다.</div>;
  }

  return (
    <div className={s.room}>
      <header className={s['room__header']}>
        <button className={s['room__back-btn']} onClick={handleLeave}>
          ← 나가기
        </button>
        <h1 className={s['room__title']}>{room.title}</h1>
      </header>

      <div className={s['room__content']}>
        <div className={s['room__info']}>
          <span className={s['room__format']}>{room.format.toUpperCase()}</span>
          {room.overtime && <span className={s['room__overtime']}>연장</span>}
          <span className={s['room__players']}>
            {players}/2 {players === 2 ? '(준비완료)' : '(대기중)'}
          </span>
        </div>

        <div className={s['room__seats']}>
          <div className={`${s.seat} ${s['seat--filled']}`}>
            <div className={s['seat__label']}>플레이어 1</div>
            <div className={s['seat__status']}>{readyStates[0] ? '준비 완료' : '대기중'}</div>
          </div>
          <div className={`${s.seat} ${players >= 2 ? s['seat--filled'] : s['seat--empty']}`}>
            <div className={s['seat__label']}>플레이어 2</div>
            <div className={s['seat__status']}>
              {players >= 2 ? (readyStates[1] ? '준비 완료' : '대기중') : '비어있음'}
            </div>
          </div>
        </div>

        <button
          className={`${s['room__ready-btn']} ${ready ? s['room__ready-btn--ready'] : ''}`}
          onClick={handleReady}
          disabled={players < 2}
        >
          {ready ? '준비 취소' : '준비'}
        </button>
      </div>
    </div>
  );
};
