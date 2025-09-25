import { Box, Grid } from '@mui/material';

import ConcessionsCard from './concessionDetails';
import { FeeSummaryCard } from '../StudentFeeDetail';
import InstallmentStatusCard from './InstallmentStatusCard';

import type { IStudentFee } from '../type';

const OverviewFeeDetails = ({ student }: { student: IStudentFee | null }) => (
  <Box>
    <FeeSummaryCard student={student} showHeader={false} />
    <Grid container gap={3} mt={2}>
      <Grid size={{ xs: 12, md: 5 }}>
        <ConcessionsCard />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <InstallmentStatusCard />
      </Grid>
    </Grid>
  </Box>
);
export default OverviewFeeDetails;
