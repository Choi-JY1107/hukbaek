import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { GameRepository } from './game.repo';
import { RoomRepository } from '../room/room.repo';
import { Tile, RoomFormat, MatchResult } from '@shared/types/types/game';
import { TILES } from '@shared/types/dist/constants';
import * as dealer from './dealer/dealer';

type GameState = {
  matchId: string;
  p1: { id: string; nickname: string; wins: number; currentGameWins: number };
  p2: { id: string; nickname: string; wins: number; currentGameWins: number };
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
    await this.gameRepo.createRound(match.id, roundNumber, starterId, match.currentGameNumber);
  }

  async playTile(roomId: string, playerId: string, tile: Tile): Promise<boolean> {
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

    // 모든 플레이어가 0~8 타일 사용 가능
    if (!TILES.includes(tile as any)) {
      throw new BadRequestException('Invalid tile');
    }

    const alreadyPlayed = currentRound.plays.some((p) => p.playerId === playerId);
    if (alreadyPlayed) {
      throw new BadRequestException('Already played this round');
    }

    await this.gameRepo.createPlay(currentRound.id, playerId, tile);

    const round = await this.gameRepo.findRoundById(currentRound.id);
    if (!round) return false;

    if (round.plays.length === 2) {
      await this.finishRound(roomId, round.id, match.format);
      return true; // 라운드 끝남
    }

    return false; // 라운드 진행 중
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

    console.log(`🎲 라운드 ${round.roundNumber} 결과: P1(${p1Play.tile}) vs P2(${p2Play.tile}) => ${result}`);

    // 현재 게임 내 라운드 승수 업데이트
    if (result === 'p1') {
      await this.gameRepo.updateMatch(match.id, { p1CurrentGameWins: match.p1CurrentGameWins + 1 });
      match.p1CurrentGameWins += 1;
    } else if (result === 'p2') {
      await this.gameRepo.updateMatch(match.id, { p2CurrentGameWins: match.p2CurrentGameWins + 1 });
      match.p2CurrentGameWins += 1;
    }

    console.log(`📊 현재 게임 내 라운드 승수: P1=${match.p1CurrentGameWins}, P2=${match.p2CurrentGameWins}`);
    console.log(`📊 전체 게임 승수: P1=${match.p1Wins}, P2=${match.p2Wins}, Format=${format}`);

    // 9라운드를 다 했는지 확인
    if (dealer.isGameFinished(round.roundNumber)) {
      console.log(`🎮 한 게임 종료! (9라운드 완료)`);

      // 한 게임의 승자 결정
      const gameWinner = dealer.matchResult(match.p1CurrentGameWins, match.p2CurrentGameWins);
      console.log(`🏆 게임 승자: ${gameWinner} (P1: ${match.p1CurrentGameWins}승, P2: ${match.p2CurrentGameWins}승)`);

      // 게임 승수 업데이트
      if (gameWinner === 'p1') {
        await this.gameRepo.updateMatch(match.id, { p1Wins: match.p1Wins + 1 });
        match.p1Wins += 1;
      } else if (gameWinner === 'p2') {
        await this.gameRepo.updateMatch(match.id, { p2Wins: match.p2Wins + 1 });
        match.p2Wins += 1;
      }

      console.log(`📊 업데이트된 전체 게임 승수: P1=${match.p1Wins}, P2=${match.p2Wins}`);

      // 전체 매치가 끝났는지 확인
      if (dealer.isMatchFinished(match.p1Wins, match.p2Wins, format)) {
        console.log(`🏁 전체 매치 종료! P1=${match.p1Wins}게임, P2=${match.p2Wins}게임`);
        const winner = dealer.matchResult(match.p1Wins, match.p2Wins);
        const winnerId = winner === 'p1' ? match.p1Id : winner === 'p2' ? match.p2Id : undefined;
        await this.gameRepo.updateMatch(match.id, { winnerId });
        await this.roomRepo.update(roomId, { status: 'in_game' });
      } else {
        console.log(`➡️ 다음 게임 시작 (게임 ${match.currentGameNumber + 1}, 라운드 1부터)...`);
        // 게임 번호 증가 및 라운드 승수 초기화
        await this.gameRepo.updateMatch(match.id, {
          currentGameNumber: match.currentGameNumber + 1,
          p1CurrentGameWins: 0,
          p2CurrentGameWins: 0,
        });
        // 새 게임의 첫 라운드 시작 (라운드 1부터)
        await this.startRound(roomId, 1, 'p1');
      }
    } else {
      console.log(`➡️ 다음 라운드로 진행...`);
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
      p1: { id: p1.id, nickname: p1.nickname, wins: match.p1Wins, currentGameWins: match.p1CurrentGameWins },
      p2: { id: p2.id, nickname: p2.nickname, wins: match.p2Wins, currentGameWins: match.p2CurrentGameWins },
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

  async getPlayerTiles(playerId: string): Promise<Tile[]> {
    const player = await this.roomRepo.findPlayerById(playerId);
    if (!player) return [];

    const match = await this.gameRepo.findMatchByRoomId(player.roomId);
    if (!match) return [];

    // 모든 플레이어가 0~8 타일 모두 가짐
    const allTiles = [...TILES];

    console.log(`🎴 getPlayerTiles: playerId=${playerId}, 현재 게임 번호=${match.currentGameNumber}`);

    // 현재 게임 번호의 라운드만 확인
    const currentGameRounds = match.rounds.filter((r) => r.gameNumber === match.currentGameNumber);

    console.log(`🎴 현재 게임(${match.currentGameNumber})의 라운드 수: ${currentGameRounds.length}`);

    // 현재 게임에서 사용한 타일 찾기
    const usedTiles = currentGameRounds
      .flatMap((r) => r.plays)
      .filter((p) => p.playerId === playerId)
      .map((p) => p.tile);

    console.log(`🎴 usedTiles:`, usedTiles);

    const remainingTiles = allTiles.filter((tile) => !usedTiles.includes(tile));
    console.log(`🎴 remainingTiles:`, remainingTiles);

    return remainingTiles;
  }

  async getMatchResult(roomId: string): Promise<{ p1Result: MatchResult; p2Result: MatchResult } | null> {
    const match = await this.gameRepo.findMatchByRoomId(roomId);
    if (!match || !match.winnerId) return null;

    const winner = dealer.matchResult(match.p1Wins, match.p2Wins);

    if (winner === null) {
      return { p1Result: 'draw', p2Result: 'draw' };
    }

    return {
      p1Result: winner === 'p1' ? 'win' : 'lose',
      p2Result: winner === 'p2' ? 'win' : 'lose',
    };
  }
}
