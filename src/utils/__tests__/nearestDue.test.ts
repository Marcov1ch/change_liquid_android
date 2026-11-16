import { describe, expect, it } from 'vitest';
import { formatDue, pickNearestDue, type DueCandidate } from '../nearestDue';

const base = {
  componentType: 'engine_oil',
  intervalKm: 7000,
  intervalMonths: null,
  dueDate: null,
  daysRemaining: null,
};

function candidate(partial: Partial<DueCandidate>): DueCandidate {
  return {
    componentName: 'Масло',
    status: 'good',
    kmRemaining: 900,
    ...base,
    ...partial,
  };
}

describe('pickNearestDue', () => {
  it('ignores empty and replaced', () => {
    expect(pickNearestDue([])).toBeNull();
    expect(pickNearestDue([candidate({ status: 'replaced', kmRemaining: 10 })])).toBeNull();
  });

  it('prefers overdue', () => {
    const result = pickNearestDue([
      candidate({ componentName: 'Масло', kmRemaining: 900 }),
      candidate({ componentName: 'Фильтр', status: 'overdue', kmRemaining: -50 }),
    ]);
    expect(result?.componentName).toBe('Фильтр');
  });

  it('compares normalized remaining', () => {
    const result = pickNearestDue([
      candidate({ componentName: 'Масло', kmRemaining: 100 }),
      candidate({
        componentName: 'Страховка',
        kmRemaining: null,
        daysRemaining: 2,
        intervalKm: null,
        intervalMonths: 12,
        dueDate: '2026-11-14',
      }),
    ]);
    expect(result?.componentName).toBe('Страховка');
  });

  it('formats km and date', () => {
    expect(formatDue({
      componentName: 'Масло',
      kind: 'km',
      status: 'warning',
      kmRemaining: 1200,
      dueDate: null,
      ratio: 0.1,
    })).toBe('осталось 1 200 км');
    expect(formatDue({
      componentName: 'Страховка',
      kind: 'date',
      status: 'warning',
      kmRemaining: null,
      dueDate: '2026-11-14',
      ratio: 0.1,
    })).toBe('до 14.11');
  });
});
