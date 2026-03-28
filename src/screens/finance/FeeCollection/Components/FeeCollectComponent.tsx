import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Button, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { StudentFeeSummaryCard } from './StudentFeesSummaryCard';
import PaymentDetailsForm, {
  buildInitialValues,
  buildValidationSchema,
} from './PaymentDetailsForm';

import type { IStudentFee } from './type';

const FeeCollectComponent = ({
  student,
  onSubmit,
  onCancel,
  loading = false,
}: {
  student: IStudentFee | null;
  onSubmit?: (values: any) => void;
  onCancel?: (e: any, isSubmit: boolean) => void;
  loading?: boolean;
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Commenting out real API calls for now
  /*
  const { data: feeCollectionDetailsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCollectionDetailsQuery,
    params: {
      studentFeeId: student?.id,
    },
  });

  const [collectFee, { isLoading: isCollectFeeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCollectFeeMutation,
  });
  */

  // Dummy Data
  const dummyFeeHeads = [
    {
      feeHeadId: 'fh1',
      feeHeadName: 'Tuition Fee',
      totalAmount: 20000,
      paidAmount: 12000,
      pendingAmount: 8000,
      status: 1,
    },
    {
      feeHeadId: 'fh2',
      feeHeadName: 'Exam Fee',
      totalAmount: 5000,
      paidAmount: 0,
      pendingAmount: 5000,
      status: 1,
    },
    {
      feeHeadId: 'fh3',
      feeHeadName: 'Library Fee',
      totalAmount: 3000,
      paidAmount: 3000,
      pendingAmount: 0,
      status: 0,
    },
  ];

  const dummyCharges = [
    {
      chargeId: 'ch1',
      chargeName: 'Late Fee',
      amount: 500,
    },
    {
      chargeId: 'ch2',
      chargeName: 'Transport Fine',
      amount: 300,
    },
  ];

  const formik = useFormik({
    initialValues: buildInitialValues(),
    validationSchema: buildValidationSchema(currentYear),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = {
        studentId: student?.id,
        academicYearId: currentYear?.id,
        feeHeadPayments: values.selectedFeeHeads.map((fh: any) => ({
          feeHeadId: fh.feeHeadId,
          amount: fh.amount,
        })),
        chargePayments: values.selectedCharges.map((ch: any) => ({
          chargeId: ch.chargeId,
          amount: ch.amount,
        })),
        totalAmount: values.totalPayableAmount,
        payments: values.payments.map((p) => ({
          paymentMethod: p.paymentMethod,
          amount: Number(String(p.amount).replace(/[₹,\s,]/g, '')),
          details: p.details,
        })),
      };

      // Simulating successful submit
      if (onSubmit) {
        onSubmit(values);
      }
      onCancel?.(null, true);

      /*
      try {
        await collectFee(payload).unwrap();
        if (onSubmit) {
          onSubmit(values);
        }
        onCancel?.(null, true);
      } catch (error) {
        console.error('Failed to collect fee:', error);
      }
      */
    },
  });

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      display="flex"
      flexDirection="column"
      height="100%"
    >
      <Scrollbar sx={{ p: 1.5, height: '100%' }}>
        <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
          <StudentFeeSummaryCard student={student} />
          <PaymentDetailsForm formik={formik} feeHeads={dummyFeeHeads} charges={dummyCharges} />
        </BackPopUpChecked>
      </Scrollbar>

      <DialogActions>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => {
            onCancel?.(null, false);
          }}
          disabled={loading}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          // loading={isCollectFeeLoading}
          size="small"
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};

export default FeeCollectComponent;
