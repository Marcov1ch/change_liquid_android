import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChartBar } from '@phosphor-icons/react';
import { AppShell } from '../components/shell/AppShell';
import { AppBar } from '../components/shell/AppBar';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { StatisticsPanel } from '../components/StatisticsPanel';
import { useVehicles } from '../hooks/useVehicles';
import { useVehicleDetails } from '../hooks/useVehicleDetails';
import { useLastVehicle } from '../hooks/useLastVehicle';
import { useAuth } from '../context/AuthContext';

export function StatisticsPage() {
  const { active, archived } = useVehicles();
  const { lastId } = useLastVehicle();
  const { user } = useAuth();
  const primaryId = user?.primary_vehicle_id ?? null;
  const [params] = useSearchParams();
  const requested = Number(params.get('vehicle'));
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedId !== null) return;
    const fromUrl = Number.isFinite(requested) ? requested : null;
    if (fromUrl) {
      setSelectedId(fromUrl);
      return;
    }
    if (primaryId) {
      setSelectedId(primaryId);
      return;
    }
    if (lastId) {
      setSelectedId(lastId);
      return;
    }
    if (active[0]) setSelectedId(active[0].id);
  }, [active, lastId, primaryId, requested, selectedId]);

  const options = useMemo(() => {
    const list = [...active];
    const selectedArchived = archived.find(item => item.id === selectedId);
    if (selectedArchived) list.push(selectedArchived);
    return list;
  }, [active, archived, selectedId]);

  const details = useVehicleDetails(selectedId);

  return (
    <AppShell>
      <AppBar title="Статистика" />

      {options.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3" role="tablist" aria-label="Автомобили">
          {options.map(vehicle => (
            <button
              key={vehicle.id}
              type="button"
              role="tab"
              aria-selected={vehicle.id === selectedId}
              onClick={() => setSelectedId(vehicle.id)}
              className={`shrink-0 min-h-[40px] px-3 rounded-md3-full text-label-md border ${
                vehicle.id === selectedId
                  ? 'bg-primary-container text-primary-on-container border-primary-container'
                  : 'bg-surface text-surface-on-variant border-outline-variant'
              }`}
            >
              {vehicle.brand} {vehicle.model}
              {vehicle.is_active === false ? ' · архив' : ''}
            </button>
          ))}
        </div>
      )}

      {!selectedId ? (
        <EmptyState icon={ChartBar} title="Нет автомобилей" description="Добавьте автомобиль, чтобы увидеть статистику." />
      ) : details.isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <StatisticsPanel
          replacements={details.replacements}
          repairs={details.repairs}
          fuelRecords={details.fuelRecords}
          otherExpenses={details.otherExpenses}
        />
      )}
    </AppShell>
  );
}
