
import { RouletteColor, SpinResult } from '../types';

/**
 * Uses Web Crypto API for the "best" randomness available in 2025.
 * This is cryptographically secure and non-deterministic for standard browser usage.
 */
export const generateSecureRandom = (min: number, max: number): number => {
  const range = max - min + 1;
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return min + (array[0] % range);
};

export const getRouletteColor = (value: number): RouletteColor => {
  if (value === 0) return 'GREEN';
  // European Roulette logic (standard for Idle Slayer)
  // 18 Red, 18 Black, 1 Green
  // We simulate a 37-slot wheel (0-36)
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  return redNumbers.includes(value) ? 'RED' : 'BLACK';
};

export const spinWheel = (): SpinResult => {
  const value = generateSecureRandom(0, 36);
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    value,
    color: getRouletteColor(value),
  };
};
