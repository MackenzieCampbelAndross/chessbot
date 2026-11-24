import { describe, it, expect } from 'vitest';
import { Board } from '../src/core/board';
import { Evaluator } from '../src/core/evaluator';

describe('Evaluator', () => {
  it('evaluates starting position with symmetric near-zero score', () => {
    const state = Board.getInitialState();
    const score = Evaluator.evaluate(state);
    expect(score).toBe(0);
  });

  it('rewards side with material advantage', () => {
    // White is up a Queen
    const fenWhiteUpQueen = 'rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const state = Board.fromFEN(fenWhiteUpQueen);
    const score = Evaluator.evaluate(state);
    expect(score).toBeGreaterThan(800); // Queen = 900
  });

  it('evaluates positional advantages for developed pieces', () => {
    // White knight on e4 vs Knight on a1
    const fenKnightCenter = '4k3/8/8/8/4N3/8/8/4K3 w - - 0 1';
    const fenKnightCorner = '4k3/8/8/8/8/8/8/N3K3 w - - 0 1';

    const scoreCenter = Evaluator.evaluate(Board.fromFEN(fenKnightCenter));
    const scoreCorner = Evaluator.evaluate(Board.fromFEN(fenKnightCorner));

    expect(scoreCenter).toBeGreaterThan(scoreCorner);
  });
});
