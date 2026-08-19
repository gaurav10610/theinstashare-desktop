import React, { useState, useEffect } from 'react';
import { usePeerStore } from '../../stores/usePeerStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { M3Badge } from '../ui/M3Components';
import { Minus, Square, X, QrCode, ShieldCheck, Wifi } from 'lucide-react';

export function Header() {
  const { myName, myAvatar, peers } = usePeerStore();
  const { isWebBridgeActive } = useSettingsStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const activePeerCount = Object.keys(peers).length;

  useEffect(() => {
    window.api?.isWindowMaximized().then(setIsMaximized).catch(() => {});
  }, []);

  const handleMinimize = () => window.api?.minimizeWindow();
  const handleMaximize = () => {
    window.api?.maximizeWindow();
    setIsMaximized(!isMaximized);
  };
  const handleClose = () => window.api?.closeWindow();

  return (
    <header
      className="h-13 w-full flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md select-none shrink-0"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Left: Branding & Status (with traffic light clearance on macOS) */}
      <div className="flex items-center gap-3 pl-18">
        <div className="flex items-center gap-2">
          <span className="text-xl shrink-0">{myAvatar}</span>
          <span className="font-bold text-xs text-slate-100 tracking-tight">{myName}</span>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          <M3Badge variant={activePeerCount > 0 ? 'success' : 'primary'}>
            <Wifi className="w-3 h-3 mr-1 inline" />
            {activePeerCount} {activePeerCount === 1 ? 'Peer' : 'Peers'} Active
          </M3Badge>

          {isWebBridgeActive && (
            <M3Badge variant="secondary">
              <QrCode className="w-3 h-3 mr-1 inline" />
              Web Gateway Live
            </M3Badge>
          )}
        </div>
      </div>

      {/* Right: Security & Window Controls */}
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>E2EE Active</span>
        </div>

        {/* Window Controls on Windows/Linux */}
        {window.api?.platform !== 'darwin' && (
          <div className="flex items-center gap-1 ml-2">
            <button onClick={handleMinimize} className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={handleMaximize} className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg">
              <Square className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
