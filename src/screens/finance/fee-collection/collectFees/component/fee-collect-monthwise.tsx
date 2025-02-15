import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Typography } from '@mui/material';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
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
    onSubmit: (values) => {
      console.log('Final Submission:', values);
    },
  });

  const monthSet: any = new Set();

  students.fees.forEach((fee: any) => {
    fee.paymentDueDateList.forEach((payment: any) => {
      const monthName = payment.month;

      if (payment.status === 'Unpaid') {
        monthSet.add(monthName);
      }
    });
  });

  const uniqueMonths = [...monthSet].map((month) => ({
    value: month,
    label: month,
  }));

  // const [feeHeadList, setFeHeadList] = useState<any>([]);

  // useEffect(() => {
  //     const newFeeHeadList: any[] = [];

  //     if (students.fees && students.fees.length > 0) {
  //         students.fees.forEach((fee: any) => {

  //             formik.values.selectedTerms.forEach((month: any) => {
  //                 // Check if the fee has any unpaid payments for the selected month

  //                 const unpaidPayments = fee.paymentDueDateList?.filter(
  //                     (payment: PaymentDueDate) =>

  //                         payment.month === month && payment.status === "Unpaid"
  //                 );

  //                 console.log("unpaidPayments: ", unpaidPayments)
  //                 console.log("unpaidPayments: ", unpaidPayments)

  //                 if (unpaidPayments && unpaidPayments.length > 0) {
  //                     // If unpaid payments exist for the month, add them to the list
  //                     unpaidPayments.forEach((payment: any) => {
  //                         newFeeHeadList.push({
  //                             month: payment.month,
  //                             feeHead: fee.feeHead,
  //                             feeHeadId: fee.feeHeadId,
  //                             paymentMode: fee.acceptedpaymentMethod,
  //                             amount: payment.amount,
  //                             status: payment.status,
  //                             paymentDueDate: payment.date,
  //                             paymentHistory: payment.paymentHistory,
  //                         });
  //                     });
  //                 } else {
  //                     // If no unpaid payment exists for the month, mark it as unpaid with amount 0
  //                     newFeeHeadList.push({
  //                         month: "",
  //                         feeHead: fee.feeHead,
  //                         feeHeadId: fee.feeHeadId,
  //                         paymentMode: fee.acceptedpaymentMethod,
  //                         amount: 0, // No due date, so set amount to 0
  //                         status: "Unpaid", // Mark as Unpaid for this month
  //                         paymentDueDate: month, // Use the selected month
  //                         paymentHistory: [], // No payment history
  //                     });
  //                 }
  //             });
  //         });
  //     }

  //     // Update the state with the new list of unpaid fees
  //     setFeHeadList(newFeeHeadList);

  // }, [formik.values.selectedTerms, students.fees]);

  return (
    <CustomDialog maxWidth="lg" title="Fee Collection" open={dialogValue} handleClose={onClose}>
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
                multiple
                label="Select Term"
                options={uniqueMonths}
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
