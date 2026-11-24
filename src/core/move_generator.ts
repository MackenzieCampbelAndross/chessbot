import { GameState, Move, PieceColor, PieceType } from '../types';
import { Board } from './board';

export class MoveGenerator {
  static isSquareAttacked(board: (any)[], targetSquare: number, attackingColor: PieceColor): boolean {
    const tRank = Math.floor(targetSquare / 8);
    const tFile = targetSquare % 8;

    // 1. Pawn attacks
    const pawnPawnDirection = attackingColor === 'w' ? -1 : 1;
    const pRank = tRank + pawnPawnDirection;
    if (pRank >= 0 && pRank <= 7) {
      for (const dFile of [-1, 1]) {
        const pFile = tFile + dFile;
        if (pFile >= 0 && pFile <= 7) {
          const sq = pRank * 8 + pFile;
          const piece = board[sq];
          if (piece && piece.color === attackingColor && piece.type === 'p') {
            return true;
          }
        }
      }
    }

    // 2. Knight attacks
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dr, df] of knightOffsets) {
      const r = tRank + dr;
      const f = tFile + df;
      if (r >= 0 && r <= 7 && f >= 0 && f <= 7) {
        const sq = r * 8 + f;
        const piece = board[sq];
        if (piece && piece.color === attackingColor && piece.type === 'n') {
          return true;
        }
      }
    }

    // 3. Sliding Orthogonals (Rooks & Queens)
    const orthogonalDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dr, df] of orthogonalDirs) {
      let r = tRank + dr;
      let f = tFile + df;
      while (r >= 0 && r <= 7 && f >= 0 && f <= 7) {
        const sq = r * 8 + f;
        const piece = board[sq];
        if (piece) {
          if (piece.color === attackingColor && (piece.type === 'r' || piece.type === 'q')) {
            return true;
          }
          break; // Blocked
        }
        r += dr;
        f += df;
      }
    }

    // 4. Sliding Diagonals (Bishops & Queens)
    const diagonalDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, df] of diagonalDirs) {
      let r = tRank + dr;
      let f = tFile + df;
      while (r >= 0 && r <= 7 && f >= 0 && f <= 7) {
        const sq = r * 8 + f;
        const piece = board[sq];
        if (piece) {
          if (piece.color === attackingColor && (piece.type === 'b' || piece.type === 'q')) {
            return true;
          }
          break; // Blocked
        }
        r += dr;
        f += df;
      }
    }

    // 5. King attacks (adjacent 1 square)
    for (let dr = -1; dr <= 1; dr++) {
      for (let df = -1; df <= 1; df++) {
        if (dr === 0 && df === 0) continue;
        const r = tRank + dr;
        const f = tFile + df;
        if (r >= 0 && r <= 7 && f >= 0 && f <= 7) {
          const sq = r * 8 + f;
          const piece = board[sq];
          if (piece && piece.color === attackingColor && piece.type === 'k') {
            return true;
          }
        }
      }
    }

    return false;
  }

  static findKing(board: (any)[], color: PieceColor): number {
    for (let i = 0; i < 64; i++) {
      const piece = board[i];
      if (piece && piece.color === color && piece.type === 'k') {
        return i;
      }
    }
    return -1;
  }

  static isKingInCheck(state: GameState, color: PieceColor): boolean {
    const kingSq = this.findKing(state.board, color);
    if (kingSq === -1) return false;
    const opponentColor: PieceColor = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(state.board, kingSq, opponentColor);
  }

  static generatePseudoLegalMoves(state: GameState): Move[] {
    const moves: Move[] = [];
    const color = state.turn;
    const opponentColor: PieceColor = color === 'w' ? 'b' : 'w';

    for (let sq = 0; sq < 64; sq++) {
      const piece = state.board[sq];
      if (!piece || piece.color !== color) continue;

      const rank = Math.floor(sq / 8);
      const file = sq % 8;

      switch (piece.type) {
        case 'p': {
          const dir = color === 'w' ? 1 : -1;
          const startRank = color === 'w' ? 1 : 6;
          const promoRank = color === 'w' ? 7 : 0;

          // Single step forward
          const fwd1Rank = rank + dir;
          if (fwd1Rank >= 0 && fwd1Rank <= 7) {
            const fwd1Sq = fwd1Rank * 8 + file;
            if (!state.board[fwd1Sq]) {
              if (fwd1Rank === promoRank) {
                for (const promo of ['q', 'r', 'b', 'n'] as PieceType[]) {
                  moves.push({ from: sq, to: fwd1Sq, piece: 'p', color, promotion: promo });
                }
              } else {
                moves.push({ from: sq, to: fwd1Sq, piece: 'p', color });

                // Double step forward from starting rank
                if (rank === startRank) {
                  const fwd2Sq = (rank + 2 * dir) * 8 + file;
                  if (!state.board[fwd2Sq]) {
                    moves.push({ from: sq, to: fwd2Sq, piece: 'p', color });
                  }
                }
              }
            }
          }

          // Diagonal Captures
          for (const dFile of [-1, 1]) {
            const capFile = file + dFile;
            if (capFile >= 0 && capFile <= 7) {
              const capRank = rank + dir;
              if (capRank >= 0 && capRank <= 7) {
                const capSq = capRank * 8 + capFile;
                const targetPiece = state.board[capSq];

                if (targetPiece && targetPiece.color === opponentColor) {
                  if (capRank === promoRank) {
                    for (const promo of ['q', 'r', 'b', 'n'] as PieceType[]) {
                      moves.push({
                        from: sq,
                        to: capSq,
                        piece: 'p',
                        color,
                        captured: targetPiece.type,
                        promotion: promo,
                      });
                    }
                  } else {
                    moves.push({
                      from: sq,
                      to: capSq,
                      piece: 'p',
                      color,
                      captured: targetPiece.type,
                    });
                  }
                } else if (state.enPassantTarget === capSq) {
                  // En passant
                  moves.push({
                    from: sq,
                    to: capSq,
                    piece: 'p',
                    color,
                    captured: 'p',
                    isEnPassant: true,
                  });
                }
              }
            }
          }
          break;
        }

        case 'n': {
          const knightOffsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1],
          ];
          for (const [dr, df] of knightOffsets) {
            const r = rank + dr;
            const f = file + df;
            if (r >= 0 && r <= 7 && f >= 0 && f <= 7) {
              const targetSq = r * 8 + f;
              const targetPiece = state.board[targetSq];
              if (!targetPiece) {
                moves.push({ from: sq, to: targetSq, piece: 'n', color });
              } else if (targetPiece.color === opponentColor) {
                moves.push({ from: sq, to: targetSq, piece: 'n', color, captured: targetPiece.type });
              }
            }
          }
          break;
        }

        case 'b':
        case 'r':
        case 'q': {
          const dirs: [number, number][] = [];
          if (piece.type === 'b' || piece.type === 'q') {
            dirs.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
          }
          if (piece.type === 'r' || piece.type === 'q') {
            dirs.push([1, 0], [-1, 0], [0, 1], [0, -1]);
          }

          for (const [dr, df] of dirs) {
            let r = rank + dr;
            let f = file + df;
            while (r >= 0 && r <= 7 && f >= 0 && f <= 7) {
              const targetSq = r * 8 + f;
              const targetPiece = state.board[targetSq];
              if (!targetPiece) {
                moves.push({ from: sq, to: targetSq, piece: piece.type, color });
              } else {
                if (targetPiece.color === opponentColor) {
                  moves.push({ from: sq, to: targetSq, piece: piece.type, color, captured: targetPiece.type });
                }
                break; // Ray blocked
              }
              r += dr;
              f += df;
            }
          }
          break;
        }

        case 'k': {
          // Standard king steps
          for (let dr = -1; dr <= 1; dr++) {
            for (let df = -1; df <= 1; df++) {
              if (dr === 0 && df === 0) continue;
              const r = rank + dr;
              const f = file + df;
              if (r >= 0 && r <= 7 && f >= 0 && f <= 7) {
                const targetSq = r * 8 + f;
                const targetPiece = state.board[targetSq];
                if (!targetPiece) {
                  moves.push({ from: sq, to: targetSq, piece: 'k', color });
                } else if (targetPiece.color === opponentColor) {
                  moves.push({ from: sq, to: targetSq, piece: 'k', color, captured: targetPiece.type });
                }
              }
            }
          }

          // Castling
          if (color === 'w' && sq === 4) {
            // White Kingside (e1 to g1: sq 4 -> 6)
            if (
              state.castlingRights.wK &&
              !state.board[5] &&
              !state.board[6] &&
              state.board[7]?.type === 'r' &&
              state.board[7]?.color === 'w' &&
              !this.isSquareAttacked(state.board, 4, 'b') &&
              !this.isSquareAttacked(state.board, 5, 'b') &&
              !this.isSquareAttacked(state.board, 6, 'b')
            ) {
              moves.push({ from: 4, to: 6, piece: 'k', color: 'w', isCastling: true });
            }
            // White Queenside (e1 to c1: sq 4 -> 2)
            if (
              state.castlingRights.wQ &&
              !state.board[3] &&
              !state.board[2] &&
              !state.board[1] &&
              state.board[0]?.type === 'r' &&
              state.board[0]?.color === 'w' &&
              !this.isSquareAttacked(state.board, 4, 'b') &&
              !this.isSquareAttacked(state.board, 3, 'b') &&
              !this.isSquareAttacked(state.board, 2, 'b')
            ) {
              moves.push({ from: 4, to: 2, piece: 'k', color: 'w', isCastling: true });
            }
          } else if (color === 'b' && sq === 60) {
            // Black Kingside (e8 to g8: sq 60 -> 62)
            if (
              state.castlingRights.bK &&
              !state.board[61] &&
              !state.board[62] &&
              state.board[63]?.type === 'r' &&
              state.board[63]?.color === 'b' &&
              !this.isSquareAttacked(state.board, 60, 'w') &&
              !this.isSquareAttacked(state.board, 61, 'w') &&
              !this.isSquareAttacked(state.board, 62, 'w')
            ) {
              moves.push({ from: 60, to: 62, piece: 'k', color: 'b', isCastling: true });
            }
            // Black Queenside (e8 to c8: sq 60 -> 58)
            if (
              state.castlingRights.bQ &&
              !state.board[59] &&
              !state.board[58] &&
              !state.board[57] &&
              state.board[56]?.type === 'r' &&
              state.board[56]?.color === 'b' &&
              !this.isSquareAttacked(state.board, 60, 'w') &&
              !this.isSquareAttacked(state.board, 59, 'w') &&
              !this.isSquareAttacked(state.board, 58, 'w')
            ) {
              moves.push({ from: 60, to: 58, piece: 'k', color: 'b', isCastling: true });
            }
          }
          break;
        }
      }
    }

    return moves;
  }

  static applyMove(state: GameState, move: Move): GameState {
    const next = Board.cloneState(state);
    const movingPiece = next.board[move.from]!;

    // 1. Move piece
    next.board[move.from] = null;
    next.board[move.to] = move.promotion ? { type: move.promotion, color: move.color } : movingPiece;

    // 2. Handle Castling rook move
    if (move.isCastling) {
      if (move.to === 6) {
        next.board[7] = null;
        next.board[5] = { type: 'r', color: 'w' };
      } else if (move.to === 2) {
        next.board[0] = null;
        next.board[3] = { type: 'r', color: 'w' };
      } else if (move.to === 62) {
        next.board[63] = null;
        next.board[61] = { type: 'r', color: 'b' };
      } else if (move.to === 58) {
        next.board[56] = null;
        next.board[59] = { type: 'r', color: 'b' };
      }
    }

    // 3. Handle En Passant capture removal
    if (move.isEnPassant) {
      const capturedPawnSq = move.color === 'w' ? move.to - 8 : move.to + 8;
      next.board[capturedPawnSq] = null;
    }

    // 4. Update En Passant target
    if (move.piece === 'p' && Math.abs(move.to - move.from) === 16) {
      next.enPassantTarget = move.color === 'w' ? move.from + 8 : move.from - 8;
    } else {
      next.enPassantTarget = null;
    }

    // 5. Update Castling Rights
    if (move.from === 4 || move.to === 4) {
      next.castlingRights.wK = false;
      next.castlingRights.wQ = false;
    } else if (move.from === 60 || move.to === 60) {
      next.castlingRights.bK = false;
      next.castlingRights.bQ = false;
    }
    if (move.from === 7 || move.to === 7) next.castlingRights.wK = false;
    if (move.from === 0 || move.to === 0) next.castlingRights.wQ = false;
    if (move.from === 63 || move.to === 63) next.castlingRights.bK = false;
    if (move.from === 56 || move.to === 56) next.castlingRights.bQ = false;

    // 6. Halfmove clock
    if (move.piece === 'p' || move.captured) {
      next.halfmoveClock = 0;
    } else {
      next.halfmoveClock++;
    }

    // 7. Fullmove number
    if (move.color === 'b') {
      next.fullmoveNumber++;
    }

    // 8. Generate SAN notation
    move.san = this.formatSAN(state, move);
    next.history.push(move);

    // 9. Turn flip
    next.turn = move.color === 'w' ? 'b' : 'w';

    // 10. Check check and checkmate status
    next.isCheck = this.isKingInCheck(next, next.turn);

    return next;
  }

  static generateLegalMoves(state: GameState): Move[] {
    const pseudo = this.generatePseudoLegalMoves(state);
    const legal: Move[] = [];

    for (const move of pseudo) {
      const simulated = this.applyMove(state, move);
      // King of the side making the move must not be in check
      if (!this.isKingInCheck(simulated, move.color)) {
        legal.push(move);
      }
    }

    return legal;
  }

  static getGameStatus(state: GameState): {
    isCheck: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    isDraw: boolean;
  } {
    const legalMoves = this.generateLegalMoves(state);
    const inCheck = this.isKingInCheck(state, state.turn);

    if (legalMoves.length === 0) {
      if (inCheck) {
        return { isCheck: true, isCheckmate: true, isStalemate: false, isDraw: false };
      } else {
        return { isCheck: false, isCheckmate: false, isStalemate: true, isDraw: true };
      }
    }

    // 50-move rule
    if (state.halfmoveClock >= 100) {
      return { isCheck: inCheck, isCheckmate: false, isStalemate: false, isDraw: true };
    }

    return { isCheck: inCheck, isCheckmate: false, isStalemate: false, isDraw: false };
  }

  static formatSAN(_state: GameState, move: Move): string {
    if (move.isCastling) {
      return move.to % 8 === 6 ? 'O-O' : 'O-O-O';
    }

    const toAlg = Board.squareToAlgebraic(move.to);
    const fromAlg = Board.squareToAlgebraic(move.from);

    if (move.piece === 'p') {
      let san = '';
      if (move.captured) {
        san = `${fromAlg[0]}x${toAlg}`;
      } else {
        san = toAlg;
      }
      if (move.promotion) {
        san += `=${move.promotion.toUpperCase()}`;
      }
      return san;
    }

    const pieceChar = move.piece.toUpperCase();
    const captureChar = move.captured ? 'x' : '';
    return `${pieceChar}${captureChar}${toAlg}`;
  }
}
