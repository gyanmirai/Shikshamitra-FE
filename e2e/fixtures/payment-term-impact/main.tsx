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
import PaymentTermTable from 'src/screens/finance/settings/PaymentTerm/Components/PaymentTermTable';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { usage } from './mock-api';
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
              <Button onClick={() => setOpen(true)}>Edit monthly</Button>
              {saved && (
                <Typography role="status">Payment term saved after confirmation</Typography>
              )}
              <PaymentTermTable
                data={[
                  {
                    id: 'monthly',
                    name: 'monthly',
                    code: 'PT-MONTHLY',
                    academicYearId: 'year',
                    boardId: 'board',
                    status: 'Active',
                    isDefault: false,
                    currentVersionNumber: 1,
                    hasDraft: false,
                    hasPublishedVersion: true,
                    installmentCount: 1,
                    referencedStructureCount: 2,
                    canDirectEdit: false,
                    usage,
                  },
                ]}
                loading={false}
                totalCount={1}
                page={1}
                rowsPerPage={10}
                searchTerm=""
                onPaginationChange={() => {}}
                onSearchChange={() => {}}
                onView={() => {}}
                onVersionHistory={() => {}}
                onEdit={() => setOpen(true)}
                onDelete={() => {}}
                onPublish={() => {}}
                onArchive={() => {}}
                onRestore={() => {}}
                canView
                canEdit
                canPublish
                canArchive
                canRestore
                canDelete
                actionLoading={false}
              />
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
                    editData={editData}
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
