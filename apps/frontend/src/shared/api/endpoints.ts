import { http } from './http';
import { RoomInfo } from '@shared/types/room';
import { RoomFormat } from '@shared/types/game';

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
