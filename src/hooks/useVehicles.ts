import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Vehicle } from '../types';

export function useVehicles() {
  const query = useQuery({
    queryKey: ['vehicles'],
    queryFn: api.getAllVehicles,
  });

  const vehicles: Vehicle[] = query.data ?? [];
  return {
    vehicles,
    active: vehicles.filter(vehicle => vehicle.is_active !== false),
    archived: vehicles.filter(vehicle => vehicle.is_active === false),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
