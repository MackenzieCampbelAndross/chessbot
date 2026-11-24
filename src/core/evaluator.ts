import { GameState } from '../types';
import { PIECE_VALUES, PieceSquareTables } from './piece_square_tables';

export class Evaluator {
  static evaluate(state: GameState): number {
    let materialScore = 0;
    let positionalScore = 0;

    for (let sq = 0; sq < 64; sq++) {
      const piece = state.board[sq];
      if (!piece) continue;

      const pieceVal = PIECE_VALUES[piece.type];
      const pstVal = PieceSquareTables.getPositionalScore(piece.type, piece.color, sq);

      if (piece.color === 'w') {
        materialScore += pieceVal;
        positionalScore += pstVal;
      } else {
        materialScore -= pieceVal;
        positionalScore -= pstVal;
      }
    }

    return materialScore + positionalScore;
  }
}
