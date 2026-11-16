import { describe, expect, it } from 'vitest';
import { tripResultKm } from '../trip';

describe('tripResultKm', () => {
  it('rounds the accumulated distance', () => {
    expect(tripResultKm(1000, 12.4)).toBe(1012);
    expect(tripResultKm(1000, 12.6)).toBe(1013);
  });

  it('never returns less than the current km', () => {
    expect(tripResultKm(1000, 0)).toBe(1000);
  });
});
