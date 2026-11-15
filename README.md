# ChangeLiquid Android

Независимое Android-приложение ChangeLiquid на Capacitor 8 + React 19 + TypeScript.

UI-код в этом репозитории развивается отдельно от веб-версии (`../change_liquid_frontend`):
изменения дизайна и компонентов здесь не затрагивают web. Общим остаётся только backend API.

## Требования

- Node.js 20+
- JDK 21 (не bundled JBR Android Studio)
- Android SDK Platform 36, Build Tools 35.0.0
- Android Studio 2026.2.2+ или сборка из терминала

## Установка

```bash
npm ci
```

`android/local.properties` с путём к Android SDK создаётся локально и не коммитится.

## Разработка UI

```bash
npm run dev
```

Vite проксирует `/api` и `/auth` на `http://localhost:8000` (см. `vite.config.ts`).
Можно разрабатывать интерфейс в браузере, но нативные функции (GPS, secure storage) работают только в APK.

## Сборка debug APK

```bash
npm run build:android
npx cap sync android
cd android
./gradlew assembleDebug
```

Для Gradle используйте JDK 21:

```bash
JAVA_HOME="C:/Program Files/Java/jdk-21.0.12.1" ./gradlew assembleDebug
```

Результат:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Проверки

| Команда | Описание |
| --- | --- |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run build:android` | Проверка типов + сборка web-ассетов в `dist/` |
| `npm run dev` | Dev-сервер Vite |

## Конфигурация

- `capacitor.config.ts` — `appId: ru.changeliquid.app`, `webDir: dist`, `server.androidScheme: https`.
- `.env.android` — `VITE_API_ORIGIN=https://change-liquid.ru`, подхватывается при `vite build --mode android`.
- Backend CORS должен разрешать `https://localhost` и `capacitor://localhost`.

## Нативные возможности

- GPS: `@capacitor/geolocation` (foreground), разрешения `ACCESS_FINE_LOCATION` и `ACCESS_COARSE_LOCATION`.
- Хранение токенов: `@aparajita/capacitor-secure-storage` (Android Keystore, AES-GCM); `android:allowBackup="false"`.
- Состояние поездки: `@capacitor/preferences`, переживает перезапуск приложения.

## Структура

```text
src/
├── api/          # HTTP-клиент, refresh-токены, tokenStorage
├── components/   # UI-компоненты
├── context/      # AuthContext, ToastContext
├── hooks/        # useGpsTracker и др.
├── pages/        # Экраны приложения
├── types/        # Типы API
└── utils/        # GPS, валидация, форматирование
android/          # Нативный проект Capacitor
```

## Не коммитить

- `android/local.properties`
- `android/build/`, `android/app/build/`, `android/.gradle/`
- keystore (`*.jks`, `*.keystore`)
- `google-services.json` (при подключении Firebase)
