import React, { useState, useEffect } from 'react';

import { Box, Button, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

import FeeRefundPaymentDialog from './fee-refund-payment-dialog';

interface FinanceFeeRefundAllocationDialogProps {
  dialogValue: boolean;
  selectedData: any;
  onClose: () => void;
}

const FinanceFeeRefundAllocationDialog: React.FC<FinanceFeeRefundAllocationDialogProps> = ({
  dialogValue,
  selectedData,
  onClose,
}) => {
  const historyData = [
    {
      className: '1A',
      grNo: '101',
      receiptNo: 'RCPT001',
      refundDate: '01-05-2024',
      amount: 1500,
      modeOfPayment: 'Cheque',
      transactionId: 'TXN12345',
      receiptBook: 'RB001',
    },
    {
      className: '2B',
      grNo: '102',
      receiptNo: 'RCPT002',
      refundDate: '15-05-2024',
      amount: 2000,
      modeOfPayment: 'Transaction',
      transactionId: 'TXN12346',
      receiptBook: 'RB002',
    },
  ];
  const data = [
    {
      grNumber: '28877',
      studentName: 'JAY',
      paymentId: 'j878d',
      feeHead: 'Tuition',
      paidAmount: '10000',
      refundAmount: '0',
      paidDate: '20-04-2024',
      status: 'Paid',
      totalFees: 60000,
      charges: 0,
      askForRefund: 2000,
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
      paidDate: '20-04-2024',
      status: 'Paid',
      totalFees: 60000,
      askForRefund: 2000,
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

  // const totalRow = {
  //   paymentId: '',
  //   feeHead: '',
  //   paidAmount: 'Total',
  //   refundAmount: totalRefundAmount,

  //   paidDate: '',
  //   status: '',
  // };

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
    <CustomDialog maxWidth="xl" title="Fee Refund" open={dialogValue} handleClose={onClose}>
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

            { id: 'feeHead', label: 'Fee Head' },
            {
              id: 'paidAmount',
              label: 'Paid Amount',
              render(value, row) {
                if (row.paidAmount === 'Total') {
                  return (
                    <Typography fontSize="12px" fontWeight="bold">
                      Total Refund
                    </Typography>
                  );
                }
                return (
                  <Typography fontSize="12px">{formatNumber(row.paidAmount, 'INR')}</Typography>
                );
              },
            },
            {
              id: 'askForRefund',
              label: 'Ask For Refund',
              render(value, row) {
                return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
              },
            },
            {
              id: 'refundAmount',
              label: 'Approved Refund Amount',
              render: (value: any, row: any) => {
                if (row.feeHead === 'Tuition') {
                  return (
                    <Typography fontSize="12px">{formatNumber(row.paidAmount, 'INR')}</Typography>
                  );
                }
                if (row.feeHead === 'Library') {
                  return (
                    <Typography fontSize="12px">{formatNumber(row.paidAmount, 'INR')}</Typography>
                  );
                }
                return (
                  <Typography fontSize="12px">{formatNumber(row.paidAmount, 'INR')}</Typography>
                );
              },
            },
          ]}
          // data={[...paymentHistoryData, totalRow]}
          data={paymentHistoryData}
        />

        <FeeRefundPaymentDialog
          onSave={handleSave}
          dialogValue
          onClose={closeDialog}
          data={selectedEntry}
          isEdit={isEdit}
          allData={paymentHistoryData}
          total={totalRefundAmount}
          tuitionFeeAmount={tuitionFeeRefundAmount}
          libraryFeeFeeAmount={libraryFeeRefundAmount}
          totalFeeAmount={totalFeeRefundAmount}
        />
      </Scrollbar>
      <DialogActions>
        <Button type="submit" variant="contained" size="small">
          View Receipt
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default FinanceFeeRefundAllocationDialog;
