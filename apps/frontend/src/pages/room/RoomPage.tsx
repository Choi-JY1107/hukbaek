import { useEffect, useState } from 'react';
import { useAppStore } from '../../app/store';
import { sendMessage, onMessage, disconnectSocket } from '../../app/ws';
import s from './RoomPage.module.scss';

export const RoomPage: React.FC = () => {
  const { room, me, setView, setGame, setMe } = useAppStore();
  const [ready, setReady] = useState(false);
  const [players, setPlayers] = useState<number>(1);
  const [readyStates, setReadyStates] = useState<[boolean, boolean]>([false, false]);
  const [opponentName, setOpponentName] = useState<string>('');
  const [isHost] = useState(true);

  useEffect(() => {
    // 방에 입장했음을 서버에 알림 (WebSocket room join + socketId 업데이트)
    if (room && me) {
      sendMessage({ t: 'join_room', roomId: room.id, playerId: me.id });
    }

    const unsubRoomUpdated = onMessage('room_updated', (data) => {
      console.log('🔔 [room_updated]', data);
      console.log('🔔 내 닉네임:', me?.nickname);
      setPlayers(data.players);
      setReadyStates(data.readyStates);

      // 상대방 닉네임 설정
      if (data.playerNames && me) {
        console.log('🔔 playerNames:', data.playerNames);
        const oppName = data.playerNames.find(name => name !== me.nickname);
        console.log('🔔 상대 닉네임:', oppName);
        if (oppName) {
          setOpponentName(oppName);
        }
      }
    });

    const unsubGameStart = onMessage('game_start', (data) => {
      // 내 패 정보 업데이트
      if (me && data.myTiles) {
        setMe({ ...me, tilesLeft: data.myTiles });
      }

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
  }, [me, room, setGame, setView]);

  const handleReady = () => {
    if (!room || players < 2) return;
    const newReady = !ready;
    setReady(newReady);
    sendMessage({ t: 'set_ready', roomId: room.id, ready: newReady });
  };

  const handleLeave = () => {
    disconnectSocket();
    setView('lobby');
  };

  if (!room) {
    return <div className={s['room__empty']}>방 정보가 없습니다.</div>;
  }

  const oppReady = isHost ? readyStates[1] : readyStates[0];
  const myReady = isHost ? readyStates[0] : readyStates[1];

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
        {/* 상대 플레이어 */}
        <div className={s['room__opponent']}>
          <div className={`${s['room__player']} ${players >= 2 ? s['room__player--filled'] : ''}`}>
            <div className={s['room__player-icon']}>
              {players >= 2 ? '👤' : '💺'}
            </div>
            <div className={s['room__player-info']}>
              <div className={s['room__player-label']}>
                상대 {opponentName && `(${opponentName})`}
              </div>
              {players >= 2 && (
                <div className={`${s['room__player-status']} ${oppReady ? s['room__player-status--ready'] : ''}`}>
                  {oppReady ? '✓ 준비 완료' : '대기 중'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VS 표시 */}
        <div className={s['room__vs']}>VS</div>

        {/* 내 플레이어 */}
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

      {/* 준비하기 버튼 - 맨 아래 */}
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
