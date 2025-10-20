import { http } from './http.js';
import { RoomInfo } from '@shared/types/room.js';
import { RoomFormat } from '@shared/types/game.js';

export type CreateRoomRequest = {
  title: string;
  password?: string;
  format: RoomFormat;
  overtime: boolean;
  nickname: string;
};

export type CreateRoomResponse = {
  roomId: string;
  playerId: string;
};

export const api = {
  getRooms: () => http.get<RoomInfo[]>('/rooms'),
  createRoom: (data: CreateRoomRequest) => http.post<CreateRoomResponse>('/rooms', data),
};
