import type { Vehicle } from '../../types';
import { Spoiler } from '../Spoiler';
import { VehicleCardHeader } from '../VehicleCardHeader';
import { ReferenceComponentsSection } from './ReferenceComponentsSection';
import { ReferenceSizesSection } from './ReferenceSizesSection';

interface Props {
  embedded?: boolean;
  vehicle: Vehicle;
  onClose: () => void;
  onShare: () => void;
  onUpdate: () => void;
}

export function ReferenceTab({ embedded = false, vehicle, onClose, onShare, onUpdate }: Props) {
  return (
    <div className="md3-card overflow-hidden animate-fade-in">
      {!embedded && (
<VehicleCardHeader
        vehicle={vehicle}
        title={`Справочник: ${vehicle.brand} ${vehicle.model}`}
        onClose={onClose}
        onShare={onShare}
      />
      )}

      <div className="p-4 flex flex-col gap-4">
        <section>
          <h3 className="text-title-sm text-surface-on m-0 mb-1">Компоненты</h3>
          <p className="text-body-sm text-outline m-0 mb-3">
            Интервалы по умолчанию уже подставлены. Отметьте, о чём напоминать.
          </p>
          <ReferenceComponentsSection vehicle={vehicle} onUpdate={onUpdate} />
        </section>

        <Spoiler
          title="Колёса и диски"
          summary={`Диски: ${vehicle.rims.length} · Шины: ${vehicle.tires.length}`}
        >
          <ReferenceSizesSection vehicle={vehicle} onUpdate={onUpdate} />
        </Spoiler>
      </div>
    </div>
  );
}
