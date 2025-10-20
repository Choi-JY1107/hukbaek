import { create } from 'zustand';
import { Tile } from '@shared/types/game';

export type ViewType = 'lobby' | 'room' | 'game';

export type PlayerState = {
  id: string;
  nickname: string;
  ready: boolean;
  tilesLeft: Tile[];
};

export type RoomState = {
  id: string;
  title: string;
  locked: boolean;
  format: 'bo1' | 'bo3' | 'bo5';
  overtime: boolean;
  playerCount: number;
};

export type GameState = {
  round: number;
  starterId: string;
  myTurn: boolean;
  score: {
    me: number;
    opp: number;
    need: number;
  };
};

export type AppState = {
  view: ViewType;
  me: PlayerState | null;
  room: RoomState | null;
  game: GameState | null;
  setView: (view: ViewType) => void;
  setMe: (me: PlayerState | null) => void;
  setRoom: (room: RoomState | null) => void;
  setGame: (game: GameState | null) => void;
  updateMyTilesLeft: (tiles: Tile[]) => void;
  updateGameTurn: (myTurn: boolean, round: number) => void;
  updateScore: (me: number, opp: number, need: number) => void;
};

export const useAppStore = create<AppState>((set) => ({
  view: 'lobby',
  me: null,
  room: null,
  game: null,
  setView: (view) => set({ view }),
  setMe: (me) => set({ me }),
  setRoom: (room) => set({ room }),
  setGame: (game) => set({ game }),
  updateMyTilesLeft: (tiles) =>
    set((state) => ({
      me: state.me ? { ...state.me, tilesLeft: tiles } : null,
    })),
  updateGameTurn: (myTurn, round) =>
    set((state) => ({
      game: state.game ? { ...state.game, myTurn, round } : null,
    })),
  updateScore: (me, opp, need) =>
    set((state) => ({
      game: state.game ? { ...state.game, score: { me, opp, need } } : null,
    })),
}));
