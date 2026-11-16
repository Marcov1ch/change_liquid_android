import { describe, expect, it } from 'vitest';
import { resolveTheme } from '../theme';

describe('resolveTheme', () => {
  it('follows the system in system mode', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('explicit mode wins over the system', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});
