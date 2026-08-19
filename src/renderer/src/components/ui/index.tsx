import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, LucideIcon } from 'lucide-react';

/**
 * Utility to merge Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BUTTON & ICON BUTTON
// ─────────────────────────────────────────────────────────────────────────────

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tonal' | 'outlined' | 'ghost' | 'danger' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-8 px-3.5 text-xs gap-1.5 rounded-xl font-medium',
      md: 'h-10 px-5 text-sm gap-2 rounded-2xl font-semibold',
      lg: 'h-12 px-6 text-base gap-2.5 rounded-2xl font-bold'
    };

    const variantClasses = {
      primary:
        'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/30',
      filled:
        'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/30',
      secondary:
        'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white shadow-md shadow-cyan-600/20 border border-cyan-400/30',
      tonal:
        'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 border border-slate-300 dark:border-slate-700',
      outlined:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 active:bg-slate-200/60',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100',
      danger:
        'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-md shadow-rose-600/20 border border-rose-400/30'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.98]',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'standard' | 'filled' | 'tonal' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'standard', size = 'md', icon, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8 rounded-lg text-sm',
      md: 'w-10 h-10 rounded-xl text-base',
      lg: 'w-12 h-12 rounded-2xl text-lg'
    };

    const variantClasses = {
      standard:
        'bg-transparent hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 active:bg-slate-300/50',
      filled:
        'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/30',
      tonal:
        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700/80',
      outlined:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40 disabled:pointer-events-none active:scale-95 shrink-0',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {icon}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

// ─────────────────────────────────────────────────────────────────────────────
// 2. CARD & SUBCOMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'filled' | 'outlined' | 'glass';
  interactive?: boolean;
}

export function Card({
  children,
  className,
  variant = 'filled',
  interactive = false,
  ...props
}: CardProps) {
  const variantClasses = {
    elevated:
      'bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-950/5 dark:shadow-slate-950/40',
    filled:
      'bg-white dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 shadow-xs',
    outlined:
      'bg-transparent text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-800',
    glass:
      'glass-panel text-slate-900 dark:text-slate-100'
  };

  return (
    <div
      className={cn(
        'rounded-3xl p-5 transition-all duration-200',
        variantClasses[variant],
        interactive &&
          'cursor-pointer hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-1 pb-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-slate-600 dark:text-slate-400 leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('py-1 text-slate-800 dark:text-slate-200', className)} {...props}>
      {children}
    </div>
  );
}

export function CardActions({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center gap-2 pt-4 mt-auto border-t border-slate-200 dark:border-slate-800/60', className)} {...props}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BADGE
// ─────────────────────────────────────────────────────────────────────────────

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ children, className, variant = 'primary', size = 'md', ...props }: BadgeProps) {
  const variantClasses = {
    primary:
      'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30',
    secondary:
      'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30',
    success:
      'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
    warning:
      'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30',
    danger:
      'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30',
    neutral:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 rounded-lg font-medium',
    md: 'text-xs px-2.5 py-1 rounded-xl font-semibold'
  };

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 select-none shrink-0 font-medium', sizeClasses[size], variantClasses[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DIALOG / MODAL
// ─────────────────────────────────────────────────────────────────────────────

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  maxWidth = 'max-w-lg'
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div
        className={cn(
          'relative w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-scale-up text-slate-900 dark:text-slate-100',
          maxWidth
        )}
      >
        {/* Header */}
        {(title || icon) && (
          <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                  {icon}
                </div>
              )}
              <div>
                {title && <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>}
                {description && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{description}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="py-2">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. INPUT / TEXT FIELD
// ─────────────────────────────────────────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, leadingIcon, trailingIcon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leadingIcon && (
            <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
              {leadingIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full h-10 px-4 rounded-2xl bg-white dark:bg-slate-900/80 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-800 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed',
              leadingIcon && 'pl-10',
              trailingIcon && 'pr-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute right-3 text-slate-400 dark:text-slate-500">
              {trailingIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-[11px] text-rose-500 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-[11px] text-slate-600 dark:text-slate-400">{helperText}</span>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ─────────────────────────────────────────────────────────────────────────────
// 6. SWITCH / TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{label}</span>}
          {description && <span className="text-[11px] text-slate-600 dark:text-slate-400">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50',
          checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5',
            checked ? 'translate-x-5.5' : 'translate-x-0.5'
          )}
        />
      </button>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TABS
// ─────────────────────────────────────────────────────────────────────────────

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon | React.ReactNode;
  badge?: number | string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-800/80', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none cursor-pointer',
              isActive
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700/60 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
            )}
          >
            {tab.icon && typeof tab.icon === 'function' ? (
              React.createElement(tab.icon as any, { className: 'w-3.5 h-3.5' })
            ) : (
              tab.icon
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-500 text-white font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────

export interface ProgressBarProps {
  progress?: number;
  indeterminate?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success';
}

export function ProgressBar({ progress = 0, indeterminate = false, className, variant = 'primary' }: ProgressBarProps) {
  const variantColor = {
    primary: 'bg-indigo-500',
    secondary: 'bg-cyan-500',
    success: 'bg-emerald-500'
  };

  return (
    <div className={cn('w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative', className)}>
      {indeterminate ? (
        <div className={cn('h-full w-1/3 rounded-full animate-indeterminate', variantColor[variant])} />
      ) : (
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out', variantColor[variant])}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. TOOLTIP & DIVIDER
// ─────────────────────────────────────────────────────────────────────────────

export function Divider({ className, orientation = 'horizontal' }: { className?: string; orientation?: 'horizontal' | 'vertical' }) {
  return (
    <div
      className={cn(
        orientation === 'horizontal' ? 'w-full h-px bg-slate-200 dark:bg-slate-800' : 'h-full w-px bg-slate-200 dark:border-slate-800',
        className
      )}
    />
  );
}

// Backward Compatibility Aliases for smooth migration
export const M3Button = Button;
export const M3IconButton = IconButton;
export const M3Card = Card;
export const M3CardHeader = CardHeader;
export const M3CardContent = CardContent;
export const M3CardActions = CardActions;
export const M3Badge = Badge;
export const M3Dialog = Dialog;
export const M3TextField = Input;
export const M3Switch = Switch;
export const M3Tabs = Tabs;
export const M3ProgressBar = ProgressBar;
export const M3Divider = Divider;
