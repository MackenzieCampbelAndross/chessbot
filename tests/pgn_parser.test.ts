import { describe, it, expect } from 'vitest';
import { Board } from '../src/core/board';
import { MoveGenerator } from '../src/core/move_generator';
import { PGNParser } from '../src/core/pgn_parser';

describe('PGNParser', () => {
  it('exports GameState to properly formatted PGN with standard headers', () => {
    let state = Board.getInitialState();
    // 1. e4 e5 2. Nf3
    const move1 = MoveGenerator.generateLegalMoves(state).find((m) => m.from === 12 && m.to === 28)!; // e2 to e4
    state = MoveGenerator.applyMove(state, move1);

    const move2 = MoveGenerator.generateLegalMoves(state).find((m) => m.from === 52 && m.to === 36)!; // e7 to e5
    state = MoveGenerator.applyMove(state, move2);

    const pgn = PGNParser.exportPGN(state, 'Mackenzie', 'ChessBot Engine');
    expect(pgn).toContain('[White "Mackenzie"]');
    expect(pgn).toContain('[Black "ChessBot Engine"]');
    expect(pgn).toContain('1. e4 e5');
  });

  it('parses and replays PGN game moves', () => {
    const pgnSample = `[Event "World Championship"]
[Site "London"]
[White "Player1"]
[Black "Player2"]

1. e4 e5 2. Nf3 Nc6 *`;

    const { state, headers } = PGNParser.parseAndReplay(pgnSample);
    expect(headers['Event']).toBe('World Championship');
    expect(headers['White']).toBe('Player1');
    expect(state.history.length).toBe(4);
    expect(state.board[28]?.type).toBe('p'); // e4
    expect(state.board[36]?.type).toBe('p'); // e5
  });
});
