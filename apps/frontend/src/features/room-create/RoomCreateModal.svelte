<script lang="ts">
  import { api } from '@/shared/api/endpoints';
  import type { CreateRoomRequest } from '@/shared/api/endpoints';
  import { roomStore } from '@/entities/room/store';
  import { playerStore } from '@/entities/player/store';
  import { ROOM_FORMATS, FORMAT_LABELS } from '@shared/constants/index';
  import s from './RoomCreateModal.module.scss';

  export let isOpen: boolean;
  export let onClose: () => void;
  export let onSuccess: () => void;

  let formData: CreateRoomRequest = {
    title: '',
    password: '',
    format: 'bo1',
    nickname: '',
  };
  let isLoading = false;
  let error = '';

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    error = '';

    if (!formData.title.trim()) {
      error = '방 제목을 입력해주세요';
      return;
    }

    if (!formData.nickname.trim()) {
      error = '닉네임을 입력해주세요';
      return;
    }

    isLoading = true;
    try {
      const data: CreateRoomRequest = {
        ...formData,
        password: formData.password || undefined,
      };
      const response = await api.createRoom(data);

      roomStore.setRoom({
        id: response.roomId,
        title: formData.title,
        locked: !!formData.password,
        format: formData.format,
        playerCount: 1,
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
      error = err.message || '방 생성에 실패했습니다';
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

{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div class={s.modal} on:click={handleBackdropClick} role="dialog" aria-modal="true">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div class={s['modal__content']} on:click={(e) => e.stopPropagation()} role="document">
      <h2 class={s['modal__title']}>방 만들기</h2>

      <form class={s['modal__form']} on:submit={handleSubmit}>
        <div class={s['form__group']}>
          <label for="room-title" class={s['form__label']}>방 제목</label>
          <input
            id="room-title"
            type="text"
            class={s['form__input']}
            bind:value={formData.title}
            placeholder="방 제목을 입력하세요"
            maxlength="30"
            disabled={isLoading}
          />
        </div>

        <div class={s['form__group']}>
          <label for="room-nickname" class={s['form__label']}>닉네임</label>
          <input
            id="room-nickname"
            type="text"
            class={s['form__input']}
            bind:value={formData.nickname}
            placeholder="닉네임을 입력하세요"
            maxlength="20"
            disabled={isLoading}
          />
        </div>

        <div class={s['form__group']}>
          <label for="room-password" class={s['form__label']}>비밀번호 (선택)</label>
          <input
            id="room-password"
            type="password"
            class={s['form__input']}
            bind:value={formData.password}
            placeholder="비밀번호를 입력하세요"
            maxlength="20"
            disabled={isLoading}
          />
        </div>

        <div class={s['form__group']}>
          <span class={s['form__label']}>게임 형식</span>
          <div class={s['format-selector']}>
            {#each ROOM_FORMATS as format (format)}
              <button
                type="button"
                class="{s['format-button']} {formData.format === format ? s['format-button--active'] : ''}"
                on:click={() => (formData.format = format)}
                disabled={isLoading}
              >
                <span class={s['format-button__icon']}>
                  {#if format === 'bo1'}⚡{/if}
                  {#if format === 'bo3'}🎯{/if}
                  {#if format === 'bo5'}👑{/if}
                </span>
                <span class={s['format-button__label']}>{FORMAT_LABELS[format]}</span>
              </button>
            {/each}
          </div>
        </div>

        {#if error}
          <div class={s['form__error']}>{error}</div>
        {/if}

        <div class={s['modal__actions']}>
          <button
            type="button"
            class={s['modal__cancel']}
            on:click={onClose}
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            class={s['modal__submit']}
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '방 만들기'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
