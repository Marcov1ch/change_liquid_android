import { useTheme } from '../../theme/ThemeProvider';
import type { ThemeMode } from '../../theme/theme';

const OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: 'system', label: 'Системная' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
];

export function ProfileThemeSection() {
  const { mode, setMode } = useTheme();

  return (
    <section className="md3-card p-4">
      <h2 className="text-title-sm text-surface-on m-0 mb-3">Тема</h2>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Тема оформления">
        {OPTIONS.map(option => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={mode === option.value}
            onClick={() => setMode(option.value)}
            className={`min-h-[44px] rounded-md3-sm text-label-md border ${
              mode === option.value
                ? 'bg-primary-container text-primary-on-container border-primary-container'
                : 'bg-surface text-surface-on-variant border-outline-variant'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
