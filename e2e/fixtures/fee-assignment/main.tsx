import 'simplebar-react/dist/simplebar.min.css';

import type { IFeeStructureData } from 'src/screens/finance/FeeStructureAssign/Components/type';

import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { defaultSettings } from 'src/components/settings/config-settings';
import { Box, Alert, Stack, Button, Typography, CssBaseline } from '@mui/material';
import AssignmentDrawer from 'src/screens/finance/FeeStructureAssign/Components/AssignmentDrawer';
import FeeStructureAssignTable from 'src/screens/finance/FeeStructureAssign/Components/FeeStructureAssignTable';

import { api } from './mock-service';

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    confirmPopup,
    globalState: (
      state = {
        currentYear: {
          id: 'year',
          name: '2026–27',
          startDate: '2026-04-01T00:00:00Z',
          endDate: '2027-03-31T00:00:00Z',
          boards: [
            { id: 'board', name: 'CBSE', educationMediums: [{ id: 'medium', name: 'English' }] },
          ],
        },
      }
    ) => state,
    auth: (
      state = {
        permissions: [
          'Finance.Fees.StructureAssign.View',
          'Finance.Fees.StructureAssign.Add',
          'Finance.Fees.StructureAssign.OverrideAmount',
          'Finance.Fees.StructureAssign.OverridePolicies',
          'Finance.Policies.ProrationPolicy.OverrideChargePeriod',
        ]
          .filter(
            (name) =>
              !new URLSearchParams(window.location.search).has('variableFees') ||
              !name.endsWith('.OverrideAmount')
          )
          .map((name) => ({ name, isGranted: true })),
      }
    ) => state,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
function Fixture() {
  const [students, setStudents] = React.useState<IFeeStructureData[]>([]);
  const { setMode } = useColorScheme();
  return (
    <Stack sx={{ height: '100vh', p: { xs: 1, md: 2 }, bgcolor: 'background.neutral' }} spacing={1}>
      <Alert severity="info">Component verification · synthetic students · no backend writes</Alert>
      <Stack direction="row" spacing={1}>
        <Button onClick={() => setMode('light')}>Light</Button>
        <Button onClick={() => setMode('dark')}>Dark</Button>
      </Stack>
      <Typography variant="h5">Assign fee structure · 2026–27</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
        <FeeStructureAssignTable
          onAssignStructure={(student) => setStudents([student])}
          onBulkAssign={setStudents}
        />
        <AssignmentDrawer
          students={students}
          academicYearId="year"
          academicYearName="2026–27"
          onClose={() => setStudents([])}
        />
      </Box>
    </Stack>
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
