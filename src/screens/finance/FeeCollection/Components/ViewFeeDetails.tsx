import type { RootState } from 'src/redux/store';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { useSelector } from 'react-redux';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Alert, Stack, Button, Skeleton } from '@mui/material';
import { useGetStudentFeeDetailsQuery } from 'src/redux/feeCollection/feeCollection';

import PaymentHistory from './ViewDetailsComponent/PaymentHistory';
import FeeOverview from './ViewDetailsComponent/FeeOverviewDetails';
import ConcessionsCard from './ViewDetailsComponent/concessionDetails';
import { ConsolidatedFeeDetails } from './ViewDetailsComponent/FeeTermsViewDetails';
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
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const {
    data: feeDetails,
    isLoading: isFeeDetailsLoading,
    isFetching: isFeeDetailsFetching,
    isError: isFeeDetailsError,
    refetch: refetchFeeDetails,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentFeeDetailsQuery,
    params: {
      studentId: String(student?.studentId ?? ''),
      academicYearId: currentYear?.id ?? '',
    },
    options: {
      skip: !student?.studentId || !currentYear?.id,
    },
    popupConfig: { error: false },
  });

  const overview = feeDetails?.feeOverview;

  if (!currentYear?.id) {
    return <Box>Select an academic year to view fee details.</Box>;
  }

  if (isFeeDetailsError) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            disabled={isFeeDetailsFetching}
            onClick={refetchFeeDetails}
          >
            Retry
          </Button>
        }
      >
        Fee details could not be loaded. Please try again.
      </Alert>
    );
  }

  if (isFeeDetailsLoading || (!feeDetails && isFeeDetailsFetching)) {
    return (
      <Stack spacing={2} sx={{ p: 2 }} role="status" aria-label="Loading fee details">
        <Skeleton variant="rounded" height={180} />
        <Skeleton variant="rounded" height={180} />
        <Skeleton variant="rounded" height={240} />
      </Stack>
    );
  }

  if (!feeDetails) {
    return <Box>Fee details are unavailable for this student.</Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Scrollbar sx={{ flex: 1, minHeight: 0, p: 2 }}>
        <Stack spacing={2}>
          <StudentFeesSummaryView student={feeDetails.student} />
          <FeeOverview
            total={overview?.totalFee ?? 0}
            paid={overview?.paidFee ?? 0}
            pending={overview?.pendingFee ?? 0}
            overdue={overview?.overdueFee ?? 0}
            concession={overview?.concessionAmount ?? 0}
            netFee={overview?.netFee}
            grossPaid={overview?.grossPaidAmount}
            refunded={overview?.refundedAmount}
            overpayment={overview?.overpaymentAmount}
            adjustment={overview?.adjustmentCreditAmount}
          />
          <ConsolidatedFeeDetails feeHeads={feeDetails.feeHeads} charges={feeDetails.charges} />
          <ConcessionsCard concessions={feeDetails.concessions} />
          <PaymentHistory payments={feeDetails.payments} />
        </Stack>
      </Scrollbar>
    </Box>
  );
};

export default ViewFeeDetails;
