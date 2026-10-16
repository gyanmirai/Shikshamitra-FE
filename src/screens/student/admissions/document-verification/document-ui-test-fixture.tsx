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
  const [
    Close,
    Info,
    Error,
    CheckCircle,
    WarningAmber,
    Clear,
    Search,
    RemoveRedEye,
    ArrowUpward,
    ArrowDownward,
    ExpandLess,
    ExpandMore,
  ] = await Promise.all([
    import('@mui/icons-material/Close'),
    import('@mui/icons-material/Info'),
    import('@mui/icons-material/Error'),
    import('@mui/icons-material/CheckCircle'),
    import('@mui/icons-material/WarningAmber'),
    import('@mui/icons-material/Clear'),
    import('@mui/icons-material/Search'),
    import('@mui/icons-material/RemoveRedEye'),
    import('@mui/icons-material/ArrowUpward'),
    import('@mui/icons-material/ArrowDownward'),
    import('@mui/icons-material/ExpandLess'),
    import('@mui/icons-material/ExpandMore'),
  ]);
  return {
    Close: Close.default,
    Info: Info.default,
    Error: Error.default,
    CheckCircle: CheckCircle.default,
    WarningAmber: WarningAmber.default,
    Clear: Clear.default,
    Search: Search.default,
    RemoveRedEye: RemoveRedEye.default,
    ArrowUpward: ArrowUpward.default,
    ArrowDownward: ArrowDownward.default,
    ExpandLess: ExpandLess.default,
    ExpandMore: ExpandMore.default,
  };
});
[
  'mdi:chevron-down',
  'mdi:content-save-outline',
  'mdi:download',
  'mdi:upload',
  'mdi:eye-outline',
  'mdi:check',
  'mdi:undo-variant',
  'mdi:file-check-outline',
  'mdi:file-cancel-outline',
  'mdi:history',
  'mdi:magnify-minus-outline',
  'mdi:magnify-plus-outline',
  'mdi:fit-to-screen-outline',
  'mdi:close',
  'mdi:account-outline',
  'mdi:account-edit-outline',
  'mdi:account-check-outline',
  'mdi:calendar-clock-outline',
  'eva:more-vertical-fill',
  'solar:export-bold',
  'solar:document-bold',
  'file-icons:microsoft-excel',
  'solar:minimize-square-3-outline',
  'solar:maximize-square-3-outline',
  'solar:trash-bin-trash-bold',
  'fluent:filter-12-filled',
].forEach((name) => {
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
export function renderDocumentUi(children: ReactNode, permissions = ['View', 'Add', 'Delete']) {
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
