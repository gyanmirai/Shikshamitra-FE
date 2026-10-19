import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Alert, Box, Button, CssBaseline, Stack, Typography } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import CustomDialog from 'src/components/customDialog';
import { useBoolean } from 'src/hooks/use-boolean';
import confirmPopup, { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { financeModuleType } from 'src/redux/tagTypes';
import FeeCollectionTable from 'src/screens/finance/FeeCollection/Components/FeeCollectionTable';
import FeeCollectComponentForm from 'src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm';
import type { IFeeData, IStudentFee } from 'src/screens/finance/FeeCollection/Components/type';
import type { UseFinanceAcademicFiltersResult } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import { api, requests, resetFixture, refreshSelectionBalances } from './mock-service';
import 'simplebar-react/dist/simplebar.min.css';

const boards = [{ id: 'gseb', name: 'GSEB', educationMediums: [{ id: 'english', name: 'English' }] }];
const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer, confirmPopup,
    globalState: () => ({ currentYear: { id: 'year-2026', name: '2026-2027', startDate: '2026-06-01', endDate: '2027-05-31', boards } }),
    auth: () => ({ permissionsInitialized: true, loading: false, permissions: ['Finance.Fees.FeeCollections.View', 'Finance.Fees.FeeCollections.Add', 'Finance.Fees.FeeCollections.Waive'].map((name) => ({ name, isGranted: true })) }),
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

function Fixture() {
  const dialog = useBoolean();
  const [student, setStudent] = React.useState<IStudentFee | null>(null);
  const { setMode } = useColorScheme();
  const [showRequests, setShowRequests] = React.useState(false);
  const filters: UseFinanceAcademicFiltersResult = {
    boards: boards as any, mediums: boards[0].educationMediums as any,
    classes: [{ id: 'class-3', name: 'Class 3' }], divisions: [{ id: 'division-a', name: 'A' }],
    selectedBoard: 'gseb', selectedMedium: 'english', selectedStandardId: 'class-3', selectedDivisionId: 'All Divisions',
    isReady: true, classOptions: [{ id: 'class-3', name: 'Class 3' }],
    divisionOptions: [{ id: 'All Divisions', name: 'All Divisions' }, { id: 'division-a', name: 'A' }],
    isDivisionDisabled: false, classesLoading: false,
    filterPayload: { academicYearId: 'year-2026', boardId: 'gseb', educationMediumId: 'english', standardId: 'class-3' },
    setSelectedBoard: () => {}, setSelectedMedium: () => {}, setSelectedStandardId: () => {}, setSelectedDivisionId: () => {},
  };
  const close = () => { dialog.onFalse(); setStudent(null); store.dispatch(setIsChanges(false)); };
  const open = (row: IFeeData) => { setStudent(row as unknown as IStudentFee); dialog.onTrue(); };
  return (
    <Stack sx={{ height: '100vh', p: 2, bgcolor: 'background.neutral' }} spacing={1}>
      <Alert severity="info">Synthetic browser contract fixture · actual Collections components · no backend writes · 2026-2027</Alert>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button onClick={() => { close(); resetFixture(); store.dispatch(api.util.resetApiState()); }}>Reset synthetic scenario</Button>
        <Button onClick={() => { close(); resetFixture('statuses'); store.dispatch(api.util.resetApiState()); }}>Mixed statuses</Button>
        <Button onClick={() => { close(); resetFixture('selection'); store.dispatch(api.util.resetApiState()); }}>Selection regression</Button>
        <Button onClick={() => setMode('light')}>Light</Button><Button onClick={() => setMode('dark')}>Dark</Button>
        <Button onClick={() => setShowRequests(!showRequests)}>Request evidence</Button>
      </Stack>
      <Typography variant="h5">Collections · late-fee regression</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
        <FeeCollectionTable onAddFee={dialog} onDelete={() => {}} onCollectFee={open} onView={() => {}} onGiveAdjustment={() => {}} academicFilters={filters} />
      </Box>
      {showRequests && <Box component="pre" sx={{ maxHeight: 250, overflow: 'auto', fontSize: 12 }}>{JSON.stringify(requests.filter((request) => request.method === 'POST'), null, 2)}</Box>}
      <CustomDialog open={dialog.value} fullScreen title={`Collect Fees – ${student?.name ?? 'Student'}`} handleClose={close}>
        <Button onClick={() => { refreshSelectionBalances(); store.dispatch(api.util.invalidateTags([financeModuleType.feeDetails, financeModuleType.feeCollection])); }}>Refresh selection balances</Button>
        {dialog.value && <FeeCollectComponentForm student={student} onCancel={close} />}
      </CustomDialog>
    </Stack>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}><CssBaseline /><Fixture /></LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
