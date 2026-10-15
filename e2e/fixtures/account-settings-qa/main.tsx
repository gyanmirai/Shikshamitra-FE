import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Button, CssBaseline, Typography } from '@mui/material';
import { Toaster } from 'sonner';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import Income from 'src/screens/finance/settings/IncomeCategories';
import Expense from 'src/screens/finance/settings/ExpenseCategories/ExpenseCategories';
import Bank from 'src/screens/finance/settings/BankAccManagement';
import 'simplebar-react/dist/simplebar.min.css';

const store = configureStore({
  reducer: { confirmPopup, globalState: (state = { currentYear: { id: 'qa-year' } }) => state },
});
function Fixture() {
  const [kind, setKind] = React.useState('Income');
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CssBaseline />
        <Box
          sx={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            p: 1,
            gap: 1,
            bgcolor: 'background.neutral',
          }}
        >
          <Typography variant="caption">Local QA fixture · synthetic data · no live API</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['Income', 'Expense', 'Bank'].map((item) => (
              <Button
                key={item}
                size="small"
                variant={kind === item ? 'contained' : 'outlined'}
                onClick={() => setKind(item)}
              >
                {item}
              </Button>
            ))}
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {kind === 'Income' ? <Income /> : kind === 'Expense' ? <Expense /> : <Bank />}
          </Box>
        </Box>
        <Toaster />
      </ThemeProvider>
    </Provider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
