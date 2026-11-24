import { GameState, Move, Difficulty, PieceType } from '../types';
import { Board } from './board';
import { MoveGenerator } from './move_generator';
import { ChessEngine } from './engine';
import { PGNParser } from './pgn_parser';
import { PIECE_VALUES } from './piece_square_tables';

export interface GameSnapshot {
  state: GameState;
  redoStack: Move[];
}

export class GameController {
  private state: GameState;
  private redoStack: Move[] = [];
  private engine = new ChessEngine();
  private storageKey = 'chessbot_saved_game_v1';

  constructor(initialFen?: string) {
    if (initialFen) {
      this.state = Board.fromFEN(initialFen);
    } else {
      this.state = Board.getInitialState();
    }
  }

  getState(): GameState {
    return this.state;
  }

  makeMove(from: number, to: number, promotion?: PieceType): Move | null {
    const legalMoves = MoveGenerator.generateLegalMoves(this.state);
    const move = legalMoves.find(
      (m) => m.from === from && m.to === to && (!promotion || m.promotion === promotion)
    );

    if (!move) return null;

    this.state = MoveGenerator.applyMove(this.state, move);
    this.redoStack = []; // Clear redo stack on new branch
    this.saveToStorage();
    return move;
  }

  makeAIMove(difficulty: Difficulty = 'INTERMEDIATE'): { move: Move | null; search: any } {
    const searchResult = this.engine.findBestMove(this.state, difficulty);
    if (searchResult.bestMove) {
      this.state = MoveGenerator.applyMove(this.state, searchResult.bestMove);
      this.redoStack = [];
      this.saveToStorage();
    }
    return { move: searchResult.bestMove, search: searchResult };
  }

  undo(): boolean {
    if (this.state.history.length === 0) return false;

    const lastMove = this.state.history.pop()!;
    this.redoStack.push(lastMove);

    // Replay from starting state to recompute
    let fresh = Board.getInitialState();
    for (const m of this.state.history) {
      fresh = MoveGenerator.applyMove(fresh, m);
    }
    this.state = fresh;
    this.saveToStorage();
    return true;
  }

  redo(): boolean {
    if (this.redoStack.length === 0) return false;

    const moveToRedo = this.redoStack.pop()!;
    this.state = MoveGenerator.applyMove(this.state, moveToRedo);
    this.saveToStorage();
    return true;
  }

  reset(): void {
    this.state = Board.getInitialState();
    this.redoStack = [];
    this.saveToStorage();
  }

  loadFEN(fen: string): void {
    this.state = Board.fromFEN(fen);
    this.redoStack = [];
    this.saveToStorage();
  }

  exportPGN(): string {
    return PGNParser.exportPGN(this.state);
  }

  importPGN(pgn: string): void {
    const { state } = PGNParser.parseAndReplay(pgn);
    this.state = state;
    this.redoStack = [];
    this.saveToStorage();
  }

  getCapturedPieces(): { whiteCaptured: PieceType[]; blackCaptured: PieceType[]; advantage: number } {
    const whiteCaptured: PieceType[] = []; // Black pieces captured by White
    const blackCaptured: PieceType[] = []; // White pieces captured by Black

    for (const move of this.state.history) {
      if (move.captured) {
        if (move.color === 'w') {
          whiteCaptured.push(move.captured);
        } else {
          blackCaptured.push(move.captured);
        }
      }
    }

    let whiteValue = 0;
    for (const p of whiteCaptured) whiteValue += PIECE_VALUES[p];
    let blackValue = 0;
    for (const p of blackCaptured) blackValue += PIECE_VALUES[p];

    return {
      whiteCaptured,
      blackCaptured,
      advantage: (whiteValue - blackValue) / 100,
    };
  }

  private saveToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const fen = Board.toFEN(this.state);
        localStorage.setItem(this.storageKey, JSON.stringify({ fen, history: this.state.history }));
      } catch {
        // Fallback for sandboxed environments
      }
    }
  }
}
