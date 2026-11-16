# Android Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Переверстать Android-клиент ChangeLiquid в мобильное M3-приложение «Гараж → Автомобиль» с быстрым добавлением записей одной рукой, собственной айдентикой и светлой/тёмной темами.

**Architecture:** Навигация переезжает на маршруты react-router (`/`, `/vehicle/:id/:section`, `/stats`, `/profile`). Каркас — `AppShell` с app bar, нижней навигацией, FAB и глобальным GPS-оверлеем. Секции машины переиспользуют существующие списки и формы, но живут внутри нового экрана и нижних шторок. Данные — TanStack Query, инвалидации сохраняются.

**Tech Stack:** React 19, TypeScript strict, Vite 8, Tailwind 3.4, react-router 7, TanStack Query 5, Capacitor 8, Vitest + jsdom, Phosphor Icons.

**Spec:** `docs/superpowers/specs/2026-11-16-android-redesign-design.md`

## Delta после первичного плана (2026-11-16)

Эти изменения уже есть в бэкенде и вебе; план ниже учитывает их, хотя спека в этой части устарела:

- Компонентов замен теперь **12**: добавлены `differential_oil_front` и `transfer_case_oil`; `differential_oil` отображается как «Масло в редукторе (зад)». Списки компонентов берутся только из API, без хардкода.
- В `VehicleResponse` появилось поле `reference_items` (объёмы, варианты, допуски); API — `PATCH /api/v1/vehicles/{id}/reference` (полная замена).
- У компонента есть `supports_volume`: объём задаётся только для жидкостей; фильтры и свечи — только название/допуск.
- Интервалы, уведомления и размеры колёс/дисков переезжают из «Настроек» в секцию **«Справочник»**.
- Секций машины теперь шесть: Замены · Шины · Заправки · **Ремонт** · Траты · Справочник.
- Вкладка «Ремонт или обслуживание» переименована в «Ремонт» (заголовок секции и публичная страница тоже).

## Global Constraints

- Веб-фронтенд и бэкенд не меняются; API-контракт фиксирован.
- Замены создаются только через `POST /vehicles/{id}/replacements/bulk` (API-обёртка `api.createReplacement`), одиночного create нет.
- Датовые узлы `insurance` и `parking_monthly` требуют `next_change_date`; даты записей не в будущем.
- Архивированная машина (`is_active === false`): мутации запрещены (409), UI прячет добавление.
- Валюта только из `/auth/me`; статистика агрегируется на клиенте.
- Оффлайн: без веб-шрифтов и CDN; иконки — `@phosphor-icons/react`.
- Токены из спеки §13: `--bg #F4F6F8 / #0E1216`, `--surface #FFFFFF / #161C22`, `--primary #1A6DFF / #A8C3FF`, радиусы 12/20/28.
- Тап-таргеты ≥ 48×48dp; подписи у переключателей; никаких эмодзи как структурных иконок.
- Обе темы, `prefers-reduced-motion`, safe-area через `--sat/--sab`.
- Системные бары — встроенный `SystemBars` из `@capacitor/core`; `@capacitor/status-bar` не добавлять.
- Новые зависимости: `@phosphor-icons/react`, `@capacitor/app`.
- Каталог компонентов — 12 штук из `/enums/component-configs`; никаких локальных списков ключей или названий.
- `supports_volume === false` (фильтры, свечи) — объём не показываем и не отправляем.
- Справочные данные приватны: не выводятся на публичной странице и не влияют на статусы/статистику.
- Интервалы и уведомления сохраняются **полными картами** по всем 12 компонентам; частичная карта на бэкенде сбросит остальные значения в дефолты.
- «Настройки» автомобиля — только паспорт (марка, модель, номер, год, пробег, удаление); интервалы, уведомления и размеры живут в «Справочнике».

## Review Focus

- Пустой гараж: нет машин → FAB и пустое состояние, никаких запросов деталей (Task 6).
- Все машины в архиве: сегмент «Архив», добавление записей недоступно (Task 6).
- Датовая запись без `next_change_date` (`insurance`, `parking_monthly`) блокируется с понятной ошибкой (Task 9).
- Архивированная машина при прямом заходе на `/vehicle/:id` показывает баннер и прячет FAB; 409 из API выводится пользователю (Task 7).
- Трекинг идёт, пользователь открывает статистику/профиль: оверлей остаётся, остановка обновляет пробег нужной машины (Task 12).
- Смена темы при открытой шторке: шторка и системные бары перекрашиваются без скачков (Task 2, 3).
- Справочник: у фильтра нельзя задать объём, у жидкости можно; пустой компонент без объёма и вариантов не сохраняется (Task 8).
- Справочник архивной машины: всё только для чтения, сохранение/сброс скрыты (Task 8).
- «Сбросить» интервал: км → 0, месяцы → пусто; после сохранения API возвращает дефолт (Task 8).
- Настройки авто после переноса не отправляют интервалы/размеры и не перетирают правки из «Справочника» (Task 8).

---

## File Structure

**Theme**
- `src/theme/status.tsx` — метаданные статусов (подпись, иконка, классы).
- `src/theme/theme.ts` — чистый `resolveTheme`.
- `src/theme/ThemeProvider.tsx` — тема, preferences, `SystemBars`, `theme-color`.
- `src/theme/nav.ts` — `NAV_ITEMS`, `isNavActive`.
- `src/index.css`, `tailwind.config.js`, `index.html` — токены, база, мета.

**UI primitive**
- `src/components/ui/Sheet.tsx`, `ActionSheet.tsx`, `ConfirmDialog.tsx`, `EmptyState.tsx`, `Skeleton.tsx`.

**Shell**
- `src/components/shell/AppShell.tsx`, `AppBar.tsx`, `BottomNav.tsx`, `Fab.tsx`, `Menu.tsx`.

**Vehicle**
- `src/components/vehicle/VehicleCard.tsx`, `VehicleActionsMenu.tsx`, `ArchiveToggle.tsx`, `StatusHero.tsx`, `SectionTabs.tsx`.

**Quick add**
- `src/components/quickadd/QuickAddSheet.tsx`, `QuickAddKmForm.tsx`.

**Reference**
- `src/components/reference/ReferenceTab.tsx` — секция целиком: компоненты + аккордеоны интервалов и колёс.
- `src/components/reference/ReferenceComponentsSection.tsx`, `ReferenceIntervalsSection.tsx`, `ReferenceSizesSection.tsx`, `ReferenceForm.tsx`.
- `src/utils/reference.ts`, `intervalDraft.ts` + тесты.

**Stats**
- `src/components/stats/StatisticsView.tsx`.

**Pages**
- `src/pages/GaragePage.tsx`, `VehiclePage.tsx`, `StatisticsPage.tsx`.

**Hooks / utils**
- `src/hooks/useVehicles.ts`, `useVehicleDetails.ts`, `useLastVehicle.ts`, `useNewReplacement.ts`.
- `src/utils/nearestDue.ts`, `quickAdd.ts`, `sections.ts`, `trip.ts`.
- `src/context/TrackingProvider.tsx`, `src/context/BackButtonProvider.tsx`, `src/components/TrackingOverlay.tsx`.

**Modified during migration**
- `src/types/index.ts` (`ReferenceItem`, `ReferenceItemPayload`, `ReferenceVariant`, `supports_volume`), `src/api/vehicles.ts` (`updateVehicleReference`), `src/api/enums.ts`.
- `src/components/VehicleForm.tsx`, `EditVehicleForm.tsx`, `VehicleFields.tsx`, `VehicleSizesFields.tsx`, `Spoiler.tsx`, `src/hooks/useVehicleForm.ts`.
- `src/components/VehicleWorkspacePanel.tsx`, `RepairList.tsx`, `src/components/public/PublicRepairsSection.tsx` (подписи «Ремонт»).

