import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ShareNetwork } from '@phosphor-icons/react';
import { useVehicleDetails } from '../hooks/useVehicleDetails'
import { useTracking } from '../context/TrackingProvider';
import { useLastVehicle } from '../hooks/useLastVehicle';
import { parseSection, type Section } from '../utils/sections';
import { buildDueCandidates, pickNearestDue } from '../utils/nearestDue';
import { AppShell } from '../components/shell/AppShell';
import { AppBar } from '../components/shell/AppBar';
import { Fab } from '../components/shell/Fab';
import { Skeleton } from '../components/ui/Skeleton';
import { StatusHero } from '../components/vehicle/StatusHero';
import { SectionTabs } from '../components/vehicle/SectionTabs';
import { QuickAddSheet } from '../components/quickadd/QuickAddSheet';
import { ReplacementList } from '../components/ReplacementList';
import { TireSetsPanel } from '../components/TireSetsPanel';
import { FuelRecordsList } from '../components/FuelRecordsList';
import { RepairList } from '../components/RepairList';
import { OtherExpensesList } from '../components/OtherExpensesList';
import { ReferenceTab } from '../components/reference/ReferenceTab';
import { ShareVehicleDialog } from '../components/ShareVehicleDialog';

export function VehiclePage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.id);
  const section = parseSection(params.section);
  const details = useVehicleDetails(Number.isFinite(id) ? id : null);
  const { remember } = useLastVehicle();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const tracking = useTracking();

  useEffect(() => {
    if (details.vehicle) remember(details.vehicle.id);
  }, [details.vehicle, remember]);

  const nearest = useMemo(
    () => details.vehicle
      ? pickNearestDue(buildDueCandidates(details.vehicle, details.replacements, details.tireSets))
      : null,
    [details.vehicle, details.replacements, details.tireSets],
  );

  if (!Number.isFinite(id)) return <Navigate to="/" replace />;
  if (details.isError) return <Navigate to="/" replace />;
  if (details.isLoading && !details.vehicle) {
    return (
      <AppShell>
        <Skeleton className="h-40 mb-4" />
        <Skeleton className="h-64" />
      </AppShell>
    );
  }
  if (!details.vehicle) return <Navigate to="/" replace />;

  const vehicle = details.vehicle;
  const archived = vehicle.is_active === false;
  const visibleReplacements = details.tireSets.length
    ? details.replacements.filter(item => item.component_type !== 'tire_change')
    : details.replacements;

  const counts: Record<Section, number> = {
    replacements: visibleReplacements.length,
    tires: details.tireSets.length,
    fuel: details.fuelRecords.length,
    repairs: details.repairs.length,
    expenses: details.otherExpenses.length,
    reference: vehicle.reference_items?.length ?? 0,
  };

  const go = (next: Section) => navigate(`/vehicle/${vehicle.id}/${next}`);
  const share = () => setShareOpen(true);

  return (
    <AppShell
      fab={!archived && section !== 'reference'
        ? <Fab label="Добавить запись" onClick={() => setShowQuickAdd(true)} />
        : undefined}
    >
      <AppBar
        onBack={() => navigate('/')}
        title={`${vehicle.brand} ${vehicle.model}`}
        actions={(
          <button
            type="button"
            onClick={share}
            className="flex items-center justify-center w-10 h-10 rounded-md3-full text-surface-on-variant active:bg-surface-2"
            aria-label="Поделиться историей"
          >
            <ShareNetwork size={21} />
          </button>
        )}
      />

      <StatusHero
        vehicle={vehicle}
        nearest={nearest}
        tracking={tracking.isTracking && tracking.vehicleId === vehicle.id}
        onStartTrip={archived ? undefined : () => void tracking.start(vehicle.id)}
      />

      <div className="mt-3">
        <SectionTabs value={section} counts={counts} onChange={go} />
      </div>

      {archived && (
        <div className="mt-3 rounded-md3-sm bg-surface-2 px-3 py-2 text-body-sm text-surface-on-variant">
          Автомобиль в архиве — данные доступны только для чтения.
        </div>
      )}

      <div className={`mt-3 ${archived ? 'pointer-events-none opacity-80' : ''}`}>
        {section === 'replacements' && (
          <ReplacementList
            embedded
            replacements={visibleReplacements}
            repairs={details.repairs}
            vehicleId={vehicle.id}
            selectedVehicle={vehicle}
            onClose={() => navigate('/')}
            onShare={share}
            onReplacementsUpdate={() => details.invalidate('replacements')}
          />
        )}
        {section === 'tires' && (
          <TireSetsPanel
            embedded
            tireSets={details.tireSets}
            replacements={details.replacements}
            vehicleId={vehicle.id}
            selectedVehicle={vehicle}
            onClose={() => navigate('/')}
            onShare={share}
            onTireSetsUpdate={() => details.invalidate('tires')}
          />
        )}
        {section === 'fuel' && (
          <FuelRecordsList
            embedded
            records={details.fuelRecords}
            vehicleId={vehicle.id}
            selectedVehicle={vehicle}
            onClose={() => navigate('/')}
            onShare={share}
            onRecordsUpdate={() => details.invalidate('fuel')}
          />
        )}
        {section === 'repairs' && (
          <RepairList
            embedded
            repairs={details.repairs}
            replacements={details.replacements}
            vehicleId={vehicle.id}
            selectedVehicle={vehicle}
            onClose={() => navigate('/')}
            onShare={share}
            onRepairsUpdate={() => details.invalidate('repairs')}
          />
        )}
        {section === 'expenses' && (
          <OtherExpensesList
            embedded
            expenses={details.otherExpenses}
            vehicleId={vehicle.id}
            selectedVehicle={vehicle}
            onClose={() => navigate('/')}
            onShare={share}
            onExpensesUpdate={() => details.invalidate('expenses')}
          />
        )}
        {section === 'reference' && (
          <ReferenceTab
            embedded
            vehicle={vehicle}
            onClose={() => navigate('/')}
            onShare={share}
            onUpdate={() => details.invalidate('reference')}
          />
        )}
      </div>

      <QuickAddSheet
        vehicle={vehicle}
        section={section}
        repairs={details.repairs}
        replacements={details.replacements}
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSaved={(target) => details.invalidate(target)}
      />

      <ShareVehicleDialog vehicle={shareOpen ? vehicle : null} onClose={() => setShareOpen(false)} />
    </AppShell>
  );
}
