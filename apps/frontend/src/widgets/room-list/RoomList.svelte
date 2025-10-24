<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '@/shared/api/endpoints';
  import type { RoomInfo } from '@shared/types/room';
  import { FORMAT_LABELS } from '@shared/constants/index';
  import s from './RoomList.module.scss';

  export let onJoinRoom: (room: RoomInfo) => void;

  let rooms: RoomInfo[] = [];
  let isRefreshing = false;

  const loadRooms = async () => {
    try {
      const data = await api.getRooms();
      rooms = data;
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  const handleRefresh = async () => {
    isRefreshing = true;
    await loadRooms();
    setTimeout(() => {
      isRefreshing = false;
    }, 500);
  };

  const handleJoinRoom = (room: RoomInfo) => {
    if (room.playerCount >= 2) return;
    onJoinRoom(room);
  };

  onMount(() => {
    loadRooms();
  });

  $: sortedRooms = [...rooms].sort((a, b) => {
    if (a.playerCount >= 2 && b.playerCount < 2) return 1;
    if (a.playerCount < 2 && b.playerCount >= 2) return -1;
    return 0;
  });
</script>

<div class={s['room-list']}>
  <div class={s['room-list__header']}>
    <h3 class={s['room-list__title']}>방 목록</h3>
    <button
      type="button"
      class="{s['room-list__refresh']} {isRefreshing ? s['room-list__refresh--spinning'] : ''}"
      on:click={handleRefresh}
      disabled={isRefreshing}
      aria-label="새로고침"
    >
      ↻
    </button>
  </div>

  {#if rooms.length === 0}
    <div class={s['room-list__empty']}>방이 없습니다. 새로운 방을 만들어보세요!</div>
  {:else}
    <div class={s['room-list__items']}>
      {#each sortedRooms as room (room.id)}
        <button
          type="button"
          class="{s['room-list__card']} {room.locked ? s['room-list__card--locked'] : ''} {room.playerCount >= 2 ? s['room-list__card--full'] : ''}"
          on:click={() => handleJoinRoom(room)}
          disabled={room.playerCount >= 2}
        >
          <div class={s['room-list__card-title']}>
            {#if room.locked}
              <span class={s['room-list__lock-icon']}>🔒</span>
            {/if}
            {room.title}
            {#if room.playerCount >= 2}
              <span class={s['room-list__full-badge']}>만석</span>
            {/if}
          </div>
          <div class={s['room-list__card-info']}>
            <span class={s['room-list__format']}>{FORMAT_LABELS[room.format]}</span>
            <span class={s['room-list__players']}>{room.playerCount}/2</span>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>
