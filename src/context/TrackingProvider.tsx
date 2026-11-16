/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useToast } from './ToastContext';
import { useGpsTracker } from '../hooks/useGpsTracker';
import type { Vehicle } from '../types';
import { tripResultKm } from '../utils/trip';

interface TrackingValue {
  isTracking: boolean;
  vehicleId: number | null;
  elapsed: number;
  distanceKm: number;
  start: (vehicleId: number) => Promise<void>;
  stop: () => Promise<{ vehicleId: number; distanceKm: number } | null>;
}

const TrackingContext = createContext<TrackingValue | null>(null);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tracker = useGpsTracker(message => toast.error(message));

  const stop = useCallback(async () => {
    const final = await tracker.stopTracking();
    if (!final?.vehicleId) return null;

    let vehicles = queryClient.getQueryData<Vehicle[]>(['vehicles']);
    if (!vehicles) {
      vehicles = await api.getAllVehicles();
      queryClient.setQueryData(['vehicles'], vehicles);
    }
    const vehicleId = final.vehicleId;
    const vehicle = vehicles.find(item => item.id === vehicleId);
    if (!vehicle) return { vehicleId, distanceKm: final.distanceKm };

    const newKm = tripResultKm(vehicle.current_km, final.distanceKm);
    try {
      await api.updateVehicleKm(vehicleId, newKm);
      toast.success(`Поездка завершена · ${newKm.toLocaleString('ru-RU')} км`);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['replacements', vehicleId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось обновить пробег');
    }
    return { vehicleId, distanceKm: final.distanceKm };
  }, [queryClient, toast, tracker]);

  const value = useMemo(() => ({
    isTracking: tracker.isTracking,
    vehicleId: tracker.vehicleId,
    elapsed: tracker.elapsed,
    distanceKm: tracker.distanceKm,
    start: tracker.startTracking,
    stop,
  }), [tracker.isTracking, tracker.vehicleId, tracker.elapsed, tracker.distanceKm, tracker.startTracking, stop]);

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export function useTracking(): TrackingValue {
  const context = useContext(TrackingContext);
  if (!context) throw new Error('useTracking must be used inside TrackingProvider');
  return context;
}
