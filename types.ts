
export type RouletteColor = 'RED' | 'BLACK' | 'GREEN';

export interface SpinResult {
  id: string;
  timestamp: number;
  color: RouletteColor;
  value: number;
}

export interface RouletteStats {
  redCount: number;
  blackCount: number;
  greenCount: number;
  totalSpins: number;
}
