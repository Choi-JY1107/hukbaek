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

    await this.gameService.playTile(msg.roomId, player.id, msg.tile);
    await this.broadcastGameState(msg.roomId);
  }

  @SubscribeMessage('request_state')
  async handleRequestState(
    @ConnectedSocket() client: Socket,
    @MessageBody() msg: Extract<WsClientToServer, { t: 'request_state' }>,
  ) {
    await this.broadcastGameState(msg.roomId);
  }

  private async broadcastRoomState(roomId: string) {
    const room = await this.roomRepo.findById(roomId);
    if (!room) return;

    const readyStates: [boolean, boolean] = [
      room.roomPlayers[0]?.ready || false,
      room.roomPlayers[1]?.ready || false,
    ];

    const msg: WsServerToClient = {
      t: 'room_updated',
      players: room.roomPlayers.length,
      readyStates,
    };

    this.server.to(roomId).emit('message', msg);
  }

  private async broadcastGameState(roomId: string) {
    const state = await this.gameService.getGameState(roomId);
    if (!state) return;

    const msg: WsServerToClient = {
      t: 'game_start',
      starterId: state.currentRound?.starterId || state.p1.id,
    };

    this.server.to(roomId).emit('message', msg);
  }
}
