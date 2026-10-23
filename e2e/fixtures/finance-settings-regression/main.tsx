import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Button, CssBaseline, Stack, Typography } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { financePermissions } from 'src/constants/finance-menu';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import FinanceChargeCategory from 'src/screens/finance/settings/ChargeCategory/ChargeCategory';
import ConcessionType from 'src/screens/finance/settings/ConcessionTypeSetting';
import 'simplebar-react/dist/simplebar.min.css';
const permissions = [
  ...Object.values(financePermissions.fees.settings.chargeCategoryActions),
  ...Object.values(financePermissions.fees.settings.concessionTypeActions),
  financePermissions.fees.chargeActions.view,
].map((name) => ({ name, isGranted: true }));
const store = configureStore({
  reducer: {
    confirmPopup,
    globalState: (state = { currentYear: { id: 'year', name: '2026-2027' } }) => state,
    auth: (state = { permissions }) => state,
  },
});
function Fixture() {
  const [view, setView] = React.useState('charge');
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CssBaseline />
        <Box
          sx={{ height: '100dvh', p: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}
        >
          <Typography variant="caption">Finance settings · synthetic verification data</Typography>
          <Stack direction="row">
            <Button onClick={() => setView('charge')}>Charge Category workspace</Button>
            <Button onClick={() => setView('concession')}>Concession Type workspace</Button>
          </Stack>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {view === 'charge' ? <FinanceChargeCategory /> : <ConcessionType />}
          </Box>
        </Box>
      </ThemeProvider>
    </Provider>
  );
}
class DiagnosticBoundary extends React.Component<{ children: React.ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? (
      <div role="alert">Fixture error: {this.state.error}</div>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById('root')!).render(
  <DiagnosticBoundary>
    <Fixture />
  </DiagnosticBoundary>
);
