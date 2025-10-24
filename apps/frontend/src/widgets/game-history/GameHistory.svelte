<script lang="ts">
  import s from './GameHistory.module.scss';

  export let oppColorHistory: ('black' | 'white')[];
  export let myHistory: { tile: number; result: 'win' | 'lose' | 'draw' }[];
</script>

{#if myHistory.length > 0}
  <div class={s['game-history']}>
    <div class={s['game-history__row']}>
      <span class={s['game-history__label']}>상대</span>
      <div class={s['game-history__tiles']}>
        {#each oppColorHistory as color, idx (idx)}
          <span class={s['game-history__tile']}>
            {color === 'black' ? '⬛' : '⬜'}
          </span>
        {/each}
      </div>
    </div>

    <div class={s['game-history__row']}>
      <span class={s['game-history__label']}>나</span>
      <div class={s['game-history__tiles']}>
        {#each myHistory as item, idx (idx)}
          {@const isBlack = item.tile % 2 === 0}
          <span
            class="{s['game-history__tile']} {isBlack ? s['game-history__tile--black'] : s['game-history__tile--white']}"
          >
            {item.tile}
          </span>
        {/each}
      </div>
    </div>

    <div class={s['game-history__row']}>
      <span class={s['game-history__label']}>결과</span>
      <div class={s['game-history__tiles']}>
        {#each myHistory as item, idx (idx)}
          <span
            class="{s['game-history__tile']} {s[`game-history__tile--${item.result}`]}"
          >
            {item.result === 'win' ? '○' : item.result === 'lose' ? '✕' : '='}
          </span>
        {/each}
      </div>
    </div>
  </div>
{/if}
