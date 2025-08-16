import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { Box, Button } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import StudentInfoCard from './ViewStudentFeeDetails';
import FinanceStudentDetailedFeeComponent from './FinanceStudentDetailedFeeComponent';

import type { IStudentFee } from './type';

const ViewFeeDetails = ({
  student,
  collectFeesDialog,
  viewDialog,
}: {
  student: IStudentFee | null;
  collectFeesDialog: UseBooleanReturn;
  viewDialog: UseBooleanReturn;
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    {student ? (
      <StudentInfoCard student={student} />
    ) : (
      <Box data-testid="student-empty-state">No student selected</Box>
    )}{' '}
    <FinanceStudentDetailedFeeComponent
      studentId="12"
      student={{
        id: 1,
        name: 'Dharmik Jinjala',
        profileImage: '',
        rollNumber: '01',
        board: 'CBSE',
        medium: 'English',
        className: '10',
        division: 'A',
        totalFees: 50000,
        paidFees: 30000,
        pendingFees: 20000,
        overdueFees: 5000,
        status: 'Pending',
        terms: [],
        contactNumber: '+91 6355030866',
        admissionDate: '01-04-2025',
        grNumber: 'GR0036',
        parentName: 'Laljibhai Jinjala',
        email: 'dharmikjinjala2486@gmail.com',
      }}
    />
    <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowForwardIcon />}
        size="small"
        sx={{
          flex: 1,
          justifyContent: 'flex-start',
        }}
      >
        Send Reminder
      </Button>
      <Button
        variant="contained"
        startIcon={<CreditCardIcon />}
        sx={{
          flex: 2,
        }}
        color="primary"
        size="small"
        onClick={() => {
          collectFeesDialog.onTrue();
          viewDialog.onFalse();
        }}
      >
        Collect Fees
      </Button>
    </Box>
  </Box>
);
export default ViewFeeDetails;
