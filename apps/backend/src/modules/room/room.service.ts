import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { RoomRepository } from './room.repo';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { RoomInfo } from '@shared/types/types/room';

@Injectable()
export class RoomService {
  constructor(private roomRepo: RoomRepository) {}

  async getRooms(): Promise<RoomInfo[]> {
    const rooms = await this.roomRepo.findAll();
    return rooms.map((room) => ({
      id: room.id,
      title: room.title,
      locked: room.locked,
      format: room.format,
      overtime: room.overtime,
      status: room.status,
      playerCount: room.roomPlayers?.length || 0,
    }));
  }

  async createRoom(dto: CreateRoomDto, socketId: string): Promise<{ roomId: string; playerId: string }> {
    const room = await this.roomRepo.create({
      title: dto.title,
      locked: !!dto.password,
      passwordHash: dto.password,
      format: dto.format,
      overtime: dto.overtime,
      status: 'lobby',
    });

    const player = await this.roomRepo.addPlayer(room.id, {
      nickname: dto.nickname,
      socketId,
      ready: false,
    });

    return { roomId: room.id, playerId: player.id };
  }

  async joinRoom(dto: JoinRoomDto, socketId: string): Promise<{ roomId: string; playerId: string }> {
    const room = await this.roomRepo.findById(dto.roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.status !== 'lobby') {
      throw new BadRequestException('Game already started');
    }

    if (room.roomPlayers.length >= 2) {
      throw new BadRequestException('Room is full');
    }

    if (room.locked && room.passwordHash) {
      if (!dto.password) {
        throw new BadRequestException('Password required');
      }
      if (dto.password !== room.passwordHash) {
        throw new BadRequestException('Invalid password');
      }
    }

    const player = await this.roomRepo.addPlayer(room.id, {
      nickname: dto.nickname,
      socketId,
      ready: false,
    });

    return { roomId: room.id, playerId: player.id };
  }

  async setReady(playerId: string, ready: boolean): Promise<void> {
    await this.roomRepo.updatePlayer(playerId, { ready });
  }

  async leaveRoom(playerId: string): Promise<string | null> {
    const player = await this.roomRepo.findPlayerById(playerId);
    if (!player) return null;

    const roomId = player.roomId;
    await this.roomRepo.removePlayer(playerId);

    const room = await this.roomRepo.findById(roomId);
    if (room && room.roomPlayers.length === 0) {
      await this.roomRepo.delete(roomId);
      return null;
    }

    return roomId;
  }
}
