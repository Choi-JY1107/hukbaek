import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../entities/room.entity';
import { RoomPlayer } from '../../entities/room-player.entity';
import { RoomFormat } from '@shared/types/types/game';
import { RoomStatus } from '@shared/types/types/room';

@Injectable()
export class RoomRepository {
  constructor(
    @InjectRepository(Room)
    private roomRepo: Repository<Room>,
    @InjectRepository(RoomPlayer)
    private playerRepo: Repository<RoomPlayer>,
  ) {}

  async findAll(): Promise<Room[]> {
    return this.roomRepo.find({ relations: ['roomPlayers'] });
  }

  async findById(id: string): Promise<Room | null> {
    return this.roomRepo.findOne({ where: { id }, relations: ['roomPlayers'] });
  }

  async create(data: {
    title: string;
    locked: boolean;
    passwordHash?: string;
    format: RoomFormat;
    status: RoomStatus;
  }): Promise<Room> {
    const room = this.roomRepo.create(data);
    return this.roomRepo.save(room);
  }

  async update(id: string, data: Partial<Room>): Promise<void> {
    await this.roomRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.roomRepo.delete(id);
  }

  async addPlayer(roomId: string, data: { nickname: string; socketId: string; ready: boolean }): Promise<RoomPlayer> {
    const player = this.playerRepo.create({ ...data, roomId });
    return this.playerRepo.save(player);
  }

  async findPlayerById(id: string): Promise<RoomPlayer | null> {
    return this.playerRepo.findOne({ where: { id } });
  }

  async findPlayerBySocketId(socketId: string): Promise<RoomPlayer | null> {
    return this.playerRepo.findOne({ where: { socketId } });
  }

  async updatePlayer(id: string, data: Partial<RoomPlayer>): Promise<void> {
    await this.playerRepo.update(id, data);
  }

  async removePlayer(id: string): Promise<void> {
    await this.playerRepo.delete(id);
  }
}
