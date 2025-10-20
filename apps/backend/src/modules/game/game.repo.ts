import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../../entities/match.entity';
import { Round } from '../../entities/round.entity';
import { Play } from '../../entities/play.entity';
import { Tile, RoomFormat, RoundResult } from '@shared/types/types/game';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(Match)
    private matchRepo: Repository<Match>,
    @InjectRepository(Round)
    private roundRepo: Repository<Round>,
    @InjectRepository(Play)
    private playRepo: Repository<Play>,
  ) {}

  async createMatch(roomId: string, p1Id: string, p2Id: string, format: RoomFormat): Promise<Match> {
    const match = this.matchRepo.create({ roomId, p1Id, p2Id, format, p1Wins: 0, p2Wins: 0 });
    return this.matchRepo.save(match);
  }

  async findMatchByRoomId(roomId: string): Promise<Match | null> {
    return this.matchRepo.findOne({ where: { roomId }, relations: ['rounds', 'rounds.plays'] });
  }

  async updateMatch(id: string, data: Partial<Match>): Promise<void> {
    await this.matchRepo.update(id, data);
  }

  async createRound(matchId: string, roundNumber: number, starterId: string, gameNumber: number): Promise<Round> {
    const round = this.roundRepo.create({ matchId, roundNumber, starterId, gameNumber });
    return this.roundRepo.save(round);
  }

  async findRoundById(id: string): Promise<Round | null> {
    return this.roundRepo.findOne({ where: { id }, relations: ['plays'] });
  }

  async updateRound(id: string, data: Partial<Round>): Promise<void> {
    await this.roundRepo.update(id, data);
  }

  async createPlay(roundId: string, playerId: string, tile: Tile): Promise<Play> {
    const play = this.playRepo.create({ roundId, playerId, tile });
    return this.playRepo.save(play);
  }
}
