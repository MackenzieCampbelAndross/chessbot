import { describe, it, expect } from 'vitest';
import { Board, STARTING_FEN } from '../src/core/board';

describe('Board & FEN Parser', () => {
  it('converts square indices to algebraic coordinates correctly', () => {
    expect(Board.squareToAlgebraic(0)).toBe('a1');
    expect(Board.squareToAlgebraic(7)).toBe('h1');
    expect(Board.squareToAlgebraic(28)).toBe('e4');
    expect(Board.squareToAlgebraic(56)).toBe('a8');
    expect(Board.squareToAlgebraic(63)).toBe('h8');
  });

  it('converts algebraic coordinates to square indices correctly', () => {
    expect(Board.algebraicToSquare('a1')).toBe(0);
    expect(Board.algebraicToSquare('h1')).toBe(7);
    expect(Board.algebraicToSquare('e4')).toBe(28);
    expect(Board.algebraicToSquare('a8')).toBe(56);
    expect(Board.algebraicToSquare('h8')).toBe(63);
  });

  it('parses starting FEN into correct board state', () => {
    const state = Board.fromFEN(STARTING_FEN);
    expect(state.turn).toBe('w');
    expect(state.castlingRights).toEqual({ wK: true, wQ: true, bK: true, bQ: true });
    expect(state.enPassantTarget).toBeNull();
    expect(state.board[4]).toEqual({ type: 'k', color: 'w' }); // e1
    expect(state.board[60]).toEqual({ type: 'k', color: 'b' }); // e8
    expect(state.board[28]).toBeNull(); // e4 empty at start
  });

  it('serializes board state back into standard FEN string', () => {
    const state = Board.fromFEN(STARTING_FEN);
    const fen = Board.toFEN(state);
    expect(fen).toBe(STARTING_FEN);
  });
});
