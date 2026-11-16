import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SectionTabs } from '../SectionTabs';

describe('SectionTabs', () => {
  it('renders labels with counts and marks the active section', () => {
    const html = renderToStaticMarkup(
      <SectionTabs
        value="fuel"
        counts={{ replacements: 12, tires: 3, fuel: 28, repairs: 6, expenses: 4, reference: 2 }}
        onChange={() => undefined}
      />,
    );
    expect(html).toContain('aria-label="Заправки (28)"');
    expect(html).toContain('aria-label="Справочник (2)"');
    expect(html).toContain('aria-selected="true"');
  });
});
