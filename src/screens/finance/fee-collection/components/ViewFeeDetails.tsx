import type { UseBooleanReturn } from 'src/hooks/useBoolean';

import { Box, Grid } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeCollectionDetailsQuery } from 'src/redux/fee-collection/feeCollection';

import PaymentHistory from './view-details-component/PaymentHistory';
import FeeOverview from './view-details-component/FeeOverviewDetails';
import ConcessionsCard from './view-details-component/concessionDetails';
import { ConsolidatedFeeDetails } from './view-details-component/FeeTermsViewDetails';
import { StudentFeesSummaryView } from './view-details-component/StudentFeesSummaryView';

import type { IStudentFee } from './type';

const ViewFeeDetails = ({
  student,
  collectFeesDialog,
  viewDialog,
}: {
  student: IStudentFee | null;
  collectFeesDialog: UseBooleanReturn;
  viewDialog: UseBooleanReturn;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: feeCollectionDetailsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCollectionDetailsQuery,
    params: {
      studentFeeId: student?.id,
    },
  });
  return (
    <Box display="flex" flexDirection="column" height="100%" pb={1}>
      <Scrollbar sx={{ height: '100%', p: 1 }}>
        <Grid container spacing={1}>
          {/* Row 1 */}
          {/* Left Side: Student Info & Fee Terms */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container direction="column" spacing={1}>
              <Grid size={{ xs: 12 }}>
                <StudentFeesSummaryView student={student} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <ConsolidatedFeeDetails />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Side: Overview */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FeeOverview
              total={50000}
              paid={30000}
              pending={15000}
              overdue={5000}
              concession={2000}
            />
          </Grid>

          {/* Row 2: Payment History & Concessions */}
          <Grid size={{ xs: 12, md: 8 }}>
            <PaymentHistory student={student} />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ConcessionsCard />
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
};
export default ViewFeeDetails;
