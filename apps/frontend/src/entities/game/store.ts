import { create } from 'zustand';
import { GameState } from '@/shared/types';

type GameStore = {
  game: GameState | null;
  setGame: (game: GameState | null) => void;
  updateGameTurn: (myTurn: boolean, round: number) => void;
  updateScore: (me: number, opp: number, need: number) => void;
};

export const useGameStore = create<GameStore>((set) => ({
  game: null,
  setGame: (game) => set({ game }),
  updateGameTurn: (myTurn, round) =>
    set((state) => ({
      game: state.game ? { ...state.game, myTurn, round } : null,
    })),
  updateScore: (me, opp, need) =>
    set((state) => ({
      game: state.game ? { ...state.game, score: { me, opp, need } } : null,
    })),
}));
