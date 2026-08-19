import React, { useState } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { usePeerStore } from '../../stores/usePeerStore';
import { M3IconButton, M3Button, cn } from './M3Components';
import { Layers, X, Send, Trash2, File as FileIcon, ChevronUp, ChevronDown } from 'lucide-react';

export function DropShelf() {
  const { dropShelfFiles, removeDropShelfFile, clearDropShelf, addDropShelfFiles } = useFileStore();
  const { peers, selectedPeerId } = usePeerStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addDropShelfFiles(Array.from(e.dataTransfer.files));
      setIsExpanded(true);
    }
  };

  const activePeer = selectedPeerId ? peers[selectedPeerId] : Object.values(peers)[0];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'fixed bottom-6 right-6 z-40 transition-all duration-300',
        isDragOver && 'scale-105 ring-4 ring-indigo-500/50'
      )}
    >
      <div className="glass-panel-elevated rounded-3xl p-3 border border-indigo-500/30 shadow-2xl flex flex-col items-end">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Virtual Shelf ({dropShelfFiles.length})</span>
          </div>

          <M3IconButton
            size="sm"
            variant="tonal"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-300"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </M3IconButton>
        </div>

        {isExpanded && (
          <div className="mt-3 w-80 max-h-72 flex flex-col gap-2 pt-2 border-t border-slate-800">
            <div className="overflow-y-auto max-h-44 flex flex-col gap-1.5 pr-1">
              {dropShelfFiles.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  Drag & drop files or snippets here to hold
                </div>
              ) : (
                dropShelfFiles.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <FileIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate text-slate-200">{item.name}</span>
                    </div>
                    <button
                      onClick={() => removeDropShelfFile(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {dropShelfFiles.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <button
                  onClick={clearDropShelf}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                <M3Button
                  size="sm"
                  variant="filled"
                  icon={<Send className="w-3.5 h-3.5" />}
                  disabled={!activePeer}
                  onClick={() => {
                    alert(`Sending ${dropShelfFiles.length} files to ${activePeer?.name || 'peer'}`);
                    clearDropShelf();
                  }}
                >
                  Send to {activePeer ? activePeer.name.slice(0, 10) : 'Peer'}
                </M3Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
