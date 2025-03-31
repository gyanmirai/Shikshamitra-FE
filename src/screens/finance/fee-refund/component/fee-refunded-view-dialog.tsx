import React, { useState, useEffect } from 'react';

import { Box, Tooltip, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { Iconify } from 'src/components/iconify/iconify';
import CustomizableTable from 'src/components/customizabaleTable';

interface FinanceFeeRefundedViewDialogProps {
  dialogValue: boolean;
  selectedData: any;
  onClose: () => void;
}

const FinanceFeeRefundedViewDialog: React.FC<FinanceFeeRefundedViewDialogProps> = ({
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
    <CustomDialog
      maxWidth="xl"
      title={
        <Box display="flex" flexDirection="row" gap={2} alignItems="center">
          <Typography variant="h5">Fee Refund</Typography>
          <Tooltip
            arrow
            placement="right"
            title="The Fee Refund Details dialog displays all refund-related information for the student, including the refund mode, approved refund amount, requested date, and more."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </Tooltip>
        </Box>
      }
      open={dialogValue}
      handleClose={onClose}
    >
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
        <Box display="flex" gap={3} alignItems="center">
          <Typography fontSize="14px">
            <strong>Name:</strong> John Doe
          </Typography>
          <Typography fontSize="14px">
            <strong>Roll No:</strong> 1234
          </Typography>
          <Typography fontSize="14px">
            <strong>Class:</strong> 10th
          </Typography>
          <Typography fontSize="14px">
            <strong>GR No:</strong> 5678
          </Typography>
          <Typography fontSize="14px">
            <strong>Division:</strong> A
          </Typography>
        </Box>
        <CustomizableTable
          tableId="fee-refund-table"
          isFilter={false}
          isShowedDense={false}
          isPagination={false}
          isSearch={false}
          columns={[
            { id: 'feeHead', label: 'Fee Head' },
            {
              id: 'paidAmount',
              label: 'Paid Amount',
              render(value, row) {
                if (row.paidAmount === 'Total') {
                  return (
                    <Typography fontSize="12px" fontWeight="bold" minWidth="120px">
                      Total Refund
                    </Typography>
                  );
                }
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    {formatNumber(row.paidAmount, 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'askForRefund',
              label: 'Ask For Refund',
              render(value, row) {
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    {formatNumber(value, 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'refundAmount',
              label: 'Approved Refund Amount',
              render: (value, row) => (
                <Typography fontSize="12px" minWidth="150px">
                  {formatNumber(row.paidAmount, 'INR')}
                </Typography>
              ),
            },
            {
              id: 'refundAmount',
              label: 'Refunded Amount',
              render: (value, row) => (
                <Typography fontSize="12px" minWidth="150px">
                  {formatNumber(row.paidAmount, 'INR')}
                </Typography>
              ),
            },
            {
              id: 'requestedOn',
              label: 'Requested On',
              render(value, row) {
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    08-09-2024
                  </Typography>
                );
              },
            },
            {
              id: 'approvedDate',
              label: 'Approved Date',
              render(value, row) {
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    09-10-2024
                  </Typography>
                );
              },
            },
            {
              id: 'refundedDate',
              label: 'Refunded Date',
              render(value, row) {
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    10-11-2024
                  </Typography>
                );
              },
            },
            {
              id: 'refundedMode',
              label: 'Refunded Mode',
              render(value, row) {
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    Cash
                  </Typography>
                );
              },
            },
            {
              id: 'receiptNo',
              label: 'Receipt No',
              render(value, row) {
                return (
                  <Typography fontSize="12px" minWidth="120px">
                    8hsuqhs
                  </Typography>
                );
              },
            },
            {
              id: 'transactionId',
              label: 'Transaction Id',
              render(value, row) {
                return (
                  <Typography fontSize="12px" minWidth="150px">
                    -
                  </Typography>
                );
              },
            },
          ]}
          data={paymentHistoryData}
        />
      </Scrollbar>
    </CustomDialog>
  );
};

export default FinanceFeeRefundedViewDialog;
