import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Drop } from '@phosphor-icons/react';
import { api } from '../api/client';
import type { Vehicle } from '../types';
import { AppShell } from '../components/shell/AppShell';
import { AppBar } from '../components/shell/AppBar';
import { Fab } from '../components/shell/Fab';
import { Sheet } from '../components/ui/Sheet';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { EmptyGarageIllustration } from '../components/ui/EmptyGarageIllustration';
import { Skeleton } from '../components/ui/Skeleton';
import { VehicleCard } from '../components/vehicle/VehicleCard';
import { PrimaryVehicleHero } from '../components/vehicle/PrimaryVehicleHero';
import { VehicleActionsMenu } from '../components/vehicle/VehicleActionsMenu';
import { ArchiveToggle } from '../components/vehicle/ArchiveToggle';
import { VehicleForm } from '../components/VehicleForm';
import { EditVehicleForm } from '../components/EditVehicleForm';
import { useVehicles } from '../hooks/useVehicles';
import { useVehicleMutations } from '../hooks/useVehicleMutations'
import { useTracking } from '../context/TrackingProvider';
import { useAuth } from '../context/AuthContext';
import { usePrimaryVehicle } from '../hooks/usePrimaryVehicle';
import { useHorizontalSwipe } from '../hooks/useHorizontalSwipe';
import { QuickAddSheet } from '../components/quickadd/QuickAddSheet';
import { buildDueCandidates, pickNearestDue, type NearestDue } from '../utils/nearestDue';

type Confirmation = { kind: 'archive' | 'hardDelete'; vehicle: Vehicle } | null;

