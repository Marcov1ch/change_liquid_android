import type { Section } from '../../utils/sections';
import {
  ExpensesIcon,
  FuelIcon,
  ReferenceIcon,
  RepairIcon,
  ReplacementsIcon,
  TireIcon,
} from '../icons/VehicleSectionIcons';

interface Props {
  value: Section;
  counts: Record<Section, number>;
  attention?: Section[];
  onChange: (section: Section) => void;
}

const LABELS: Array<{ value: Section; label: string; icon: typeof ReplacementsIcon }> = [
  { value: 'replacements', label: 'Замены', icon: ReplacementsIcon },
  { value: 'tires', label: 'Шины', icon: TireIcon },
  { value: 'fuel', label: 'Заправки', icon: FuelIcon },
  { value: 'repairs', label: 'Ремонт', icon: RepairIcon },
  { value: 'expenses', label: 'Траты', icon: ExpensesIcon },
  { value: 'reference', label: 'Справочник', icon: ReferenceIcon },
];

export function SectionTabs({ value, counts, attention = [], onChange }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-outline-variant" role="tablist" aria-label="Разделы автомобиля">
      {LABELS.map(item => {
        const active = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${item.label} (${counts[item.value]})`}
            title={`${item.label} (${counts[item.value]})`}
            onClick={() => onChange(item.value)}
            className={`relative shrink-0 flex items-center justify-center min-h-[48px] min-w-[44px] px-3 ${
              active ? 'text-primary' : 'text-surface-on-variant'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {attention.includes(item.value) && (
              <span className="absolute top-2.5 right-2 w-1.5 h-1.5 rounded-md3-full bg-critical" aria-hidden="true" />
            )}
            {active && <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
