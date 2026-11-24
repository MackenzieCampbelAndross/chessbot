import React, { useState, useMemo, useEffect } from 'react';
import { GameController } from './core/game_controller';
import { Difficulty, GameState, PieceType } from './types';
import { Chessboard } from './components/Chessboard';
import { Header } from './components/Header';
import { GamePanel } from './components/GamePanel';
import { PGNModal } from './components/PGNModal';

export const App: React.FC = () => {
  const controller = useMemo(() => new GameController(), []);
  const [state, setState] = useState<GameState>(controller.getState());
  const [difficulty, setDifficulty] = useState<Difficulty>('INTERMEDIATE');
  const [isThinking, setIsThinking] = useState(false);
  const [isPGNModalOpen, setIsPGNModalOpen] = useState(false);

  const refreshState = () => {
    setState({ ...controller.getState() });
  };

  const handleMakeMove = (from: number, to: number, promotion?: PieceType) => {
    const move = controller.makeMove(from, to, promotion);
    if (move) {
      refreshState();
    }
  };

  // Trigger AI move automatically when it's Black's turn
  useEffect(() => {
    if (state.turn === 'b' && !state.isCheckmate && !state.isDraw && !state.isStalemate) {
      setIsThinking(true);
      const timer = setTimeout(() => {
        controller.makeAIMove(difficulty);
        setIsThinking(false);
        refreshState();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [state.turn, state.history.length]);

  const handleManualAIMove = () => {
    setIsThinking(true);
    setTimeout(() => {
      controller.makeAIMove(difficulty);
      setIsThinking(false);
      refreshState();
    }, 150);
  };

  const handleUndo = () => {
    // If it's White's turn, undoing means undoing Black's move + White's move
    controller.undo();
    if (state.turn === 'w') {
      controller.undo();
    }
    refreshState();
  };

  const handleRedo = () => {
    controller.redo();
    refreshState();
  };

  const handleNewGame = () => {
    controller.reset();
    refreshState();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      <Header
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        state={state}
        onNewGame={handleNewGame}
        onOpenPGN={() => setIsPGNModalOpen(true)}
      />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Chessboard Viewport */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-slate-950/80">
          <Chessboard
            state={state}
            onMakeMove={handleMakeMove}
            isInteractive={!isThinking && state.turn === 'w'}
          />
        </div>

        {/* Game Panel / Move History / Eval */}
        <GamePanel
          controller={controller}
          state={state}
          difficulty={difficulty}
          isThinking={isThinking}
          onAIMove={handleManualAIMove}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </main>

      <PGNModal
        isOpen={isPGNModalOpen}
        onClose={() => setIsPGNModalOpen(false)}
        controller={controller}
        onRefresh={refreshState}
      />
    </div>
  );
};

export default App;
