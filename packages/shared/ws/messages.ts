import type { Tile, MatchResult } from '../types/game';

export type WsClientToServer =
  | { t: 'join_room'; roomId: string; playerId: string }
  | { t: 'set_ready'; roomId: string; ready: boolean }
  | { t: 'play_tile'; roomId: string; tile: Tile }
  | { t: 'request_state'; roomId: string };

export type WsServerToClient =
  | { t: 'room_updated'; players: number; readyStates: [boolean, boolean]; playerNames?: [string, string] }
  | { t: 'game_start'; starterId: string; myTiles: Tile[] }
  | { t: 'turn_info'; yourTurn: boolean; round: number; starterId: string }
  | { t: 'tile_ack'; accepted: boolean; reason?: string }
  | { t: 'opp_played'; tileColor: 'black' | 'white' }
  | { t: 'round_result'; winner: 'win' | 'lose' | 'draw'; myTile: number; oppTileColor: 'black' | 'white' }
  | { t: 'score'; me: number; opp: number; need: number; meRoundWins: number; oppRoundWins: number }
  | { t: 'match_result'; result: MatchResult }
  | { t: 'error'; code: string; message: string };
