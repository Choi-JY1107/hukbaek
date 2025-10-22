import { useEffect, useState } from 'react';
import { useRoomStore } from '@/entities/room/store';
import { usePlayerStore } from '@/entities/player/store';
import { useGameStore } from '@/entities/game/store';
import { GameBoard } from '@/widgets/game-board/GameBoard';
import { GameHistory } from '@/widgets/game-history/GameHistory';
import { TileHand } from '@/features/game-play-tile/TileHand';
import { onMessage } from '@/shared/lib/websocket';
import { Tile } from '@/shared/types';
import { FORMAT_LABELS } from '@shared/constants/index';
import s from './GamePage.module.scss';

export const GamePage: React.FC = () => {
  const { room } = useRoomStore();
  const { game, updateGameTurn, updateScore } = useGameStore();
  const { me, setMe } = usePlayerStore();
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [myPlayedTile, setMyPlayedTile] = useState<Tile | null>(null);
  const [oppPlayedColor, setOppPlayedColor] = useState<'black' | 'white' | null>(null);
  const [oppColorHistory, setOppColorHistory] = useState<('black' | 'white')[]>([]);
  const [myHistory, setMyHistory] = useState<{ tile: number; result: 'win' | 'lose' | 'draw' }[]>([]);
  const [roundWins, setRoundWins] = useState<{ me: number; opp: number }>({ me: 0, opp: 0 });
  const [oppTileMemo, setOppTileMemo] = useState<Record<number, 'check' | 'question' | null>>({});
  const [isMemoCollapsed, setIsMemoCollapsed] = useState(true);

  useEffect(() => {
    const unsubGameStart = onMessage('game_start', (data) => {
      setOppColorHistory([]);
      setMyHistory([]);
      setRoundWins({ me: 0, opp: 0 });
      setOppTileMemo({});

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
      setOppPlayedColor(data.tileColor);
    });

    const unsubRoundResult = onMessage('round_result', (data) => {
      setResult(data.winner);

      setOppColorHistory((prev) => [...prev, data.oppTileColor]);
      setMyHistory((prev) => [...prev, { tile: data.myTile, result: data.winner }]);

      setTimeout(() => {
        setResult(null);
        setMyPlayedTile(null);
        setOppPlayedColor(null);
      }, 2000);
    });

    const unsubTurnInfo = onMessage('turn_info', (data) => {
      updateGameTurn(data.yourTurn, data.round);
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
  }, [me, setMe, updateGameTurn, updateScore]);

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

        {game.round > 0 && (
          <div className={s['game__memo-widget']}>
            <div className={s['game__memo-header']} onClick={() => setIsMemoCollapsed(!isMemoCollapsed)}>
              <div className={s['game__memo-title']}>상대 패 메모</div>
              <div className={s['game__memo-toggle']}>{isMemoCollapsed ? '▼' : '▲'}</div>
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

        <GameHistory oppColorHistory={oppColorHistory} myHistory={myHistory} />
      </header>

      <GameBoard
        result={result}
        myPlayedTile={myPlayedTile}
        oppPlayedColor={oppPlayedColor}
        myTurn={game.myTurn}
      />

      <TileHand myPlayedTile={myPlayedTile} onPlayTile={setMyPlayedTile} />
    </div>
  );
};
