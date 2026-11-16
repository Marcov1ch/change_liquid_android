import type { ReactNode } from 'react';
import type { IconComponent } from '../../theme/icon';

interface Props {
  icon: IconComponent;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
      <div className="w-14 h-14 rounded-md3-full bg-surface-2 text-surface-on-variant flex items-center justify-center">
        <Icon size={26} />
      </div>
      <p className="text-title-sm text-surface-on m-0">{title}</p>
      {description && <p className="text-body-md text-outline m-0 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
