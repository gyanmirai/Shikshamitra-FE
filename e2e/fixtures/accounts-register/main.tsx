import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { UnknownAction } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Alert, Button, Stack, CssBaseline } from '@mui/material';
import { Toaster } from 'sonner';
import { LocalizationProvider } from 'src/components/Localization-provider/localization-provider';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import AccountsRegister from 'src/screens/finance/accounts/Registers';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { financeModuleType } from 'src/redux/tagTypes';
import { api, confirmRefund, returnRefund, fixtureState } from './api';
import 'simplebar-react/dist/simplebar.min.css';
const years = [
  { id: 'year-2026', startDate: '2026-06-15', endDate: '2027-05-10' },
  { id: 'year-2025', startDate: '2025-06-01', endDate: '2026-05-31' },
];
const grants = ['IncomeTracking', 'ExpenseTracking'].flatMap((name) =>
  ['View', 'Add'].map((action) => ({
    name: 'Finance.Accounts.' + name + '.' + action,
    isGranted: true,
  }))
);
const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    confirmPopup,
    globalState: (
      state: { currentYear: (typeof years)[number] } = { currentYear: years[0] },
      action: UnknownAction
    ) => (action.type === 'fixture/year' ? { currentYear: years[Number(action.payload)] } : state),
    auth: (
      state: { permissions: typeof grants; loading: boolean; permissionsInitialized: boolean } = {
        permissions: grants,
        loading: false,
        permissionsInitialized: true,
      },
      action: UnknownAction
    ) =>
      action.type === 'fixture/read-only'
        ? { ...state, permissions: grants.filter((x) => x.name.endsWith('.View')) }
        : state,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
function Fixture() {
  const [direction, setDirection] = React.useState<'income' | 'expense'>('income');
  return (
    <Provider store={store}>
      <ThemeProvider
        theme={createTheme(defaultSettings)}
        defaultMode="light"
        modeStorageKey="accounts-ui-qa-mode"
      >
        <LocalizationProvider>
          <CssBaseline />
          <Box
            sx={{
              height: '100dvh',
              p: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              bgcolor: 'background.neutral',
              overflow: 'hidden',
            }}
          >
            <Alert severity="info">
              Component verification · synthetic data · no real payments
            </Alert>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button onClick={() => setDirection('income')}>Income page</Button>
              <Button onClick={() => setDirection('expense')}>Expenses page</Button>
              <Button onClick={() => store.dispatch({ type: 'fixture/year', payload: 1 })}>
                Previous academic year
              </Button>
              <Button onClick={() => store.dispatch({ type: 'fixture/year', payload: 0 })}>
                Current academic year
              </Button>
              <Button
                onClick={() => {
                  confirmRefund();
                  store.dispatch(api.util.invalidateTags([financeModuleType.feeRefund]));
                }}
              >
                Confirm synthetic payout
              </Button>
              <Button
                onClick={() => {
                  returnRefund();
                  store.dispatch(api.util.invalidateTags([financeModuleType.feeRefund]));
                }}
              >
                Return synthetic payout
              </Button>
              <Button onClick={() => store.dispatch({ type: 'fixture/read-only' })}>
                Read-only mode
              </Button>
              <Button
                onClick={() => {
                  fixtureState.failList = !fixtureState.failList;
                  store.dispatch(
                    api.util.invalidateTags([
                      financeModuleType.incomeTracking,
                      financeModuleType.expenseDetails,
                    ])
                  );
                }}
              >
                Toggle list error
              </Button>
            </Stack>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <AccountsRegister direction={direction} />
            </Box>
            <Toaster />
          </Box>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
