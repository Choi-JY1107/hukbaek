import { sendMessage } from '@/shared/lib/websocket';
import { useRoomStore } from '@/entities/room/store';
import { useGameStore } from '@/entities/game/store';
import { usePlayerStore } from '@/entities/player/store';
import { Tile } from '@/shared/types';
import s from './TileHand.module.scss';

type Props = {
  myPlayedTile: Tile | null;
  onPlayTile: (tile: Tile) => void;
};

export const TileHand: React.FC<Props> = ({ myPlayedTile, onPlayTile }) => {
  const { room } = useRoomStore();
  const { game } = useGameStore();
  const { me, updateMyTilesLeft } = usePlayerStore();

  const handlePlayTile = (tile: Tile) => {
    if (!room || !game || !game.myTurn || myPlayedTile !== null) return;
    if (!me || !me.tilesLeft.includes(tile)) return;

    onPlayTile(tile);

    const message = { t: 'play_tile' as const, roomId: room.id, tile };
    sendMessage(message);

    updateMyTilesLeft(me.tilesLeft.filter((t) => t !== tile));
  };

  if (!me) return null;

  return (
    <div className={s['tile-hand']}>
      <div className={s['tile-hand__label']}>내 손패</div>
      <div className={s['tile-hand__tiles']}>
        {me.tilesLeft.map((tile) => {
          const isBlack = tile % 2 === 0;
          const isDisabled = !game?.myTurn || myPlayedTile !== null;
          return (
            <button
              key={tile}
              className={`${s['tile-hand__btn']} ${isBlack ? s['tile-hand__btn--black'] : s['tile-hand__btn--white']} ${isDisabled ? s['tile-hand__btn--disabled'] : ''}`}
              onClick={() => handlePlayTile(tile)}
              disabled={isDisabled}
            >
              {tile}
            </button>
          );
        })}
      </div>
    </div>
  );
};
