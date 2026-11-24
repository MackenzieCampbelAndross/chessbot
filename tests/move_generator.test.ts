import { describe, it, expect } from 'vitest';
import { Board } from '../src/core/board';
import { MoveGenerator } from '../src/core/move_generator';

describe('MoveGenerator', () => {
  it('generates exactly 20 initial legal moves for White in starting position', () => {
    const state = Board.getInitialState();
    const legalMoves = MoveGenerator.generateLegalMoves(state);
    // 16 pawn moves (8 single + 8 double) + 4 knight moves (Na3, Nc3, Nf3, Nh3)
    expect(legalMoves.length).toBe(20);
  });

  it('detects check when king is attacked by enemy piece', () => {
    // White king at e1 (4), Black queen at e4 (28)
    const fen = '4k3/8/8/8/4q3/8/8/4K3 w - - 0 1';
    const state = Board.fromFEN(fen);
    const inCheck = MoveGenerator.isKingInCheck(state, 'w');
    expect(inCheck).toBe(true);
  });

  it('detects Scholar\'s Mate (Checkmate)', () => {
    // 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#
    const scholarsMateFen = 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4';
    const state = Board.fromFEN(scholarsMateFen);
    const status = MoveGenerator.getGameStatus(state);
    expect(status.isCheck).toBe(true);
    expect(status.isCheckmate).toBe(true);
  });

  it('detects Stalemate', () => {
    // Black king at a8 (56), White queen at c7 (50), White king at b6 (41)
    const stalemateFen = 'k7/2Q5/1K6/8/8/8/8/8 b - - 0 1';
    const state = Board.fromFEN(stalemateFen);
    const status = MoveGenerator.getGameStatus(state);
    expect(status.isCheck).toBe(false);
    expect(status.isCheckmate).toBe(false);
    expect(status.isStalemate).toBe(true);
    expect(status.isDraw).toBe(true);
  });

  it('allows kingside and queenside castling when squares are open and unattacked', () => {
    // White king at e1, rooks at a1 and h1, open f1, g1, b1, c1, d1
    const fen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
    const state = Board.fromFEN(fen);
    const moves = MoveGenerator.generateLegalMoves(state);

    const kingsideCastle = moves.find((m) => m.from === 4 && m.to === 6 && m.isCastling);
    const queensideCastle = moves.find((m) => m.from === 4 && m.to === 2 && m.isCastling);

    expect(kingsideCastle).toBeDefined();
    expect(queensideCastle).toBeDefined();
  });
});
