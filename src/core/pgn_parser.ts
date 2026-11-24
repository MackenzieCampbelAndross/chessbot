import { GameState, Move } from '../types';
import { Board } from './board';
import { MoveGenerator } from './move_generator';

export class PGNParser {
  static exportPGN(
    state: GameState,
    whiteName = 'Player',
    blackName = 'ChessBot',
    event = 'ChessBot Game'
  ): string {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '.');

    let result = '*';
    const status = MoveGenerator.getGameStatus(state);
    if (status.isCheckmate) {
      result = state.turn === 'w' ? '0-1' : '1-0';
    } else if (status.isDraw || status.isStalemate) {
      result = '1/2-1/2';
    }

    let pgn = `[Event "${event}"]\n`;
    pgn += `[Site "Localhost"]\n`;
    pgn += `[Date "${today}"]\n`;
    pgn += `[Round "1"]\n`;
    pgn += `[White "${whiteName}"]\n`;
    pgn += `[Black "${blackName}"]\n`;
    pgn += `[Result "${result}"]\n\n`;

    let moveText = '';
    for (let i = 0; i < state.history.length; i++) {
      const move = state.history[i];
      if (i % 2 === 0) {
        const moveNumber = Math.floor(i / 2) + 1;
        moveText += `${moveNumber}. ${move.san || 'move'} `;
      } else {
        moveText += `${move.san || 'move'} `;
      }
    }

    moveText += result;
    return pgn + moveText.trim();
  }

  static parseAndReplay(pgn: string): { state: GameState; headers: Record<string, string> } {
    const headers: Record<string, string> = {};
    const lines = pgn.trim().split('\n');

    let moveText = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('[')) {
        const match = trimmed.match(/\[(\w+)\s+"(.*)"\]/);
        if (match) {
          headers[match[1]] = match[2];
        }
      } else if (trimmed) {
        moveText += ' ' + trimmed;
      }
    }

    let state = Board.getInitialState();

    // Clean move tokens: remove move numbers like "1.", "2...", comments, and result
    const tokens = moveText
      .replace(/\{[^}]*\}/g, '')
      .replace(/\d+\.+/g, '')
      .replace(/(1-0|0-1|1\/2-1\/2|\*)/g, '')
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0);

    for (const token of tokens) {
      const legalMoves = MoveGenerator.generateLegalMoves(state);
      const matchedMove = legalMoves.find((m) => m.san === token || this.looseSANMatch(m, token));

      if (matchedMove) {
        state = MoveGenerator.applyMove(state, matchedMove);
      }
    }

    return { state, headers };
  }

  private static looseSANMatch(move: Move, token: string): boolean {
    const toAlg = Board.squareToAlgebraic(move.to);
    return token.includes(toAlg);
  }
}
