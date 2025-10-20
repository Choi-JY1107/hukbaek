import { RoomFormat } from './game.js';

export type RoomStatus = 'lobby' | 'in_game';

export type RoomInfo = {
  id: string;
  title: string;
  locked: boolean;
  format: RoomFormat;
  overtime: boolean;
  status: RoomStatus;
  playerCount: number;
};

export type PlayerInfo = {
  id: string;
  nickname: string;
  ready: boolean;
};
