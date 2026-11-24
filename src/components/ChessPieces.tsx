import React from 'react';
import { PieceType, PieceColor } from '../types';

export const PieceIcon: React.FC<{ type: PieceType; color: PieceColor; className?: string }> = ({
  type,
  color,
  className = 'w-10 h-10',
}) => {
  const isWhite = color === 'w';

  // Unicode chess symbols styled with high-contrast SVG
  const symbolMap: Record<PieceType, { w: string; b: string }> = {
    k: { w: '♔', b: '♚' },
    q: { w: '♕', b: '♛' },
    r: { w: '♖', b: '♜' },
    b: { w: '♗', b: '♝' },
    n: { w: '♘', b: '♞' },
    p: { w: '♙', b: '♟' },
  };

  return (
    <div
      className={`flex items-center justify-center font-serif text-3xl sm:text-4xl select-none leading-none transition-transform hover:scale-105 ${
        isWhite
          ? 'text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter'
          : 'text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]'
      } ${className}`}
    >
      {symbolMap[type][color]}
    </div>
  );
};
