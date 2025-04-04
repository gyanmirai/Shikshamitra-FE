import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Tooltip, Typography } from '@mui/material';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import NumericFormatCustom from 'src/components/custom-numeric-format';

// Define TypeScript interfaces for data structure
interface PaymentHistory {
  paymentMode: string;
  amount: string;
  paymentId?: string;
  paymentStatus: string;
}

interface PaymentDueDate {
  month: string;
  date: string;
  status: string;
  amount: number;
  paymentHistory: PaymentHistory[];
}

interface Fee {
  feeHeadId: string;
  feeHead: string;
  grossFees: number;
  payableFee: number;
  generalDiscount: number;
  acceptedpaymentMethod: string[];
  lateFeeChargesType: string;
  lateFeeChargesAmount: string;
  isActive: boolean;
  status: string;
  paymentDueDate: string;
  paymentDueDateList: PaymentDueDate[];
}

interface Student {
  studentId: number;
  name: string;
  grade: number;
  feestructureId: string;
  paymentTerm: string;
  totalPending: number;
  totalPaid: number;
  discountAmount: number;
  fixedReduction: number;
  overAllDueDate: string;
  totalFees: number;
  totalDueAfterDiscount: number;
  previousCharges: number;
  chargesDetails: string;
  fees: Fee[];
}

interface FeeCollectionMonthWiseProps {
  students: Student;
  dialogValue: boolean;
  onClose: () => void;
}

const FeeCollectionMonthWise: React.FC<FeeCollectionMonthWiseProps> = ({
  students,
  dialogValue,
  onClose,
}) => {
  const formik = useFormik<any>({
    initialValues: {
      feeType: '',
      selectedTerms: [],
      paymentMode: [],
    },
    onSubmit: (values) => {},
  });

  return (
    <CustomDialog
      maxWidth="lg"
      title={
        <Box display="flex" flexDirection="row" gap={2} alignItems="center">
          <Typography variant="h5">Yor Are Collecting Fees For Vishal</Typography>
          <Tooltip
            arrow
            placement="right"
            title="To collect the fee, please select the term. The pending fee will automatically appear in the due amount input under Fee-wise. Enter the received amount in the Received Amount input field."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </Tooltip>
        </Box>
      }
      open={dialogValue}
      handleClose={onClose}
    >
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
        <form onSubmit={formik.handleSubmit}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box flex={8} display="flex" flexDirection="row" gap={2} py="12px">
              <Typography>
                <strong>Name:</strong> Vishal RameshBhai Patel
              </Typography>
              <Typography>
                <strong>Standard:</strong> 10/B
              </Typography>
              <Typography>
                <strong>Gr Number:</strong> 89866
              </Typography>
              <Typography>
                <strong>Roll Number:</strong> 1
              </Typography>
            </Box>
            <Box flex={1}>
              <CustomSelect
                autoFocus
                multiple
                label="Select Term"
                options={[]}
                // @ts-ignore
                value={formik.values.selectedTerms}
                onChange={(selectedValues) => {
                  formik.setFieldValue('selectedTerms', selectedValues);
                }}
                size="small"
              />
            </Box>
          </Box>

          {/* Fee Type And Payment Mode Selection */}
          <Typography sx={{ my: 3 }} variant="h6">
            Tuition
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <NumericFormatCustom
                label="Due Amount"
                value=""
                onChange={(e) => {
                  formik.setFieldValue('dueAmount', e);
                }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <NumericFormatCustom
                label="Received Amount"
                value=""
                onChange={(e) => {
                  formik.setFieldValue('dueAmount', e);
                }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomSelect
                multiple
                label="Payment Mode"
                options={[
                  { value: 'Cash', label: 'Cash' },
                  // { value: 'Card', label: 'Card' },
                  { value: 'Online', label: 'Online' },
                  // { value: 'Cheque', label: 'Cheque' },
                ]}
                // @ts-ignore
                value={formik.values.paymentMode}
                onChange={(selectedValues) => formik.setFieldValue('paymentMode', selectedValues)}
                formControlProps={{ sx: { width: '100%' } }}
              />
            </Grid>
          </Grid>
        </form>
      </Scrollbar>
    </CustomDialog>
  );
};

export default FeeCollectionMonthWise;
