import type { ReactNode } from 'react';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { vi, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { addIcon } from '@iconify/react';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, cleanup } from '@testing-library/react';
import { setPermissions } from 'src/redux/auth/authSlice';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';

vi.mock('@mui/icons-material', async () => {
  const [Close, Info, Error, CheckCircle, WarningAmber] = await Promise.all([
    import('@mui/icons-material/Close'),
    import('@mui/icons-material/Info'),
    import('@mui/icons-material/Error'),
    import('@mui/icons-material/CheckCircle'),
    import('@mui/icons-material/WarningAmber'),
  ]);
  return {
    Close: Close.default,
    Info: Info.default,
    Error: Error.default,
    CheckCircle: CheckCircle.default,
    WarningAmber: WarningAmber.default,
  };
});
['mdi:chevron-down', 'mdi:content-save-outline', 'mdi:download'].forEach((name) => {
  addIcon(name, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});
export const documentStage: AdmissionApplicationStage = {
  id: 'stage-documents',
  definitionStageId: 'definition-documents',
  name: 'Verify admission documents',
  code: 'DOCUMENTS',
  stageType: 1,
  documentVerificationEnabled: true,
  status: 1,
  displayOrder: 0,
  allowManualSkip: false,
};
const stores: ReturnType<typeof createDocumentTestStore>[] = [];
export function renderDocumentUi(
  children: ReactNode,
  permissions = ['View', 'Upload', 'RecordOriginal', 'Review', 'Waive', 'Download']
) {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  const store = createDocumentTestStore();
  stores.push(store);
  store.dispatch(
    setPermissions(
      permissions.map((action) => ({
        name: action.startsWith('Students.') ? action : `Students.Admissions.Documents.${action}`,
        isGranted: true,
      }))
    )
  );
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
  return store;
}
afterEach(() => {
  cleanup();
  stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
  clearCachedAuthSession();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
