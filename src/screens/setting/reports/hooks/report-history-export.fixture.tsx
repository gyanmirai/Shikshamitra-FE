import type { TableExportRequest } from 'src/components/customizabaleTable/types';

import { createElement } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';

export const exportRequest: TableExportRequest = {
  format: 'excel',
  columns: [{ id: 'fileName', label: 'File name' }],
  searchTerm: 'Shift',
  filters: [{ column: 'status', type: 'equals', value: 'Completed', valueType: 'string' }],
  sorts: [{ column: 'creationTime', direction: 'desc' }],
};
export const exportRows = Array.from({ length: 205 }, (_, index) => ({
  id: `job-${index}`,
  reportTypeId: 'shift-register',
  reportType: 'Shifts',
  status: 'Completed',
  fileName: `Shift-${index}.pdf`,
}));

export function historyExportFixture() {
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json({ accessToken: 'session-a' })),
    http.get('*/api/app/institute-setup-report/options', () =>
      HttpResponse.json({
        reportTypes: [
          {
            id: 'shift-register',
            label: 'Shifts',
            requiredPermissions: ['Source.View'],
            academic: false,
            columns: [],
          },
        ],
        choices: {},
      })
    )
  );
  const initialAuth = {
    permissionsInitialized: true,
    permissions: ['InstituteSetup.Reports.View', 'Source.View'].map((name) => ({
      name,
      isGranted: true,
    })),
    sessionContext: { tenantId: 'school-a' },
  };
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: (state: typeof initialAuth | undefined, action: { type: string }) => {
        const current = state ?? initialAuth;
        return action.type === 'test/switch-school'
          ? { ...current, sessionContext: { tenantId: 'school-b' } }
          : current;
      },
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(Provider, { store, children });
  return { store, wrapper };
}
