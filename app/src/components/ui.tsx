import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4 shadow-lg shadow-black/20 backdrop-blur-sm transition-colors ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 pt-6 pb-3">
      <div className="min-w-0">
        <h1 className="bg-gradient-to-b from-white to-slate-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({ value, max, color = '#34d399' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07] shadow-inner shadow-black/30">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
      />
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const styles: Record<string, string> = {
    primary:
      'bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/20 hover:from-emerald-300 hover:to-emerald-400',
    secondary: 'border border-white/10 bg-white/10 text-white hover:bg-white/15',
    ghost: 'text-slate-300 hover:bg-white/5',
    danger: 'border border-red-500/20 bg-red-500/15 text-red-400 hover:bg-red-500/25',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15 ${props.className ?? ''}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15 ${props.className ?? ''}`}
    />
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="px-4 py-8 text-center text-sm text-slate-500">{text}</p>;
}