**Removed after migration**
- `src/pages/HomePage.tsx`, `src/components/VehicleList.tsx`, `VehicleToolbar.tsx`, `VehicleWorkspacePanel.tsx`, `AddVehicleFab.tsx`, `VehicleCardHeader.tsx`, `VehicleStatisticsDialog.tsx`, `TrackingBar.tsx`.

---

### Task 1: Dependencies, tokens, status metadata

**Files:**
- Modify: `package.json` (via `npm install`)
- Modify: `tailwind.config.js`, `src/index.css`, `index.html`
- Create: `src/theme/status.tsx`, `src/theme/icon.ts`, `src/theme/__tests__/status.test.ts`

**Interfaces:**
- Produces: `type IconComponent = React.ComponentType<IconProps>` (from `@phosphor-icons/react`) in `src/theme/icon.ts`
- Produces: `type StatusKey = 'good' | 'warning' | 'critical' | 'overdue' | 'unknown' | 'replaced'`
- Produces: `interface StatusMeta { key: StatusKey; label: string; icon: IconComponent; chipClass: string; railClass: string }`
- Produces: `getStatusMeta(status: string | null | undefined): StatusMeta`

- [ ] **Step 1: Install dependencies**

Run: `npm install @phosphor-icons/react @capacitor/app`
Expected: `package.json` lists both dependencies; `node_modules/@phosphor-icons/react` exists.

- [ ] **Step 2: Write the failing status test**

`src/theme/__tests__/status.test.ts`:

```ts
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
    expect(JSON.stringify(getStatusMeta('warning'))).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/theme/__tests__/status.test.ts`
Expected: FAIL — cannot resolve `../status`.

- [ ] **Step 4: Implement tokens and status metadata**

In `tailwind.config.js`, map colors to CSS variables. Base: `surface`, `surface-2`, `surface-3`, `surface-on`, `surface-on-variant`, `primary`, `primary-container`, `outline`, `outline-variant`, `error`, `error-container`, `on-error`. Statuses as pairs: `good: { DEFAULT: 'var(--good-fg)', container: 'var(--good-bg)' }` and the same shape for `warning`, `critical`, `overdue`, `unknown`; classes are `bg-good-container text-good`. Radii: `md3-sm: 12px`, `md3-md: 20px`, `md3-lg: 24px`, `md3-xl: 28px`.

In `src/index.css`, define `:root` and `[data-theme="dark"]` variable values from spec §13, plus `color-scheme`, and keep existing `.md3-*` classes mapped to the new variables. Update the type scale to spec §13.2 (title-lg 22/28/600, title-md 18/24/600, title-sm 16/22/600, label-lg 14/20/500, label-md 13/18/500, label-sm 12/16/500, body-md 15/22/400, body-sm 13/18/400).

In `index.html`, set `<meta name="color-scheme" content="light dark">`.

In `src/theme/status.tsx`, use Phosphor icons: `CheckCircle` (good), `Clock` (warning), `Warning` (critical), `XCircle` (overdue), `MinusCircle` (unknown), `Check` (replaced). Chip classes are `bg-good-container text-good`, `bg-warning-container text-warning`, `bg-critical-container text-critical`, `bg-error-container text-error`, `bg-unknown-container text-unknown`, `bg-surface-2 text-surface-on-variant`; rail classes are `bg-good`, `bg-warning`, `bg-critical`, `bg-error`, `bg-outline`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/theme/__tests__/status.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Verify the build**

Run: `npm run build:android`
Expected: exit 0. Fix any token-name typos.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tailwind.config.js src/index.css index.html src/theme
git commit -m "feat: add mobile design tokens and status metadata"
```

---

### Task 2: Theme provider and system bars

**Files:**
- Create: `src/theme/theme.ts`, `src/theme/__tests__/theme.test.ts`, `src/theme/ThemeProvider.tsx`
- Modify: `src/main.tsx`, `android/app/src/main/res/values/styles.xml`, `android/app/src/main/res/values/colors.xml`

**Interfaces:**
- Produces: `type ThemeMode = 'system' | 'light' | 'dark'`
- Produces: `resolveTheme(mode: ThemeMode, systemDark: boolean): 'light' | 'dark'`
- Produces: `useTheme(): { mode: ThemeMode; resolved: 'light' | 'dark'; setMode(mode: ThemeMode): void }`

- [ ] **Step 1: Write the failing test**

`src/theme/__tests__/theme.test.ts`:

```ts
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
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/theme/__tests__/theme.test.ts`
Expected: FAIL — cannot resolve `../theme`.

- [ ] **Step 3: Implement `resolveTheme` and `ThemeProvider`**

`resolveTheme` returns the explicit mode, otherwise `systemDark ? 'dark' : 'light'`.

`ThemeProvider` responsibilities:
- state `mode`, persisted in `@capacitor/preferences` under key `theme-mode`;
- `matchMedia('(prefers-color-scheme: dark)')` listener when mode is `system`;
- sets `document.documentElement.dataset.theme` and `style.colorScheme`;
- updates `<meta name="theme-color">` to `#F4F6F8` / `#0E1216`;
- calls `SystemBars.setStyle({ style: resolved === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light })` from `@capacitor/core`, ignoring web errors;
- wraps children in `main.tsx` outside `ToastProvider`.

In `styles.xml`, remove `android:windowLightStatusBar` and `android:windowLightNavigationBar` from `AppTheme.NoActionBar`. In `colors.xml`, set `background` to `#F4F6F8`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/theme/__tests__/theme.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify the build**

