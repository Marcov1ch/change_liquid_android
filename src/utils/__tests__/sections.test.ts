import { describe, expect, it } from 'vitest';
import { parseSection } from '../sections';

describe('parseSection', () => {
  it('accepts known sections', () => {
    expect(parseSection('fuel')).toBe('fuel');
    expect(parseSection('tires')).toBe('tires');
    expect(parseSection('reference')).toBe('reference');
  });

  it('falls back to replacements', () => {
    expect(parseSection(undefined)).toBe('replacements');
    expect(parseSection('unknown')).toBe('replacements');
  });
});
