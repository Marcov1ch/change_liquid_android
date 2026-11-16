import { Archive, ArrowCounterClockwise, ChartBar, Gauge, PencilSimple, Trash, Play } from '@phosphor-icons/react';
import type { Vehicle } from '../../types';
import { Menu, type MenuItem } from '../shell/Menu';

interface Props {
  vehicle: Vehicle;
  onEdit: () => void;
  onStatistics: () => void;
  onUpdateKm: () => void;
  onStartTrip?: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onHardDelete: () => void;
}

export function VehicleActionsMenu({
  vehicle,
  onEdit,
  onStatistics,
  onUpdateKm,
  onStartTrip,
  onArchive,
  onRestore,
  onHardDelete,
}: Props) {
  const archived = vehicle.is_active === false;
  const items: MenuItem[] = archived
    ? [
        { label: 'Статистика', icon: ChartBar, onSelect: onStatistics },
        { label: 'Восстановить', icon: ArrowCounterClockwise, onSelect: onRestore },
        { label: 'Удалить навсегда', icon: Trash, danger: true, onSelect: onHardDelete },
      ]
    : [
        { label: 'Настройки', icon: PencilSimple, onSelect: onEdit },
        { label: 'Статистика', icon: ChartBar, onSelect: onStatistics },
        { label: 'Обновить пробег', icon: Gauge, onSelect: onUpdateKm },
        ...(onStartTrip ? [{ label: 'Поездка', icon: Play, onSelect: onStartTrip }] : []),
        { label: 'В архив', icon: Archive, danger: true, onSelect: onArchive },
      ];

  return <Menu items={items} label={`Действия: ${vehicle.brand} ${vehicle.model}`} />;
}
