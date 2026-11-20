import type { ComponentProps } from 'react';

import React from 'react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { useBoolean } from 'src/hooks/use-boolean';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import CustomDialog from 'src/components/customDialog';
import confirmReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import authReducer, { setUser, setPermissions } from 'src/redux/auth/authSlice';
import GlobalAcademicSearch from 'src/layouts/components/global-academic-search';
import globalReducer, { setCurrentYear } from 'src/redux/globalState/globalSlice';

import CollectChargesForm from './AssignChargeProcessForm';
import { ids, staleRow, libraryRoot } from './AssignChargeProcessForm.finance.fixture';

export const cashierContextActor = '26d4efc0-07a3-48f4-a40c-896905e23f51';
export const cashierContextTenant = '6328216a-70aa-4c86-90a8-375c6328967f';
export const cashierNextYear = { id: '397ae7db-838a-41df-b14a-16c48a003205', name: '2027–2028' };

export function installCashierAcademicResponses() {
  const years = [
    { id: ids.otherYear, name: '2025–2026' },
    { id: ids.sourceYear, name: '2026–2027' },
    cashierNextYear,
  ];
  const seen: string[] = [];
  mswServer.use(
    http.get(`${libraryRoot}/app/academic-year`, () => {
      seen.push('years');
      return HttpResponse.json({ totalCount: years.length, items: years });
    }),
    http.get(`${libraryRoot}/app/education-board`, () => {
      seen.push('boards');
      return HttpResponse.json({ totalCount: 0, items: [] });
    }),
    http.get(`${libraryRoot}/app/user-scope/user-scope-hierarchy`, ({ request }) => {
      seen.push('scope');
      if (new URL(request.url).searchParams.get('userId') !== cashierContextActor)
        return HttpResponse.json(
          { detail: 'Unknown authenticated context actor.' },
          { status: 403 }
        );
      return HttpResponse.json({
        userId: cashierContextActor,
        userName: 'Actual Library cashier',
        isAdmin: false,
        fromCache: false,
        generatedAt: '2026-11-19T00:00:00Z',
        accessibleHierarchy: years.map((year) => ({
          academicYearId: year.id,
          academicYearName: year.name,
          hasFullBoardAccess: true,
          boards: [],
        })),
      });
    })
  );
  return seen;
}

// Real component integration, with no mock of selector/confirmation/guard hooks.
// This does NOT manufacture a context-keyed unmount or claim that the shell
// selector is pointer-reachable behind the production MUI modal.
export function mountCashierWithActualAcademicSelector(grants: string[]) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      globalState: globalReducer,
      confirmPopup: confirmReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
  store.dispatch(setUser({ id: cashierContextActor, tenantId: cashierContextTenant }));
  store.dispatch(setPermissions(grants.map((name) => ({ name, isGranted: true }))));
  store.dispatch(setCurrentYear({ id: ids.otherYear, name: '2025–2026' }));
  const onClose = vi.fn<ComponentProps<typeof CollectChargesForm>['onClose']>();
  function OwningDialog() {
    const open = useBoolean(true);
    const [busy, setBusy] = React.useState(false);
    return (
      <CustomDialog
        open={open.value}
        title="Library Finance"
        disableClose={busy}
        handleClose={() => onClose(null, false)}
      >
        <CollectChargesForm
          open={open}
          onClose={onClose}
          charge={staleRow}
          onBusyChange={setBusy}
        />
      </CustomDialog>
    );
  }
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <GlobalAcademicSearch />
        <OwningDialog />
      </ThemeProvider>
    </Provider>
  );
  return { store, onClose };
}

export function collectionResponseGate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}
