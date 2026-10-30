import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Button, Typography, Card } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { financePermissions } from 'src/constants/finance-menu';
import { useBoolean } from 'src/hooks/use-boolean';
import UpdateChargeForm from 'src/screens/finance/ChargesManagement/Components/UpdateChargeForm/UpdateChargeForm';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import 'simplebar-react/dist/simplebar.min.css';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const year = {
  id: 'year',
  name: '2026-2027',
  startDate: '2026-06-01',
  endDate: '2027-05-31',
  boards: [{ id: 'board', name: 'GSEB', educationMediums: [{ id: 'medium', name: 'English' }] }],
};
const store = configureStore({
  reducer: {
    globalState: (state = { currentYear: year }) => state,
    confirmPopup,
    auth: (
      state: any = {
        permissionsInitialized: true,
        loading: false,
        permissions: [
          { name: financePermissions.fees.chargeActions.add, isGranted: true },
          ...(new URLSearchParams(window.location.search).has('admin')
            ? [{ name: financePermissions.fees.chargeActions.approve, isGranted: true }]
            : []),
        ],
      },
      action: any
    ) =>
      action.type === 'togglePermission'
        ? {
            ...state,
            permissions: state.permissions.length
              ? []
              : [{ name: financePermissions.fees.chargeActions.add, isGranted: true }],
          }
        : state,
  },
});
function Fixture() {
  const open = useBoolean(true);
  const dirty = useSelector((s: any) => s.confirmPopup.isChanges);
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const close = (submitted = false) => {
    if (!submitted && dirty) {
      setDiscardOpen(true);
      return;
    }
    store.dispatch(setIsChanges(false));
    open.onFalse();
  };
  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', p: 1, gap: 1 }}>
      <Typography variant="h6">Add Charge · synthetic component fixture</Typography>
      <Box>
        <Button onClick={() => store.dispatch({ type: 'togglePermission' })}>
          Toggle create permission
        </Button>
        <Button
          onClick={() => {
            (window as any).failStudentLookup = true;
          }}
        >
          Fail next student lookup
        </Button>
        <Button onClick={() => close()}>Back to Charges</Button>
      </Box>
      {open.value ? (
        <Card sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <UpdateChargeForm
            open={open}
            defaultBoardId="board"
            defaultMediumId="medium"
            defaultStandardId="class3"
            defaultDivisionId="a"
            onClose={(_event, submitted) => close(!!submitted)}
          />
        </Card>
      ) : (
        <Typography>
          Charges list · last charge{' '}
          {new URLSearchParams(window.location.search).has('approvalNotRequired')
            ? 'Approved'
            : 'Pending'}
        </Typography>
      )}
      <ConfirmDialog
        open={discardOpen}
        icon="warning"
        title="Discard unsaved changes?"
        content="Your charge has unsaved changes. Leaving will discard them."
        onClose={() => setDiscardOpen(false)}
        action={
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setDiscardOpen(false);
              close(true);
            }}
          >
            Discard changes
          </Button>
        }
      />
    </Box>
  );
}
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Fixture />
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
