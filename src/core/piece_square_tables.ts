/**
 * Piece-Square Tables (PST) for ChessBot.
 * Evaluates positional advantage for each piece type across 64 squares (from White's perspective).
 * Squares 0..7 = Rank 1 (a1..h1), Squares 56..63 = Rank 8 (a8..h8).
 */

import { PieceType, PieceColor } from '../types';

export const PAWN_TABLE = [
   0,   0,   0,   0,   0,   0,   0,   0,
   5,  10,  10, -20, -20,  10,  10,   5,
   5,  -5, -10,   0,   0, -10,  -5,   5,
   0,   0,   0,  20,  20,   0,   0,   0,
   5,   5,  10,  25,  25,  10,   5,   5,
  10,  10,  20,  30,  30,  20,  10,  10,
  50,  50,  50,  50,  50,  50,  50,  50,
   0,   0,   0,   0,   0,   0,   0,   0,
];

export const KNIGHT_TABLE = [
 -50, -40, -30, -30, -30, -30, -40, -50,
 -40, -20,   0,   5,   5,   0, -20, -40,
 -30,   5,  10,  15,  15,  10,   5, -30,
 -30,   0,  15,  20,  20,  15,   0, -30,
 -30,   5,  15,  20,  20,  15,   5, -30,
 -30,   0,  10,  15,  15,  10,   0, -30,
 -40, -20,   0,   0,   0,   0, -20, -40,
 -50, -40, -30, -30, -30, -30, -40, -50,
];

export const BISHOP_TABLE = [
 -20, -10, -10, -10, -10, -10, -10, -20,
 -10,   5,   0,   0,   0,   0,   5, -10,
 -10,  10,  10,  10,  10,  10,  10, -10,
 -10,   0,  10,  10,  10,  10,   0, -10,
 -10,   5,   5,  10,  10,   5,   5, -10,
 -10,   0,   5,  10,  10,   5,   0, -10,
 -10,   0,   0,   0,   0,   0,   0, -10,
 -20, -10, -10, -10, -10, -10, -10, -20,
];

export const ROOK_TABLE = [
   0,   0,   0,   5,   5,   0,   0,   0,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
   5,  10,  10,  10,  10,  10,  10,   5,
   0,   0,   0,   0,   0,   0,   0,   0,
];

export const QUEEN_TABLE = [
 -20, -10, -10,  -5,  -5, -10, -10, -20,
 -10,   0,   5,   0,   0,   0,   0, -10,
 -10,   5,   5,   5,   5,   5,   0, -10,
   0,   0,   5,   5,   5,   5,   0,  -5,
  -5,   0,   5,   5,   5,   5,   0,  -5,
 -10,   0,   5,   5,   5,   5,   0, -10,
 -10,   0,   0,   0,   0,   0,   0, -10,
 -20, -10, -10,  -5,  -5, -10, -10, -20,
];

export const KING_MIDDLE_TABLE = [
  20,  30,  10,   0,   0,  10,  30,  20,
  20,  20,   0,   0,   0,   0,  20,  20,
 -10, -20, -20, -20, -20, -20, -20, -10,
 -20, -30, -30, -40, -40, -30, -30, -20,
 -30, -40, -40, -50, -50, -40, -40, -30,
 -30, -40, -40, -50, -50, -40, -40, -30,
 -30, -40, -40, -50, -50, -40, -40, -30,
 -30, -40, -40, -50, -50, -40, -40, -30,
];

export const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

export class PieceSquareTables {
  static getPositionalScore(type: PieceType, color: PieceColor, square: number): number {
    // For Black, flip vertically (rank 8 becomes rank 1)
    const rank = Math.floor(square / 8);
    const file = square % 8;
    const sqIndex = color === 'w' ? square : (7 - rank) * 8 + file;

    let score = 0;
    switch (type) {
      case 'p':
        score = PAWN_TABLE[sqIndex];
        break;
      case 'n':
        score = KNIGHT_TABLE[sqIndex];
        break;
      case 'b':
        score = BISHOP_TABLE[sqIndex];
        break;
      case 'r':
        score = ROOK_TABLE[sqIndex];
        break;
      case 'q':
        score = QUEEN_TABLE[sqIndex];
        break;
      case 'k':
        score = KING_MIDDLE_TABLE[sqIndex];
        break;
    }

    return score;
  }
}
