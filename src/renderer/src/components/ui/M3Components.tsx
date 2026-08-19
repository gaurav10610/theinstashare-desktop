import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// --- M3 Button ---
export interface M3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const M3Button = forwardRef<HTMLButtonElement, M3ButtonProps>(
  ({ className, variant = 'filled', size = 'md', icon, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.98] shrink-0';

    const variants = {
      filled: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 border border-indigo-500/40',
      tonal: 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/25',
      outlined: 'border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:bg-slate-800/50',
      text: 'text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300',
      elevated: 'bg-slate-800 hover:bg-slate-750 text-slate-100 shadow-md border border-slate-700/60',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 border border-rose-500/40'
    };

    const sizes = {
      sm: 'text-xs px-3 h-8 gap-1.5',
      md: 'text-xs px-4 h-9 gap-2',
      lg: 'text-sm px-5 h-11 gap-2.5'
    };

    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled} {...props}>
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);
M3Button.displayName = 'M3Button';

// --- M3 Icon Button ---
export interface M3IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'standard' | 'filled' | 'tonal' | 'outlined' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const M3IconButton = forwardRef<HTMLButtonElement, M3IconButtonProps>(
  ({ className, variant = 'standard', size = 'md', active, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 active:scale-95';

    const variants = {
      standard: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70',
      filled: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20',
      tonal: active
        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
        : 'bg-slate-800/70 hover:bg-slate-750 text-slate-300 border border-slate-700/60 hover:text-slate-100',
      outlined: 'border border-slate-700 text-slate-300 hover:bg-slate-800/50',
      danger: 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30'
    };

    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-9 h-9 text-sm',
      lg: 'w-11 h-11 text-base'
    };

    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    );
  }
);
M3IconButton.displayName = 'M3IconButton';

// --- M3 Card ---
export function M3Card({ className, children, elevated, onClick }: { className?: string; children: React.ReactNode; elevated?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl p-5 transition-all duration-150',
        elevated ? 'glass-panel-elevated' : 'glass-panel',
        onClick && 'cursor-pointer hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 hover:scale-[1.005]',
        className
      )}
    >
      {children}
    </div>
  );
}

// --- M3 Badge ---
export function M3Badge({ children, variant = 'primary', className }: { children: React.ReactNode; variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'; className?: string }) {
  const variants = {
    primary: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
    secondary: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    error: 'bg-rose-500/15 text-rose-300 border-rose-500/25'
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0', variants[variant], className)}>
      {children}
    </span>
  );
}

// --- M3 Text Field ---
export interface M3TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const M3TextField = forwardRef<HTMLInputElement, M3TextFieldProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</label>}
        <div className="relative flex items-center">
          {icon && <span className="absolute left-3.5 text-slate-400 pointer-events-none">{icon}</span>}
          <input
            ref={ref}
            className={cn(
              'w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 h-10 text-xs text-slate-100 placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
              icon && 'pl-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-[11px] text-rose-400 font-medium">{error}</span>}
      </div>
    );
  }
);
M3TextField.displayName = 'M3TextField';

// --- M3 Progress Bar ---
export function M3ProgressBar({ progress, className, color = 'primary' }: { progress: number; className?: string; color?: 'primary' | 'success' | 'warning' }) {
  const colors = {
    primary: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500'
  };

  return (
    <div className={cn('w-full bg-slate-800 rounded-full h-2 overflow-hidden', className)}>
      <div
        className={cn('h-full transition-all duration-200 rounded-full', colors[color])}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

// --- M3 Switch ---
export function M3Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (checked: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-xl hover:bg-slate-800/40 transition-colors" onClick={() => onChange(!checked)}>
      <div className="flex flex-col pr-4">
        <span className="text-xs font-semibold text-slate-200">{label}</span>
        {description && <span className="text-[11px] text-slate-400 mt-0.5">{description}</span>}
      </div>
      <div className={cn('w-10 h-5.5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0', checked ? 'bg-indigo-600' : 'bg-slate-700')}>
        <div className={cn('w-4.5 h-4.5 rounded-full bg-white transition-transform shadow-sm', checked ? 'translate-x-4.5' : 'translate-x-0')} />
      </div>
    </div>
  );
}

// --- M3 Tabs ---
export function M3Tabs({ tabs, activeTab, onChange, className }: { tabs: { id: string; label: string; icon?: React.ReactNode; badge?: number }[]; activeTab: string; onChange: (id: string) => void; className?: string }) {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer select-none',
              isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={cn('px-1.5 py-0.2 rounded-full text-[10px]', isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-300')}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// --- M3 Dialog ---
export function M3Dialog({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className={cn('w-full glass-panel-elevated rounded-3xl p-6 relative border border-slate-700/80 shadow-2xl', maxWidth)}>
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800/70 transition-colors">
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
