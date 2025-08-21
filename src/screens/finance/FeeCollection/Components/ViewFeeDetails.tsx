import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { Box } from '@mui/material';

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
      <Box>
        <StudentInfoCard student={student} />
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
          collectFeesDialog={collectFeesDialog}
          viewDialog={viewDialog}
        />
      </Box>
    ) : (
      <Box data-testid="student-empty-state">No student selected</Box>
    )}
  </Box>
);
export default ViewFeeDetails;
