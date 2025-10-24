import { writable } from 'svelte/store';
import type { PlayerState, Tile } from '@/shared/types';

type PlayerStoreState = {
  me: PlayerState | null;
  opponent: PlayerState | null;
};

function createPlayerStore() {
  const { subscribe, set, update } = writable<PlayerStoreState>({
    me: null,
    opponent: null,
  });

  return {
    subscribe,
    setMe: (me: PlayerState | null) =>
      update((state: PlayerStoreState) => ({ ...state, me })),
    setOpponent: (opponent: PlayerState | null) =>
      update((state: PlayerStoreState) => ({ ...state, opponent })),
    updateMyTilesLeft: (tiles: Tile[]) =>
      update((state: PlayerStoreState) => ({
        ...state,
        me: state.me ? { ...state.me, tilesLeft: tiles } : null,
      })),
    reset: () => set({ me: null, opponent: null }),
  };
}

export const playerStore = createPlayerStore();
