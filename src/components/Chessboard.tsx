import React, { useState } from 'react';
import { GameState, PieceType } from '../types';
import { PieceIcon } from './ChessPieces';
import { MoveGenerator } from '../core/move_generator';

interface ChessboardProps {
  state: GameState;
  onMakeMove: (from: number, to: number, promotion?: PieceType) => void;
  isInteractive?: boolean;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  state,
  onMakeMove,
  isInteractive = true,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);

  const legalMoves = MoveGenerator.generateLegalMoves(state);

  const selectedMoves = selectedSquare !== null
    ? legalMoves.filter((m) => m.from === selectedSquare)
    : [];

  const legalTargets = new Set(selectedMoves.map((m) => m.to));

  const lastMove = state.history[state.history.length - 1];

  const handleSquareClick = (square: number) => {
    if (!isInteractive) return;

    const clickedPiece = state.board[square];

    // If destination square is legal move for current selection:
    if (selectedSquare !== null && legalTargets.has(square)) {
      // Check for pawn promotion (moving to rank 8 for White or rank 1 for Black)
      const movingPiece = state.board[selectedSquare];
      const isPromo =
        movingPiece?.type === 'p' &&
        (Math.floor(square / 8) === 7 || Math.floor(square / 8) === 0);

      onMakeMove(selectedSquare, square, isPromo ? 'q' : undefined);
      setSelectedSquare(null);
      return;
    }

    // Otherwise select or switch to clicked piece of current player's color
    if (clickedPiece && clickedPiece.color === state.turn) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  const kingInCheckSquare = state.isCheck
    ? MoveGenerator.findKing(state.board, state.turn)
    : null;

  // Build grid of 64 squares: Rank 8 down to Rank 1 (rank 7 down to 0)
  const squares: React.ReactNode[] = [];

  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const sq = rank * 8 + file;
      const isLight = (rank + file) % 2 !== 0;
      const piece = state.board[sq];
      const isSelected = selectedSquare === sq;
      const isTarget = legalTargets.has(sq);
      const isLastMove = lastMove && (lastMove.from === sq || lastMove.to === sq);
      const isCheckSquare = kingInCheckSquare === sq;

      // Base square color
      let bgClass = isLight ? 'bg-amber-100/90 text-amber-900' : 'bg-emerald-800 text-emerald-100';

      if (isLastMove) {
        bgClass = isLight ? 'bg-amber-300' : 'bg-emerald-600';
      }

      if (isSelected) {
        bgClass = 'bg-sky-400/80 ring-2 ring-sky-300';
      }

      if (isCheckSquare) {
        bgClass = 'bg-rose-600 ring-4 ring-rose-400 animate-pulse';
      }

      squares.push(
        <div
          key={sq}
          onClick={() => handleSquareClick(sq)}
          className={`relative aspect-square flex items-center justify-center cursor-pointer select-none transition-colors ${bgClass}`}
        >
          {/* Coordinate labels */}
          {file === 0 && (
            <span className="absolute top-0.5 left-1 text-[9px] font-bold opacity-60">
              {rank + 1}
            </span>
          )}
          {rank === 0 && (
            <span className="absolute bottom-0.5 right-1 text-[9px] font-bold opacity-60">
              {String.fromCharCode('a'.charCodeAt(0) + file)}
            </span>
          )}

          {/* Piece */}
          {piece && (
            <PieceIcon type={piece.type} color={piece.color} />
          )}

          {/* Legal move indicator */}
          {isTarget && (
            <div
              className={`absolute rounded-full ${
                piece
                  ? 'w-full h-full border-4 border-amber-400/70 bg-amber-400/20'
                  : 'w-4 h-4 bg-black/30 ring-2 ring-white/50'
              }`}
            />
          )}
        </div>
      );
    }
  }

  return (
    <div className="w-full max-w-[560px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900 grid grid-cols-8 grid-rows-8">
      {squares}
    </div>
  );
};
