import { Tile } from '@/shared/types';
import s from './GameBoard.module.scss';

type Props = {
  result: 'win' | 'lose' | 'draw' | null;
  myPlayedTile: Tile | null;
  oppPlayedColor: 'black' | 'white' | null;
  myTurn: boolean;
};

export const GameBoard: React.FC<Props> = ({ result, myPlayedTile, oppPlayedColor, myTurn }) => {
  return (
    <div className={s['game-board']}>
      {result && (
        <div className={`${s['game-board__result']} ${s[`game-board__result--${result}`]}`}>
          {result === 'win' ? '🎉 승리!' : result === 'lose' ? '😔 패배' : '🤝 무승부'}
        </div>
      )}

      {!result && myPlayedTile !== null && (
        <div className={s['game-board__played-tile']}>
          <div className={s['game-board__played-label']}>내가 낸 타일</div>
          <div
            className={`${s['game-board__played-value']} ${myPlayedTile % 2 === 0 ? s['game-board__played-value--black'] : s['game-board__played-value--white']}`}
          >
            {myPlayedTile}
          </div>
        </div>
      )}

      {!result && oppPlayedColor && (
        <div className={s['game-board__played-tile']}>
          <div className={s['game-board__played-label']}>상대가 낸 타일</div>
          <div
            className={`${s['game-board__played-value']} ${s[`game-board__played-value--${oppPlayedColor}`]}`}
          >
            {oppPlayedColor === 'black' ? '⬛' : '⬜'}
          </div>
        </div>
      )}

      {!result && !myPlayedTile && !oppPlayedColor && (
        <div className={s['game-board__turn-indicator']}>
          {myTurn ? '🎯 당신의 차례입니다' : '⏳ 상대의 차례를 기다리는 중...'}
        </div>
      )}
    </div>
  );
};
