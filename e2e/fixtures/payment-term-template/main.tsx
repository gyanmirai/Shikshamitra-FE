import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CssBaseline, Box, Drawer, Button, Typography } from '@mui/material';
import { Toaster } from 'sonner';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import PaymentTermForm from 'src/screens/finance/settings/PaymentTerm/Components/PaymentTermForm';

import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';

import 'simplebar-react/dist/simplebar.min.css';

const store = configureStore({
  reducer: {
    confirmPopup: confirmPopupReducer,
    globalState: (state = { currentYear: { id: 'year' } }) => state,
    auth: (state = { permissions: [] }) => state,
  },
});
class DiagnosticBoundary extends React.Component<
  { children: React.ReactNode },
  { message: string }
> {
  state = { message: '' };
  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }
  render() {
    return this.state.message ? (
      <Typography role="alert">Fixture error: {this.state.message}</Typography>
    ) : (
      this.props.children
    );
  }
}
function Fixture() {
  const [open, setOpen] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [mode, setMode] = React.useState<'create' | 'edit' | 'duplicate'>('edit');
  const editData = {
    id: 'monthly',
    paymentTermName: 'monthly',
    boardId: 'board',
    academicYearId: 'year',
    isUsedInDownstream: true,
    canDirectEdit: false,
  } as any;
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DiagnosticBoundary>
            <CssBaseline />
            <Box sx={{ p: 3, height: '100dvh', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5">Payment Terms · synthetic verification data</Typography>
              <Button
                onClick={() => {
                  setMode('create');
                  setOpen(true);
                }}
              >
                Create Payment Term
              </Button>
              <Button
                onClick={() => {
                  setMode('edit');
                  setOpen(true);
                }}
              >
                Edit monthly
              </Button>
              <Button
                onClick={() => {
                  setMode('duplicate');
                  setOpen(true);
                }}
              >
                Open copied draft
              </Button>
              {saved && (
                <Typography role="status">Payment term saved after confirmation</Typography>
              )}
              <Drawer
                open={open}
                anchor="right"
                onClose={() => setOpen(false)}
                PaperProps={{ sx: { width: '95%', maxWidth: 1400 } }}
              >
                {open && (
                  <PaymentTermForm
                    open
                    onClose={(_, submit) => {
                      setOpen(false);
                      if (submit) setSaved(true);
                    }}
                    editData={
                      mode === 'create'
                        ? undefined
                        : mode === 'edit'
                          ? editData
                          : ({
                              paymentTermName: 'monthly copy',
                              boardId: 'board',
                              academicYearId: 'year',
                              demandGenerationRule: 'OnDueDate',
                              installments: [
                                {
                                  installmentName: 'Annual',
                                  sequence: 1,
                                  startDate: '2026-06-01',
                                  endDate: '2027-05-31',
                                  dueDate: '2027-05-31',
                                  demandDate: '2027-05-31',
                                  allocationPercentage: 100,
                                  demandEnabled: true,
                                },
                              ],
                            } as any)
                    }
                  />
                )}
              </Drawer>
              <Toaster />
            </Box>
          </DiagnosticBoundary>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
