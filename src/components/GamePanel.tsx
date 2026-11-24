import React from 'react';
import { GameState, Difficulty } from '../types';
import { GameController } from '../core/game_controller';
import { Evaluator } from '../core/evaluator';
import { PieceIcon } from './ChessPieces';

interface GamePanelProps {
  controller: GameController;
  state: GameState;
  difficulty: Difficulty;
  isThinking: boolean;
  onAIMove: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const GamePanel: React.FC<GamePanelProps> = ({
  controller,
  state,
  difficulty,
  isThinking,
  onAIMove,
  onUndo,
  onRedo,
}) => {
  const evalScore = Evaluator.evaluate(state) / 100; // Centipawns to pawns
  const clampedEval = Math.max(-10, Math.min(10, evalScore));
  const whitePercent = 50 + (clampedEval / 10) * 45; // 5% to 95%

  const { whiteCaptured, blackCaptured, advantage } = controller.getCapturedPieces();

  return (
    <aside className="w-full lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full select-none">
      {/* Top Evaluation Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-slate-400">Position Evaluation</span>
          <span
            className={`font-mono font-bold ${
              evalScore > 0 ? 'text-emerald-400' : evalScore < 0 ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            {evalScore > 0 ? `+${evalScore.toFixed(1)}` : evalScore.toFixed(1)}
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-700/60 overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-slate-100 transition-all duration-500 ease-out"
            style={{ width: `${whitePercent}%` }}
          />
          <div
            className="h-full bg-slate-950 transition-all duration-500 ease-out"
            style={{ width: `${100 - whitePercent}%` }}
          />
        </div>
      </div>

      {/* Opponent (Black) Info */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🤖</span>
            <div>
              <h4 className="text-xs font-bold text-slate-200">ChessBot (Black)</h4>
              <p className="text-[10px] text-slate-500">{difficulty} Engine</p>
            </div>
          </div>
          {state.turn === 'b' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 animate-pulse">
              {isThinking ? 'Calculating Move...' : 'To Move'}
            </span>
          )}
        </div>

        {/* Captured White pieces */}
        <div className="flex items-center space-x-1 min-h-[24px]">
          {blackCaptured.map((p, idx) => (
            <div key={idx} className="scale-75 origin-left">
              <PieceIcon type={p} color="w" className="w-6 h-6" />
            </div>
          ))}
          {advantage < 0 && (
            <span className="text-[10px] font-mono text-emerald-400 font-bold ml-1">
              +{(Math.abs(advantage)).toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* Move History Table */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Move Record ({state.history.length} moves)
        </h4>

        {state.history.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-8 italic">
            No moves played yet. White to open.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs font-mono">
            {state.history.map((m, idx) => {
              if (idx % 2 === 0) {
                const moveNum = Math.floor(idx / 2) + 1;
                const nextMove = state.history[idx + 1];

                return (
                  <React.Fragment key={idx}>
                    <div className="flex items-center justify-between bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800/60">
                      <span className="text-slate-500 text-[10px]">{moveNum}.</span>
                      <span className="text-slate-200 font-semibold">{m.san}</span>
                    </div>
                    {nextMove ? (
                      <div className="flex items-center justify-between bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800/60">
                        <span className="text-slate-500 text-[10px]">{moveNum}...</span>
                        <span className="text-slate-200 font-semibold">{nextMove.san}</span>
                      </div>
                    ) : (
                      <div className="bg-transparent" />
                    )}
                  </React.Fragment>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>

      {/* Player (White) Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">👤</span>
            <div>
              <h4 className="text-xs font-bold text-slate-200">You (White)</h4>
              <p className="text-[10px] text-slate-500">Player</p>
            </div>
          </div>
          {state.turn === 'w' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              Your Turn
            </span>
          )}
        </div>

        {/* Captured Black pieces */}
        <div className="flex items-center space-x-1 min-h-[24px]">
          {whiteCaptured.map((p, idx) => (
            <div key={idx} className="scale-75 origin-left">
              <PieceIcon type={p} color="b" className="w-6 h-6" />
            </div>
          ))}
          {advantage > 0 && (
            <span className="text-[10px] font-mono text-emerald-400 font-bold ml-1">
              +{advantage.toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* Control Action Buttons */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
        <button
          onClick={onUndo}
          className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center space-x-1"
        >
          <span>↶</span>
          <span>Undo</span>
        </button>

        <button
          onClick={onRedo}
          className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center space-x-1"
        >
          <span>↷</span>
          <span>Redo</span>
        </button>

        <button
          onClick={onAIMove}
          disabled={isThinking}
          className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition-all flex items-center justify-center space-x-1 disabled:opacity-50"
        >
          <span>🤖</span>
          <span>AI Move</span>
        </button>
      </div>
    </aside>
  );
};
