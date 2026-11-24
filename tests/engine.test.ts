import { describe, it, expect } from 'vitest';
import { Board } from '../src/core/board';
import { ChessEngine } from '../src/core/engine';

describe('ChessEngine', () => {
  const engine = new ChessEngine();

  it('finds immediate checkmate in 1 move when available', () => {
    // White to move: Queen at h5, Bishop at c4, Black f7 square is weak
    // Qxf7# is mate in 1
    const mateInOneFen = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 4';
    const state = Board.fromFEN(mateInOneFen);

    const result = engine.findBestMove(state, 'INTERMEDIATE');
    expect(result.bestMove).toBeDefined();
    // From h5 (39) to f7 (53)
    expect(result.bestMove?.from).toBe(39);
    expect(result.bestMove?.to).toBe(53);
    expect(result.nodesEvaluated).toBeGreaterThan(0);
  });

  it('finds obvious free queen capture', () => {
    // White pawn on d4 can capture free black Queen on e5
    const freeQueenFen = '4k3/8/8/4q3/3P4/8/8/4K3 w - - 0 1';
    const state = Board.fromFEN(freeQueenFen);

    const result = engine.findBestMove(state, 'CASUAL');
    expect(result.bestMove).toBeDefined();
    // Pawn from d4 (27) captures on e5 (36)
    expect(result.bestMove?.from).toBe(27);
    expect(result.bestMove?.to).toBe(36);
    expect(result.bestMove?.captured).toBe('q');
  });

  it('respects difficulty search depths', () => {
    const state = Board.getInitialState();

    const begResult = engine.findBestMove(state, 'BEGINNER');
    expect(begResult.depth).toBe(1);

    const casResult = engine.findBestMove(state, 'CASUAL');
    expect(casResult.depth).toBe(2);

    const intResult = engine.findBestMove(state, 'INTERMEDIATE');
    expect(intResult.depth).toBe(3);
  });
});
