import { ROOM_FORMATS, PLAYER_COLORS } from '../constants/index.js';

export type Tile = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type RoomFormat = typeof ROOM_FORMATS[number];
export type PlayerColor = typeof PLAYER_COLORS[number];
export type RoundResult = 'p1' | 'p2' | 'draw';
export type MatchResult = 'win' | 'lose' | 'draw';

export type PlayerId = string;

export type GameState = {
  round: number;
  starterId: PlayerId;
  score: {
    p1: number;
    p2: number;
  };
  targetWins: number;
};

export type PlayerHand = {
  tilesLeft: Set<Tile>;
  color: PlayerColor;
};
