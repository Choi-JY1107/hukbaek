import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { GameRepository } from './game.repo';
import { RoomRepository } from '../room/room.repo';
import { Tile, RoomFormat } from '@shared/types/types/game';
import { BLACK_TILES, WHITE_TILES } from '@shared/types/dist/constants';
import * as dealer from './dealer/dealer';

type GameState = {
  matchId: string;
  p1: { id: string; nickname: string; wins: number };
  p2: { id: string; nickname: string; wins: number };
  currentRound?: {
    roundNumber: number;
    starterId: string;
    plays: { playerId: string; tile: Tile }[];
  };
  rounds: {
    roundNumber: number;
    result: string;
    plays: { playerId: string; tile: Tile }[];
  }[];
  winnerId?: string;
};

@Injectable()
export class GameService {
  constructor(
    private gameRepo: GameRepository,
    private roomRepo: RoomRepository,
  ) {}

  async startMatch(roomId: string): Promise<void> {
    const room = await this.roomRepo.findById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.roomPlayers.length !== 2) {
      throw new BadRequestException('Need 2 players');
    }

    const [p1, p2] = room.roomPlayers;
    if (!p1.ready || !p2.ready) {
      throw new BadRequestException('All players must be ready');
    }

    await this.gameRepo.createMatch(roomId, p1.id, p2.id, room.format);
    await this.roomRepo.update(roomId, { status: 'in_game' });

    await this.startRound(roomId, 1, 'p1');
  }

  private async startRound(roomId: string, roundNumber: number, starter: 'p1' | 'p2'): Promise<void> {
    const match = await this.gameRepo.findMatchByRoomId(roomId);
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const starterId = starter === 'p1' ? match.p1Id : match.p2Id;
    await this.gameRepo.createRound(match.id, roundNumber, starterId);
  }

  async playTile(roomId: string, playerId: string, tile: Tile): Promise<void> {
    const match = await this.gameRepo.findMatchByRoomId(roomId);
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const currentRound = match.rounds.find((r) => !r.result);
    if (!currentRound) {
      throw new BadRequestException('No active round');
    }

    const isP1 = playerId === match.p1Id;
    const isP2 = playerId === match.p2Id;
    if (!isP1 && !isP2) {
      throw new BadRequestException('Player not in match');
    }

    const validTiles = isP1 ? BLACK_TILES : WHITE_TILES;
    if (!(validTiles as readonly Tile[]).includes(tile)) {
      throw new BadRequestException('Invalid tile for player');
    }

    const alreadyPlayed = currentRound.plays.some((p) => p.playerId === playerId);
    if (alreadyPlayed) {
      throw new BadRequestException('Already played this round');
    }

    await this.gameRepo.createPlay(currentRound.id, playerId, tile);

    const round = await this.gameRepo.findRoundById(currentRound.id);
    if (!round) return;

    if (round.plays.length === 2) {
      await this.finishRound(roomId, round.id, match.format);
    }
  }

  private async finishRound(roomId: string, roundId: string, format: RoomFormat): Promise<void> {
    const round = await this.gameRepo.findRoundById(roundId);
    if (!round) return;

    const match = await this.gameRepo.findMatchByRoomId(roomId);
    if (!match) return;

    const [play1, play2] = round.plays;
    const p1Play = play1.playerId === match.p1Id ? play1 : play2;
    const p2Play = play1.playerId === match.p2Id ? play1 : play2;

    const result = dealer.judge(p1Play.tile, p2Play.tile);
    await this.gameRepo.updateRound(roundId, { result });

    if (result === 'p1') {
      await this.gameRepo.updateMatch(match.id, { p1Wins: match.p1Wins + 1 });
      match.p1Wins += 1;
    } else if (result === 'p2') {
      await this.gameRepo.updateMatch(match.id, { p2Wins: match.p2Wins + 1 });
      match.p2Wins += 1;
    }

    if (dealer.isMatchFinished(match.p1Wins, match.p2Wins, format)) {
      const winner = dealer.matchResult(match.p1Wins, match.p2Wins);
      const winnerId = winner === 'p1' ? match.p1Id : winner === 'p2' ? match.p2Id : undefined;
      await this.gameRepo.updateMatch(match.id, { winnerId });
      await this.roomRepo.update(roomId, { status: 'in_game' });
    } else {
      const nextStarter = dealer.nextStarter(result, round.starterId === match.p1Id ? 'p1' : 'p2');
      await this.startRound(roomId, round.roundNumber + 1, nextStarter);
    }
  }

  async getGameState(roomId: string): Promise<GameState | null> {
    const match = await this.gameRepo.findMatchByRoomId(roomId);
    if (!match) return null;

    const room = await this.roomRepo.findById(roomId);
    if (!room) return null;

    const currentRound = match.rounds.find((r) => !r.result);
    const p1 = room.roomPlayers.find((p) => p.id === match.p1Id);
    const p2 = room.roomPlayers.find((p) => p.id === match.p2Id);

    if (!p1 || !p2) return null;

    return {
      matchId: match.id,
      p1: { id: p1.id, nickname: p1.nickname, wins: match.p1Wins },
      p2: { id: p2.id, nickname: p2.nickname, wins: match.p2Wins },
      currentRound: currentRound ? {
        roundNumber: currentRound.roundNumber,
        starterId: currentRound.starterId,
        plays: currentRound.plays.map((p) => ({ playerId: p.playerId, tile: p.tile })),
      } : undefined,
      rounds: match.rounds
        .filter((r) => r.result)
        .map((r) => ({
          roundNumber: r.roundNumber,
          result: r.result!,
          plays: r.plays.map((p) => ({ playerId: p.playerId, tile: p.tile })),
        })),
      winnerId: match.winnerId,
    };
  }
}
