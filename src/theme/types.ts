import type {
  CssVarsTheme,
  TypographyStyle,
  Theme as BaseTheme,
  CssVarsThemeOptions,
} from '@mui/material/styles';

import type { CustomShadows } from './core/custom-shadows';

// ----------------------------------------------------------------------

export type Theme = Omit<BaseTheme, 'palette' | 'applyStyles'> & CssVarsTheme;

export type ThemeUpdateOptions = Omit<CssVarsThemeOptions, 'typography'> & {
  typography?: TypographyStyle;
  customShadows?: CustomShadows;
};

export type ThemeComponents = CssVarsThemeOptions['components'];

export type ThemeColorScheme = 'light' | 'dark';

export type ThemeDirection = 'ltr' | 'rtl';

export type ThemeLocaleComponents = { components: ThemeComponents };
