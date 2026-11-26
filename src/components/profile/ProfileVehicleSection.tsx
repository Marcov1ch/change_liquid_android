import { useState } from 'react';
import { Sheet } from '../ui/Sheet';
import { VehicleForm } from '../VehicleForm';
import { useAuth } from '../../context/AuthContext';
import { useVehicleMutations } from '../../hooks/useVehicleMutations';

export function ProfileVehicleSection() {
  const { refreshUser } = useAuth();
  const mutations = useVehicleMutations();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="md3-card p-6">
        <h2 className="text-title-md text-surface-on mb-4">Автомобили</h2>
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-outline m-0">
            Добавьте ещё один автомобиль, чтобы вести историю обслуживания
            и расходов отдельно по каждой машине.
          </p>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="md3-btn-primary self-start"
          >
            Добавить автомобиль
          </button>
        </div>
      </div>

      <Sheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Новый автомобиль">
        <VehicleForm
          embedded
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSubmit={async (data) => {
            await mutations.createVehicle(data);
            await refreshUser();
            setIsOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}
