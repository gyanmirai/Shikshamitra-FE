import type { UnknownAction } from '@reduxjs/toolkit';

import React from 'react';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import StudentSetupScreen from 'src/screens/student/setup';
import { studentPermissions } from 'src/constants/student-menu';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { studentSetupSettings } from 'src/screens/student/setup/student-setup-catalog';
import { LocalizationProvider } from 'src/components/Localization-provider/localization-provider';

import { api } from './mock-service';
import { years, medium, boards } from './structure';

const query = new URLSearchParams(window.location.search);
const viewPermissions = studentSetupSettings.filter((_, index) => !query.has('limited') || index < 5).map((item) => item.permission);
const permissions = [...new Set([studentPermissions.root, studentPermissions.dashboard, ...viewPermissions,
  ...(!query.has('readonly') ? ['Students.Admissions.Add', 'Students.Admissions.Forms.Add', 'Students.Admissions.Workflows.Add', 'Students.Admissions.Offerings.Add', 'Students.Onboarding.Add', 'Students.Records.Settings.Add', 'Students.Records.HouseManagement.Add'] : []),
])].filter((name) => !query.has('denied') || name === studentPermissions.root).map((name) => ({ name, isGranted: true }));
const initialGlobalState = { currentYear: { ...years[0], boards: [boards[0]] }, currentMedium: medium, currentBoard: boards[0] };
function fixtureGlobalState(state: typeof initialGlobalState = initialGlobalState, action: UnknownAction = { type: 'fixture/initial' }): typeof initialGlobalState {
  return action.type === 'fixture/year' ? { ...state, currentYear: { ...(years.find((year) => year.id === action.payload) ?? years[0]),
    boards: [boards.find((board) => board.academicYearId === action.payload) ?? boards[0]] } } : state;
}
const store = configureStore({
  reducer: {
    confirmPopup,
    [api.reducerPath]: api.reducer,
    globalState: fixtureGlobalState,
    auth: (state = { sessionContext: { accountMode: 'tenant', tenantId: 'synthetic-tenant' }, user: { sub: 'synthetic-user' }, loading: false, permissionsInitialized: true, permissions }) => state,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

createRoot(document.getElementById('root')!).render(<Provider store={store}>
  <ThemeProvider defaultMode={query.has('dark') ? 'dark' : 'light'} modeStorageKey="student-guide-fixture-mode"
    theme={createTheme({ ...defaultSettings, colorScheme: query.has('dark') ? 'dark' : 'light' })}>
    <LocalizationProvider><CssBaseline /><StudentSetupScreen /></LocalizationProvider>
  </ThemeProvider>
</Provider>);
