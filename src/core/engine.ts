import { GameState, Move, Difficulty, EngineSearchResult } from '../types';
import { MoveGenerator } from './move_generator';
import { Evaluator } from './evaluator';
import { PIECE_VALUES } from './piece_square_tables';

export class ChessEngine {
  private nodesCount = 0;

  findBestMove(state: GameState, difficulty: Difficulty = 'INTERMEDIATE'): EngineSearchResult {
    const startTime = performance.now();
    this.nodesCount = 0;

    const depth = this.getDepthForDifficulty(difficulty);
    const legalMoves = MoveGenerator.generateLegalMoves(state);

    if (legalMoves.length === 0) {
      return {
        bestMove: null,
        evaluationScore: 0,
        depth: 0,
        nodesEvaluated: 0,
        timeMs: 0,
      };
    }

    // For BEGINNER mode, occasionally pick random move to simulate novice play
    if (difficulty === 'BEGINNER' && Math.random() < 0.25) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return {
        bestMove: randomMove,
        evaluationScore: Evaluator.evaluate(state),
        depth: 1,
        nodesEvaluated: legalMoves.length,
        timeMs: performance.now() - startTime,
      };
    }

    this.orderMoves(legalMoves);

    let bestMove: Move | null = legalMoves[0];
    let bestScore = state.turn === 'w' ? -Infinity : Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of legalMoves) {
      const nextState = MoveGenerator.applyMove(state, move);
      const score = this.minimax(nextState, depth - 1, alpha, beta, state.turn === 'b');

      if (state.turn === 'w') {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
        alpha = Math.max(alpha, bestScore);
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
        beta = Math.min(beta, bestScore);
      }

      if (beta <= alpha) break;
    }

    const duration = performance.now() - startTime;

    return {
      bestMove,
      evaluationScore: bestScore,
      depth,
      nodesEvaluated: this.nodesCount,
      timeMs: Math.round(duration),
    };
  }

  private minimax(
    state: GameState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    this.nodesCount++;

    const status = MoveGenerator.getGameStatus(state);
    if (status.isCheckmate) {
      return isMaximizing ? -200000 - depth : 200000 + depth;
    }
    if (status.isDraw || status.isStalemate) {
      return 0;
    }

    if (depth <= 0) {
      return Evaluator.evaluate(state);
    }

    const moves = MoveGenerator.generateLegalMoves(state);
    this.orderMoves(moves);

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        const next = MoveGenerator.applyMove(state, move);
        const score = this.minimax(next, depth - 1, alpha, beta, false);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Beta cut-off
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        const next = MoveGenerator.applyMove(state, move);
        const score = this.minimax(next, depth - 1, alpha, beta, true);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Alpha cut-off
      }
      return minScore;
    }
  }

  private orderMoves(moves: Move[]): void {
    // MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
    moves.sort((a, b) => {
      const aScore = a.captured ? PIECE_VALUES[a.captured] - PIECE_VALUES[a.piece] * 0.1 : 0;
      const bScore = b.captured ? PIECE_VALUES[b.captured] - PIECE_VALUES[b.piece] * 0.1 : 0;
      return bScore - aScore;
    });
  }

  private getDepthForDifficulty(difficulty: Difficulty): number {
    switch (difficulty) {
      case 'BEGINNER':
        return 1;
      case 'CASUAL':
        return 2;
      case 'INTERMEDIATE':
        return 3;
      case 'ADVANCED':
        return 4;
      case 'MASTER':
        return 5;
    }
  }
}
