import { useCallback, useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';

const KEY = 'last-vehicle-id';

export function useLastVehicle() {
  const [lastId, setLastId] = useState<number | null>(null);

  useEffect(() => {
    Preferences.get({ key: KEY })
      .then(({ value }) => setLastId(value ? Number(value) : null))
      .catch(() => undefined);
  }, []);

  const remember = useCallback((id: number) => {
    setLastId(id);
    void Preferences.set({ key: KEY, value: String(id) }).catch(() => undefined);
  }, []);

  return { lastId, remember };
}
