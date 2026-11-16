import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface Props {
  children: ReactNode;
  nav?: boolean;
  fab?: ReactNode;
}

export function AppShell({ children, nav = true, fab }: Props) {
  return (
    <div className="app-shell flex flex-col overflow-hidden bg-surface-container">
      <main
        className={`flex-1 min-h-0 w-full max-w-3xl mx-auto px-4 pt-4 overflow-y-auto overscroll-contain no-scrollbar ${
          nav ? 'pb-[calc(76px+var(--sab)+16px)]' : 'pb-8'
        }`}
      >
        {children}
      </main>
      {fab}
      {nav && <BottomNav />}
    </div>
  );
}
