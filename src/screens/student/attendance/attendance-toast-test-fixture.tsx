import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { createTheme } from 'src/theme/create-theme';
import { ThemeProvider } from '@mui/material/styles';
import { shikshaMitraToast } from 'src/components/toast';
import { defaultSettings } from 'src/components/settings/config-settings';

export function renderAttendanceErrorRecovery() {
  const delivery = vi.mocked(shikshaMitraToast.error).mock.lastCall?.[0];
  const alertProps =
    typeof delivery?.alertProps === 'function'
      ? delivery.alertProps('attendance-test-error')
      : delivery?.alertProps;
  return render(
    <ThemeProvider theme={createTheme(defaultSettings)}>{alertProps?.action}</ThemeProvider>
  );
}
