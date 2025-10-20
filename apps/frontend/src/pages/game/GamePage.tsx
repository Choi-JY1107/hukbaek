import { useEffect, useState } from 'react';
import { useAppStore } from '../../app/store.js';
import { sendMessage, onMessage } from '../../app/ws.js';
import { Tile } from '@shared/types/game.js';
import s from './GamePage.module.scss';

export const GamePage: React.FC = () => {
  const { game, me, room, updateMyTilesLeft } = useAppStore();
  const [myTile, setMyTile] = useState<Tile | null>(null);
  const [oppTile, setOppTile] = useState<Tile | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);

  useEffect(() => {
    const unsubTileAck = onMessage('tile_ack', (data) => {
      if (!data.accepted) {
        alert(data.reason || '잘못된 타일입니다');
      }
    });

    const unsubRoundResult = onMessage('round_result', (data) => {
      setMyTile(data.myTile);
      setOppTile(data.oppTile);
      if (data.winner === 'me') setResult('win');
      else if (data.winner === 'opp') setResult('lose');
      else setResult('draw');

      setTimeout(() => {
        setMyTile(null);
        setOppTile(null);
        setResult(null);
      }, 2000);
    });

    const unsubMatchResult = onMessage('match_result', (data) => {
      setTimeout(() => {
        alert(`게임 종료! 결과: ${data.result === 'win' ? '승리' : data.result === 'lose' ? '패배' : '무승부'}`);
      }, 500);
    });

    return () => {
      unsubTileAck();
      unsubRoundResult();
      unsubMatchResult();
    };
  }, []);

  const handlePlayTile = (tile: Tile) => {
    if (!room || !game || !game.myTurn) return;
    if (!me || !me.tilesLeft.includes(tile)) return;

    sendMessage({ t: 'play_tile', roomId: room.id, tile });
    updateMyTilesLeft(me.tilesLeft.filter((t) => t !== tile));
  };

  if (!game || !me || !room) {
    return <div>게임 정보가 없습니다.</div>;
  }

  return (
    <div className={s.game}>
      <header className={s['game__header']}>
        <div className={s['game__score']}>
          <span>나: {game.score.me}</span>
          <span>vs</span>
          <span>상대: {game.score.opp}</span>
        </div>
        <div className={s['game__round']}>라운드 {game.round}</div>
      </header>

      <div className={s['game__board']}>
        <div className={s['game__tile-display']}>
          {myTile !== null && (
            <div className={s['game__my-tile']}>
              <div className={s['game__tile-label']}>내 타일</div>
              <div className={s['game__tile-value']}>{myTile}</div>
            </div>
          )}
          {oppTile !== null && (
            <div className={s['game__opp-tile']}>
              <div className={s['game__tile-label']}>상대 타일</div>
              <div className={s['game__tile-value']}>{oppTile}</div>
            </div>
          )}
          {result && (
            <div className={`${s['game__result']} ${s[`game__result--${result}`]}`}>
              {result === 'win' ? '승리!' : result === 'lose' ? '패배' : '무승부'}
            </div>
          )}
        </div>

        <div className={s['game__turn-indicator']}>
          {game.myTurn ? '당신의 차례입니다' : '상대의 차례를 기다리는 중...'}
        </div>
      </div>

      <div className={s['game__hand']}>
        <div className={s['game__hand-label']}>내 손패</div>
        <div className={s['game__tiles']}>
          {me.tilesLeft.map((tile) => (
            <button
              key={tile}
              className={`${s['game__tile-btn']} ${!game.myTurn ? s['game__tile-btn--disabled'] : ''}`}
              onClick={() => handlePlayTile(tile)}
              disabled={!game.myTurn}
            >
              {tile}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
