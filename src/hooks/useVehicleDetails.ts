import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Section } from '../utils/sections';
import type { Vehicle } from '../types';

export function useVehicleDetails(vehicleId: number | null) {
  const queryClient = useQueryClient();
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles'],
    queryFn: api.getAllVehicles,
  });

  const replacements = useQuery({
    queryKey: ['replacements', vehicleId],
    queryFn: () => api.getReplacements(vehicleId!),
    enabled: !!vehicleId,
  });
  const tireSets = useQuery({
    queryKey: ['tire-sets', vehicleId],
    queryFn: () => api.getTireSets(vehicleId!),
    enabled: !!vehicleId,
  });
  const fuelRecords = useQuery({
    queryKey: ['fuel-records', vehicleId],
    queryFn: () => api.getFuelRecords(vehicleId!),
    enabled: !!vehicleId,
  });
  const repairs = useQuery({
    queryKey: ['repairs', vehicleId],
    queryFn: () => api.getRepairs(vehicleId!),
    enabled: !!vehicleId,
  });
  const otherExpenses = useQuery({
    queryKey: ['other-expenses', vehicleId],
    queryFn: () => api.getOtherExpenses(vehicleId!),
    enabled: !!vehicleId,
  });

  const vehicle: Vehicle | undefined = (vehiclesQuery.data ?? []).find(item => item.id === vehicleId);

  const invalidate = (section: Section) => {
    if (vehicleId) {
      const keys: Record<Section, string> = {
        replacements: 'replacements',
        tires: 'tire-sets',
        fuel: 'fuel-records',
        repairs: 'repairs',
        expenses: 'other-expenses',
        reference: 'vehicles',
      };
      queryClient.invalidateQueries({ queryKey: [keys[section], vehicleId] });
    }
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    if (vehicleId) queryClient.invalidateQueries({ queryKey: ['replacements', vehicleId] });
  };

  return {
    vehicle,
    vehicles: vehiclesQuery.data ?? [],
    replacements: replacements.data ?? [],
    tireSets: tireSets.data ?? [],
    fuelRecords: fuelRecords.data ?? [],
    repairs: repairs.data ?? [],
    otherExpenses: otherExpenses.data ?? [],
    isLoading: vehiclesQuery.isLoading || replacements.isLoading,
    isError: vehiclesQuery.isError,
    refetch: vehiclesQuery.refetch,
    invalidate,
  };
}
