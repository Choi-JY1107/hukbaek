<script lang="ts">
  import { api } from '@/shared/api/endpoints';
  import { roomStore } from '@/entities/room/store';
  import { playerStore } from '@/entities/player/store';
  import type { RoomInfo } from '@shared/types/room';
  import { FORMAT_LABELS } from '@shared/constants/index';
  import s from './RoomJoinModal.module.scss';

  export let room: RoomInfo | null;
  export let isOpen: boolean;
  export let onClose: () => void;
  export let onSuccess: () => void;

  let formData = { nickname: '', password: '' };
  let isLoading = false;
  let error = '';

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!room) return;

    error = '';

    if (!formData.nickname.trim()) {
      error = '닉네임을 입력해주세요';
      return;
    }

    if (room.locked && !formData.password) {
      error = '비밀번호를 입력해주세요';
      return;
    }

    isLoading = true;
    try {
      const response = await api.joinRoom({
        roomId: room.id,
        nickname: formData.nickname,
        password: formData.password || undefined,
      });

      roomStore.setRoom({
        id: room.id,
        title: room.title,
        locked: room.locked,
        format: room.format,
        playerCount: room.playerCount,
      });

      playerStore.setMe({
        id: response.playerId,
        nickname: formData.nickname,
        ready: false,
        tilesLeft: [],
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      error = err.message || '방 참가에 실패했습니다';
    } finally {
      isLoading = false;
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
</script>

{#if isOpen && room}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div class={s.modal} on:click={handleBackdropClick} role="dialog" aria-modal="true">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div class={s['modal__content']} on:click={(e) => e.stopPropagation()} role="document">
      <button type="button" class={s['modal__close']} on:click={onClose} aria-label="닫기">×</button>
      <h2 class={s['modal__title']}>방 참가</h2>
      <div class={s['join-room-info']}>
        <div class={s['join-room-info__title']}>방 제목 : {room.title}</div>
        <div class={s['join-room-info__meta']}>
          <span class={s['join-room-info__label']}>승부 수 : </span>
          <span class={s['join-room-info__format']}>{FORMAT_LABELS[room.format]}</span>
        </div>
      </div>

      <form class={s['modal__form']} on:submit={handleSubmit}>
        <div class={s['form__group']}>
          <label for="nickname" class={s['form__label']}>닉네임</label>
          <input
            id="nickname"
            type="text"
            class={s['form__input']}
            bind:value={formData.nickname}
            placeholder="닉네임을 입력하세요"
            maxlength="20"
            disabled={isLoading}
          />
        </div>

        {#if room.locked}
          <div class={s['form__group']}>
            <label for="password" class={s['form__label']}>비밀번호</label>
            <input
              id="password"
              type="password"
              class={s['form__input']}
              bind:value={formData.password}
              placeholder="비밀번호를 입력하세요"
              maxlength="20"
              disabled={isLoading}
            />
          </div>
        {/if}

        {#if error}
          <div class={s['form__error']}>{error}</div>
        {/if}

        <div class={s['modal__actions']}>
          <button
            type="submit"
            class={s['modal__submit']}
            disabled={isLoading}
          >
            {isLoading ? '참가 중...' : '참가하기'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
