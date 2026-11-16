import { useEffect, useRef, useState } from 'react';
import { DotsThreeVertical } from '@phosphor-icons/react';
import type { IconComponent } from '../../theme/icon';
import { useBackHandler } from '../../context/BackButtonProvider';

export interface MenuItem {
  label: string;
  icon?: IconComponent;
  danger?: boolean;
  onSelect: () => void;
}

interface Props {
  items: MenuItem[];
  label?: string;
}

export function Menu({ items, label = 'Ещё' }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useBackHandler(() => {
    setOpen(false);
    return true;
  }, open);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center justify-center w-10 h-10 rounded-md3-full text-surface-on-variant active:bg-surface-2"
        aria-label={label}
        aria-expanded={open}
      >
        <DotsThreeVertical size={22} weight="bold" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-md3-md border border-outline-variant bg-surface shadow-md3-3 p-1 animate-scale-in"
        >
          {items.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={`flex w-full items-center gap-2.5 min-h-[44px] px-3 rounded-md3-sm text-left text-body-sm ${
                  item.danger ? 'text-error' : 'text-surface-on'
                } active:bg-surface-2`}
              >
                {Icon && <Icon size={18} />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
