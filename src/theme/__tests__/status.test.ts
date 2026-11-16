import { describe, expect, it } from 'vitest';
import { getStatusMeta } from '../status';

describe('getStatusMeta', () => {
  it('maps known statuses', () => {
    expect(getStatusMeta('overdue')).toMatchObject({ key: 'overdue', label: 'Просрочено' });
    expect(getStatusMeta('good').label).toBe('В порядке');
  });

  it('falls back to unknown', () => {
    expect(getStatusMeta(undefined).key).toBe('unknown');
    expect(getStatusMeta('nonsense').key).toBe('unknown');
  });

  it('has no emoji in metadata', () => {
    expect(JSON.stringify({ ...getStatusMeta('warning'), icon: undefined }))
      .not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });
});
