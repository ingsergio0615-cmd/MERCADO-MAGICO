import { type LucideIcon } from 'lucide-react';

export type GameLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Fraction {
  numerator: number;
  denominator: number;
}

export interface GameState {
  currentLevel: GameLevel;
  progress: number; // 0 to 100
  score: number;
  isWon: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}
