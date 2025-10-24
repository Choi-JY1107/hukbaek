<script lang="ts">
  import RoomList from '@/widgets/room-list/RoomList.svelte';
  import RoomCreateModal from '@/features/room-create/RoomCreateModal.svelte';
  import RoomJoinModal from '@/features/room-join/RoomJoinModal.svelte';
  import type { RoomInfo } from '@shared/types/room';
  import s from './LobbyPage.module.scss';

  export let onNavigateToRoom: () => void;

  let showCreateModal = false;
  let showJoinModal = false;
  let selectedRoom: RoomInfo | null = null;

  const handleJoinRoom = (room: RoomInfo) => {
    selectedRoom = room;
    showJoinModal = true;
  };
</script>

<div class={s.lobby}>
  <header class={s['lobby__header']}>
    <h1 class={s['lobby__title']}>흑과백</h1>
    <button class={s['lobby__create-btn']} on:click={() => (showCreateModal = true)}>
      방 만들기
    </button>
  </header>

  <div class={s['lobby__content']}>
    <RoomList onJoinRoom={handleJoinRoom} />
  </div>

  <RoomCreateModal
    isOpen={showCreateModal}
    onClose={() => (showCreateModal = false)}
    onSuccess={onNavigateToRoom}
  />

  <RoomJoinModal
    room={selectedRoom}
    isOpen={showJoinModal}
    onClose={() => (showJoinModal = false)}
    onSuccess={onNavigateToRoom}
  />
</div>
