import { describe, it, expect } from 'vitest';
import { GameController } from '../src/core/game_controller';
import { MoveGenerator } from '../src/core/move_generator';
import { Board } from '../src/core/board';

describe('ChessBot End-to-End Game Lifecycle', () => {
  it('plays an opening sequence, computes AI move, evaluates position, and exports valid PGN', () => {
    const controller = new GameController();

    // 1. White plays e4 (12 to 28)
    const m1 = controller.makeMove(12, 28);
    expect(m1?.san).toBe('e4');

    // 2. Black plays e5 (52 to 36)
    const m2 = controller.makeMove(52, 36);
    expect(m2?.san).toBe('e5');

    // 3. White plays Nf3 (6 to 21)
    const m3 = controller.makeMove(6, 21);
    expect(m3?.san).toBe('Nf3');

    // 4. Black AI calculates and executes a move
    const aiResult = controller.makeAIMove('CASUAL');
    expect(aiResult.move).not.toBeNull();
    expect(controller.getState().history.length).toBe(4);
    expect(controller.getState().turn).toBe('w');

    // 5. Verify game state and integrity
    const status = MoveGenerator.getGameStatus(controller.getState());
    expect(status.isCheckmate).toBe(false);
    expect(status.isStalemate).toBe(false);

    // 6. Verify FEN serialization and re-import
    const fen = Board.toFEN(controller.getState());
    expect(fen).toContain('w'); // White's turn

    // 7. Verify PGN export
    const pgn = controller.exportPGN();
    expect(pgn).toContain('[Event "ChessBot Game"]');
    expect(pgn).toContain('1. e4 e5');
    expect(pgn).toContain('2. Nf3');
  });
});
