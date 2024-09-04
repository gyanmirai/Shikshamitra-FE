import 'src/global.css';
// import 'react-phone-input-2/lib/style.css';
import 'react-phone-number-input/style.css';
// ----------------------------------------------------------------------

import type { Viewport } from 'next';

import { CONFIG } from 'src/config-global';
import { primary } from 'src/theme/core/palette';
import { ThemeProvider } from 'src/theme/theme-provider';
import { getInitColorSchemeScript } from 'src/theme/color-scheme-script';

import { Snackbar } from 'src/components/snackbar';
import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { detectSettings } from 'src/components/settings/server';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';
import { LocalizationProvider } from 'src/components/Localization-provider/localization-provider';

import ReduxProvider from '../redux/reduxProvider';

// ----------------------------------------------------------------------

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primary.main,
};

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const settings = CONFIG.isStaticExport ? defaultSettings : await detectSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {getInitColorSchemeScript}
        <ReduxProvider>
          <LocalizationProvider>
            <SettingsProvider
              settings={settings}
              caches={CONFIG.isStaticExport ? 'localStorage' : 'cookie'}
            >
              <ThemeProvider>
                <MotionLazy>
                  <Snackbar />
                  <ProgressBar />
                  <SettingsDrawer />
                  {children}
                </MotionLazy>
              </ThemeProvider>
            </SettingsProvider>
          </LocalizationProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
