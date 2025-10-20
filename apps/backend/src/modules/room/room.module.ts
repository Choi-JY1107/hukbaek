import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../../entities/room.entity';
import { RoomPlayer } from '../../entities/room-player.entity';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { RoomRepository } from './room.repo';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomPlayer])],
  providers: [RoomService, RoomRepository],
  controllers: [RoomController],
  exports: [RoomService, RoomRepository],
})
export class RoomModule {}
