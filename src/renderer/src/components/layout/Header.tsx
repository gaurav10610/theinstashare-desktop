import React, { useState, useEffect } from 'react';
import { usePeerStore } from '../../stores/usePeerStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { Badge, IconButton } from '../ui';
import { Minus, Square, X, QrCode, ShieldCheck, Wifi, Sun, Moon, Laptop } from 'lucide-react';

export function Header() {
  const { myName, myAvatar, peers } = usePeerStore();
  const { isWebBridgeActive } = useSettingsStore();
  const { theme, setTheme } = useThemeStore();
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

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <header
      className="h-13 w-full flex items-center justify-between px-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 backdrop-blur-md select-none shrink-0 text-slate-900 dark:text-slate-100"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Left: Branding & Status (with traffic light clearance on macOS) */}
      <div className="flex items-center gap-3 pl-18">
        <div className="flex items-center gap-2">
          <span className="text-xl shrink-0">{myAvatar}</span>
          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 tracking-tight">{myName}</span>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          <Badge variant={activePeerCount > 0 ? 'success' : 'primary'}>
            <Wifi className="w-3 h-3 mr-1 inline" />
            {activePeerCount} {activePeerCount === 1 ? 'Peer' : 'Peers'} Active
          </Badge>

          {isWebBridgeActive && (
            <Badge variant="secondary">
              <QrCode className="w-3 h-3 mr-1 inline" />
              Web Gateway Live
            </Badge>
          )}
        </div>
      </div>

      {/* Right: Theme Switcher, Security & Window Controls */}
      <div className="flex items-center gap-2.5" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {/* Quick Theme Switcher Button */}
        <IconButton
          size="sm"
          variant="tonal"
          onClick={cycleTheme}
          title={`Theme: ${theme.toUpperCase()} (Click to toggle Dark / Light / System)`}
          icon={
            theme === 'system' ? (
              <Laptop className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            ) : theme === 'light' ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            )
          }
        />

        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>E2EE Active</span>
        </div>

        {/* Window Controls on Windows/Linux */}
        {window.api?.platform !== 'darwin' && (
          <div className="flex items-center gap-1 ml-2">
            <button onClick={handleMinimize} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={handleMaximize} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Square className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
