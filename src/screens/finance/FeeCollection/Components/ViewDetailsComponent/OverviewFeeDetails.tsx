import { Box } from '@mui/material';

import { FeeSummaryCard } from '../StudentFeeDetail';

import type { IStudentFee } from '../type';

const OverviewFeeDetails = ({ student }: { student: IStudentFee | null }) => (
  <Box>
    <FeeSummaryCard student={student} showHeader={false} />
  </Box>
);
export default OverviewFeeDetails;
