import type { ReactNode } from 'react';

interface Props {
  title?: string;
  leading?: ReactNode;
  onBack?: () => void;
  actions?: ReactNode;
}

export function AppBar({ title, leading, onBack, actions }: Props) {
  return (
    <header className="sticky top-0 z-30 shrink-0 bg-surface/95 backdrop-blur border-b border-outline-variant">
      <div className="max-w-3xl mx-auto min-h-[56px] px-2 flex items-center gap-1">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center w-11 h-11 rounded-md3-full text-surface-on-variant active:bg-surface-2"
            aria-label="Назад"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        )}
        {leading}
        {title && <h1 className="text-title-md text-surface-on m-0 flex-1 min-w-0 truncate px-1">{title}</h1>}
        {!title && <div className="flex-1" />}
        {actions && <div className="flex items-center gap-0.5">{actions}</div>}
      </div>
    </header>
  );
}
