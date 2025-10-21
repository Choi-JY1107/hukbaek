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

export type { Tile };
