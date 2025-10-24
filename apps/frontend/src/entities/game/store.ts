import { writable } from 'svelte/store';
import type { GameState } from '@/shared/types';

function createGameStore() {
  const { subscribe, set, update } = writable<GameState | null>(null);

  return {
    subscribe,
    setGame: (game: GameState | null) => set(game),
    updateGameTurn: (myTurn: boolean, round: number) =>
      update((state: GameState | null) =>
        state ? { ...state, myTurn, round } : null
      ),
    updateScore: (me: number, opp: number, need: number) =>
      update((state: GameState | null) =>
        state ? { ...state, score: { me, opp, need } } : null
      ),
    reset: () => set(null),
  };
}

export const gameStore = createGameStore();
