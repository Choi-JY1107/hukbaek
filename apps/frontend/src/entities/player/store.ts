import { create } from 'zustand';
import { PlayerState, Tile } from '@/shared/types';

type PlayerStore = {
  me: PlayerState | null;
  opponent: PlayerState | null;
  setMe: (me: PlayerState | null) => void;
  setOpponent: (opponent: PlayerState | null) => void;
  updateMyTilesLeft: (tiles: Tile[]) => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  me: null,
  opponent: null,
  setMe: (me) => set({ me }),
  setOpponent: (opponent) => set({ opponent }),
  updateMyTilesLeft: (tiles) =>
    set((state) => ({
      me: state.me ? { ...state.me, tilesLeft: tiles } : null,
    })),
}));
