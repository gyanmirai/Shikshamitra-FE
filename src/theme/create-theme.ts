import type { CssVarsTheme } from '@mui/material/styles';
import type { SettingsState } from 'src/components/settings';

import { extendTheme } from '@mui/material/styles';
import {
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_DEFAULT,
} from 'src/components/settings/config-settings';

import { setFont } from './styles/utils';
import { overridesTheme } from './overrides-theme';
import { shadows, typography, components, colorSchemes, customShadows } from './core';
import { updateCoreWithSettings, updateComponentsWithSettings } from './with-settings/update-theme';

// ----------------------------------------------------------------------

function clampFontSize(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return FONT_SIZE_DEFAULT;
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, value));
}

export function createTheme(settings: SettingsState): CssVarsTheme {
  const fontSize = clampFontSize(settings.fontSize);

  const initialTheme = {
    colorSchemes,
    shadows: shadows(settings.colorScheme),
    customShadows: customShadows(settings.colorScheme),
    direction: settings.direction,
    shape: { borderRadius: 8 },
    components,
    typography: {
      ...typography,
      fontFamily: setFont(settings.fontFamily),
      // Drives MUI's pxToRem helper and is used by components that derive
      // sizes from `theme.typography.fontSize` (default MUI value is 14).
      fontSize,
    },
    cssVarPrefix: '',
    shouldSkipGeneratingVar,
    colorSchemeSelector: 'data-mui-color-scheme',
  };

  /**
   * 1.Update values from settings before creating theme.
   */
  const updateTheme = updateCoreWithSettings(initialTheme, settings);

  /**
   * 2.Create theme + add locale + update component with settings.
   */
  // @ts-ignore
  const theme = extendTheme(updateTheme, updateComponentsWithSettings(settings), overridesTheme);

  return theme;
}

// ----------------------------------------------------------------------

function shouldSkipGeneratingVar(keys: string[], value: string | number): boolean {
  const skipGlobalKeys = [
    'mixins',
    'overlays',
    'direction',
    'breakpoints',
    'cssVarPrefix',
    'unstable_sxConfig',
    'typography',
    // 'transitions',
  ];

  const skipPaletteKeys: { [key: string]: string[] } = {
    global: ['tonalOffset', 'dividerChannel', 'contrastThreshold'],
    grey: ['A100', 'A200', 'A400', 'A700'],
    text: ['icon'],
  };

  const isPaletteKey = keys[0] === 'palette';

  if (isPaletteKey) {
    const paletteType = keys[1];
    const skipKeys = skipPaletteKeys[paletteType] || skipPaletteKeys.global;

    return keys.some((key) => skipKeys?.includes(key));
  }

  return keys.some((key) => skipGlobalKeys?.includes(key));
}

/**
* createTheme without @settings and @locale components.
*
 ```jsx
export function createTheme(): Theme {
  const initialTheme = {
    colorSchemes,
    shadows: shadows('light'),
    customShadows: customShadows('light'),
    shape: { borderRadius: 8 },
    components,
    typography,
    cssVarPrefix: '',
    shouldSkipGeneratingVar,
  };

  const theme = extendTheme(initialTheme, overridesTheme);

  return theme;
}
 ```
*/
