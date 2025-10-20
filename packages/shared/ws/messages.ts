import { Tile, MatchResult } from '../types/game.js';

export type WsClientToServer =
  | { t: 'set_ready'; roomId: string; ready: boolean }
  | { t: 'play_tile'; roomId: string; tile: Tile }
  | { t: 'request_state'; roomId: string };

export type WsServerToClient =
  | { t: 'room_updated'; players: number; readyStates: [boolean, boolean] }
  | { t: 'game_start'; starterId: string }
  | { t: 'turn_info'; yourTurn: boolean; round: number; starterId: string }
  | { t: 'tile_ack'; accepted: boolean; reason?: string }
  | { t: 'round_result'; winner: 'me' | 'opp' | 'draw'; myTile: Tile; oppTile: Tile }
  | { t: 'score'; me: number; opp: number; need: number }
  | { t: 'match_result'; result: MatchResult }
  | { t: 'error'; code: string; message: string };
