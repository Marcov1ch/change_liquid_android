import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.changeliquid.app',
  appName: 'ChangeLiquid',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SystemBars: {
      style: 'LIGHT',
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
    },
    App: {
      disableBackButtonHandler: true,
    },
  },
};

export default config;
