import { Plus } from '@phosphor-icons/react';
import type { IconComponent } from '../../theme/icon';

interface Props {
  label: string;
  onClick: () => void;
  icon?: IconComponent;
}

export function Fab({ label, onClick, icon: Icon = Plus }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-[19px] bg-primary text-primary-on shadow-md3-3 transition-transform duration-150 active:scale-95"
      style={{ bottom: 'calc(76px + var(--sab) + 16px)' }}
    >
      <Icon size={26} weight="bold" />
    </button>
  );
}
