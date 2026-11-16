import { Play, Stop } from '@phosphor-icons/react';
import type { Vehicle } from '../../types';
import { getStatusMeta } from '../../theme/status';
import { formatDue, formatKm, type NearestDue } from '../../utils/nearestDue';

interface Props {
  vehicle: Vehicle;
  nearest: NearestDue | null;
  onStartTrip?: () => void;
  tracking: boolean;
}

export function StatusHero({ vehicle, nearest, onStartTrip, tracking }: Props) {
  const meta = getStatusMeta(vehicle.vehicle_status);
  const Icon = meta.icon;
  const progress = nearest
    ? Math.min(100, Math.max(4, Math.round((1 - nearest.ratio) * 100)))
    : 0;

  return (
    <div className="rounded-md3-md border border-outline-variant bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md3-full text-label-sm ${meta.chipClass}`}>
          <Icon size={15} weight="fill" />
          {meta.label}
        </span>
        {onStartTrip && (
          <button
            type="button"
            onClick={onStartTrip}
            disabled={tracking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md3-full text-label-sm ${
              tracking ? 'bg-error-container text-error' : 'bg-primary-container text-primary-on-container'
            }`}
          >
            {tracking ? <Stop size={15} weight="fill" /> : <Play size={15} weight="fill" />}
            {tracking ? 'Идёт поездка' : 'Поездка'}
          </button>
        )}
      </div>

      <p className="text-display text-surface-on m-0 mt-3">{formatKm(vehicle.current_km)} км</p>
      <p className="text-body-sm text-outline m-0 mt-1">
        {nearest ? `${nearest.componentName} · ${formatDue(nearest)}` : 'Нет данных о ближайшей замене'}
      </p>

      {nearest && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <div className={`h-full rounded-full ${meta.railClass}`} style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-caption text-outline mt-1.5">
            <span>{formatDue(nearest)}</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
