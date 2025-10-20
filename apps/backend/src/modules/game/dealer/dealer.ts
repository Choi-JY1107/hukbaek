import { RoomFormat, RoundResult } from '@shared/types/types/game';

export const judge = (a: number, b: number): RoundResult => {
  if (a > b) return 'p1';
  if (a < b) return 'p2';
  return 'draw';
};

export const nextStarter = (prev: RoundResult, prevStarter: 'p1' | 'p2'): 'p1' | 'p2' => {
  if (prev === 'draw') return prevStarter;
  return prev;
};

// 한 게임은 9라운드 (모든 타일을 다 사용)
const ROUNDS_PER_GAME = 9;

// 포맷별 목표 게임 수 (Bo1=1게임, Bo3=2게임, Bo5=3게임)
export const targetGames = (format: RoomFormat): number => {
  if (format === 'bo1') return 1;
  if (format === 'bo3') return 2;
  return 3;
};

// 전체 매치가 끝났는지 확인 (누군가 목표 게임 수를 달성했는지)
export const isMatchFinished = (gamesWon1: number, gamesWon2: number, format: RoomFormat): boolean => {
  const target = targetGames(format);
  return gamesWon1 >= target || gamesWon2 >= target;
};

// 한 게임이 끝났는지 확인 (9라운드를 다 했는지)
export const isGameFinished = (roundNumber: number): boolean => {
  return roundNumber >= ROUNDS_PER_GAME;
};

export const matchResult = (p1Wins: number, p2Wins: number): 'p1' | 'p2' | null => {
  if (p1Wins > p2Wins) return 'p1';
  if (p2Wins > p1Wins) return 'p2';
  return null;
};
