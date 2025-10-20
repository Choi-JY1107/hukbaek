import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../../entities/match.entity';
import { Round } from '../../entities/round.entity';
import { Play } from '../../entities/play.entity';
import { GameService } from './game.service';
import { GameRepository } from './game.repo';
import { GameGateway } from './game.gateway';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Round, Play]), RoomModule],
  providers: [GameService, GameRepository, GameGateway],
  exports: [GameService],
})
export class GameModule {}
