import { describe, expect, it } from 'vitest';
import type { NewReplacementData } from '../../components/AddReplacementForm';
import { buildReplacementPayload } from '../quickAdd';

const base: NewReplacementData = {
  component_type: 'engine_oil',
  component_name: 'Mobil 1',
  component_price: '2500',
  work_price: '500',
  replacement_date: '2026-11-16',
  km_at_replacement: 100000,
  next_change_date: '',
};

describe('buildReplacementPayload', () => {
  it('builds a regular replacement payload', () => {
    expect(buildReplacementPayload(base, null)).toEqual({
      ok: true,
      payload: {
        component_type: 'engine_oil',
        component_name: 'Mobil 1',
        replacement_date: '2026-11-16',
        km_at_replacement: 100000,
        component_price: 2500,
        work_price: 500,
      },
    });
  });

  it('requires next_change_date for date-only components', () => {
    const result = buildReplacementPayload({ ...base, component_type: 'insurance', next_change_date: '' }, null);
    expect(result).toEqual({ ok: false, error: 'Укажите дату окончания' });
  });

  it('zeroes prices when a repair blocks the component', () => {
    const result = buildReplacementPayload(base, {
      id: 1,
      vehicle_id: 1,
      repair_date: '2026-11-16',
      km_at_repair: 1,
      description: null,
      work_cost: 0,
      parts_cost: 0,
      component_types: ['engine_oil'],
    });
    expect(result.ok && result.payload.component_price).toBe(0);
    expect(result.ok && result.payload.work_price).toBe(0);
  });
});
