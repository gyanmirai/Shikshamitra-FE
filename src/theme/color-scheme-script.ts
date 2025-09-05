'use client';

import { defaultSettings } from 'src/components/settings';
import { getInitColorSchemeScript as _getInitColorSchemeScript } from '@mui/material/styles';

// ----------------------------------------------------------------------

export const schemeConfig = {
  modeStorageKey: 'theme-mode',
  defaultMode: defaultSettings.colorScheme,
};

export const getInitColorSchemeScript = _getInitColorSchemeScript(schemeConfig);
