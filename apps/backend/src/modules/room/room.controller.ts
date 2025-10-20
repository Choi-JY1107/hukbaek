import { Controller, Get, Post, Body } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { RoomInfo } from '@shared/types/types/room';

@Controller('rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  async getRooms(): Promise<RoomInfo[]> {
    return this.roomService.getRooms();
  }

  @Post()
  async createRoom(@Body() dto: CreateRoomDto): Promise<{ roomId: string; playerId: string }> {
    return this.roomService.createRoom(dto, 'temp-socket-id');
  }

  @Post('join')
  async joinRoom(@Body() dto: JoinRoomDto): Promise<{ roomId: string; playerId: string }> {
    return this.roomService.joinRoom(dto, 'temp-socket-id');
  }
}
