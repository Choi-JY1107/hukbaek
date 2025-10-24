<script lang="ts">
  import type { Tile } from '@/shared/types';
  import s from './GameBoard.module.scss';

  export let result: 'win' | 'lose' | 'draw' | null;
  export let myPlayedTile: Tile | null;
  export let oppPlayedColor: 'black' | 'white' | null;
  export let myTurn: boolean;
</script>

<div class={s['game-board']}>
  {#if result}
    <div class="{s['game-board__result']} {s[`game-board__result--${result}`]}">
      {result === 'win' ? '🎉 승리!' : result === 'lose' ? '😔 패배' : '🤝 무승부'}
    </div>
  {/if}

  {#if !result && myPlayedTile !== null}
    <div class={s['game-board__played-tile']}>
      <div class={s['game-board__played-label']}>내가 낸 타일</div>
      <div
        class="{s['game-board__played-value']} {myPlayedTile % 2 === 0 ? s['game-board__played-value--black'] : s['game-board__played-value--white']}"
      >
        {myPlayedTile}
      </div>
    </div>
  {/if}

  {#if !result && oppPlayedColor}
    <div class={s['game-board__played-tile']}>
      <div class={s['game-board__played-label']}>상대가 낸 타일</div>
      <div
        class="{s['game-board__played-value']} {s[`game-board__played-value--${oppPlayedColor}`]}"
      >
        {oppPlayedColor === 'black' ? '⬛' : '⬜'}
      </div>
    </div>
  {/if}

  {#if !result && !myPlayedTile && !oppPlayedColor}
    <div class={s['game-board__turn-indicator']}>
      {myTurn ? '🎯 당신의 차례입니다' : '⏳ 상대의 차례를 기다리는 중...'}
    </div>
  {/if}
</div>
