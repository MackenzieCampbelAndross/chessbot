import { GameState, Piece, PieceColor, PieceType, CastlingRights } from '../types';

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export class Board {
  static squareToAlgebraic(square: number): string {
    const file = square % 8;
    const rank = Math.floor(square / 8);
    const fileChar = String.fromCharCode('a'.charCodeAt(0) + file);
    const rankChar = (rank + 1).toString();
    return `${fileChar}${rankChar}`;
  }

  static algebraicToSquare(san: string): number {
    const file = san.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = parseInt(san[1], 10) - 1;
    return rank * 8 + file;
  }

  static getInitialState(): GameState {
    return this.fromFEN(STARTING_FEN);
  }

  static fromFEN(fen: string): GameState {
    const parts = fen.trim().split(/\s+/);
    const boardPart = parts[0];
    const turnPart = parts[1] || 'w';
    const castlingPart = parts[2] || '-';
    const enPassantPart = parts[3] || '-';
    const halfmovePart = parts[4] || '0';
    const fullmovePart = parts[5] || '1';

    const board: (Piece | null)[] = new Array(64).fill(null);
    const ranks = boardPart.split('/');

    // In FEN, ranks are ordered 8 down to 1 (top to bottom)
    for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
      const fenRank = ranks[rankIdx];
      const actualRank = 7 - rankIdx; // 7 for Rank 8 down to 0 for Rank 1
      let fileIdx = 0;

      for (let i = 0; i < fenRank.length; i++) {
        const char = fenRank[i];
        if (char >= '1' && char <= '8') {
          fileIdx += parseInt(char, 10);
        } else {
          const color: PieceColor = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toLowerCase() as PieceType;
          const sq = actualRank * 8 + fileIdx;
          board[sq] = { type, color };
          fileIdx++;
        }
      }
    }

    const castlingRights: CastlingRights = {
      wK: castlingPart.includes('K'),
      wQ: castlingPart.includes('Q'),
      bK: castlingPart.includes('k'),
      bQ: castlingPart.includes('q'),
    };

    let enPassantTarget: number | null = null;
    if (enPassantPart !== '-') {
      enPassantTarget = this.algebraicToSquare(enPassantPart);
    }

    return {
      board,
      turn: turnPart === 'w' ? 'w' : 'b',
      castlingRights,
      enPassantTarget,
      halfmoveClock: parseInt(halfmovePart, 10),
      fullmoveNumber: parseInt(fullmovePart, 10),
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      history: [],
    };
  }

  static toFEN(state: GameState): string {
    const ranks: string[] = [];

    for (let rankIdx = 7; rankIdx >= 0; rankIdx--) {
      let emptyCount = 0;
      let rankStr = '';

      for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
        const sq = rankIdx * 8 + fileIdx;
        const piece = state.board[sq];

        if (!piece) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            rankStr += emptyCount.toString();
            emptyCount = 0;
          }
          const char = piece.type;
          rankStr += piece.color === 'w' ? char.toUpperCase() : char.toLowerCase();
        }
      }

      if (emptyCount > 0) {
        rankStr += emptyCount.toString();
      }
      ranks.push(rankStr);
    }

    let castlingStr = '';
    if (state.castlingRights.wK) castlingStr += 'K';
    if (state.castlingRights.wQ) castlingStr += 'Q';
    if (state.castlingRights.bK) castlingStr += 'k';
    if (state.castlingRights.bQ) castlingStr += 'q';
    if (!castlingStr) castlingStr = '-';

    const epStr = state.enPassantTarget !== null ? this.squareToAlgebraic(state.enPassantTarget) : '-';

    return `${ranks.join('/')} ${state.turn} ${castlingStr} ${epStr} ${state.halfmoveClock} ${state.fullmoveNumber}`;
  }

  static cloneState(state: GameState): GameState {
    return {
      board: [...state.board],
      turn: state.turn,
      castlingRights: { ...state.castlingRights },
      enPassantTarget: state.enPassantTarget,
      halfmoveClock: state.halfmoveClock,
      fullmoveNumber: state.fullmoveNumber,
      isCheck: state.isCheck,
      isCheckmate: state.isCheckmate,
      isStalemate: state.isStalemate,
      isDraw: state.isDraw,
      history: [...state.history],
    };
  }
}
