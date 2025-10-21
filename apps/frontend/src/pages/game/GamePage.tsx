import { useEffect, useState } from 'react';
import { useAppStore } from '../../app/store';
import { sendMessage, onMessage } from '../../app/ws';
import { Tile } from '@shared/types/game';
import { FORMAT_LABELS } from '@shared/constants/index';
import s from './GamePage.module.scss';

export const GamePage: React.FC = () => {
  const { game, me, room, updateMyTilesLeft, updateGameTurn, updateScore, setMe } = useAppStore();
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [myPlayedTile, setMyPlayedTile] = useState<Tile | null>(null);
  const [oppPlayedColor, setOppPlayedColor] = useState<'black' | 'white' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oppColorHistory, setOppColorHistory] = useState<('black' | 'white')[]>([]);
  const [myHistory, setMyHistory] = useState<{ tile: number; result: 'win' | 'lose' | 'draw' }[]>([]);
  const [roundWins, setRoundWins] = useState<{ me: number; opp: number }>({ me: 0, opp: 0 });
  const [oppTileMemo, setOppTileMemo] = useState<Record<number, 'check' | 'question' | null>>({});
  const [isMemoCollapsed, setIsMemoCollapsed] = useState(true);

  useEffect(() => {
    const unsubGameStart = onMessage('game_start', (data) => {
      console.log('🎮 [WebSocket] 새 게임 시작! 히스토리 초기화 + 패 초기화');
      console.log('🎮 새로운 패:', data.myTiles);

      // 히스토리 초기화
      setOppColorHistory([]);
      setMyHistory([]);
      setRoundWins({ me: 0, opp: 0 });
      setOppTileMemo({});

      // 패 초기화
      if (me && data.myTiles) {
        setMe({ ...me, tilesLeft: data.myTiles });
      }
    });

    const unsubTileAck = onMessage('tile_ack', (data) => {
      if (!data.accepted) {
        alert(data.reason || '잘못된 타일입니다');
      }
    });

    const unsubOppPlayed = onMessage('opp_played', (data) => {
      console.log('🎯 [WebSocket] 상대가 타일을 냈습니다:', data);
      setOppPlayedColor(data.tileColor);
    });

    const unsubRoundResult = onMessage('round_result', (data) => {
      console.log('🏆 [WebSocket] 라운드 결과:', data);
      setResult(data.winner);
      setIsSubmitting(false); // 라운드 끝나면 제출 가능

      // 상대 색깔 히스토리에 추가 (round_result에서 직접 받음)
      console.log('📝 상대 히스토리에 추가:', data.oppTileColor);
      setOppColorHistory((prev) => [...prev, data.oppTileColor]);

      // 내 히스토리에 추가 (round_result에서 직접 받음)
      console.log('📝 내 히스토리에 추가:', data.myTile, data.winner);
      setMyHistory((prev) => [...prev, { tile: data.myTile, result: data.winner }]);

      setTimeout(() => {
        setResult(null);
        setMyPlayedTile(null); // 결과 표시 후 제출한 타일도 초기화
        setOppPlayedColor(null); // 상대 색깔도 초기화
      }, 2000);
    });

    const unsubTurnInfo = onMessage('turn_info', (data) => {
      updateGameTurn(data.yourTurn, data.round);
      setIsSubmitting(false); // 턴 바뀌면 제출 가능
    });

    const unsubScore = onMessage('score', (data) => {
      updateScore(data.me, data.opp, data.need);
      setRoundWins({ me: data.meRoundWins, opp: data.oppRoundWins });
    });

    const unsubMatchResult = onMessage('match_result', (data) => {
      setTimeout(() => {
        alert(`게임 종료! 결과: ${data.result === 'win' ? '승리' : data.result === 'lose' ? '패배' : '무승부'}`);
      }, 500);
    });

    return () => {
      unsubGameStart();
      unsubTileAck();
      unsubOppPlayed();
      unsubRoundResult();
      unsubTurnInfo();
      unsubScore();
      unsubMatchResult();
    };
  }, []);

  const handlePlayTile = (tile: Tile) => {
    if (!room || !game || !game.myTurn || isSubmitting) return;
    if (!me || !me.tilesLeft.includes(tile)) return;

    setIsSubmitting(true); // 제출 중 플래그
    setMyPlayedTile(tile); // 제출한 타일 저장

    const message = { t: 'play_tile' as const, roomId: room.id, tile };
    console.log('📤 [WebSocket] 타일을 냅니다:', message);
    sendMessage(message);

    updateMyTilesLeft(me.tilesLeft.filter((t) => t !== tile));
  };

  const toggleOppTileMemo = (tile: number) => {
    setOppTileMemo((prev) => {
      const current = prev[tile];
      let next: 'check' | 'question' | null;

      if (!current) {
        next = 'check';
      } else if (current === 'check') {
        next = 'question';
      } else {
        next = null;
      }

      return {
        ...prev,
        [tile]: next,
      };
    });
  };

  if (!game || !me || !room) {
    return <div>게임 정보가 없습니다.</div>;
  }

  return (
    <div className={s.game}>
      <header className={s['game__header']}>
        <div className={s['game__score']}>
          <span>나: {game.score.me} ({roundWins.me}승)</span>
          <span>vs</span>
          <span>상대: {game.score.opp} ({roundWins.opp}승)</span>
        </div>
        <div className={s['game__round-info']}>
          <span>라운드 ({game.round}/9)</span>
          <span>{FORMAT_LABELS[room.format]}</span>
        </div>

        {/* 상대방 패 메모 위젯 */}
        {game.round > 0 && (
          <div className={s['game__memo-widget']}>
            <div className={s['game__memo-header']} onClick={() => setIsMemoCollapsed(!isMemoCollapsed)}>
              <div className={s['game__memo-title']}>상대 패 메모</div>
              <div className={s['game__memo-toggle']}>{isMemoCollapsed ? '▲' : '▼'}</div>
            </div>
            {!isMemoCollapsed && (
              <div className={s['game__memo-tiles']}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((tile) => {
                  const isBlack = tile % 2 === 0;
                  const memoState = oppTileMemo[tile];
                  return (
                    <button
                      key={tile}
                      className={`${s['game__memo-btn']} ${isBlack ? s['game__memo-btn--black'] : s['game__memo-btn--white']} ${memoState ? s[`game__memo-btn--${memoState}`] : ''}`}
                      onClick={() => toggleOppTileMemo(tile)}
                    >
                      {tile}
                      {memoState === 'check' && <span className={`${s['game__memo-mark']} ${s['game__memo-mark--check']}`}>✓</span>}
                      {memoState === 'question' && <span className={`${s['game__memo-mark']} ${s['game__memo-mark--question']}`}>?</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 히스토리 그리드 (3 x 9) */}
        {myHistory.length > 0 && (
          <div className={s['game__history-grid']}>
            {/* 1행: 상대 패 */}
            <div className={s['game__history-row']}>
              <span className={s['game__history-label']}>상대</span>
              <div className={s['game__history-tiles']}>
                {oppColorHistory.map((color, idx) => (
                  <span key={idx} className={s['game__history-tile']}>
                    {color === 'black' ? '⬛' : '⬜'}
                  </span>
                ))}
              </div>
            </div>

            {/* 2행: 내 패 */}
            <div className={s['game__history-row']}>
              <span className={s['game__history-label']}>나</span>
              <div className={s['game__history-tiles']}>
                {myHistory.map((item, idx) => {
                  const isBlack = item.tile % 2 === 0;
                  return (
                    <span
                      key={idx}
                      className={`${s['game__history-tile']} ${isBlack ? s['game__history-tile--black'] : s['game__history-tile--white']}`}
                    >
                      {item.tile}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* 3행: 성공 여부 */}
            <div className={s['game__history-row']}>
              <span className={s['game__history-label']}>결과</span>
              <div className={s['game__history-tiles']}>
                {myHistory.map((item, idx) => (
                  <span
                    key={idx}
                    className={`${s['game__history-tile']} ${s[`game__history-tile--${item.result}`]}`}
                  >
                    {item.result === 'win' ? '○' : item.result === 'lose' ? '✕' : '='}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className={s['game__board']}>
        {result && (
          <div className={`${s['game__result']} ${s[`game__result--${result}`]}`}>
            {result === 'win' ? '🎉 승리!' : result === 'lose' ? '😔 패배' : '🤝 무승부'}
          </div>
        )}

        {!result && myPlayedTile !== null && (
          <div className={s['game__played-tile']}>
            <div className={s['game__played-label']}>내가 낸 타일</div>
            <div
              className={`${s['game__played-value']} ${myPlayedTile % 2 === 0 ? s['game__played-value--black'] : s['game__played-value--white']}`}
            >
              {myPlayedTile}
            </div>
          </div>
        )}

        {!result && oppPlayedColor && (
          <div className={s['game__played-tile']}>
            <div className={s['game__played-label']}>상대가 낸 타일</div>
            <div
              className={`${s['game__played-value']} ${s[`game__played-value--${oppPlayedColor}`]}`}
            >
              {oppPlayedColor === 'black' ? '⬛' : '⬜'}
            </div>
          </div>
        )}

        {!result && !myPlayedTile && !oppPlayedColor && (
          <div className={s['game__turn-indicator']}>
            {game.myTurn ? '🎯 당신의 차례입니다' : '⏳ 상대의 차례를 기다리는 중...'}
          </div>
        )}
      </div>

      <div className={s['game__hand']}>
        <div className={s['game__hand-label']}>내 손패</div>
        <div className={s['game__tiles']}>
          {me.tilesLeft.map((tile) => {
            const isBlack = tile % 2 === 0; // 짝수=흑, 홀수=백
            const isDisabled = !game.myTurn || myPlayedTile !== null; // 턴이 아니거나 이미 제출했으면 비활성화
            return (
              <button
                key={tile}
                className={`${s['game__tile-btn']} ${isBlack ? s['game__tile-btn--black'] : s['game__tile-btn--white']} ${isDisabled ? s['game__tile-btn--disabled'] : ''}`}
                onClick={() => handlePlayTile(tile)}
                disabled={isDisabled}
              >
                {tile}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
