import type { PropsWithChildren } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { receivingWrapper } from './receiving-test-fixture';

const theme = createTheme(defaultSettings);
export function receivingUiWrapper(canReceive = true) {
  const Store = receivingWrapper(canReceive);
  return ({ children }: PropsWithChildren) => (
    <Store>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
      </ThemeProvider>
    </Store>
  );
}
