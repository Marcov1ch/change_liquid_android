import { describe, expect, it } from 'vitest';
import { validateKmUpdate } from '../quickAdd';

describe('validateKmUpdate', () => {
  it('requires a number above the current km', () => {
    expect(validateKmUpdate(100, '90')).toEqual({ ok: false, error: 'Пробег должен быть больше текущего' });
    expect(validateKmUpdate(100, '120')).toEqual({ ok: true, newKm: 120 });
    expect(validateKmUpdate(100, 'abc').ok).toBe(false);
  });
});
