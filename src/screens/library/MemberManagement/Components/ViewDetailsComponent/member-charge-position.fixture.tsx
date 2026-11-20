import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import FinesCharges from './FinesCharges';
import { recordMember } from './member-record-test-fixture';

const theme = createTheme(defaultSettings);
export const chargeRoute = 'http://library.test/api/library/members/:memberId/charges';
export function chargePage(items: Record<string, unknown>[], totalCount = items.length, page = 1) {
  return HttpResponse.json({
    items,
    totalCount,
    currentPage: page,
    pageSize: 20,
    totalPages: Math.ceil(totalCount / 20),
  });
}
export function mountMemberCharges(member: typeof recordMember | null = recordMember) {
  const actions = ['Library.LibraryMembers.View'];
  const forbidden: string[] = [];
  mswServer.use(
    http.all(/\/api\/(finance(?:\/|$)|library\/charges(?:\/|$))/, ({ request }) => {
      forbidden.push(request.url);
      return HttpResponse.json(
        { detail: 'This member read does not own that action.' },
        { status: 403 }
      );
    })
  );
  const store = configureStore({
    reducer: {
      auth: () => ({
        permissions: actions.map((name) => ({ name, isGranted: true })),
      }),
      globalState: (
        state: { currentYear: { id: string } } | undefined,
        action: { type: string }
      ) =>
        action.type === 'member-charge-test/change-year'
          ? { currentYear: { id: 'next-context-year' } }
          : (state ?? { currentYear: { id: 'current-context-year' } }),
      confirmPopup: confirmReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </Provider>
  );
  return {
    ...render(<FinesCharges member={member} />, { wrapper }),
    store,
    actions,
    forbidden,
    changeMember: (next: typeof recordMember | null) => <FinesCharges member={next} />,
  };
}
