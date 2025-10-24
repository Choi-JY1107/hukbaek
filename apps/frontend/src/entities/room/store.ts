import { writable } from 'svelte/store';
import type { RoomState } from '@/shared/types';

function createRoomStore() {
  const { subscribe, set } = writable<RoomState | null>(null);

  return {
    subscribe,
    setRoom: (room: RoomState | null) => set(room),
    reset: () => set(null),
  };
}

export const roomStore = createRoomStore();
