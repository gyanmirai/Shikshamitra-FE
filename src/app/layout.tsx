import 'src/global.css';
// ----------------------------------------------------------------------

import type { Viewport } from 'next';

import { CONFIG } from 'src/config-global';
import { primary } from 'src/theme/core/palette';
import { Snackbar } from 'src/components/snackbar';
import { InitColorSchemeScript } from '@mui/material';
import { ThemeProvider } from 'src/theme/theme-provider';
import { ProgressBar } from 'src/components/progress-bar';
import { detectSettings } from 'src/components/settings/server';
import KeyboardShortcut from 'src/components/keyboard-shortcut';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';
import { LocalizationProvider } from 'src/components/Localization-provider/localization-provider';

import { AppContent } from './app-content';
import NextAuthSessionProvider from './providers';
import ReduxProvider from '../redux/reduxProvider';

// ----------------------------------------------------------------------

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primary.main,
};

type Props = { children: React.ReactNode };

export default async function RootLayout({ children }: Props) {
  const settings = CONFIG.isStaticExport ? defaultSettings : await detectSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript
          attribute="data"
          modeStorageKey="theme-mode"
          defaultMode={defaultSettings.colorScheme}
        />
        <NextAuthSessionProvider>
          <ReduxProvider>
            <KeyboardShortcut />
            <LocalizationProvider>
              <SettingsProvider
                settings={settings}
                // caches={CONFIG.isStaticExport ? 'localStorage' : 'cookie'}
              >
                <ThemeProvider>
                  <Snackbar />
                  <ProgressBar />
                  <SettingsDrawer />
                  <AppContent>{children}</AppContent>
                </ThemeProvider>
              </SettingsProvider>
            </LocalizationProvider>
          </ReduxProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
