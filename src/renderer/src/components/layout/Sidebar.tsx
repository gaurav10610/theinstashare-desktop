import React from 'react';
import { usePeerStore } from '../../stores/usePeerStore';
import { useFileStore } from '../../stores/useFileStore';
import { useCallStore } from '../../stores/useCallStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { cn } from '../ui/M3Components';
import {
  Compass,
  MessageSquare,
  HardDriveUpload,
  MonitorPlay,
  Terminal,
  Sparkles,
  Settings,
  LucideIcon
} from 'lucide-react';

interface NavItem {
  id: 'dashboard' | 'talk' | 'files' | 'remote' | 'terminal' | 'ai' | 'settings';
  label: string;
  icon: LucideIcon;
  badge?: number;
  isLive?: boolean;
  isAI?: boolean;
}

export function Sidebar() {
  const { activeTab, setActiveTab, messages } = usePeerStore();
  const { transfers } = useFileStore();
  const { isActive: isCallActive } = useCallStore();
  const { incomingCall } = useNotificationStore();

  const activeTransfersCount = Object.values(transfers).filter(
    (t) => t.status === 'transferring' || t.status === 'queued'
  ).length;

  const totalUnreadMessages = Object.values(messages).reduce((acc, list) => acc + list.length, 0);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Radar', icon: Compass },
    { id: 'talk', label: '1:1 Talk', icon: MessageSquare, isLive: isCallActive || incomingCall !== null },
    { id: 'files', label: 'Transfers', icon: HardDriveUpload, badge: activeTransfersCount },
    { id: 'remote', label: 'Remote', icon: MonitorPlay },
    { id: 'terminal', label: 'P2P Shell', icon: Terminal },
    { id: 'ai', label: 'AI Copilot', icon: Sparkles, isAI: true },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-20 bg-slate-950/80 border-r border-slate-800/80 flex flex-col items-center py-5 justify-between select-none shrink-0">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* App Logo */}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
          <span className="font-extrabold text-white text-lg tracking-tight">ZH</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-2.5 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'group relative w-full flex flex-col items-center gap-1 py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                )}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
                )}

                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-transform group-hover:scale-110',
                      isActive && 'text-indigo-400',
                      item.isAI && 'text-amber-400'
                    )}
                  />

                  {/* Badges / Live indicators */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-slate-950">
                      {item.badge}
                    </span>
                  )}

                  {item.isLive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
                  )}
                </div>

                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Version */}
      <div className="text-[10px] font-semibold text-slate-600 tracking-wider">
        v2.0
      </div>
    </aside>
  );
}
