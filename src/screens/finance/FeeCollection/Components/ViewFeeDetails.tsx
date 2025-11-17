import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { Box, Grid } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

import PaymentHistory from './ViewDetailsComponent/PaymentHistory';
import FeeOverview from './ViewDetailsComponent/FeeOverviewDetails';
import ConcessionsCard from './ViewDetailsComponent/concessionDetails';
import { FeeTermAccordion } from './ViewDetailsComponent/FeeTermsViewDetails';
import { StudentFeesSummaryView } from './ViewDetailsComponent/StudentFeesSummaryView';

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
  <Box display="flex" flexDirection="column" height="100%">
    <Scrollbar sx={{ height: '100%', p: 1.5 }}>
      <Grid container spacing={2} mb={2}>
        {/* Row 1 */}
        {/* Left Side */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Grid container direction="column" spacing={2}>
            <Grid size={{ xs: 12 }}>
              <StudentFeesSummaryView student={student} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FeeTermAccordion />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Side */}
        <Grid size={{ xs: 12, md: 3 }}>
          <FeeOverview
            total={50000}
            paid={30000}
            pending={15000}
            overdue={5000}
            concession={2000}
          />
        </Grid>

        {/* Row 2 */}
        <Grid size={{ xs: 12, md: 9 }}>
          <PaymentHistory student={student} />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <ConcessionsCard />
        </Grid>
      </Grid>
    </Scrollbar>
  </Box>
);
export default ViewFeeDetails;
