import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { VehicleFormData } from '../types';

export function useVehicleMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = (id?: number) => {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['replacements', id] });
  };

  const run = async (action: () => Promise<unknown>, success?: string) => {
    try {
      await action();
      if (success) toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось выполнить действие');
      throw error;
    }
  };

  return {
    createVehicle: (data: VehicleFormData) => run(async () => {
      await api.createVehicle(data);
      invalidate();
    }, 'Автомобиль добавлен'),
    updateKm: (id: number, newKm: number) => run(async () => {
      await api.updateVehicleKm(id, newKm);
      invalidate(id);
    }, 'Пробег обновлён'),
    updateNotify: (id: number, data: Partial<Record<string, boolean>>) => run(async () => {
      await api.updateNotify(id, data);
      invalidate(id);
    }),
    archive: (id: number) => run(async () => {
      await api.deleteVehicle(id);
      invalidate(id);
    }, 'Автомобиль в архиве'),
    restore: (id: number) => run(async () => {
      await api.restoreVehicle(id);
      invalidate(id);
    }, 'Автомобиль восстановлен'),
    hardDelete: (id: number) => run(async () => {
      await api.hardDeleteVehicle(id);
      invalidate(id);
    }, 'Автомобиль удалён'),
  };
}
