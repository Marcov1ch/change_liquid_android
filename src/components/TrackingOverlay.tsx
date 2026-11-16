import { useTracking } from '../context/TrackingProvider';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(value => String(value).padStart(2, '0')).join(':');
}

export function TrackingOverlay() {
  const tracking = useTracking();
  if (!tracking.isTracking) return null;

  const km = Math.floor(tracking.distanceKm * 10) / 10;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-6">
      <div className="w-full max-w-sm rounded-md3-lg bg-primary text-primary-on shadow-md3-4 px-6 py-6 flex flex-col items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-md3-full bg-good animate-pulse" />
          <span className="text-label-lg font-medium">Поездка</span>
        </div>
        <div className="text-center">
          <p className="text-display m-0 font-mono tabular-nums">{formatTime(tracking.elapsed)}</p>
          <p className="text-title-md m-0 mt-1 font-mono tabular-nums">
            {km < 0.1 ? '0 м' : `${km.toFixed(1)} км`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void tracking.stop()}
          className="md3-btn bg-white text-primary !px-8"
        >
          Стоп
        </button>
      </div>
    </div>
  );
}
