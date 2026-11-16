import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GasPump, Gear, Gauge, Receipt, Tire, Wrench } from '@phosphor-icons/react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import type { Repair, Replacement, Vehicle } from '../../types';
import type { Section } from '../../utils/sections';
import { ActionSheet, type ActionSheetItem } from '../ui/ActionSheet';
import { Sheet } from '../ui/Sheet';
import { FuelRecordForm } from '../FuelRecordForm';
import { OtherExpenseForm } from '../OtherExpenseForm';
import { RepairForm } from '../RepairForm';
import { TireSetForm } from '../TireSetForm';
import { QuickAddKmForm } from './QuickAddKmForm';
import { QuickAddReplacementForm } from './QuickAddReplacementForm';

type QuickAddType = 'fuel' | 'repairs' | 'replacements' | 'expenses' | 'km' | 'tires';

interface Props {
  vehicle: Vehicle;
  section?: Section;
  repairs?: Repair[];
  replacements?: Replacement[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: (section: Section) => void;
}

const SECTION_TO_TYPE: Partial<Record<Section, QuickAddType>> = {
  fuel: 'fuel',
  repairs: 'repairs',
  replacements: 'replacements',
  expenses: 'expenses',
  tires: 'tires',
};

export function QuickAddSheet({ vehicle, section, repairs = [], replacements = [], isOpen, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [type, setType] = useState<QuickAddType | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const activeType = section ? SECTION_TO_TYPE[section] : undefined;

  useEffect(() => {
    if (!isOpen) setType(null);
  }, [isOpen]);

  const items: ActionSheetItem[] = [
    { id: 'fuel', label: 'Заправка', icon: GasPump, selected: activeType === 'fuel' },
    { id: 'repairs', label: 'Ремонт', icon: Wrench, selected: activeType === 'repairs' },
    { id: 'replacements', label: 'Замена', icon: Gear, selected: activeType === 'replacements' },
    { id: 'expenses', label: 'Прочие траты', icon: Receipt, selected: activeType === 'expenses' },
    { id: 'km', label: 'Пробег', icon: Gauge, selected: activeType === 'km' },
    ...(section === 'tires' ? [{ id: 'tires', label: 'Шины', icon: Tire, selected: true }] : []),
  ];

  const finish = (target: Section) => {
    onClose();
    setType(null);
    onSaved(target);
  };

  return (
    <>
      <ActionSheet
        isOpen={isOpen && type === null}
        onClose={onClose}
        title={`${vehicle.brand} ${vehicle.model}`}
        description="Что добавить?"
        items={items}
        onSelect={(id) => setType(id as QuickAddType)}
      />

      <Sheet
        isOpen={isOpen && type !== null}
        onClose={() => {
          setType(null);
          onClose();
        }}
        title={items.find(item => item.id === type)?.label ?? 'Новая запись'}
      >
        {type === 'fuel' && (
          <FuelRecordForm
            vehicle={vehicle}
            today={today}
            onCancel={() => setType(null)}
            onSubmit={async (payload) => {
              await api.createFuelRecord(vehicle.id, payload);
              toast.success('Заправка добавлена');
              finish('fuel');
            }}
          />
        )}

        {type === 'expenses' && (
          <OtherExpenseForm
            today={today}
            onCancel={() => setType(null)}
            onSubmit={async (payload) => {
              await api.createOtherExpense(vehicle.id, payload);
              toast.success('Трата добавлена');
              finish('expenses');
            }}
          />
        )}

        {type === 'repairs' && (
          <RepairForm
            vehicle={vehicle}
            replacements={replacements}
            today={today}
            onCancel={() => setType(null)}
            onSubmit={async (payload) => {
              await api.createRepair(vehicle.id, payload);
              toast.success(`Ремонт добавлен${payload.component_types.length ? `, заполните ${payload.component_types.length} замен` : ''}`);
              onClose();
              setType(null);
              onSaved('repairs');
              navigate(`/vehicle/${vehicle.id}/replacements`);
            }}
          />
        )}

        {type === 'tires' && (
          <TireSetForm
            today={today}
            onCancel={() => setType(null)}
            onSubmit={async (payload) => {
              await api.createTireSet(vehicle.id, payload);
              toast.success('Комплект добавлен');
              finish('tires');
            }}
          />
        )}

        {type === 'km' && (
          <QuickAddKmForm
            vehicle={vehicle}
            onCancel={() => setType(null)}
            onSubmit={async (newKm) => {
              await api.updateVehicleKm(vehicle.id, newKm);
              toast.success('Пробег обновлён');
              finish('reference');
            }}
          />
        )}

        {type === 'replacements' && (
          <QuickAddReplacementForm
            vehicle={vehicle}
            repairs={repairs}
            onCancel={() => setType(null)}
            onSaved={() => {
              finish('replacements');
            }}
          />
        )}
      </Sheet>
    </>
  );
}
