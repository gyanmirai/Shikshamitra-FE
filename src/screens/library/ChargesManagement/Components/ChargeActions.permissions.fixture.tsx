import type { ReactNode, ComponentProps } from 'react';
import type { ILibraryChargeData } from 'src/screens/library/ChargesManagement/Components/type';

import React from 'react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { LibraryChargeStatusType } from 'src/enums/library_charges_type';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import authReducer, { setUser, setPermissions } from 'src/redux/auth/authSlice';
import globalReducer, { setCurrentYear } from 'src/redux/globalState/globalSlice';

import LibraryChargesTable from './ChargedManagementTable';

export const chargeActionRoot = 'http://library.test/api';
export const chargeActionYear = '268cd088-b405-4325-8749-365e6778ab33';
export const chargeActionPermission = {
  view: 'Library.Charges.View',
  add: 'Library.Charges.Add',
  update: 'Library.Charges.Update',
  delete: 'Library.Charges.Delete',
  financeView: 'Finance.Fees.Charges.View',
};
export const chargeActionRow: ILibraryChargeData = {
  id: '6b3dd3b8-4590-4471-b927-71c874d31bda',
  memberId: '5c68d95f-73ba-4207-a337-71e6396ffec7',
  memberName: 'Maya José',
  academicYearId: chargeActionYear,
  sourceVersion: ' exact unchanged assessment version +/=%& ',
  financeSourceLinkId: null,
  role: 'Employee',
  chargeCategory: 'Damage assessment',
  fineAmount: 100.75,
  reason: 'Reviewed physical damage.',
  status: LibraryChargeStatusType.Pending,
  schoolChargeDate: '2026-11-17',
  schoolDueDate: '2026-11-30',
  chargeDateProvenance: 2,
  dueDateProvenance: 2,
};

export function chargeActionStore(grants: string[]) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      globalState: globalReducer,
      confirmPopup: confirmReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
  store.dispatch(
    setUser({
      id: '26d4efc0-07a3-48f4-a40c-896905e23f51',
      tenantId: '6328216a-70aa-4c86-90a8-375c6328967f',
    })
  );
  store.dispatch(setPermissions(grants.map((name) => ({ name, isGranted: true }))));
  store.dispatch(setCurrentYear({ id: chargeActionYear, name: 'Explicit selected source year' }));
  return store;
}

export function renderChargeActions(store: ReturnType<typeof chargeActionStore>, child: ReactNode) {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>{child}</LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export function mountChargeActionTable(grants: string[]) {
  const store = chargeActionStore(grants);
  const callbacks = {
    onEditCharge: vi.fn<ComponentProps<typeof LibraryChargesTable>['onEditCharge']>(),
    onDeleteCharge: vi.fn<ComponentProps<typeof LibraryChargesTable>['onDeleteCharge']>(),
    onViewCharges: vi.fn<ComponentProps<typeof LibraryChargesTable>['onViewCharges']>(),
    onCollectCharges: vi.fn<ComponentProps<typeof LibraryChargesTable>['onCollectCharges']>(),
  };
  renderChargeActions(
    store,
    <LibraryChargesTable
      data={[chargeActionRow]}
      addChargesDialog={{
        value: false,
        onTrue: vi.fn(),
        onFalse: vi.fn(),
        onToggle: vi.fn(),
        setValue: vi.fn(),
      }}
      {...callbacks}
    />
  );
  return { store, callbacks };
}
