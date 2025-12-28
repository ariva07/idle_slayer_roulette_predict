import { RouletteColor, SpinResult } from '../types';

/**
 * IDLE SLAYER ROULETTE LOGIC (CONFIRMED):
 * Range: 0-14
 * 0: Green
 * 1-7: Red
 * 8-14: Black
 */

export const generateSecureRandom = (min: number, max: number): number => {
  const range = max - min + 1;
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return min + (array[0] % range);
};

export const getRouletteColor = (value: number): RouletteColor => {
  if (value === 0) return 'GREEN';
  if (value >= 1 && value <= 7) return 'RED';
  return 'BLACK'; // Dla 8-14
};

export const spinWheel = (): SpinResult => {
  const value = generateSecureRandom(0, 14);
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    value,
    color: getRouletteColor(value),
  };
};
