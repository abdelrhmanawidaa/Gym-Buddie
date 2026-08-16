import { NavLink } from 'react-router-dom';
import { useT } from '../lib/i18n';
import type { TranslationKey } from '../lib/translations';

const items: { to: string; label: TranslationKey; icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement }[] = [
  { to: '/', label: 'nav.today', icon: HomeIcon },
  { to: '/workout', label: 'nav.workout', icon: DumbbellIcon },
  { to: '/muscles', label: 'nav.muscles', icon: MuscleIcon },
  { to: '/progress', label: 'nav.progress', icon: ChartIcon },
  { to: '/nutrition', label: 'nav.food', icon: AppleIcon },
  { to: '/body', label: 'nav.body', icon: RulerIcon },
];

export default function BottomNav() {
  const { t } = useT();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-white/10 bg-[#0b0f14]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-500'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="max-w-full truncate px-0.5">{t(label)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function DumbbellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6.5 6.5 3 10l4 4 3.5-3.5" />
      <path d="M17.5 17.5 21 14l-4-4-3.5 3.5" />
      <path d="m9 15 6-6" />
    </svg>
  );
}

function MuscleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 9c2-2 5-2.5 7-1.5 2 1 2.5 3 4.5 3.5 2 .5 3.5-.5 4.5-1.5" />
      <path d="M4 9c-1 3 0 6 2.5 7.5C9 18 12 17.5 13.5 15" />
      <path d="M20 9.5c1 3.5-.5 7-3.5 8.5" />
    </svg>
  );
}

function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19V9M12 19V5m8 14v-8" />
    </svg>
  );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 8c-2.5-2-6-1.5-7 1.5-1.3 4 1 9.5 4 9.5 1.2 0 1.5-.5 3-.5s1.8.5 3 .5c2.3 0 4.5-4 4.5-6.5 0-2-1.5-3.5-3-3.8" />
      <path d="M12 8c0-2 1-3.5 3-4" />
    </svg>
  );
}

function RulerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="9" width="18" height="6" rx="1" transform="rotate(-45 12 12)" />
      <path d="m8 9 1.5 1.5M11.5 5.5 13 7M15 2l1.5 1.5" transform="translate(0 6)" />
    </svg>
  );
}