Run: `npm run build:android && npx cap sync android`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/theme src/main.tsx android/app/src/main/res/values styles.xml colors.xml
git commit -m "feat: add light and dark theme provider"
```

---

### Task 3: Sheet, ActionSheet, ConfirmDialog, EmptyState, Skeleton

**Files:**
- Create: `src/components/ui/Sheet.tsx`, `ActionSheet.tsx`, `ConfirmDialog.tsx`, `EmptyState.tsx`, `Skeleton.tsx`
- Create: `src/components/ui/__tests__/ActionSheet.test.tsx`, `src/components/ui/__tests__/EmptyState.test.tsx`

**Interfaces:**
- Produces: `SheetProps { isOpen: boolean; onClose(): void; title?: string; children: ReactNode; footer?: ReactNode }`
- Produces: `ActionSheetItem { id: string; label: string; icon: IconComponent; selected?: boolean }`
- Produces: `ActionSheetProps { isOpen: boolean; onClose(): void; title: string; items: ActionSheetItem[]; onSelect(id: string): void }`
- Produces: `EmptyStateProps { icon: IconComponent; title: string; description?: string; action?: ReactNode }`
- Produces: `ConfirmDialogProps { isOpen: boolean; title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm(): void; onCancel(): void }`

- [ ] **Step 1: Write the failing tests**

`ActionSheet.test.tsx`:

```tsx
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
```

`EmptyState.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/components/ui/__tests__`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement primitives**

- `Sheet`: fixed overlay, `role="dialog"`, `aria-modal`, backdrop click closes, Esc closes, `max-h-[90dvh]`, top radius `md3-xl`, drag handle, focus trap on open, restore focus on close, body scroll lock, `padding-bottom: calc(var(--sab) + 12px)`.
- `ActionSheet`: `Sheet` with `title` and rows of min-height 56dp: icon in tonal square, label, chevron; `selected` row gets `bg-primary-container text-primary-on-container`; no subtitle prop.
- `ConfirmDialog`: `Sheet`-based centered dialog with cancel/confirm; danger styling when `confirmLabel` is destructive (prop `danger?: boolean` — add it).
- `EmptyState`: icon circle, title, optional description and action.
- `Skeleton`: `div` with `animate-pulse` and `bg-surface-2`, props `className`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/ui/__tests__`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui
git commit -m "feat: add sheet and empty state primitives"
```

---

### Task 4: App shell, routes, bottom navigation

**Files:**
- Create: `src/components/shell/AppShell.tsx`, `AppBar.tsx`, `BottomNav.tsx`, `Fab.tsx`, `Menu.tsx`
- Create: `src/theme/nav.ts`, `src/utils/sections.ts`, `src/utils/__tests__/sections.test.ts`
- Modify: `src/App.tsx`
- Create placeholders: `src/pages/GaragePage.tsx`, `VehiclePage.tsx`, `StatisticsPage.tsx`

**Interfaces:**
- Produces: `NAV_ITEMS: Array<{ to: string; label: string; icon: IconComponent }>`
- Produces: `isNavActive(pathname: string, to: string): boolean`
- Produces: `SECTIONS = ['replacements','tires','fuel','repairs','expenses','reference'] as const`
- Produces: `type Section = (typeof SECTIONS)[number]`
- Produces: `parseSection(value: string | undefined): Section`
- Produces: `AppShellProps { children: ReactNode; nav?: boolean; fab?: ReactNode }`
- Produces: `AppBarProps { title?: string; leading?: ReactNode; onBack?: () => void; actions?: ReactNode }`
- Produces: `FabProps { label: string; onClick(): void; icon?: IconComponent }`

- [ ] **Step 1: Write the failing test**

`src/utils/__tests__/sections.test.ts`:

```ts
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
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/utils/__tests__/sections.test.ts`
Expected: FAIL — cannot resolve `../sections`.

- [ ] **Step 3: Implement shell and routes**

- `src/theme/nav.ts`: 3 items — Гараж `/` (`Car`), Статистика `/stats` (`ChartBar`), Профиль `/profile` (`User`). `isNavActive` returns true for exact root or prefix match; `/vehicle/*` activates `/`. `BottomNav` читает `useAuth()` и показывает красную точку на «Профиле», пока `profile_visited === false`; `aria-label` пункта — «Профиль: требуется настройка».
- `src/utils/sections.ts` as in interfaces.
- `AppShell`: flex column, safe-area paddings, `<main>` scroll container, `BottomNav`, optional FAB, right-side bottom padding `calc(76px + var(--sab))`.
- `AppBar`: 56dp height, back button 44dp, title `title-md`, trailing actions slot, border bottom.
- `BottomNav`: 3 `NavLink`s, active pill `bg-primary-container`, 48dp targets, `aria-current="page"`.
- `Fab`: 56dp, `rounded-[19px]`, primary, fixed above nav (`bottom: calc(76px + var(--sab) + 16px)`), `aria-label` from prop.
- `Menu`: anchored popover with items; closes on outside click/Esc; item `{ label: string; icon?: IconComponent; danger?: boolean; onSelect(): void }`.
- `src/App.tsx`: routes `/`, `/vehicle/:id/:section?` (включая `reference`), `/stats`, `/profile` (protected) plus existing auth/public routes. Pages are minimal placeholders rendering `AppShell` with the route title.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/__tests__/sections.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify the build**

Run: `npm run build:android`
Expected: exit 0; dev smoke check `npm run dev` renders the placeholder routes at 375px.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/pages src/components/shell src/theme/nav.ts src/utils/sections.ts src/utils/__tests__
git commit -m "feat: add app shell and route structure"
```

---

### Task 5: Vehicles data and nearest due

**Files:**
- Create: `src/hooks/useVehicles.ts`, `src/utils/nearestDue.ts`, `src/utils/__tests__/nearestDue.test.ts`

**Interfaces:**
- Produces: `useVehicles(): { vehicles: Vehicle[]; active: Vehicle[]; archived: Vehicle[]; isLoading: boolean; isError: boolean; refetch(): void }`
- Produces: `type DueCandidate = { componentType: string; componentName: string; status: string; kmRemaining: number | null; daysRemaining: number | null; intervalKm: number | null; intervalMonths: number | null; dueDate: string | null }`
- Produces: `type NearestDue = { componentName: string; kind: 'km' | 'date'; status: string; kmRemaining: number | null; dueDate: string | null; ratio: number }`
- Produces: `buildDueCandidates(vehicle: Vehicle, replacements: Replacement[], tireSets?: TireSet[]): DueCandidate[]`
- Produces: `pickNearestDue(candidates: DueCandidate[]): NearestDue | null`
- Produces: `formatDue(nearest: NearestDue): string`
- Produces: `formatKm(value: number): string` (thousands separated by a regular space, e.g. `184 320`)

- [ ] **Step 1: Write the failing tests**

`src/utils/__tests__/nearestDue.test.ts` — cover: `replaced` excluded; overdue wins; normalization (km 100/1000 beats days 5/30, days 2/30 beats km 100/1000); tie prefers km; empty list returns `null`; `formatDue` returns `осталось 1 200 км` and `до 14.11`.

```ts
import { describe, expect, it } from 'vitest';
import { formatDue, pickNearestDue } from '../nearestDue';

const base = { componentType: 'engine_oil', intervalKm: 7000, intervalMonths: null, dueDate: null, daysRemaining: null };

describe('pickNearestDue', () => {
  it('ignores replaced and unknown-less empty input', () => {
    expect(pickNearestDue([])).toBeNull();
    expect(pickNearestDue([{ ...base, componentName: 'Масло', status: 'replaced', kmRemaining: 10 }])).toBeNull();
  });

  it('prefers overdue', () => {
    const result = pickNearestDue([
      { ...base, componentName: 'Масло', status: 'good', kmRemaining: 900 },
      { ...base, componentName: 'Фильтр', status: 'overdue', kmRemaining: -50 },
    ]);
    expect(result?.componentName).toBe('Фильтр');
  });

  it('compares normalized remaining', () => {
    const result = pickNearestDue([
      { ...base, componentName: 'Масло', status: 'warning', kmRemaining: 100 },
      { ...base, componentName: 'Страховка', status: 'warning', kmRemaining: null, daysRemaining: 2, intervalKm: null, intervalMonths: 12 },
    ]);
    expect(result?.componentName).toBe('Страховка');
  });

  it('formats km and date', () => {
    expect(formatDue({ componentName: 'Масло', kind: 'km', status: 'warning', kmRemaining: 1200, dueDate: null, ratio: 0.1 }))
      .toBe('осталось 1 200 км');
    expect(formatDue({ componentName: 'Страховка', kind: 'date', status: 'warning', kmRemaining: null, dueDate: '2026-11-14', ratio: 0.1 }))
      .toBe('до 14.11');
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/utils/__tests__/nearestDue.test.ts`
Expected: FAIL — cannot resolve `../nearestDue`.

- [ ] **Step 3: Implement `useVehicles` and `nearestDue`**

- `useVehicles` uses `useQuery({ queryKey: ['vehicles'], queryFn: api.getAllVehicles })`; splits on `is_active !== false`.
- `buildDueCandidates`: latest replacement per `component_type`, skip `status === 'replaced'`; km candidate when `km_remaining != null` and `interval_km > 0`; date candidate when `days_remaining != null` and `dueDate = next_change_date`; append installed tire set as `tire_change` date candidate when `next_change_date` is present and no `tire_change` replacement candidate already exists; dedupe by component type (replacement wins); skip candidates with no interval.
- `pickNearestDue`: ratio = `kmRemaining / intervalKm` or `daysRemaining / (intervalMonths * 30)`; overdue ratios negative; sort ascending ratio, tie → km before date, then smaller absolute remaining.
- `formatDue`: `осталось ${formatKm(n)} км` / `до DD.MM` from `dueDate`.
- `formatKm`: insert a regular space every three digits (`String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/__tests__/nearestDue.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useVehicles.ts src/utils/nearestDue.ts src/utils/__tests__
git commit -m "feat: add vehicle queries and nearest due calculation"
```

---

### Task 6: Garage page

**Files:**
- Create: `src/pages/GaragePage.tsx`, `src/components/vehicle/VehicleCard.tsx`, `src/components/vehicle/VehicleActionsMenu.tsx`, `src/components/vehicle/ArchiveToggle.tsx`, `src/hooks/useVehicleMutations.ts`
- Delete: `src/components/AddVehicleFab.tsx`, `src/components/VehicleToolbar.tsx`, `src/components/VehicleList.tsx`, `src/pages/HomePage.tsx`

**Interfaces:**
- Produces: `VehicleCardProps { vehicle: Vehicle; due: NearestDue | null; onOpen(): void; menu: ReactNode; archived?: boolean }`
- Produces: `VehicleActionsMenuProps { vehicle: Vehicle; onEdit(): void; onStatistics(): void; onUpdateKm(): void; onStartTrip?: () => void; onArchive(): void; onRestore(): void; onHardDelete(): void }` — «Поездка» скрыта, пока `onStartTrip` не передан (подключается в Task 12).
- Produces: `useVehicleMutations(): { createVehicle(data: VehicleFormData): Promise<void>; updateKm(id: number, newKm: number): Promise<void>; updateNotify(id: number, data: Partial<Record<string, boolean>>): Promise<void>; archive(id: number): Promise<void>; restore(id: number): Promise<void>; hardDelete(id: number): Promise<void> }` — each mutation invalidates `['vehicles']` (and `['replacements', id]` where relevant) and surfaces API `detail` via toast.

- [ ] **Step 1: Write the failing test**

`src/components/vehicle/__tests__/VehicleCard.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Vehicle } from '../../../types';
import { VehicleCard } from '../VehicleCard';

const vehicle: Vehicle = {
  id: 1, brand: 'BMW', model: '320d', plate_number: 'А123ВС77', year: 2020,
  current_km: 184320, is_active: true, intervals: {}, notify_flags: {},
  interval_months: {}, km_remaining: {}, rims: [], tires: [],
};

describe('VehicleCard', () => {
  it('shows model, plate, km and nearest due', () => {
    const html = renderToStaticMarkup(
      <VehicleCard vehicle={vehicle} due={{ componentName: 'Масло', kind: 'km', status: 'warning', kmRemaining: 1200, dueDate: null, ratio: 0.1 }} onOpen={() => undefined} menu={null} />,
    );
    expect(html).toContain('BMW 320d');
    expect(html).toContain('А123ВС77');
    expect(html).toContain('184 320');
    expect(html).toContain('осталось 1 200 км');
  });

  it('marks archived vehicles', () => {
    const html = renderToStaticMarkup(<VehicleCard vehicle={{ ...vehicle, is_active: false }} due={null} onOpen={() => undefined} menu={null} archived />);
    expect(html).toContain('В архиве');
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/components/vehicle/__tests__/VehicleCard.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement garage**

- `GaragePage`: `AppShell` + `AppBar` (только логотип, без кнопки профиля) + `ArchiveToggle` + list of `VehicleCard` + `Fab label="Добавить автомобиль"` opening `VehicleForm` inside `Sheet`; empty state uses `EmptyState` with the same add action. Точка онбординга — на пункте «Профиль» в `BottomNav`. Mutations come from `useVehicleMutations`.
- Data: `useVehicles()`; for active vehicles fetch replacements in parallel with `useQueries` keys `['replacements', id]`, `staleTime: 30_000`; build `Map<number, NearestDue | null>` with `buildDueCandidates` + `pickNearestDue`; when a replacement query is loading, card receives `due={null}` and shows `vehicle_status` rail only.
- `VehicleCard`: status rail 4dp, model, plate, km (`toLocaleString('ru-RU')`), nearest line with `formatDue`, overflow trigger; whole card navigates via `onOpen`; archived: muted rail + «В архиве».
- `VehicleActionsMenu`: `Menu` items — Настройки (opens `EditVehicleForm` inside `Sheet` on the garage), Статистика (`/stats?vehicle=id`), Пробег (opens km sheet), Поездка (hidden until Task 12), archive group. Confirm dialogs for archive/restore/hard delete via `ConfirmDialog` (no `confirm()`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/vehicle/__tests__/VehicleCard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify manually**

Run: `npm run dev`
Check at 375px: empty state, one vehicle, archived toggle, FAB opens vehicle form, overflow menu actions.

- [ ] **Step 6: Commit**

```bash
git add src/pages/GaragePage.tsx src/pages/HomePage.tsx src/components/vehicle src/components/AddVehicleFab.tsx src/components/VehicleToolbar.tsx src/components/VehicleList.tsx
git commit -m "feat: rebuild garage screen"
```

---

### Task 7: Vehicle screen with hero and section tabs

**Files:**
- Create: `src/pages/VehiclePage.tsx`, `src/components/vehicle/StatusHero.tsx`, `src/components/vehicle/SectionTabs.tsx`, `src/hooks/useVehicleDetails.ts`
- Modify: `src/components/ReplacementList.tsx`, `TireSetsPanel.tsx`, `FuelRecordsList.tsx`, `RepairList.tsx`, `OtherExpensesList.tsx` (remove `VehicleCardHeader`, `onClose`, `onShare`; add `onAdd` prop)
- Delete: `src/components/VehicleWorkspacePanel.tsx`, `src/components/VehicleCardHeader.tsx`
- Create: `src/components/vehicle/__tests__/SectionTabs.test.tsx`

**Interfaces:**
- Produces: `useVehicleDetails(vehicleId: number | null): { vehicle?: Vehicle; replacements: Replacement[]; tireSets: TireSet[]; fuelRecords: FuelRecord[]; repairs: Repair[]; otherExpenses: OtherExpense[]; isLoading: boolean; isError: boolean; refetch(): void; invalidate(section: Section): void }`
- Produces: `SectionTabsProps { value: Section; counts: Record<Section, number>; attention?: Section[]; onChange(section: Section): void }`
- Produces: `StatusHeroProps { vehicle: Vehicle; nearest: NearestDue | null; onStartTrip?: () => void; tracking: boolean }` — иконка play скрыта, пока `onStartTrip` не передан (Task 12).

- [ ] **Step 1: Write the failing test**

`src/components/vehicle/__tests__/SectionTabs.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SectionTabs } from '../SectionTabs';

describe('SectionTabs', () => {
  it('renders labels with counts and marks the active section', () => {
    const html = renderToStaticMarkup(
      <SectionTabs value="fuel" counts={{ replacements: 12, tires: 3, fuel: 28, repairs: 6, expenses: 4, reference: 2 }} onChange={() => undefined} />,
    );
    expect(html).toContain('Заправки');
    expect(html).toContain('28');
    expect(html).toContain('Справочник');
    expect(html).toContain('aria-selected="true"');
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/components/vehicle/__tests__/SectionTabs.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement vehicle screen**

- `VehiclePage`: reads `useParams` (`id`, `section`), `parseSection`, `useVehicleDetails`; unknown id → `<Navigate to="/" replace />` and toast; archived → banner and no FAB; `AppBar` with back, title, play/stop, share, overflow; `StatusHero`; `SectionTabs`; renders existing section component for the active section; `reference` рендерит `ReferenceTab` (Task 8), до неё — пустой блок.
- `useVehicleDetails`: one `useQuery` per section with existing keys; `vehicle` from `useVehicles` cache; `invalidate(section)` invalidates that list plus `['vehicles']` and `['replacements', id]`; для `reference` инвалидируется только `['vehicles']` — справочник приходит в `VehicleResponse`.
- `SectionTabs`: horizontally scrollable, always visible labels, counts, `role="tablist"`, `aria-selected`, attention dot for tires.
- Section lists: drop `VehicleCardHeader` and `onClose/onShare` props; keep content, add `onAdd` button at the end temporarily (replaced by FAB in Task 9). Move share to app bar. На вкладке `reference` FAB скрыт: там нет типа быстрой записи.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/vehicle/__tests__/SectionTabs.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Verify manually**

Run: `npm run dev`; open `/vehicle/1`, switch all six sections, check back navigation and archived banner.

- [ ] **Step 6: Commit**

```bash
git add src/pages/VehiclePage.tsx src/components/vehicle src/hooks/useVehicleDetails.ts src/components/*List.tsx src/components/TireSetsPanel.tsx
git commit -m "feat: add vehicle screen with status hero and sections"
```

---

### Task 8: Reference tab and settings relocation

**Files:**
- Create: `src/components/reference/ReferenceTab.tsx`, `ReferenceComponentsSection.tsx`, `ReferenceIntervalsSection.tsx`, `ReferenceSizesSection.tsx`, `ReferenceForm.tsx`
- Create: `src/utils/reference.ts`, `src/utils/intervalDraft.ts`, `src/utils/__tests__/reference.test.ts`, `src/utils/__tests__/intervalDraft.test.ts`
- Modify: `src/types/index.ts`, `src/api/vehicles.ts`, `src/components/vehicle/SectionTabs.tsx`, `src/pages/VehiclePage.tsx`
- Modify: `src/components/VehicleFields.tsx`, `src/components/VehicleForm.tsx`, `src/components/EditVehicleForm.tsx`, `src/components/VehicleSizesFields.tsx`, `src/components/Spoiler.tsx`, `src/hooks/useVehicleForm.ts`
- Modify labels: `src/components/RepairList.tsx`, `src/components/public/PublicRepairsSection.tsx`

**Interfaces:**
- Produces: `ReferenceVariant { id?: number; name: string; approvals: string | null }`
- Produces: `ReferenceItem { id?: number; component_type: string; volume_liters: number | null; note: string | null; variants: ReferenceVariant[] }`
- Produces: `ReferenceItemPayload` (без `id`) для `PATCH /vehicles/{id}/reference`
- Produces: `Vehicle.reference_items?: ReferenceItem[]`; `ComponentConfig.supports_volume?: boolean`
- Produces: `api.updateVehicleReference(vehicleId: number, items: ReferenceItemPayload[]): Promise<Vehicle>`
- Produces: `ReferenceTabProps { vehicle: Vehicle; onUpdate(): void }`
- Produces: `formatVolume(value: number | null | undefined): string`, `usesVolume(type: string, configs: ComponentConfig[]): boolean`, `sortReferenceItems(items: ReferenceItem[], configs: ComponentConfig[]): ReferenceItem[]`
- Produces: `buildIntervalDraft(configs, vehicle): IntervalDraft`, `resetIntervalRow(draft, key): IntervalDraft`, `buildIntervalPayload(configs, draft): { ok: true; payload } | { ok: false; error: string }`
- Consumes: `Sheet` (Task 3), `ConfirmDialog` (Task 3), `EmptyState` (Task 3), `Spoiler` (существующий), `useComponentConfigs`.

- [ ] **Step 1: Write the failing utils tests**

Покрыть:
- `formatVolume(5.7) === '5,7 л'`, `formatVolume(null) === '—'`;
- `usesVolume` следует `supports_volume` (жидкость — true, фильтр — false);
- `sortReferenceItems` сортирует по порядку `configs`;
- `buildIntervalDraft` берёт значения из `vehicle.intervals` / `interval_months` / `notify_flags`;
- `buildIntervalPayload` всегда возвращает все 12 ключей, пустой км → `0`, пустые месяцы → `null`, отрицательные значения → `ok: false`;
- `resetIntervalRow` ставит км `'0'`, месяцы `''`, сохраняет `notify`.

Run: `npx vitest run src/utils/__tests__/reference.test.ts src/utils/__tests__/intervalDraft.test.ts`
Expected: FAIL — модулей нет.

- [ ] **Step 2: Implement types, API and utils**

- В `src/types/index.ts` добавить `ReferenceVariant`, `ReferenceItem`, `ReferenceItemPayload`, `Vehicle.reference_items?`, `ComponentConfig.supports_volume?`.
- В `src/api/vehicles.ts` добавить `updateVehicleReference` (`PATCH /vehicles/{id}/reference`, тело `{ reference_items: items }`).
- `src/utils/reference.ts` и `src/utils/intervalDraft.ts` — по интерфейсам выше.
- Каталог компонентов — 12 штук из API; не добавлять локальные списки ключей. Переименование заднего редуктора приходит из API.

- [ ] **Step 3: Implement reference sections**

- `ReferenceTab` — одна страница:
  - «Компоненты и допуски» — развёрнута;
  - `Spoiler title="Интервалы и уведомления" summary="Значения по умолчанию подставлены автоматически"` — свёрнут;
  - `Spoiler title="Колёса и диски" summary="Диски: N · Шины: M"` — свёрнут.
- `Spoiler`: добавить `defaultOpen?: boolean`, `summary?: string`, `aria-expanded`/`aria-controls`, `inert={!open}`, увеличить `max-h` до 5000px.
- `ReferenceComponentsSection`: список по компонентам, объём только при `supports_volume`, варианты и допуски; добавление/редактирование в `Sheet`; удаление с `ConfirmDialog`; пустое состояние; архив — read-only.
- `ReferenceForm`: выбор компонента из ещё не добавленных, объём (только если `supports_volume`), заметка, динамические варианты (`name`, `approvals`); нужен хотя бы объём или вариант; лимиты: name 100, approvals 300, note 500.
- `ReferenceIntervalsSection`: все 12 компонентов; поля км/мес + тумблер уведомления + «Сбросить»; сохраняет `api.updateVehicle` с **полными** `intervals`, `interval_months`, `notify_flags`; плюс уведомления по датам (`tire_change`, `insurance`, `parking_monthly`); архив — read-only.
- `ReferenceSizesSection`: `VehicleSizesFields` с `collapsible={false}`, локальные `rims`/`tires`, сохранение через `api.updateVehicleSizes`, trim PCD/размеров; архив — read-only.

- [ ] **Step 4: Relocate settings and parts of the vehicle form**

- `useVehicleForm`: убрать интервалы, уведомления и `useComponentConfigs`; оставить марку/модель/номер/год/пробег.
- `VehicleFields`: убрать секции интервалов и уведомлений (и `Spoiler`), оставить паспорт.
- `VehicleForm`: отправлять только базовые поля; `VehicleFormData.intervals/notify_flags/interval_months` сделать опциональными.
- `EditVehicleForm`: убрать `VehicleSizesFields` и отправку интервалов/уведомлений; сохранять только паспорт, чтобы не перетирать правки из «Справочника».
- `VehicleSizesFields`: добавить `collapsible?: boolean` (по умолчанию `true`), при `false` рендерить содержимое без аккордеона.
- `VehiclePage`: `reference` рендерит `ReferenceTab`; `onUpdate` инвалидирует `['vehicles']`; FAB на этой секции скрыт.
- Подписи: вкладка и заголовок «Ремонт» вместо «Ремонт или обслуживание», публичная страница — «Ремонт».

- [ ] **Step 5: Run tests and verify the build**

Run: `npx vitest run src/utils/__tests__/reference.test.ts src/utils/__tests__/intervalDraft.test.ts`
Expected: PASS.

Run: `npm run lint && npm test && npm run build:android`
Expected: все зелёные, включая существующие тесты.

- [ ] **Step 6: Verify manually**

- «Справочник»: добавить масло с объёмом 5,7 л и вариантами 0W-20/5W-30; фильтр — только название/допуск; редактирование и удаление.
- «Интервалы»: изменить и сбросить значение, сохранить; статусы/остатки км пересчитались.
- «Колёса»: добавить диск/шину, сохранить, переоткрыть — данные на месте.
- «Настройки»: интервалов, уведомлений и размеров больше нет; сохранение не сбрасывает данные из «Справочника».
- Архивная машина: все три блока read-only; FAB скрыт.
- Табы: шесть секций, «Ремонт» с подписью без «или обслуживание».

- [ ] **Step 7: Commit**

```bash
git add src/components/reference src/utils/reference.ts src/utils/intervalDraft.ts src/utils/__tests__ src/types/index.ts src/api/vehicles.ts src/components/vehicle src/components/VehicleFields.tsx src/components/VehicleForm.tsx src/components/EditVehicleForm.tsx src/components/VehicleSizesFields.tsx src/components/Spoiler.tsx src/components/RepairList.tsx src/components/public/PublicRepairsSection.tsx src/hooks/useVehicleForm.ts src/pages/VehiclePage.tsx
git commit -m "feat: add reference tab and relocate vehicle settings"
```

---

### Task 9: Quick add flow

**Files:**
- Create: `src/utils/quickAdd.ts`, `src/utils/__tests__/quickAdd.test.ts`, `src/components/quickadd/QuickAddSheet.tsx`, `src/components/quickadd/QuickAddKmForm.tsx`, `src/hooks/useNewReplacement.ts`
- Modify: `src/types/index.ts` (move `NewReplacementData`), `src/components/AddReplacementForm.tsx` (re-export type), `src/hooks/useReplacementEditing.ts` (use builder), `src/pages/VehiclePage.tsx` (FAB → sheet)

**Interfaces:**
- Produces: `type NewReplacementData = { component_type: string; component_name: string; component_price: string; work_price: string; replacement_date: string; km_at_replacement: number; next_change_date: string }` in `src/types/index.ts`
- Produces: `buildReplacementPayload(data: NewReplacementData, blockedByRepair: Repair | null): { ok: true; payload: Record<string, string | number> } | { ok: false; error: string }`
- Produces: `validateKmUpdate(currentKm: number, input: string): { ok: true; newKm: number } | { ok: false; error: string }`
- Produces: `useNewReplacement(vehicle: Vehicle, onSaved: () => void): { value: NewReplacementData; setField(partial: Partial<NewReplacementData>): void; blockedByRepair: Repair | null; submit(): Promise<boolean>; reset(): void }`
- Produces: `QuickAddSheetProps { vehicle: Vehicle; section: Exclude<Section, 'reference'>; isOpen: boolean; onClose(): void; onSaved(section: Section): void }` — `onSaved` invalidates the section and closes; for `repairs` it also navigates to `replacements`. На `reference` FAB скрыт, справочник не создаёт записей.

- [ ] **Step 1: Write the failing tests**

`src/utils/__tests__/quickAdd.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildReplacementPayload, validateKmUpdate } from '../quickAdd';
import type { NewReplacementData } from '../../types';

const base: NewReplacementData = {
  component_type: 'engine_oil', component_name: 'Mobil 1', component_price: '2500',
  work_price: '500', replacement_date: '2026-11-16', km_at_replacement: 100000, next_change_date: '',
};

describe('buildReplacementPayload', () => {
  it('builds a regular replacement payload', () => {
    expect(buildReplacementPayload(base, null)).toEqual({
      ok: true,
      payload: { component_type: 'engine_oil', component_name: 'Mobil 1', replacement_date: '2026-11-16', km_at_replacement: 100000, component_price: 2500, work_price: 500 },
    });
  });

  it('requires next_change_date for date-only components', () => {
    const result = buildReplacementPayload({ ...base, component_type: 'insurance', next_change_date: '' }, null);
    expect(result).toEqual({ ok: false, error: 'Укажите дату окончания' });
  });

  it('zeroes prices when a repair blocks the component', () => {
    const result = buildReplacementPayload(base, { id: 1, vehicle_id: 1, repair_date: '2026-11-16', km_at_repair: 1, description: null, work_cost: 0, parts_cost: 0, component_types: ['engine_oil'] });
    expect(result.ok && result.payload.component_price).toBe(0);
    expect(result.ok && result.payload.work_price).toBe(0);
  });
});

describe('validateKmUpdate', () => {
  it('requires a number above the current km', () => {
    expect(validateKmUpdate(100, '90')).toEqual({ ok: false, error: 'Пробег должен быть больше текущего' });
    expect(validateKmUpdate(100, '120')).toEqual({ ok: true, newKm: 120 });
    expect(validateKmUpdate(100, 'abc').ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/utils/__tests__/quickAdd.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement quick add**

- `quickAdd.ts`: move validation/payload logic verbatim from `useReplacementEditing.handleAddReplacement`; date-only → `km_at_replacement: 0` + `next_change_date` with error «Укажите дату окончания» when missing; `tire_change` → km + work_price + `next_change_date` with error «Укажите дату следующей замены»; regular → km + work_price; `roundMoney` for prices; blocked repair → prices 0.
- `useNewReplacement`: initializes from `vehicle.current_km` and today; `findBlockingRepair`; calls `api.createReplacement`; returns success boolean; resets.
- `useReplacementEditing`: replace its payload construction with `buildReplacementPayload` (behavior unchanged).
- `QuickAddSheet`: `ActionSheet` items — Заправка (`Fuel`), Ремонт (`Wrench`), Замена (`Gear`), Прочие траты (`Receipt`), Пробег (`Speedometer`); active section row gets `selected`; `onSelect` switches to the matching form rendered inside `Sheet`. On tires section add `Шины` (`Tire`) → `TireSetForm`.
- Forms: reuse `FuelRecordForm`, `RepairForm`, `OtherExpenseForm`, `AddReplacementForm`, `TireSetForm`; prefill date = today and km = `vehicle.current_km`; submit via API and `useVehicleDetails().invalidate(section)`.
- `QuickAddKmForm`: one numeric field (`inputMode="numeric"`) + save; uses `validateKmUpdate`, then `api.updateVehicleKm`.
- Repair success: toast `Ремонт добавлен, заполните N замен` where N = `component_types.length`; navigate to `/vehicle/:id/replacements`; placeholders get a top CTA in `ReplacementList` (pinned by `component_name === 'ВНЕСИТЕ ИЗМЕНЕНИЕ'`).
- Archived vehicle: FAB hidden (Task 7); if a sheet is somehow open, `submit` returns without calling the API and shows «Автомобиль в архиве»; other 400/409 `detail` messages are shown in the sheet's inline alert.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/utils/__tests__/quickAdd.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Verify manually**

Run: `npm run dev`; add each record type from the vehicle FAB (кроме `reference` — там FAB скрыт); verify prefills, date-only validation, repair placeholders, km update.

- [ ] **Step 6: Commit**

```bash
git add src/utils/quickAdd.ts src/utils/__tests__ src/types/index.ts src/components/AddReplacementForm.tsx src/hooks src/components/quickadd src/pages/VehiclePage.tsx
git commit -m "feat: add quick add sheets"
```

---

### Task 10: Restyle sections and replace emoji with icons

**Files:**
- Modify: `src/components/ReplacementList.tsx`, `ReplacementGroup.tsx`, `ReplacementItem.tsx`, `ReplacementMeta.tsx`, `TireSetsPanel.tsx`, `TireSetCurrentCard.tsx`, `TireSetList.tsx`, `TireHistoryList.tsx`, `TireSetSwitchSection.tsx`, `FuelRecordsList.tsx`, `RepairList.tsx`, `OtherExpensesList.tsx`, `VehicleSizesFields.tsx`, `StatisticsPanel.tsx`, `ProgressBar.tsx`, all `src/components/reference/*`, `src/components/Spoiler.tsx`, all `src/components/public/*`, all form components (`FuelRecordForm`, `RepairForm`, `OtherExpenseForm`, `AddReplacementForm`, `TireSetForm`, `TireInstallForm`, `VehicleForm`, `EditVehicleForm`), `src/context/ToastContext.tsx`, `src/utils/statusStyles.ts`, `src/utils/tireSets.ts`, `src/pages/HomePage.tsx`, `src/pages/PublicVehiclePage.tsx`
- Create: `src/components/ui/__tests__/no-emoji.test.ts`

**Interfaces:**
- Consumes: `getStatusMeta` (Task 1), `Sheet` (Task 3), `EmptyState` (Task 3), `ConfirmDialog` (Task 3), `useNewReplacement` (Task 9).
- Produces: `SEASON_META: Record<TireSeason, { label: string; icon: IconComponent }>` in `src/utils/tireSets.ts` (replaces emoji strings); `getTireStatusMeta` returns `icon: IconComponent`.
- Produces: no new exports otherwise; existing exported component signatures unchanged except `AddReplacementForm` (re-export type only).

- [ ] **Step 1: Write the failing test**

`src/components/ui/__tests__/no-emoji.test.ts`:

```ts
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe('no emoji icons', () => {
  it('has no emoji in component and page sources', () => {
    const roots = ['src/components', 'src/pages', 'src/context', 'src/utils'];
    const files = roots.flatMap(walk).filter(file => /\.tsx?$/.test(file) && !file.includes('__tests__'));
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const offenders = files.filter(file => emoji.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/components/ui/__tests__/no-emoji.test.ts`
Expected: FAIL with the list of files containing emoji.

- [ ] **Step 3: Restyle and de-emoji**

- Replace every emoji with a Phosphor icon (`statusStyles` → `getStatusMeta`; empty states → `EmptyState`; row prefixes → icons).
- Restyle rows: 16px radius, `bg-surface`, `border-outline-variant`, 48dp actions, `title-sm` names, `body-sm` metadata, status rail or chip.
- Replace `Modal` in section create/edit with `Sheet`. Keep `Modal.tsx` for now because `ShareVehicleDialog` still uses it; both are removed in Task 13–14.
- Replace `confirm()` with `ConfirmDialog` in `useCrudList`, `TireSetsPanel`, `useReplacementEditing`, profile delete, garage delete.
- Sticky section header with share button removed (share is in app bar); add-form buttons removed (FAB owns creation).
- Statistics table stays for `sm+`; wrapped in `overflow-x-auto`.
- Подписи секции — «Ремонт» (вкладка, заголовок списка, публичная страница); компонентный каталог — 12 записей из API, без хардкода.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ui/__tests__/no-emoji.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the full suite and build**

Run: `npm run lint && npm test && npm run build:android`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components src/utils/statusStyles.ts src/hooks src/index.css
git commit -m "refactor: restyle sections and replace emoji with icons"
```

---

### Task 11: Statistics page

**Files:**
- Create: `src/pages/StatisticsPage.tsx`, `src/components/stats/StatisticsView.tsx`, `src/utils/vehicles.ts`, `src/utils/__tests__/vehicles.test.ts`
- Modify: `src/components/StatisticsPanel.tsx` (becomes shared inner view or is replaced), `src/utils/statistics.ts` (unchanged API)
- Delete: `src/components/VehicleStatisticsDialog.tsx`

**Interfaces:**
- Produces: `pickDefaultVehicleId(vehicles: Vehicle[], lastId: number | null): number | null`
- Produces: `StatisticsViewProps { replacements: Replacement[]; repairs: Repair[]; fuelRecords: FuelRecord[]; otherExpenses: OtherExpense[]; year: number; onYearChange(year: number): void }`

- [ ] **Step 1: Write the failing test**

`src/utils/__tests__/vehicles.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { pickDefaultVehicleId } from '../vehicles';

const vehicles = [
  { id: 1, is_active: true } as never,
  { id: 2, is_active: true } as never,
];

describe('pickDefaultVehicleId', () => {
  it('uses the last vehicle when it is active', () => {
    expect(pickDefaultVehicleId(vehicles, 2)).toBe(2);
  });

  it('falls back to the first active vehicle', () => {
    expect(pickDefaultVehicleId(vehicles, 99)).toBe(1);
    expect(pickDefaultVehicleId([], 1)).toBeNull();
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/utils/__tests__/vehicles.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement statistics**

- `useLastVehicle`: persist `last-vehicle-id` via `@capacitor/preferences`; save when a vehicle page opens.
- `StatisticsPage`: `AppShell` + `AppBar` (title «Статистика»); horizontal chips of active vehicles, archived selected vehicle appended with «В архиве»; year `<select>`; KPI cards 2 columns; 12-month CSS bars; category breakdown with bars; table only `sm+`; empty state. Data comes from `useVehicleDetails(selectedId)` (Task 7), so no new fetch code.
- Reuse `buildVehicleStatistics` and its tests unchanged.
- `/stats?vehicle=:id&year=YYYY` reflects selected vehicle and year; invalid id → first active.
- Statistics entry from vehicle overflow navigates here; dialog deleted.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/__tests__/vehicles.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify manually**

Run: `npm run dev`; check 375px layout, year switch, empty year, archived vehicle.

- [ ] **Step 6: Commit**

```bash
git add src/pages/StatisticsPage.tsx src/components/stats src/components/StatisticsPanel.tsx src/utils/vehicles.ts src/utils/__tests__ src/components/VehicleStatisticsDialog.tsx
git commit -m "feat: add mobile statistics screen"
```

---

### Task 12: Global tracking and Android back

**Files:**
- Create: `src/context/TrackingProvider.tsx`, `src/components/TrackingOverlay.tsx`, `src/context/BackButtonProvider.tsx`, `src/utils/trip.ts`, `src/utils/__tests__/trip.test.ts`
- Modify: `src/App.tsx` (providers), `src/components/shell/AppShell.tsx` (overlay), `src/pages/VehiclePage.tsx` (play/stop action), `src/pages/GaragePage.tsx` (menu wiring), `src/components/ui/Sheet.tsx`, `src/components/shell/Menu.tsx` (back registration)
- Delete: `src/components/TrackingBar.tsx`

**Interfaces:**
- Produces: `tripResultKm(currentKm: number, distanceKm: number): number`
- Produces: `useTracking(): { isTracking: boolean; vehicleId: number | null; elapsed: number; distanceKm: number; start(vehicleId: number): Promise<void>; stop(): Promise<{ vehicleId: number; distanceKm: number } | null> }`
- Produces: `useBackHandler(handler: () => boolean): void` — LIFO stack; the most recent open overlay handles back; falls back to `history.back()`, then `App.exitApp()`.
- Consumes: `useVehicles`, `useVehicleDetails` (Tasks 5, 7) for current km after a trip.

- [ ] **Step 1: Write the failing test**

`src/utils/__tests__/trip.test.ts`:

```ts
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
```

- [ ] **Step 2: Run and verify failure**

Run: `npx vitest run src/utils/__tests__/trip.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement tracking**

- `TrackingProvider` wraps `useGpsTracker`; `stop()` calls `stopTracking()` then `api.updateVehicleKm(vehicleId, tripResultKm(currentKm, distanceKm))` using `queryClient.getQueryData<Vehicle[]>(['vehicles'])`; if the cache is empty, await `api.getAllVehicles()` and find by id; invalidates `['vehicles']` and `['replacements', vehicleId]`; toasts result. Use `useToast` inside provider.
- Mount `TrackingProvider` and `BackButtonProvider` in `App.tsx` inside `ToastProvider`; mount `TrackingOverlay` in `AppShell`.
- `BackButtonProvider` registers `App.addListener('backButton', ...)` once (ignore native errors on web); `Sheet` and `Menu` call `useBackHandler(() => { onClose(); return true })` while open.
- `VehiclePage` app bar play icon starts tracking when idle; shows stop icon when `isTracking && vehicleId === id`; wire `onStartTrip` into `StatusHero` and `VehicleActionsMenu` (garage menu too).
- Overlay restyled (dark scrim, primary card, timer, km, stop button), survives route changes; stopping updates the right vehicle even after navigating away.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/__tests__/trip.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify on device build**

Run: `npm run build:android && npx cap sync android`
Manual: start trip on vehicle A, navigate to stats/profile, overlay persists; stop updates km; back button closes sheets and navigates.

- [ ] **Step 6: Commit**

```bash
git add src/context/TrackingProvider.tsx src/context/BackButtonProvider.tsx src/components/TrackingOverlay.tsx src/utils/trip.ts src/utils/__tests__/trip.test.ts src/App.tsx src/components/shell/AppShell.tsx src/components/ui/Sheet.tsx src/components/shell/Menu.tsx src/pages/VehiclePage.tsx src/pages/GaragePage.tsx src/components/TrackingBar.tsx
git commit -m "feat: make trip tracking global"
```

---

### Task 13: Retheme profile, auth, public pages

**Files:**
- Modify: `src/pages/ProfilePage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `VerifyEmailPage.tsx`, `PublicVehiclePage.tsx`, `src/components/profile/*`, `src/components/public/*`, `src/components/LegalFooter.tsx`, `src/components/ShareVehicleDialog.tsx`
- Create: `src/components/profile/ProfileThemeSection.tsx`

**Interfaces:**
- Consumes: `useTheme` (Task 2), `Sheet` (Task 3), `EmptyState` (Task 3).
- Produces: `ProfileThemeSection` with three options: «Системная», «Светлая», «Тёмная».

- [ ] **Step 1: Apply retheme**

- Auth screens: keep structure; new tokens, Phosphor icons instead of emoji, `Sheet` not needed; ensure contrast in both themes.
- Profile: stacked cards restyled; add `ProfileThemeSection` after user card; replace `confirm()` delete with `ConfirmDialog`; legal links unchanged.
- `ShareVehicleDialog`: convert to `Sheet`; QR unchanged.
- Public page: tokens + icon set, no structural redesign.

- [ ] **Step 2: Verify build and emoji test**

Run: `npm run lint && npm test && npm run build:android`
Expected: all pass, including the no-emoji test.

- [ ] **Step 3: Verify both themes manually**

Check login, profile, public share page at 375px in light and dark; focus states visible; toggling theme in profile updates system bars.

- [ ] **Step 4: Commit**

```bash
git add src/pages src/components/profile src/components/public src/components/LegalFooter.tsx src/components/ShareVehicleDialog.tsx
git commit -m "refactor: retheme profile and auth screens"
```

---

### Task 14: Cleanup and full verification

**Files:**
- Delete: `src/components/VehicleList.tsx`, `VehicleToolbar.tsx`, `VehicleWorkspacePanel.tsx`, `VehicleCardHeader.tsx`, `AddVehicleFab.tsx`, `VehicleStatisticsDialog.tsx`, `TrackingBar.tsx`, `src/hooks/useVehicleWorkspace.ts`, `useVehicleActions.ts`, `src/components/Tabs.tsx` (if unused), `src/components/Modal.tsx` (if unused)
- Modify: `src/App.tsx` (remove unused imports)

**Interfaces:**
- Produces: no new exports; removes obsolete modules.

- [ ] **Step 1: Remove obsolete modules**

Delete the files above; remove imports/re-exports; keep `src/utils/statusStyles.ts` only if still imported — otherwise delete it.

- [ ] **Step 2: Run lint, tests, build**

Run: `npm run lint`
Expected: 0 errors.

Run: `npm test`
Expected: all suites pass, including pre-existing `src/api/__tests__` and `src/utils/__tests__`.

Run: `npm run build:android`
Expected: exit 0.

- [ ] **Step 3: Manual QA checklist**

At 360px and 412px, light and dark:

- Empty garage, one vehicle, archived vehicle.
- Garage FAB adds a vehicle; vehicle screen FAB lists 5 types (+ Шины on tires) и скрыт на «Справочнике».
- Each quick-add type creates a record; date-only validation works; repair placeholders navigate.
- «Справочник»: компоненты с объёмом/допусками, интервалы и уведомления с «Сбросить», колёса и диски; архив — read-only.
- «Настройки»: только паспорт, без интервалов/уведомлений/размеров; сохранение не сбрасывает справочник.
- Шесть вкладок машины, вкладка и заголовок «Ремонт»; в каталоге 12 компонентов, включая передний редуктор и раздатку.
- Back button: from section tab, from vehicle, from sheet, at root.
- Tracking overlay persists across routes; stop updates km.
- Statistics chips, year, mobile layout, empty year.
- Safe areas: nav bar above gesture bar; sheet button above keyboard.
- Reduced motion and enlarged system font do not break layout.
- No emoji in UI; 48dp targets.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: remove legacy workspace components"
```

---

### Task 15: Reference in the current Android app (pre-redesign)

> Выполнено в текущем Android-коде, не дожидаясь редизайна. При выполнении Task 8 переиспользовать эти компоненты и перенести их в новую оболочку.

**Files:**
- Create: `src/components/reference/ReferenceTab.tsx`, `ReferenceComponentsSection.tsx`, `ReferenceIntervalsSection.tsx`, `ReferenceSizesSection.tsx`, `ReferenceForm.tsx`
- Create: `src/utils/reference.ts`, `src/utils/intervalDraft.ts`, `src/utils/__tests__/reference.test.ts`, `src/utils/__tests__/intervalDraft.test.ts`
- Modify: `src/types/index.ts`, `src/api/vehicles.ts`, `src/components/VehicleWorkspacePanel.tsx`, `src/hooks/useVehicleWorkspace.ts`, `src/components/icons/VehicleSectionIcons.tsx`
- Modify: `src/components/Spoiler.tsx`, `src/components/VehicleSizesFields.tsx`, `src/components/VehicleFields.tsx`, `src/components/VehicleForm.tsx`, `src/components/EditVehicleForm.tsx`, `src/hooks/useVehicleForm.ts`

- [x] Добавить типы `ReferenceVariant`, `ReferenceItem`, `ReferenceItemPayload`, `supports_volume` и `reference_items` в `Vehicle`.
- [x] Добавить `api.updateVehicleReference` (`PATCH /vehicles/{id}/reference`).
- [x] Добавить утилиты `reference.ts` и `intervalDraft.ts` с тестами.
- [x] Добавить вкладку «Справочник» с одной страницей: «Компоненты и допуски» + аккордеоны «Интервалы и уведомления», «Колёса и диски».
- [x] Перенести интервалы, уведомления и размеры из «Настроек» в «Справочник»; настройки — только паспорт.
- [x] Скрыть действия для архивной машины.
- [x] Проверить: `npm run lint`, `npm test` (81), `npm run build:android`.

---

## Self-Review Notes

- Spec coverage: §7 routes (Task 4), §8 shell/nav/FAB (Tasks 3–4), §9 garage (Task 6), §10 vehicle (Task 7), reference/intervals/sizes (Task 8), §11 quick add (Task 9), §12 statistics (Task 11), §13 tokens (Task 1), §14 components (Tasks 1–9), §15 states (Tasks 3, 10), §16 a11y (Tasks 3, 4, 9, 10), §17 Android (Tasks 2, 12), §18 data (Tasks 5, 7, 8, 9), §19 decisions (Tasks 5, 6, 7, 8, 12), §20 verification (Tasks 1–14). Delta после первичного плана покрыт Task 8 (справочник, интервалы, колёса, «Ремонт»).
- Placeholder tasks still pending: none — each task has an executable deliverable and check.
- Type consistency: `Section`/`parseSection` used by Tasks 7–11; `NearestDue` used by Tasks 5–7; `ReferenceItem`/`ReferenceItemPayload`/`IntervalDraft` — Task 8; `NewReplacementData` moved to `src/types/index.ts` in Task 9 and imported everywhere after. Task 15 повторяет справочник в текущем Android и должен быть заменён оболочкой Task 8.
