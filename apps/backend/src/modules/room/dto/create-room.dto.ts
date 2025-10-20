import { RoomFormat } from '@shared/types/types/game';

export class CreateRoomDto {
  title!: string;
  password?: string;
  format!: RoomFormat;
  overtime!: boolean;
  nickname!: string;
}
