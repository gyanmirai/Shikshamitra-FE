import { useFormik } from 'formik';
import React, { useState } from 'react';
import Add from '@mui/icons-material/Add';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import {
  Box,
  Grid,
  Button,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

const students = [
  {
    studentId: 123,
    name: 'Vishal Rameshbhai Patel',
    grade: 10,
    feestructureId: 'hkjl987',
    paymentTerm: 'Monthly',
    totalPending: 38000,
    totalPaid: 40000,
    discountAmount: 0,
    fixedReduction: 0,
    overAllDueDate: '20-04-2025',
    totalFees: 78000,
    totalDueAfterDiscount: 0,
    previousCharges: 500,
    chargesDetails: 'The payment of 500 made by cheque in June 2024 was bounced. Cheque No: H8749.',
    fees: [
      {
        feeHeadId: 'Tuition',
        feeHead: 'Tuition',
        grossFees: 18000,
        payableFee: 5000,
        generalDiscount: 0,
        acceptedpaymentMethod: ['cash', 'online'],
        lateFeeChargesType: 'fixed',
        lateFeeChargesAmount: '1000',
        isActive: true,
        status: 'Unpaid', // Partially Paid, Unpaid, Paid
        paymentDueDate: '20-04-2024',

        paymentDueDateList: [
          {
            month: 'June-2024',
            date: '15-01-2024',
            status: 'Unpaid',
            amount: 1500,
            paymentHistory: [
              { paymentMode: 'Card', amount: '500', paymentId: 'JUN123', paymentStatus: 'Success' },
              { paymentMode: 'Cash', amount: '1000', paymentStatus: 'Success' },
            ],
          },
          {
            month: 'July-2024',
            date: '15-02-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Online',
                amount: '1500',
                paymentId: 'JUL456',
                paymentStatus: 'Success',
              },
            ],
          },
          {
            month: 'Aug-2024',
            date: '15-03-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Bank Transfer',
                amount: '1000',
                paymentId: 'AUG789',
                paymentStatus: 'Success',
              },
              { paymentMode: 'Cash', amount: '500', paymentStatus: 'Success' },
            ],
          },
          {
            month: 'Sep-2024',
            date: '15-03-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Check',
                amount: '1500',
                paymentId: 'SEP101',
                paymentStatus: 'Cleared',
              },
            ],
          },
          {
            month: 'Oct-2024',
            date: '15-03-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              { paymentMode: 'Card', amount: '750', paymentId: 'OCT202', paymentStatus: 'Success' },
              {
                paymentMode: 'Online',
                amount: '750',
                paymentId: 'OCT203',
                paymentStatus: 'Success',
              },
            ],
          },
          {
            month: 'Nov-2024',
            date: '15-03-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [{ paymentMode: 'Cash', amount: '1500', paymentStatus: 'Success' }],
          },
          {
            month: 'Dec-2024',
            date: '15-03-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Online',
                amount: '1500',
                paymentId: 'DEC404',
                paymentStatus: 'Success',
              },
            ],
          },
          {
            month: 'Jan-2025',
            date: '15-03-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Bank Transfer',
                amount: '1500',
                paymentId: 'JAN505',
                paymentStatus: 'Success',
              },
            ],
          },
          {
            month: 'Feb-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Online',
                amount: '500',
                paymentId: 'FEB606',
                paymentStatus: 'Failed',
              },
              { paymentMode: 'Cash', amount: '1000', paymentStatus: 'Pending' },
            ],
          },
          {
            month: 'April-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Check',
                amount: '1500',
                paymentId: 'APR707',
                paymentStatus: 'Not Cleared',
              },
            ],
          },
          {
            month: 'May-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            amount: 1500,
            paymentHistory: [],
          },
        ],
      },
      {
        feeHeadId: 'Admission',
        feeHead: 'Admission',
        grossFee: 1000,
        payableFee: 1000,
        generalDiscount: 0,
        acceptedpaymentMethod: ['cash'],
        lateFeeChargesType: 'fixed',
        lateFeeChargesAmount: '1000',
        isActive: true,
        status: 'Unpaid', // Partially Paid, Unpaid, Paid
        paymentDueDate: '20-04-2024',
        paymentDueDateList: [
          {
            month: 'June-2024',
            date: '20-04-2024',
            status: 'Unpaid',
            amount: 1000,
            paymentHistory: [],
          },
        ],
      },
    ],
  },
];

