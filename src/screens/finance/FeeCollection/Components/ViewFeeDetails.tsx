import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { motion } from 'framer-motion';
import { Box, Grid } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeCollectionDetailsQuery } from 'src/redux/feeCollection/feeCollection';

import PaymentHistory from './ViewDetailsComponent/PaymentHistory';
import FeeOverview from './ViewDetailsComponent/FeeOverviewDetails';
import ConcessionsCard from './ViewDetailsComponent/concessionDetails';
import { ConsolidatedFeeDetails } from './ViewDetailsComponent/FeeTermsViewDetails';
import { StudentFeesSummaryView } from './ViewDetailsComponent/StudentFeesSummaryView';

import type { IStudentFee } from './type';

const slideUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
});

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
      <Scrollbar sx={{ height: '100%' }}>
        <Grid container spacing={1}>
          {/* Row 1 */}
          {/* Left Side: Student Info & Fee Terms */}
          <Grid size={{ xs: 12 }}>
            <motion.div {...slideUp(0)}>
              <StudentFeesSummaryView student={student} />
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <motion.div {...slideUp(0.08)} style={{ height: '100%' }}>
              <ConsolidatedFeeDetails />
            </motion.div>
          </Grid>

          {/* Right Side: Overview */}
          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div {...slideUp(0.13)} style={{ height: '100%' }}>
              <FeeOverview
                total={50000}
                paid={30000}
                pending={15000}
                overdue={5000}
                concession={2000}
              />
            </motion.div>
          </Grid>

          {/* Row 2: Payment History & Concessions */}
          <Grid size={{ xs: 12, md: 8 }}>
            <motion.div {...slideUp(0.18)}>
              <PaymentHistory student={student} />
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div {...slideUp(0.23)} style={{ height: '100%' }}>
              <ConcessionsCard />
            </motion.div>
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
};
export default ViewFeeDetails;
