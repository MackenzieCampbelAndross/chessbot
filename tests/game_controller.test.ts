import { describe, it, expect } from 'vitest';
import { GameController } from '../src/core/game_controller';

describe('GameController', () => {
  it('manages moves, undo, and redo sequence', () => {
    const controller = new GameController();
    expect(controller.getState().turn).toBe('w');

    // 1. e4 (12 -> 28)
    const move1 = controller.makeMove(12, 28);
    expect(move1).not.toBeNull();
    expect(controller.getState().turn).toBe('b');
    expect(controller.getState().history.length).toBe(1);

    // 1... e5 (52 -> 36)
    const move2 = controller.makeMove(52, 36);
    expect(move2).not.toBeNull();
    expect(controller.getState().turn).toBe('w');

    // Undo e5
    const undone = controller.undo();
    expect(undone).toBe(true);
    expect(controller.getState().turn).toBe('b');
    expect(controller.getState().history.length).toBe(1);

    // Redo e5
    const redone = controller.redo();
    expect(redone).toBe(true);
    expect(controller.getState().turn).toBe('w');
    expect(controller.getState().history.length).toBe(2);
  });

  it('tracks captured pieces and computes material balance', () => {
    // Starting with free capture scenario
    const fen = '4k3/8/8/4q3/3P4/8/8/4K3 w - - 0 1';
    const controller = new GameController(fen);

    // White pawn captures black queen (27 -> 36)
    controller.makeMove(27, 36);

    const { whiteCaptured, blackCaptured, advantage } = controller.getCapturedPieces();
    expect(whiteCaptured).toContain('q');
    expect(blackCaptured.length).toBe(0);
    expect(advantage).toBe(9.0); // 9 pawns advantage for White
  });

  it('resets board to initial game position', () => {
    const controller = new GameController();
    controller.makeMove(12, 28);
    expect(controller.getState().history.length).toBe(1);

    controller.reset();
    expect(controller.getState().history.length).toBe(0);
    expect(controller.getState().turn).toBe('w');
  });
});
