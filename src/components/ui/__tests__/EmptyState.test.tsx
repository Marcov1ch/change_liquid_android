import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Car } from '@phosphor-icons/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    const html = renderToStaticMarkup(<EmptyState icon={Car} title="Нет автомобилей" description="Добавьте первый" />);
    expect(html).toContain('Нет автомобилей');
    expect(html).toContain('Добавьте первый');
  });
});
