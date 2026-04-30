import { defaultFont } from 'src/theme/core/typography';

import type { SettingsState } from './types';

// ----------------------------------------------------------------------

export const STORAGE_KEY = 'app-settings';

// Font size constraints used by the global font size controller.
export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 16;
export const FONT_SIZE_DEFAULT = 13;

export const defaultSettings: SettingsState = {
  colorScheme: 'light',
  direction: 'ltr',
  contrast: 'default',
  navLayout: 'mini',
  primaryColor: 'default',
  navColor: 'integrate',
  compactLayout: true,
  fontFamily: defaultFont,
  fontSize: FONT_SIZE_DEFAULT,
} as const;
