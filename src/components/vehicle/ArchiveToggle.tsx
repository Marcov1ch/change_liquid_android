import { Tabs, type TabItem } from '../Tabs';

interface Props {
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
  activeCount: number;
  archivedCount: number;
}

export function ArchiveToggle({ showArchived, onShowArchivedChange, activeCount, archivedCount }: Props) {
  const items: TabItem<'active' | 'archived'>[] = [
    { value: 'active', label: `Активные (${activeCount})` },
    { value: 'archived', label: `Архив (${archivedCount})` },
  ];

  return (
    <div className="mb-4">
      <Tabs
        items={items}
        value={showArchived ? 'archived' : 'active'}
        onChange={value => onShowArchivedChange(value === 'archived')}
        ariaLabel="Активные и архивные автомобили"
        stretch
      />
    </div>
  );
}
