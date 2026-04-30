'use client';

import type {} from '@mui/lab/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/material/themeCssVarsAugmentation';

import { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { useSettingsContext } from 'src/components/settings';
import { ThemeProvider as CssVarsProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

import { createTheme } from './create-theme';
import { RTL } from './with-settings/right-to-left';
import { schemeConfig } from './color-scheme-script';

// ----------------------------------------------------------------------

// MUI's default `typography.fontSize` is 14. The themed typography variants
// in src/theme/core/typography.ts are authored using `pxToRem(value)` which
// divides by 16 (the html root font-size). Scaling the html root by
// (fontSize / 14) keeps rem-based variants proportional to the user's
// selected base font size.
const REM_BASE = 16;
const MUI_DEFAULT_FONT_SIZE = 14;

type Props = { children: React.ReactNode };

export function ThemeProvider({ children }: Props) {
  const settings = useSettingsContext();

  // Memoize the theme so it is only re-created when an input setting changes.
  // This avoids the expensive extendTheme() call on every render.
  const theme = useMemo(() => createTheme(settings), [settings]);

  const htmlFontSize = useMemo(
    () => `${(settings.fontSize / MUI_DEFAULT_FONT_SIZE) * REM_BASE}px`,
    [settings.fontSize]
  );

  return (
    <AppRouterCacheProvider options={{ key: 'css' }}>
      <CssVarsProvider
        theme={theme}
        defaultMode={schemeConfig.defaultMode}
        modeStorageKey={schemeConfig.modeStorageKey}
      >
        <CssBaseline />
        {/*
         * Drives the global font-size scaling. Because typography variants
         * are defined in rem, updating the html root font-size automatically
         * resizes every component (buttons, tables, typography, etc.).
         */}
        <GlobalStyles styles={{ html: { fontSize: htmlFontSize } }} />
        <RTL direction={settings.direction}>{children}</RTL>
      </CssVarsProvider>
    </AppRouterCacheProvider>
  );
}
