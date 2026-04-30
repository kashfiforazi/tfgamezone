export interface Player {
  id: string;
  name: string;
  avatar: string;
  betAmount: number;
  multiplier?: number;
  winAmount?: number;
  status: 'playing' | 'cashed-out' | 'lost';
}

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
  avatar?: string;
}

export type GameStatus = 'WAITING' | 'FLYING' | 'CRASHED';

export interface WinHistory {
  multiplier: number;
  time: string;
}