interface FeeNewCollectionFormProps {
  onClose: () => void;
  dialogValue: boolean;
  data: any;
  isFromStudentAdmissionFlow: boolean;
}
const FeeNewCollectionForm: React.FC<FeeNewCollectionFormProps> = ({
  onClose,
  dialogValue,
  data,
  isFromStudentAdmissionFlow,
}) => {
  const formik = useFormik({
    initialValues: {
      feeType: '',
      selectedTerms: [],
      paymentMode: [],
    },
    onSubmit: (values) => {
      console.log('Final Submission:', values);
    },
  });
  const [selectedFees, setSelectedFees] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(students[0]);

  // Extract fee types dynamically from selected student
  const feeOptions = isFromStudentAdmissionFlow
    ? selectedStudent.fees
        .filter((fee: any) => fee.feeHeadId === 'Admission' && fee.status === 'Unpaid')
        .map((fee: any) => ({
          value: fee.feeHeadId,
          label: fee.feeHead,
        }))
    : selectedStudent.fees
        .filter((fee: any) => fee.status === 'Unpaid')
        .map((fee: any) => ({
          value: fee.feeHeadId,
          label: fee.feeHead,
        }));

  // Extract pending terms dynamically from unpaid fees
  const termOptions = formik.values.feeType
    ? selectedStudent.fees
        .filter((fee: any) => fee.feeHeadId === formik.values.feeType) // Filter for selected fee type
        .flatMap((fee: any) =>
          fee.paymentDueDateList
            .filter((due: any) => due.status === 'Unpaid')
            .map((due: any) => ({
              value: due.month,
              label: `${due.month} - ₹${due.amount}`,
              amount: due.amount,
            }))
        )
    : [];

  // Handle Add Fee to Accordion
  const handleAddFee = () => {
    if (
      !formik.values.feeType ||
      formik.values.selectedTerms.length === 0 ||
      formik.values.paymentMode.length === 0
    ) {
      alert('Please select Fee Type, Terms, and Payment Mode');
      return;
    }

    const totalAmountDue = formik.values.selectedTerms.reduce((acc, term) => {
      const termData = termOptions.find((t: any) => t.value === term);
      return acc + (termData ? termData.amount : 0);
    }, 0);

    const newFee = {
      feeType: formik.values.feeType,
      pendingTerm: formik.values.selectedTerms,
      paymentMode: formik.values.paymentMode,
      totalAmountDue,
      amounts: formik.values.paymentMode.reduce((acc: any, mode: string) => {
        acc[mode] = { due: totalAmountDue, received: '' };
        return acc;
      }, {}),
    };

    setSelectedFees([...selectedFees, newFee]);
  };

  // Handle Deleting a Fee Entry
  const handleDeleteFee = (index: number) => {
    const updatedFees = selectedFees.filter((_, i) => i !== index);
    setSelectedFees(updatedFees);
  };

  return (
    <CustomDialog maxWidth="lg" title="Fee Collection" open={dialogValue} handleClose={onClose}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
        <form onSubmit={formik.handleSubmit}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" flexDirection="row" gap={2} py="12px">
              <Typography>
                <strong>Name:</strong> {selectedStudent.name}
              </Typography>
              <Typography>
                <strong>Grade:</strong> {selectedStudent.grade}
              </Typography>
            </Box>
            <Button
              startIcon={<Add />}
              variant="contained"
              size="small"
              onClick={handleAddFee}
              sx={{ mt: 2 }}
            >
              Add
            </Button>
          </Box>
          <Box p={0} bgcolor="background.neutral">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <CustomSelect
                  label="Fee Type"
                  options={feeOptions}
                  value={formik.values.feeType}
                  onChange={(selectedValue) => formik.setFieldValue('feeType', selectedValue)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <CustomSelect
                  multiple
                  label="Pending Terms"
                  options={termOptions}
                  value={formik.values.selectedTerms}
                  onChange={(selectedValues) =>
                    formik.setFieldValue('selectedTerms', selectedValues)
                  }
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <CustomSelect
                  multiple
                  label="Payment Mode"
                  options={
                    formik.values.feeType
                      ? selectedStudent.fees
                          .find((fee: any) => fee.feeHeadId === formik.values.feeType)
                          ?.AcceptedpaymentMethod.map((mode: string) => ({
                            value: mode,
                            label: mode,
                          })) || []
                      : []
                  }
                  value={formik.values.paymentMode}
                  onChange={(selectedValues) => formik.setFieldValue('paymentMode', selectedValues)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
            </Grid>

            {selectedFees.map((fee, index) => (
              <Accordion key={index} sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{fee.feeType}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    <strong>Selected Term(s):</strong> {fee.pendingTerm.join(', ')}
                  </Typography>
                  <Typography>
                    <strong>Total Amount Due:</strong> ₹{fee.totalAmountDue}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </form>
      </Scrollbar>
    </CustomDialog>
  );
};

export default FeeNewCollectionForm;
