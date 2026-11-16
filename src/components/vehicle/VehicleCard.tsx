import type { ReactNode } from 'react';
import { Star } from '@phosphor-icons/react';
import type { Vehicle } from '../../types';
import { formatDue, formatKm, type NearestDue } from '../../utils/nearestDue';
import { getStatusMeta } from '../../theme/status';

interface Props {
  vehicle: Vehicle;
  due: NearestDue | null;
  onOpen: () => void;
  menu: ReactNode;
  archived?: boolean;
  primary?: boolean;
}

export function VehicleCard({ vehicle, due, onOpen, menu, archived = false, primary = false }: Props) {
  const status = getStatusMeta(vehicle.vehicle_status);
  const StatusIcon = status.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onOpen();
      }}
      className="relative flex gap-3 rounded-md3-md border border-outline-variant bg-surface p-3.5 cursor-pointer active:bg-surface-2"
    >
      <span className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${archived ? 'bg-outline-variant' : status.railClass}`} aria-hidden="true" />
      <div className="flex-1 min-w-0 pl-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-title-sm text-surface-on m-0 truncate">{vehicle.brand} {vehicle.model}</p>
              {primary && (
                <span className="md3-badge bg-primary-container text-primary-on-container shrink-0">
                  <Star size={11} weight="fill" />
                  Основная
                </span>
              )}
            </div>
            <p className="text-body-sm text-outline m-0 mt-0.5 truncate">
              {vehicle.plate_number} · {formatKm(vehicle.current_km)} км
            </p>
          </div>
          <div onClick={(event) => event.stopPropagation()} className="shrink-0 -mt-1 -mr-1">
            {menu}
          </div>
        </div>

        {archived ? (
          <p className="text-label-sm text-outline m-0 mt-2">В архиве</p>
        ) : due ? (
          <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md3-sm text-label-sm ${status.chipClass}`}>
            <StatusIcon size={14} weight="fill" />
            <span className="truncate">{due.componentName} · {formatDue(due)}</span>
          </div>
        ) : (
          <p className="text-label-sm text-outline m-0 mt-2">Нет замен · добавьте первую запись</p>
        )}
      </div>
    </div>
  );
}
