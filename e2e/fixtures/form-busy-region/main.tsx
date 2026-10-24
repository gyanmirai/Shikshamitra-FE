import 'simplebar-react/dist/simplebar.min.css';

import type { IConcession, IStudentInfo } from 'src/screens/finance/Concession/type';

import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { Box, Card, CssBaseline } from '@mui/material';
import { financePermissions } from 'src/constants/finance-menu';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import ConcessionRequestForm from 'src/screens/finance/Concession/Components/ConcessionRequestForm';

const year = {
  id: 'year',
  name: '2026-2027',
  boards: [{ id: 'board', name: 'CBSE', educationMediums: [{ id: 'medium', name: 'English' }] }],
};
const permissions = Object.values(financePermissions.fees.concessionActions).map((name) => ({
  name,
  isGranted: true,
}));
const store = configureStore({
  reducer: {
    confirmPopup,
    globalState: (s = { currentYear: year }) => s,
    auth: (s = { permissions }) => s,
  },
});
const edit: IConcession = {
  id: 'draft',
  board: 'board',
  medium: 'medium',
  className: 'Class 1',
  division: 'A',
  studentId: 'student',
  studentName: 'Sample Student',
  concessionTypeIds: ['type'],
  documents: [],
  reason: '',
  feeHead: 'tuition',
  concessions: [],
};
const student: IStudentInfo = {
  ...edit,
  rollNo: '1',
  contactNo: '',
  classDivision: 'Class 1 (A)',
  parentNaforme: '',
  grNo: '1',
  parentName: '',
  applicableFeeHeads: ['tuition'],
  documentRequired: false,
  email: '',
  totalConcession: 500,
};
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <CssBaseline />
      <Box sx={{ height: '100dvh', p: 2, display: 'flex', flexDirection: 'column' }}>
        <h3>Update Concession Request · synthetic data</h3>
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ConcessionRequestForm open student={student} editData={edit} onClose={() => {}} />
        </Card>
      </Box>
    </ThemeProvider>
  </Provider>
);
