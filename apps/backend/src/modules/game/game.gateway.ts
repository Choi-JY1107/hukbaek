import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { RoomService } from '../room/room.service';
import { RoomRepository } from '../room/room.repo';
import { WsClientToServer, WsServerToClient } from '@shared/types/ws/messages';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private gameService: GameService,
    private roomService: RoomService,
    private roomRepo: RoomRepository,
  ) {}

  async handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  async handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    const player = await this.roomRepo.findPlayerBySocketId(client.id);
    if (player) {
      const roomId = await this.roomService.leaveRoom(player.id);
      if (roomId) {
        this.server.to(roomId).emit('player_left', { playerId: player.id });
        await this.broadcastRoomState(roomId);
      }
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() msg: Extract<WsClientToServer, { t: 'join_room' }>,
  ) {
    // 플레이어의 socketId 업데이트
    await this.roomRepo.updatePlayer(msg.playerId, { socketId: client.id });

    // Socket.io room에 조인
    client.join(msg.roomId);

    // 방 상태를 모든 참가자에게 브로드캐스트
    await this.broadcastRoomState(msg.roomId);
  }

  @SubscribeMessage('set_ready')
  async handleSetReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() msg: Extract<WsClientToServer, { t: 'set_ready' }>,
  ) {
    const player = await this.roomRepo.findPlayerBySocketId(client.id);
    if (!player) return;

    await this.roomService.setReady(player.id, msg.ready);
    await this.broadcastRoomState(msg.roomId);

    const room = await this.roomRepo.findById(msg.roomId);
    if (room && room.roomPlayers.length === 2 && room.roomPlayers.every((p) => p.ready)) {
      await this.gameService.startMatch(msg.roomId);
      await this.broadcastGameState(msg.roomId);
    }
  }

  @SubscribeMessage('play_tile')
  async handlePlayTile(
    @ConnectedSocket() client: Socket,
    @MessageBody() msg: Extract<WsClientToServer, { t: 'play_tile' }>,
  ) {
    const player = await this.roomRepo.findPlayerBySocketId(client.id);
    if (!player) return;

    const roundFinished = await this.gameService.playTile(msg.roomId, player.id, msg.tile);

    if (roundFinished) {
      // 라운드가 끝났으면 결과 전송
      await this.broadcastRoundResult(msg.roomId);

      // 2초 후 다음 라운드 정보 전송
      setTimeout(async () => {
        await this.broadcastNextRound(msg.roomId);
      }, 2100);
    } else {
      // 첫 번째 플레이어가 제출했으면 상대방 턴으로 전환 알림
      await this.notifyTurnChange(msg.roomId, player.id, msg.tile);
    }
  }

  @SubscribeMessage('request_state')
  async handleRequestState(
    @ConnectedSocket() client: Socket,
    @MessageBody() msg: Extract<WsClientToServer, { t: 'request_state' }>,
  ) {
    await this.broadcastGameState(msg.roomId);
  }

  @SubscribeMessage('leave_game')
  async handleLeaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() msg: Extract<WsClientToServer, { t: 'leave_game' }>,
  ) {
    const player = await this.roomRepo.findPlayerBySocketId(client.id);
    if (!player) return;

    const roomId = await this.roomService.leaveRoom(player.id);
    if (roomId) {
      // 상대방에게 플레이어가 나갔음을 알림
      this.server.to(roomId).emit('player_left', { playerId: player.id });
      await this.broadcastRoomState(roomId);
    }
  }

  private async broadcastRoomState(roomId: string) {
    const room = await this.roomRepo.findById(roomId);
    if (!room) return;

    // 각 플레이어에게 개별적으로 메시지 전송
    for (const player of room.roomPlayers) {
      if (!player.socketId) continue;

      // 상대방 찾기
      const otherPlayer = room.roomPlayers.find(p => p.id !== player.id);

      const msg: WsServerToClient = {
        t: 'room_updated',
        playerCount: room.roomPlayers.length,
        otherPlayer: otherPlayer
          ? { name: otherPlayer.nickname, readyState: otherPlayer.ready }
          : undefined,
      };

      this.server.to(player.socketId).emit('message', msg);
    }
  }

  private async broadcastGameState(roomId: string) {
    const state = await this.gameService.getGameState(roomId);
    if (!state) return;

    // 각 플레이어에게 자신의 패를 포함한 게임 시작 메시지 전송
    const p1Player = await this.roomRepo.findPlayerById(state.p1.id);
    const p2Player = await this.roomRepo.findPlayerById(state.p2.id);

    if (p1Player?.socketId) {
      const p1Tiles = await this.gameService.getPlayerTiles(state.p1.id);
      const p1Msg: WsServerToClient = {
        t: 'game_start',
        starterId: state.currentRound?.starterId || state.p1.id,
        myTiles: p1Tiles,
      };
      this.server.to(p1Player.socketId).emit('message', p1Msg);
    }

    if (p2Player?.socketId) {
      const p2Tiles = await this.gameService.getPlayerTiles(state.p2.id);
      const p2Msg: WsServerToClient = {
        t: 'game_start',
        starterId: state.currentRound?.starterId || state.p1.id,
        myTiles: p2Tiles,
      };
      this.server.to(p2Player.socketId).emit('message', p2Msg);
    }
  }

  private async broadcastRoundResult(roomId: string) {
    const state = await this.gameService.getGameState(roomId);
    if (!state) return;

    const lastRound = state.rounds[state.rounds.length - 1];
    if (!lastRound) return;

    const p1Player = await this.roomRepo.findPlayerById(state.p1.id);
    const p2Player = await this.roomRepo.findPlayerById(state.p2.id);

    // 각 플레이어의 타일 찾기
    const p1Play = lastRound.plays.find(p => p.playerId === state.p1.id);
    const p2Play = lastRound.plays.find(p => p.playerId === state.p2.id);

    if (!p1Play || !p2Play) return;

    // P1에게 결과 전송
    if (p1Player?.socketId) {
      const p1Winner = lastRound.result === 'p1' ? 'win' : lastRound.result === 'p2' ? 'lose' : 'draw';
      const oppTileColor: 'black' | 'white' = p2Play.tile % 2 === 0 ? 'black' : 'white';
      const p1Msg: WsServerToClient = {
        t: 'round_result',
        winner: p1Winner,
        myTile: p1Play.tile,
        oppTileColor,
      };
      this.server.to(p1Player.socketId).emit('message', p1Msg);
    }

    // P2에게 결과 전송
    if (p2Player?.socketId) {
      const p2Winner = lastRound.result === 'p2' ? 'win' : lastRound.result === 'p1' ? 'lose' : 'draw';
      const oppTileColor: 'black' | 'white' = p1Play.tile % 2 === 0 ? 'black' : 'white';
      const p2Msg: WsServerToClient = {
        t: 'round_result',
        winner: p2Winner,
        myTile: p2Play.tile,
        oppTileColor,
      };
      this.server.to(p2Player.socketId).emit('message', p2Msg);
    }
  }

  private async notifyTurnChange(roomId: string, firstPlayerId: string, tile: number) {
    const state = await this.gameService.getGameState(roomId);
    if (!state || !state.currentRound) return;

    const room = await this.roomRepo.findById(roomId);
    if (!room || room.roomPlayers.length !== 2) return;

    // 첫 번째 제출자가 아닌 사람 찾기
    const secondPlayer = room.roomPlayers.find(p => p.id !== firstPlayerId);
    if (!secondPlayer?.socketId) return;

    // 타일 색깔 계산 (짝수=흑, 홀수=백)
    const tileColor: 'black' | 'white' = tile % 2 === 0 ? 'black' : 'white';

    // 상대방에게 상대가 낸 타일 색깔 알림
    const oppPlayedMsg: WsServerToClient = {
      t: 'opp_played',
      tileColor,
    };
    this.server.to(secondPlayer.socketId).emit('message', oppPlayedMsg);

    // 상대방에게 "이제 당신 차례입니다" 알림
    const turnMsg: WsServerToClient = {
      t: 'turn_info',
      yourTurn: true,
      round: state.currentRound.roundNumber,
      starterId: state.currentRound.starterId,
    };
    this.server.to(secondPlayer.socketId).emit('message', turnMsg);
  }

  private async broadcastNextRound(roomId: string) {
    const state = await this.gameService.getGameState(roomId);
    if (!state) return;

    // 매치가 끝났는지 확인
    const matchResult = await this.gameService.getMatchResult(roomId);
    if (matchResult) {
      // 매치가 끝났으면 match_result 전송
      await this.broadcastMatchResult(roomId);
      return;
    }

    // 현재 라운드가 없으면 리턴 (에러 방지)
    if (!state.currentRound) return;

    const p1Player = await this.roomRepo.findPlayerById(state.p1.id);
    const p2Player = await this.roomRepo.findPlayerById(state.p2.id);

    // 라운드 1이면 새 게임 시작 - game_start 메시지 전송 (패 초기화)
    if (state.currentRound.roundNumber === 1) {
      console.log('🎮 새 게임 시작! game_start 메시지 전송');

      // P1에게 game_start 전송
      if (p1Player?.socketId) {
        const p1Tiles = await this.gameService.getPlayerTiles(state.p1.id);
        const p1Msg: WsServerToClient = {
          t: 'game_start',
          starterId: state.currentRound.starterId,
          myTiles: p1Tiles,
        };
        this.server.to(p1Player.socketId).emit('message', p1Msg);
      }

      // P2에게 game_start 전송
      if (p2Player?.socketId) {
        const p2Tiles = await this.gameService.getPlayerTiles(state.p2.id);
        const p2Msg: WsServerToClient = {
          t: 'game_start',
          starterId: state.currentRound.starterId,
          myTiles: p2Tiles,
        };
        this.server.to(p2Player.socketId).emit('message', p2Msg);
      }
    }

    // P1에게 턴 정보 전송
    if (p1Player?.socketId) {
      const turnMsg: WsServerToClient = {
        t: 'turn_info',
        yourTurn: state.currentRound.starterId === state.p1.id,
        round: state.currentRound.roundNumber,
        starterId: state.currentRound.starterId,
      };
      this.server.to(p1Player.socketId).emit('message', turnMsg);

      const scoreMsg: WsServerToClient = {
        t: 'score',
        me: state.p1.wins,
        opp: state.p2.wins,
        need: 3,
        meRoundWins: state.p1.currentGameWins,
        oppRoundWins: state.p2.currentGameWins,
      };
      this.server.to(p1Player.socketId).emit('message', scoreMsg);
    }

    // P2에게 턴 정보 전송
    if (p2Player?.socketId) {
      const turnMsg: WsServerToClient = {
        t: 'turn_info',
        yourTurn: state.currentRound.starterId === state.p2.id,
        round: state.currentRound.roundNumber,
        starterId: state.currentRound.starterId,
      };
      this.server.to(p2Player.socketId).emit('message', turnMsg);

      const scoreMsg: WsServerToClient = {
        t: 'score',
        me: state.p2.wins,
        opp: state.p1.wins,
        need: 3,
        meRoundWins: state.p2.currentGameWins,
        oppRoundWins: state.p1.currentGameWins,
      };
      this.server.to(p2Player.socketId).emit('message', scoreMsg);
    }
  }

  private async broadcastMatchResult(roomId: string) {
    const matchResult = await this.gameService.getMatchResult(roomId);
    if (!matchResult) return;

    const state = await this.gameService.getGameState(roomId);
    if (!state) return;

    const p1Player = await this.roomRepo.findPlayerById(state.p1.id);
    const p2Player = await this.roomRepo.findPlayerById(state.p2.id);

    // P1에게 결과 전송
    if (p1Player?.socketId) {
      const msg: WsServerToClient = {
        t: 'match_result',
        result: matchResult.p1Result,
      };
      this.server.to(p1Player.socketId).emit('message', msg);
    }

    // P2에게 결과 전송
    if (p2Player?.socketId) {
      const msg: WsServerToClient = {
        t: 'match_result',
        result: matchResult.p2Result,
      };
      this.server.to(p2Player.socketId).emit('message', msg);
    }
  }
}
