import type { HTMLAttributes, ReactNode } from 'react';
import { BottomNav } from './BottomNav';

type MainHandlers = Pick<
  HTMLAttributes<HTMLElement>,
  'onTouchStart' | 'onTouchEnd' | 'onTouchCancel' | 'onClickCapture'
>;

interface Props {
  children: ReactNode;
  nav?: boolean;
  fab?: ReactNode;
  mainHandlers?: MainHandlers;
}

export function AppShell({ children, nav = true, fab, mainHandlers }: Props) {
  return (
    <div className="app-shell flex flex-col overflow-hidden bg-surface-container">
      <main
        className={`flex-1 min-h-0 w-full max-w-3xl mx-auto px-4 pt-4 overflow-y-auto overscroll-contain no-scrollbar ${
          nav ? 'pb-[calc(76px+var(--sab)+16px)]' : 'pb-8'
        }`}
        {...mainHandlers}
      >
        {children}
      </main>
      {fab}
      {nav && <BottomNav />}
    </div>
  );
}
