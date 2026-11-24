import React, { useState } from 'react';
import { GameController } from '../core/game_controller';
import { Board } from '../core/board';

interface PGNModalProps {
  isOpen: boolean;
  onClose: () => void;
  controller: GameController;
  onRefresh: () => void;
}

export const PGNModal: React.FC<PGNModalProps> = ({
  isOpen,
  onClose,
  controller,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'EXPORT' | 'IMPORT'>('EXPORT');
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [copiedFen, setCopiedFen] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPGN = controller.exportPGN();
  const currentFEN = Board.toFEN(controller.getState());

  const handleCopyPGN = () => {
    navigator.clipboard.writeText(currentPGN);
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  const handleCopyFEN = () => {
    navigator.clipboard.writeText(currentFEN);
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  const handleImport = () => {
    try {
      setErrorMessage(null);
      const text = importInput.trim();
      if (!text) return;

      if (text.includes('/') && text.split(/\s+/).length >= 2) {
        // Assume FEN
        controller.loadFEN(text);
      } else {
        // Assume PGN
        controller.importPGN(text);
      }
      onRefresh();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse PGN/FEN notation');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📜</span>
            <h3 className="text-base font-bold text-slate-100">PGN & FEN Notation</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex border-b border-slate-800 bg-slate-950 px-6 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'EXPORT'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Export Notation
          </button>
          <button
            onClick={() => setActiveTab('IMPORT')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'IMPORT'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Import PGN / FEN
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'EXPORT' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Portable Game Notation (PGN):
                  </label>
                  <button
                    onClick={handleCopyPGN}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    {copiedPgn ? '✓ Copied' : 'Copy PGN'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={currentPGN}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 h-44 outline-none resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Forsyth-Edwards Notation (FEN):
                  </label>
                  <button
                    onClick={handleCopyFEN}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    {copiedFen ? '✓ Copied' : 'Copy FEN'}
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={currentFEN}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-300 outline-none"
                />
              </div>
            </>
          )}

          {activeTab === 'IMPORT' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Paste any valid standard PGN move text or FEN position string to load the game state:
              </p>

              <textarea
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="Paste PGN (e.g. 1. e4 e5 2. Nf3 ...) or FEN (rnbqkbnr/pppppppp/...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 h-48 outline-none focus:border-emerald-500"
              />

              {errorMessage && (
                <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p>
              )}

              <button
                onClick={handleImport}
                disabled={!importInput.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
              >
                Load and Validate Position
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
