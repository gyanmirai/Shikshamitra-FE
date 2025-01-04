import React, { useState, useEffect } from 'react';

import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';

interface FinanceStudentAdditionalDiscountDialogProps {
  dialogValue: boolean;
  selectedData: any;
  onClose: () => void;
}

const FinanceStudentAdditionalDiscountDialog: React.FC<
  FinanceStudentAdditionalDiscountDialogProps
> = ({ dialogValue, selectedData, onClose }) => {
  const data = [
    {
      grNumber: '28877',
      studentName: 'JAY',
      paymentId: 'j878d',
      feeHead: 'Tuition',
      paidAmount: '10000',
      payableFee: '10000',
      generalDiscount: '0',
      refundAmount: '0',
      paidDate: '20-04-2024',
      status: 'Paid',
      totalFees: 60000,
      charges: 0,
      fees: [
        {
          feeHeadId: 198,
          feeHead: 'Tuition',
          totalFees: 60000,
          amount: 5000,
          paymentDates: [
            {
              month: 'June-2024',
              date: '15-01-2024',
              status: 'Unpaid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Card',
                  amount: '2000',
                  paymentId: '54j8',
                  paymentStatus: 'Success',
                },
                { paymentMode: 'Cash', amount: '2000' },
                {
                  paymentMode: 'Online',
                  amount: '1000',
                  paymentId: 'h8749',
                  paymentStatus: 'Failed',
                },
                {
                  paymentMode: 'Online',
                  amount: '500',
                  paymentId: 'h8749',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Check',
                  amount: '500',
                  paymentId: 'h8749',
                  paymentStatus: 'Not Clear',
                  charges: 500,
                },
              ],
            },
            {
              month: 'July-2024',
              date: '15-02-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Bank Transfer',
                  amount: '3000',
                  paymentId: 'jh238',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Card',
                  amount: '2000',
                  paymentId: 'aa123',
                  paymentStatus: 'Success',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      grNumber: '28877',
      studentName: 'JAY',
      paymentId: 'j878d',
      feeHead: 'Library',
      paidAmount: '4000',
      refundAmount: '0',
      payableFee: '4000',
      generalDiscount: '0',
      paidDate: '20-04-2024',
      status: 'Paid',
      totalFees: 60000,
      charges: 0,
      fees: [
        {
          feeHeadId: 198,
          feeHead: 'Tuition',
          totalFees: 60000,
          amount: 5000,
          paymentDates: [
            {
              month: 'July-2024',
              date: '15-02-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Bank Transfer',
                  amount: '3000',
                  paymentId: 'jh238',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Card',
                  amount: '2000',
                  paymentId: 'aa123',
                  paymentStatus: 'Success',
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const dialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState(data);
  const [isEdit, setIsEdit] = useState(false);
  // const [tableData, setTableData] = useState(data);
  const [paymentHistoryData, setPaymentHistoryData] = useState(data);

  const handleRefundChange = (index: any, value: any) => {
    const newData = [...paymentHistoryData];
    const existingIndex = newData.findIndex((val) => val.paymentId === index);
    newData[existingIndex].refundAmount = value;
    setPaymentHistoryData(newData);
  };

  const totalRefundAmount: number = paymentHistoryData.reduce(
    (total: any, item: any) => total + Number(item.refundAmount),
    0
  );

  const totalRow = {
    paymentId: '',
    feeHead: '',
    paidAmount: 'Total',
    generalDiscount: '',
    payableFee: '14000',
    refundAmount: totalRefundAmount,

    paidDate: '',
    status: '',
  };

  const handleSave = () => {};

  const closeDialog = () => {
    dialog.onFalse();
  };

  const handleDilog = () => {
    setIsEdit(true);
    setSelectedEntry(paymentHistoryData);

    dialog.onTrue();
  };

  const [tuitionFeeRefundAmount, setTuitionFeeRefundAmount] = useState('');
  const [libraryFeeRefundAmount, setlibraryFeeRefundAmount] = useState('');
  const [totalFeeRefundAmount, setTotalFeeRefundAmount] = useState(0);

  const parseNumericValue = (formattedValue: string) =>
    parseFloat(formattedValue.replace(/,/g, '')) || 0;

  useEffect(() => {
    const a = parseNumericValue(tuitionFeeRefundAmount);
    const b = parseNumericValue(libraryFeeRefundAmount);
    setTotalFeeRefundAmount(a + b);
  }, [tuitionFeeRefundAmount, libraryFeeRefundAmount]);

  const handleChangeForTuition = (formattedValue: string, numericValue: number) => {
    setTuitionFeeRefundAmount(formattedValue);
  };

  const handleChangeForLibrary = (formattedValue: string, numericValue: number) => {
    setlibraryFeeRefundAmount(formattedValue);
  };

  return (
    <CustomDialog
      maxWidth="xl"
      title="Additional Discount"
      open={dialogValue}
      handleClose={onClose}
    >
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
        <Box display="flex" flexDirection="row" gap={2} py="12px">
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

        <CustomizableTable
          isFilter={false}
          isShowedDense={false}
          isPagination={false}
          isScrollbar={false}
          isSearch={false}
          columns={[
            // { id: 'grNumber', label: 'Gr Number' },
            // { id: 'studentName', label: 'Student Name' },
            { id: 'feeHead', label: 'Fee Head' },
            {
              id: 'paidAmount',
              label: 'Gross Fee',
              render(value, row) {
                if (row.paidAmount === 'Total') {
                  return (
                    <Typography fontSize="12px" fontWeight="bold">
                      Total
                    </Typography>
                  );
                }
                return (
                  <Typography fontSize="12px">{formatNumber(row.paidAmount, 'INR')}</Typography>
                );
              },
            },
            {
              id: 'generalDiscount',
              label: 'General Discount',
              render(value, row) {
                return (
                  <Typography fontSize="12px">
                    {formatNumber(row.generalDiscount, 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'payableFee',
              label: 'Payable Fee',
              render(value, row) {
                return (
                  <Typography fontSize="12px">{formatNumber(row.payableFee, 'INR')}</Typography>
                );
              },
            },

            {
              id: 'refundAmount',
              label: 'Discount Amount',
              render: (value: any, row: any) => {
                if (row.feeHead === 'Tuition') {
                  return (
                    <NumericFormatCustom
                      size="small"
                      label="Tuition Discount"
                      name="tuitionDiscount"
                      value=""
                      onChange={() => {}}
                      // error={formik.touched.fromSalary && Boolean(formik.errors.fromSalary)}
                      // helperText={formik.touched.fromSalary && formik.errors.fromSalary}
                    />
                  );
                }
                if (row.feeHead === 'Library') {
                  return (
                    <NumericFormatCustom
                      size="small"
                      label="Library Discount"
                      name="libraryDiscount"
                      value=""
                      onChange={() => {}}
                      // error={formik.touched.fromSalary && Boolean(formik.errors.fromSalary)}
                      // helperText={formik.touched.fromSalary && formik.errors.fromSalary}
                    />
                  );
                }
                return (
                  <Box pt="20px" pb="20px">
                    <NumericFormatCustom
                      size="small"
                      label="Total Discount"
                      name="totalDiscount"
                      value={totalFeeRefundAmount.toString()}
                      onChange={() => {}}
                      // error={formik.touched.fromSalary && Boolean(formik.errors.fromSalary)}
                      // helperText={formik.touched.fromSalary && formik.errors.fromSalary}
                    />
                    {/* <FormattedAmountInput
                      label="Total Discount"
                      value={formatNumber(totalFeeRefundAmount.toString())}
                      onChange={() => { }}
                    /> */}
                  </Box>
                );
              },
            },

            {
              id: 'remark',
              label: 'Remark',
              render: (value: any, row: any) => {
                if (row.feeHead === 'Tuition') {
                  return (
                    <TextField
                      size="small"
                      label="Discount Remark"
                      value=""
                      onChange={(e) => {}}
                      sx={{ width: '100%' }}
                    />
                  );
                }
                if (row.feeHead === 'Library') {
                  return (
                    <TextField
                      size="small"
                      label="Discount Remark"
                      value=""
                      onChange={(e) => {}}
                      sx={{ width: '100%' }}
                    />
                  );
                }
                return <Box />;
              },
            },
          ]}
          data={[...paymentHistoryData, totalRow]}
        />
      </Scrollbar>
      <DialogActions>
        <Button type="submit" variant="contained" size="small">
          Save
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default FinanceStudentAdditionalDiscountDialog;
