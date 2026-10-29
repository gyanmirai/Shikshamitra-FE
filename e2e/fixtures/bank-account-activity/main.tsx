import 'simplebar-react/dist/simplebar.min.css';
import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Alert, Box, Button, CssBaseline, Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import BankAccountManagement from 'src/screens/finance/settings/BankAccManagement';
import AccountsRegister from 'src/screens/finance/accounts/Registers';
import CashManagement from 'src/screens/finance/accounts/CashManagement';
import { usePathname } from 'next/navigation';
import { api, period } from './mock-service';

const readonly = new URLSearchParams(window.location.search).has('readonly');
const permissions = ['Finance.Accounts.Settings.BankAccount', 'Finance.Accounts.IncomeTracking',
  'Finance.Accounts.ExpenseTracking', 'Finance.Accounts.CashManagement'].flatMap((feature) =>
  ['View', 'Add', 'Edit', 'Delete', 'ChangeStatus', 'Deposit'].filter((action) => !readonly || action === 'View')
    .map((action) => ({ name: `${feature}.${action}`, isGranted: true })));
const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer, confirmPopup,
    globalState: () => ({ currentYear: period }),
    auth: () => ({ user: { sub: 'fixture-user' }, permissions, permissionsInitialized: true, loading: false }),
  }, middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(api.middleware),
});
function Fixture() {
  const path = usePathname();
  const { setMode } = useColorScheme();
  return <Stack sx={{ height: '100dvh', minHeight: 0, p: 1, bgcolor: 'background.neutral' }} spacing={1}>
    <Alert severity="info" action={<Stack direction="row"><Button onClick={() => setMode('light')}>Light</Button><Button onClick={() => setMode('dark')}>Dark</Button></Stack>}>
      Synthetic bank-activity verification — no backend writes
    </Alert>
    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      {path === '/finance/income-tracking' ? <AccountsRegister direction="income" />
        : path === '/finance/expenseTracking' ? <AccountsRegister direction="expense" />
          : path === '/finance/accounts/cash-management' ? <CashManagement /> : <BankAccountManagement />}
    </Box>
  </Stack>;
}
createRoot(document.getElementById('root')!).render(<Provider store={store}>
  <ThemeProvider theme={createTheme(defaultSettings)}><CssBaseline /><LocalizationProvider dateAdapter={AdapterDayjs}>
    <Fixture />
  </LocalizationProvider></ThemeProvider>
</Provider>);
