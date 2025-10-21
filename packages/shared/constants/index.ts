export const TILES = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
export const BLACK_TILES = [0, 2, 4, 6, 8] as const;
export const WHITE_TILES = [1, 3, 5, 7] as const;

export const ROOM_FORMATS = ["bo1", "bo3", "bo5"] as const;
export const ROOM_STATUS = ["lobby", "in_game"] as const;
export const PLAYER_COLORS = ["black", "white"] as const;

export const FORMAT_LABELS: Record<(typeof ROOM_FORMATS)[number], string> = {
  bo1: "단판",
  bo3: "3판\n2선승",
  bo5: "5판\n3선승",
};
