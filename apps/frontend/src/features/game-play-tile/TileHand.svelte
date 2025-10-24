<script lang="ts">
  import { sendMessage } from '@/shared/lib/websocket';
  import { roomStore } from '@/entities/room/store';
  import { gameStore } from '@/entities/game/store';
  import { playerStore } from '@/entities/player/store';
  import type { Tile } from '@/shared/types';
  import s from './TileHand.module.scss';

  export let myPlayedTile: Tile | null;
  export let onPlayTile: (tile: Tile) => void;

  let room: any;
  let game: any;
  let player: any;

  roomStore.subscribe((value) => (room = value));
  gameStore.subscribe((value) => (game = value));
  playerStore.subscribe((value) => (player = value));

  const handlePlayTile = (tile: Tile) => {
    if (!room || !game || !game.myTurn || myPlayedTile !== null) return;
    if (!player.me || !player.me.tilesLeft.includes(tile)) return;

    onPlayTile(tile);

    const message = { t: 'play_tile' as const, roomId: room.id, tile };
    sendMessage(message);

    playerStore.updateMyTilesLeft(player.me.tilesLeft.filter((t: Tile) => t !== tile));
  };

  $: me = player?.me;
</script>

{#if me}
  <div class={s['tile-hand']}>
    <div class={s['tile-hand__label']}>내 손패</div>
    <div class={s['tile-hand__tiles']}>
      {#each me.tilesLeft as tile (tile)}
        {@const isBlack = tile % 2 === 0}
        {@const isDisabled = !game?.myTurn || myPlayedTile !== null}
        <button
          class="{s['tile-hand__btn']} {isBlack ? s['tile-hand__btn--black'] : s['tile-hand__btn--white']} {isDisabled ? s['tile-hand__btn--disabled'] : ''}"
          on:click={() => handlePlayTile(tile)}
          disabled={isDisabled}
        >
          {tile}
        </button>
      {/each}
    </div>
  </div>
{/if}
