import React, { useEffect, useRef, useState } from 'react';
import { usePeerStore } from '../../stores/usePeerStore';
import { useTerminalStore } from '../../stores/useTerminalStore';
import { useAIStore } from '../../stores/useAIStore';
import { ConnectionManager } from '../../core/transport/ConnectionManager';
import { AIClient } from '../../core/ai/AIClient';
import { M3Button, M3IconButton, M3Badge, M3Card } from '../../components/ui/M3Components';
import { Terminal as TerminalIcon, Play, Sparkles, Send } from 'lucide-react';

export function TerminalView() {
  const { selectedPeerId, peers } = usePeerStore();
  const { isActive, peerName, isHost, history, startSession, endSession, appendHistory, clearHistory } = useTerminalStore();
  const { settings } = useAIStore();

  const activePeer = selectedPeerId ? peers[selectedPeerId] : Object.values(peers)[0];
  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const [cmdInput, setCmdInput] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    terminalOutputRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleStartPty = async () => {
    if (!activePeer) return;
    startSession(activePeer.id, activePeer.name, true);

    window.api?.sendSignal(activePeer.id, {
      type: 'terminal-request',
      sourceName: usePeerStore.getState().myName,
      sourceAvatar: usePeerStore.getState().myAvatar
    }).catch(() => {});

    const transport = await ConnectionManager.getInstance().connectToPeer(activePeer.id);
    await window.api?.spawnTerminal(80, 24);

    window.api?.onTerminalData((data) => {
      appendHistory(data);
      transport?.send('terminal', { type: 'pty-data', data });
    });

    appendHistory(`\x1b[1;32m[ZeroHop P2P Shell Connected with ${activePeer.name}]\x1b[0m\n$ `);
  };

  const handleSendCommand = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!cmdInput.trim()) return;

    const command = cmdInput.trim() + '\n';
    if (activePeer) {
      const transport = ConnectionManager.getInstance().getTransport(activePeer.id);
      transport?.send('terminal', { type: 'pty-input', data: command });
    }

    window.api?.writeTerminal(command);
    appendHistory(`$ ${cmdInput}\n`);
    setCmdInput('');
  };

  const handleAskAI = async () => {
    if (!cmdInput && history.length === 0) return;
    setIsAiLoading(true);
    setAiAnalysis(null);

    const context = cmdInput ? `Command: ${cmdInput}` : `Terminal Log:\n${history.slice(-10).join('')}`;

    try {
      const result = await AIClient.query(
        `Explain this terminal command or error and provide safe recommendations:\n${context}`,
        settings,
        'You are an expert Linux/macOS/Windows terminal assistant. Give concise, safe explanations.'
      );
      setAiAnalysis(result);
    } catch (err: any) {
      setAiAnalysis(`AI Assistant Error: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-6 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700/80 shrink-0">
            <TerminalIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-100">
              {isActive ? `P2P Terminal Session: ${peerName}` : 'P2P Remote Shell & Pairing'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Encrypted DataChannel PTY</span>
            </div>
          </div>
        </div>

        {isActive ? (
          <div className="flex items-center gap-2">
            <M3Badge variant="success">{isHost ? 'Host Session' : 'Guest Peer'}</M3Badge>
            <M3Button
              size="sm"
              variant="tonal"
              icon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              onClick={handleAskAI}
            >
              Analyze with AI
            </M3Button>
            <M3Button
              size="sm"
              variant="danger"
              onClick={() => {
                window.api?.killTerminal();
                endSession();
              }}
            >
              Terminate
            </M3Button>
          </div>
        ) : (
          <M3Button
            variant="filled"
            size="sm"
            disabled={!activePeer}
            icon={<Play className="w-4 h-4" />}
            onClick={handleStartPty}
          >
            Start Shell with {activePeer?.name || 'Peer'}
          </M3Button>
        )}
      </div>

      {/* Main Terminal Window */}
      <div className="flex-1 my-4 flex flex-col rounded-2xl overflow-hidden glass-panel border border-slate-800/90 font-mono text-xs">
        {/* Terminal Title Bar */}
        <div className="h-8.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-4 text-slate-400 text-[11px] shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="ml-2 font-semibold">zerohop-pty</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={clearHistory} className="hover:text-slate-200 transition-colors">Clear</button>
          </div>
        </div>

        {/* Terminal Output Area */}
        <div className="flex-1 overflow-y-auto p-4 text-slate-200 leading-relaxed space-y-1 select-text bg-slate-950/90">
          {history.length === 0 ? (
            <div className="text-slate-600 text-center py-20 font-sans text-xs">
              Terminal idle. Click "Start Shell with Peer" to begin collaborative P2P terminal pairing.
            </div>
          ) : (
            history.map((line, idx) => (
              <div key={idx} className="whitespace-pre-wrap break-all">
                {line}
              </div>
            ))
          )}
          <div ref={terminalOutputRef} />
        </div>

        {/* Terminal Command Input */}
        {isActive && (
          <form onSubmit={handleSendCommand} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0">
            <span className="text-emerald-400 font-bold">$</span>
            <input
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              placeholder="Enter shell command..."
              className="flex-1 bg-transparent border-none text-slate-100 text-xs focus:outline-none font-mono"
            />
            <M3IconButton type="submit" size="sm" variant="filled">
              <Send className="w-3.5 h-3.5" />
            </M3IconButton>
          </form>
        )}
      </div>

      {/* AI Analysis Panel */}
      {(aiAnalysis || isAiLoading) && (
        <M3Card className="p-4 bg-indigo-950/20 border-indigo-500/30 text-xs flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Command Assistant</span>
            </div>
            <button onClick={() => setAiAnalysis(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          {isAiLoading ? (
            <div className="text-slate-400 py-2 animate-pulse">Analyzing command and diagnosing terminal context...</div>
          ) : (
            <div className="text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
              {aiAnalysis}
            </div>
          )}
        </M3Card>
      )}
    </div>
  );
}
