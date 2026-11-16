import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Airplane } from '@phosphor-icons/react';
import { ActionSheet } from '../ActionSheet';

const items = [
  { id: 'fuel', label: 'Заправка', icon: Airplane },
  { id: 'repair', label: 'Ремонт', icon: Airplane, selected: true },
];

describe('ActionSheet', () => {
  it('renders labels without secondary hints', () => {
    const html = renderToStaticMarkup(
      <ActionSheet isOpen onClose={() => undefined} title="Что добавить?" items={items} onSelect={() => undefined} />,
    );
    expect(html).toContain('Заправка');
    expect(html).toContain('Ремонт');
    expect(html).not.toContain('мойка');
  });

  it('renders nothing when closed', () => {
    expect(renderToStaticMarkup(
      <ActionSheet isOpen={false} onClose={() => undefined} title="Что добавить?" items={items} onSelect={() => undefined} />,
    )).toBe('');
  });
});
