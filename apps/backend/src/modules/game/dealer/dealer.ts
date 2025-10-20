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

export const targetWins = (format: RoomFormat): number => {
  if (format === 'bo1') return 1;
  if (format === 'bo3') return 2;
  return 3;
};

export const isMatchFinished = (p1Wins: number, p2Wins: number, format: RoomFormat): boolean => {
  const target = targetWins(format);
  return p1Wins >= target || p2Wins >= target;
};

export const matchResult = (p1Wins: number, p2Wins: number): 'p1' | 'p2' | null => {
  if (p1Wins > p2Wins) return 'p1';
  if (p2Wins > p1Wins) return 'p2';
  return null;
};
