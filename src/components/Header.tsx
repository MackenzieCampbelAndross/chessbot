import React from 'react';
import { Difficulty, GameState } from '../types';
import { MoveGenerator } from '../core/move_generator';

interface HeaderProps {
  difficulty: Difficulty;
  onDifficultyChange: (diff: Difficulty) => void;
  state: GameState;
  onNewGame: () => void;
  onOpenPGN: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  difficulty,
  onDifficultyChange,
  state,
  onNewGame,
  onOpenPGN,
}) => {
  const status = MoveGenerator.getGameStatus(state);

  let statusBadge = (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      {state.turn === 'w' ? "White's Turn" : "Black's Turn"}
    </span>
  );

  if (status.isCheckmate) {
    statusBadge = (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
        Checkmate! {state.turn === 'w' ? 'Black' : 'White'} Wins
      </span>
    );
  } else if (status.isCheck) {
    statusBadge = (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
        Check!
      </span>
    );
  } else if (status.isDraw || status.isStalemate) {
    statusBadge = (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300 border border-slate-600">
        Draw ({status.isStalemate ? 'Stalemate' : '50-Move Rule'})
      </span>
    );
  }

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 select-none">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
          ♟️
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-300 to-emerald-400 bg-clip-text text-transparent">
              CHESSBOT
            </span>
            <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              v1.0.0
            </span>
          </div>
          <p className="text-xs text-slate-400">Minimax Alpha-Beta Autonomous Chess Engine</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {statusBadge}

        <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Engine:</span>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
            className="bg-transparent font-semibold text-amber-400 outline-none cursor-pointer"
          >
            <option value="BEGINNER" className="bg-slate-900 text-slate-200">Beginner (Depth 1)</option>
            <option value="CASUAL" className="bg-slate-900 text-slate-200">Casual (Depth 2)</option>
            <option value="INTERMEDIATE" className="bg-slate-900 text-slate-200">Intermediate (Depth 3)</option>
            <option value="ADVANCED" className="bg-slate-900 text-slate-200">Advanced (Depth 4)</option>
            <option value="MASTER" className="bg-slate-900 text-slate-200">Master (Depth 5)</option>
          </select>
        </div>

        <button
          onClick={onOpenPGN}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
        >
          📜 PGN / FEN
        </button>

        <button
          onClick={onNewGame}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
        >
          + New Game
        </button>
      </div>
    </header>
  );
};
