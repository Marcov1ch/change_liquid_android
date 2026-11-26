import type { ReactNode } from 'react';
import { Star } from '@phosphor-icons/react';
import type { Vehicle } from '../../types';
import { formatDue, formatKm, type NearestDue } from '../../utils/nearestDue';

interface Props {
  vehicle: Vehicle;
  nearest: NearestDue | null;
  primary?: boolean;
  onOpen?: () => void;
  menu?: ReactNode;
}

const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function PrimaryVehicleHero({ vehicle, nearest, primary = false, onOpen, menu }: Props) {
  const progress = nearest ? Math.min(100, Math.max(4, Math.round((1 - nearest.ratio) * 100))) : 0;
  const dash = (progress / 100) * RING_CIRCUMFERENCE;

  return (
    <div
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={onOpen ? (event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') onOpen();
      } : undefined}
      className="relative rounded-md3-md bg-gradient-to-br from-[#1A6DFF] to-[#4C8DFF] p-4 text-white shadow-md3-2"
    >
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-md3-md" aria-hidden="true">
        <span className="absolute -right-8 -top-10 block h-32 w-32 rounded-md3-full bg-white/10" />
      </span>

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <p className="m-0 truncate text-title-md">{vehicle.brand} {vehicle.model}</p>
            {primary && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md3-full bg-white/20 px-2 py-0.5 text-label-sm">
                <Star size={11} weight="fill" />
                основное
              </span>
            )}
          </div>
          <p className="m-0 mt-0.5 text-label-sm text-white/80">{vehicle.plate_number}</p>
        </div>

        {nearest && (
          <div className="relative h-[60px] w-[60px] shrink-0">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="5" />
              <circle
                cx="30"
                cy="30"
                r={RING_RADIUS}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${RING_CIRCUMFERENCE}`}
                transform="rotate(-90 30 30)"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-label-sm font-bold">{progress}%</span>
          </div>
        )}
      </div>

      <p className="relative m-0 mt-2 text-display">{formatKm(vehicle.current_km)} км</p>
      <p className="relative m-0 mt-0.5 text-label-sm text-white/90">
        {nearest ? `${nearest.componentName} · ${formatDue(nearest)}` : 'Нет данных о заменах'}
      </p>

      {(nearest || menu) && (
        <div className="relative mt-3 flex items-center gap-2">
          {nearest && (
            <div className="h-1.5 flex-1 overflow-hidden rounded-md3-full bg-white/25">
              <div className="h-full rounded-md3-full bg-white" style={{ width: `${progress}%` }} />
            </div>
          )}
          {menu && (
            <div className="ml-auto -my-2 -mr-2 shrink-0" onClick={(event) => event.stopPropagation()}>
              {menu}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
