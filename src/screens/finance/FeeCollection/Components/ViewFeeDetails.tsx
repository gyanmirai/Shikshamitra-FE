import type { RootState } from 'src/redux/store';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { motion } from 'framer-motion';
import { Box, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStudentFeeDetailsQuery } from 'src/redux/feeCollection/feeCollection';

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
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: feeDetails } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentFeeDetailsQuery,
    params: {
      studentId: String(student?.studentId ?? ''),
      academicYearId: currentYear?.id ?? '',
    },
    options: {
      skip: !student?.studentId || !currentYear?.id,
    },
  });

  const overview = feeDetails?.feeOverview;

  return (
    <Box display="flex" flexDirection="column" height="100%" pb={1}>
      <Scrollbar sx={{ height: '100%' }}>
        <Grid container spacing={1}>
          {/* Student header */}
          <Grid size={{ xs: 12 }}>
            <motion.div {...slideUp(0)}>
              <StudentFeesSummaryView student={feeDetails?.student} />
            </motion.div>
          </Grid>

          {/* Fee head breakdown */}
          <Grid size={{ xs: 12, md: 8 }}>
            <motion.div {...slideUp(0.08)} style={{ height: '100%' }}>
              <ConsolidatedFeeDetails
                feeHeads={feeDetails?.feeHeads}
                charges={feeDetails?.charges}
              />
            </motion.div>
          </Grid>

          {/* Fee overview */}
          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div {...slideUp(0.13)} style={{ height: '100%' }}>
              <FeeOverview
                total={overview?.totalFee ?? 0}
                paid={overview?.paidFee ?? 0}
                pending={overview?.pendingFee ?? 0}
                overdue={overview?.overdueFee ?? 0}
                concession={overview?.concessionAmount ?? 0}
              />
            </motion.div>
          </Grid>

          {/* Payment history */}
          <Grid size={{ xs: 12, md: 8 }}>
            <motion.div {...slideUp(0.18)}>
              <PaymentHistory student={student} payments={feeDetails?.payments} />
            </motion.div>
          </Grid>

          {/* Concessions */}
          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div {...slideUp(0.23)} style={{ height: '100%' }}>
              <ConcessionsCard concessions={feeDetails?.concessions} />
            </motion.div>
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
};

export default ViewFeeDetails;