export function GaragePage() {
  const navigate = useNavigate();
  const { active, archived, isLoading } = useVehicles();
  const mutations = useVehicleMutations();
  const tracking = useTracking();
  const queryClient = useQueryClient();
  const { refreshUser, setPrimaryVehicle } = useAuth();
  const { primary, isPrimary } = usePrimaryVehicle(active);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [kmVehicle, setKmVehicle] = useState<Vehicle | null>(null);
  const [kmDraft, setKmDraft] = useState('');
  const [confirmation, setConfirmation] = useState<Confirmation>(null);

  const swipeHandlers = useHorizontalSwipe({
    onSwipe: () => setShowArchived(value => !value),
  });

  const dueQueries = useQueries({
    queries: active.map(vehicle => ({
      queryKey: ['replacements', vehicle.id],
      queryFn: () => api.getReplacements(vehicle.id),
      staleTime: 30_000,
    })),
  });

  const dueByVehicle = useMemo(() => {
    const map = new Map<number, NearestDue | null>();
    active.forEach((vehicle, index) => {
      const replacements = dueQueries[index]?.data ?? [];
      map.set(vehicle.id, pickNearestDue(buildDueCandidates(vehicle, replacements)));
    });
    return map;
  }, [active, dueQueries]);

  const secondary = showArchived ? archived : active.filter(vehicle => vehicle.id !== primary?.id);
  const emptyView = showArchived ? archived.length === 0 : active.length === 0;
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    if (primary) queryClient.invalidateQueries({ queryKey: ['replacements', primary.id] });
  };

  const handleArchive = async () => {
    if (confirmation?.kind !== 'archive') return;
    await mutations.archive(confirmation.vehicle.id);
    await refreshUser();
    setConfirmation(null);
  };

  const handleHardDelete = async () => {
    if (confirmation?.kind !== 'hardDelete') return;
    await mutations.hardDelete(confirmation.vehicle.id);
    await refreshUser();
    setConfirmation(null);
  };

  const saveKm = async () => {
    if (!kmVehicle) return;
    const value = Number(kmDraft);
    if (!Number.isFinite(value) || value <= kmVehicle.current_km) {
      return;
    }
    await mutations.updateKm(kmVehicle.id, Math.round(value));
    setKmVehicle(null);
    setKmDraft('');
  };

  const renderVehicleMenu = (vehicle: Vehicle) => (
    <VehicleActionsMenu
      vehicle={vehicle}
      onEdit={() => setEditing(vehicle)}
      onStatistics={() => navigate(`/stats?vehicle=${vehicle.id}`)}
      onUpdateKm={() => {
        setKmVehicle(vehicle);
        setKmDraft(String(vehicle.current_km));
      }}
      onStartTrip={() => void tracking.start(vehicle.id)}
      onArchive={() => setConfirmation({ kind: 'archive', vehicle })}
      onRestore={() => void mutations.restore(vehicle.id).then(refreshUser)}
      onHardDelete={() => setConfirmation({ kind: 'hardDelete', vehicle })}
    />
  );

  return (
    <AppShell
      fab={!showArchived && primary
        ? <Fab label="Добавить запись" onClick={() => setQuickAddOpen(true)} />
        : undefined}
      mainHandlers={swipeHandlers}
    >
      <AppBar
        leading={(
          <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-md3-sm bg-primary-container text-primary-on-container">
              <Drop size={20} weight="fill" />
            </span>
            <span className="text-title-md text-surface-on truncate">ChangeLiquid</span>
          </div>
        )}
      />

      <div
        key={showArchived ? 'archived' : 'active'}
        className="animate-fade-in"
      >
        {!showArchived && primary && (
          <div className="mb-3">
            <PrimaryVehicleHero
              vehicle={primary}
              nearest={dueByVehicle.get(primary.id) ?? null}
              primary
              onOpen={() => navigate(`/vehicle/${primary.id}`)}
              menu={renderVehicleMenu(primary)}
            />
          </div>
        )}

        <ArchiveToggle
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
          activeCount={active.length}
          archivedCount={archived.length}
        />

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : emptyView ? (
          <EmptyState
            illustration={<EmptyGarageIllustration className="h-28 w-40" />}
            title={showArchived ? 'Архив пуст' : 'Нет автомобилей'}
            description={showArchived ? 'Сюда попадают машины, убранные из активных.' : 'Добавьте первый автомобиль, чтобы начать вести историю.'}
            action={!showArchived ? (
              <button type="button" onClick={() => setShowAddForm(true)} className="md3-btn-primary mt-1">
                Добавить автомобиль
              </button>
            ) : undefined}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {secondary.map(vehicle => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                archived={showArchived}
                primary={isPrimary(vehicle)}
                due={dueByVehicle.get(vehicle.id) ?? null}
                onOpen={() => navigate(`/vehicle/${vehicle.id}`)}
                menu={renderVehicleMenu(vehicle)}
              />
            ))}
          </div>
        )}
      </div>

      <Sheet isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="Новый автомобиль">
        <VehicleForm
          embedded
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={async (data) => {
            await mutations.createVehicle(data);
            await refreshUser();
            setShowAddForm(false);
          }}
        />
      </Sheet>

      <Sheet isOpen={!!editing} onClose={() => setEditing(null)} title="Настройки">
        {editing && (
          <EditVehicleForm
            embedded
            isOpen={!!editing}
            vehicle={editing}
            onClose={() => setEditing(null)}
            onUpdate={() => setEditing(null)}
            onDelete={async (id) => {
              await mutations.archive(id);
            }}
            isPrimary={editing ? isPrimary(editing) : false}
            onSetPrimary={async (id) => {
              await setPrimaryVehicle(id);
              await refreshUser();
              queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            }}
          />
        )}
      </Sheet>

      <Sheet isOpen={!!kmVehicle} onClose={() => setKmVehicle(null)} title="Обновить пробег">
        <div className="flex flex-col gap-3 pb-2">
          <label className="text-label-md text-surface-on-variant">
            Новый пробег, км
            <input
              type="number"
              inputMode="numeric"
              value={kmDraft}
              onChange={(event) => setKmDraft(event.target.value)}
              className="md3-field mt-1"
              autoFocus
            />
          </label>
          <button type="button" onClick={() => void saveKm()} className="md3-btn-primary w-full">
            Сохранить
          </button>
        </div>
      </Sheet>

      {primary && (
        <QuickAddSheet
          vehicle={primary}
          isOpen={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          onSaved={() => invalidateAll()}
        />
      )}

      <ConfirmDialog
        isOpen={confirmation?.kind === 'archive'}
        title="Убрать в архив?"
        message={confirmation ? `${confirmation.vehicle.brand} ${confirmation.vehicle.model} можно будет восстановить.` : ''}
        confirmLabel="В архив"
        onConfirm={() => void handleArchive()}
        onCancel={() => setConfirmation(null)}
      />
      <ConfirmDialog
        isOpen={confirmation?.kind === 'hardDelete'}
        title="Удалить навсегда?"
        message="Все записи автомобиля будут удалены без возможности восстановления."
        confirmLabel="Удалить"
        danger
        onConfirm={() => void handleHardDelete()}
        onCancel={() => setConfirmation(null)}
      />
    </AppShell>
  );
}
