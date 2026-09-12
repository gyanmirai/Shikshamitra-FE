import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { CssBaseline, Box, Alert, Typography, Button, Stack } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import AssignmentDrawer from 'src/screens/finance/FeeStructureAssign/Components/AssignmentDrawer';
import FeeStructureAssignTable from 'src/screens/finance/FeeStructureAssign/Components/FeeStructureAssignTable';
import type { IFeeStructureData } from 'src/screens/finance/FeeStructureAssign/Components/type';
import { api } from './mock-service';
import 'simplebar-react/dist/simplebar.min.css';

const store = configureStore({ reducer: {
  [api.reducerPath]: api.reducer, confirmPopup,
  globalState: () => ({ currentYear: { id: 'year', name: '2026–27', boards: [{ id: 'board', name: 'CBSE', educationMediums: [{ id: 'medium', name: 'English' }] }] } }),
  auth: () => ({ permissions: ['Finance.Fees.StructureAssign.View', 'Finance.Fees.StructureAssign.Add', 'Finance.Fees.StructureAssign.OverrideAmount', 'Finance.Policies.ProrationPolicy.OverrideChargePeriod'].map((name) => ({ name, isGranted: true })) }),
}, middleware: (getDefault) => getDefault().concat(api.middleware) });
function Fixture() {
  const [students, setStudents] = React.useState<IFeeStructureData[]>([]);
  const { setMode } = useColorScheme();
  return <Stack sx={{ height: '100vh', p: { xs: 1, md: 2 }, bgcolor: 'background.neutral' }} spacing={1}>
    <Alert severity="info">Component verification · synthetic students · no backend writes</Alert>
    <Stack direction="row" spacing={1}><Button onClick={() => setMode('light')}>Light</Button><Button onClick={() => setMode('dark')}>Dark</Button></Stack>
    <Typography variant="h5">Assign fee structure · 2026–27</Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
      <FeeStructureAssignTable onAssignStructure={(student) => setStudents([student])} onBulkAssign={setStudents} />
      <AssignmentDrawer students={students} academicYearId="year" academicYearName="2026–27" onClose={() => setStudents([])} />
    </Box>
  </Stack>;
}
createRoot(document.getElementById('root')!).render(<Provider store={store}><ThemeProvider theme={createTheme(defaultSettings)}><CssBaseline /><Fixture /></ThemeProvider></Provider>);
