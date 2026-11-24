/**
 * Domain types and models for ChessBot (Chess Engine and Playable Application).
 */

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface CastlingRights {
  wK: boolean; // White kingside (O-O)
  wQ: boolean; // White queenside (O-O-O)
  bK: boolean; // Black kingside (o-o)
  bQ: boolean; // Black queenside (o-o-o)
}

export interface Move {
  from: number;         // 0 to 63
  to: number;           // 0 to 63
  piece: PieceType;
  color: PieceColor;
  captured?: PieceType;
  promotion?: PieceType;
  isCastling?: boolean;
  isEnPassant?: boolean;
  san?: string;         // Standard Algebraic Notation (e.g. "Nf3", "e4", "Qxf7#")
}

export interface GameState {
  board: (Piece | null)[];
  turn: PieceColor;
  castlingRights: CastlingRights;
  enPassantTarget: number | null; // Square index 0..63 eligible for en passant
  halfmoveClock: number;          // Moves since last pawn push or capture (50-move rule)
  fullmoveNumber: number;         // Incremented after Black's move
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  history: Move[];
}

export type Difficulty = 'BEGINNER' | 'CASUAL' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER';

export interface EngineSearchResult {
  bestMove: Move | null;
  evaluationScore: number; // Centipawns (positive favors White, negative favors Black)
  depth: number;
  nodesEvaluated: number;
  timeMs: number;
}
