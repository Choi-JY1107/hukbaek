import { useEffect } from 'react';
import { useRoomStore } from '@/entities/room/store';
import { usePlayerStore } from '@/entities/player/store';
import { useGameStore } from '@/entities/game/store';
import { useRoomReady } from '@/features/room-ready/useRoomReady';
import { disconnectSocket } from '@/shared/lib/websocket';
import { onMessage } from '@/shared/lib/websocket';
import s from './RoomPage.module.scss';

type Props = {
  onNavigateToLobby: () => void;
  onNavigateToGame: () => void;
};

export const RoomPage: React.FC<Props> = ({ onNavigateToLobby, onNavigateToGame }) => {
  const { room } = useRoomStore();
  const { me, opponent, setMe } = usePlayerStore();
  const { setGame } = useGameStore();
  const { ready, players, oppReady, myReady, handleReady } = useRoomReady();

  useEffect(() => {
    const unsubGameStart = onMessage('game_start', (data) => {
      if (me && data.myTiles) {
        setMe({ ...me, tilesLeft: data.myTiles });
      }

      setGame({
        round: 1,
        starterId: data.starterId,
        myTurn: me?.id === data.starterId,
        score: { me: 0, opp: 0, need: 3 },
      });
      onNavigateToGame();
    });

    return () => {
      unsubGameStart();
    };
  }, [me, setGame, setMe, onNavigateToGame]);

  const handleLeave = () => {
    disconnectSocket();
    onNavigateToLobby();
  };

  if (!room) {
    return <div className={s['room__empty']}>방 정보가 없습니다.</div>;
  }

  return (
    <div className={s.room}>
      <header className={s['room__header']}>
        <button className={s['room__back-btn']} onClick={handleLeave}>
          ← 나가기
        </button>
        <h1 className={s['room__title']}>{room.title}</h1>
        <div className={s['room__info']}>
          <span className={s['room__format']}>{room.format.toUpperCase()}</span>
          {room.overtime && <span className={s['room__overtime']}>연장</span>}
        </div>
      </header>

      <div className={s['room__content']}>
        <div className={s['room__opponent']}>
          <div className={`${s['room__player']} ${players >= 2 ? s['room__player--filled'] : ''}`}>
            <div className={s['room__player-icon']}>
              {players >= 2 ? '👤' : '💺'}
            </div>
            <div className={s['room__player-info']}>
              <div className={s['room__player-label']}>
                상대 {opponent?.nickname && `(${opponent.nickname})`}
              </div>
              {players >= 2 && (
                <div className={`${s['room__player-status']} ${oppReady ? s['room__player-status--ready'] : ''}`}>
                  {oppReady ? '✓ 준비 완료' : '대기 중'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={s['room__vs']}>VS</div>

        <div className={s['room__me']}>
          <div className={`${s['room__player']} ${s['room__player--filled']}`}>
            <div className={s['room__player-icon']}>👤</div>
            <div className={s['room__player-info']}>
              <div className={s['room__player-label']}>나 ({me?.nickname || '플레이어'})</div>
              <div className={`${s['room__player-status']} ${myReady ? s['room__player-status--ready'] : ''}`}>
                {myReady ? '✓ 준비 완료' : '대기 중'}
              </div>
            </div>
          </div>
        </div>

        {players < 2 && (
          <div className={s['room__waiting']}>
            <div className={s['room__waiting-text']}>상대 플레이어를 기다리는 중...</div>
          </div>
        )}
      </div>

      {players >= 2 && (
        <button
          className={`${s['room__ready-btn']} ${ready ? s['room__ready-btn--ready'] : ''}`}
          onClick={handleReady}
        >
          {ready ? '✓ 준비 완료' : '준비하기'}
        </button>
      )}
    </div>
  );
};
