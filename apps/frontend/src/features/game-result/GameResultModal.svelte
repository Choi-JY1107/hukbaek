<script lang="ts">
  import { sendMessage } from '@/shared/lib/websocket';
  import { roomStore } from '@/entities/room/store';
  import type { MatchResult } from '@shared/types/game';
  import s from './GameResultModal.module.scss';

  export let isOpen: boolean;
  export let result: MatchResult | null;
  export let onClose: () => void;

  let room: any;
  roomStore.subscribe((value) => (room = value));

  const handleLeave = () => {
    if (room) {
      sendMessage({ t: 'leave_game', roomId: room.id });
    }
    onClose();
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleLeave();
    }
  };

  $: resultText = result === 'win' ? '승리!' : result === 'lose' ? '패배' : '무승부';
  $: resultIcon = result === 'win' ? '🎉' : result === 'lose' ? '😔' : '🤝';
</script>

{#if isOpen && result}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div class={s.modal} on:click={handleBackdropClick} role="dialog" aria-modal="true">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div class={s['modal__content']} on:click={(e) => e.stopPropagation()} role="document">
      <div class="{s['result']} {s[`result--${result}`]}">
        <div class={s['result__icon']}>{resultIcon}</div>
        <h2 class={s['result__title']}>게임 종료</h2>
        <div class={s['result__text']}>{resultText}</div>
      </div>

      <div class={s['modal__actions']}>
        <button
          type="button"
          class={s['modal__button']}
          on:click={handleLeave}
        >
          로비로 돌아가기
        </button>
      </div>
    </div>
  </div>
{/if}
