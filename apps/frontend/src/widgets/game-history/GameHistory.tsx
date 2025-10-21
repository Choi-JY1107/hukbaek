import s from './GameHistory.module.scss';

type Props = {
  oppColorHistory: ('black' | 'white')[];
  myHistory: { tile: number; result: 'win' | 'lose' | 'draw' }[];
};

export const GameHistory: React.FC<Props> = ({ oppColorHistory, myHistory }) => {
  if (myHistory.length === 0) return null;

  return (
    <div className={s['game-history']}>
      <div className={s['game-history__row']}>
        <span className={s['game-history__label']}>상대</span>
        <div className={s['game-history__tiles']}>
          {oppColorHistory.map((color, idx) => (
            <span key={idx} className={s['game-history__tile']}>
              {color === 'black' ? '⬛' : '⬜'}
            </span>
          ))}
        </div>
      </div>

      <div className={s['game-history__row']}>
        <span className={s['game-history__label']}>나</span>
        <div className={s['game-history__tiles']}>
          {myHistory.map((item, idx) => {
            const isBlack = item.tile % 2 === 0;
            return (
              <span
                key={idx}
                className={`${s['game-history__tile']} ${isBlack ? s['game-history__tile--black'] : s['game-history__tile--white']}`}
              >
                {item.tile}
              </span>
            );
          })}
        </div>
      </div>

      <div className={s['game-history__row']}>
        <span className={s['game-history__label']}>결과</span>
        <div className={s['game-history__tiles']}>
          {myHistory.map((item, idx) => (
            <span
              key={idx}
              className={`${s['game-history__tile']} ${s[`game-history__tile--${item.result}`]}`}
            >
              {item.result === 'win' ? '○' : item.result === 'lose' ? '✕' : '='}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
