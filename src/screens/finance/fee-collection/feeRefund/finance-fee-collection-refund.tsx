import React, { useState, useEffect } from 'react';

import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';

import FeeRefundDialog from './component/fee-refund-dialog';
import FormattedAmountInput from '../../common/input-for-finance';

const FinanceFeeCollectionRefundTab = () => {
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
      studentName: 'JAY',
      paymentId: 'j878d',
      feeHead: 'Tuition',
      paidAmount: '10000',
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
      studentName: 'JAY',
      paymentId: 'j878d',
      feeHead: 'Library',
      paidAmount: '4000',
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
    refundAmount: totalRefundAmount,

    paidDate: '',
    status: '',
  };

  const handleSave = () => { };

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
    <>
      <Box display="flex" flexDirection="row" gap={2}>
        {/* <Box py="15px" display="flex" flexDirection="row" gap={3}>
          <CustomSelect
            label="Class/Grade"
            options={[]}
            value=""
            onChange={() => { }}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <CustomSelect
            label="Division"
            options={[]}
            value=""
            onChange={() => { }}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <TextField
            label="Search by student name"
            variant="outlined"
            size="small"
            fullWidth
            value=""
            onChange={(e) => { }}
          />
        </Box> */}
      </Box>
      <CustomizableTable
        isFilter={false}
        isShowedDense={false}
        isPagination={false}
        isScrollbar={false}
        isSearch={false}

        columns={[
          { id: 'studentName', label: 'Student Name' },
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
              return <Typography fontSize="12px">{formatNumber(row.paidAmount, 'INR')}</Typography>;
            },
          },

          {
            id: 'refundAmount',
            label: 'Refund Amount',
            render: (value: any, row: any) => {
              if (row.feeHead === 'Tuition') {
                return (
                  <FormattedAmountInput
                    label="Tuition Refund"
                    value={tuitionFeeRefundAmount}
                    onChange={handleChangeForTuition}
                  />
                );
              }
              if (row.feeHead === 'Library') {
                return (
                  // <CurrencyInput
                  //   value={libraryFeeRefundAmount}
                  //   currencyCode="INR"
                  //   onChange={(formattedValue, numericValue) => {
                  //     console.log('Formatted Value:', formattedValue);
                  //     console.log('Numeric Value:', numericValue);
                  //     setlibraryFeeRefundAmount(formattedValue);
                  //   }}
                  //   label="Enter Amount"
                  // />
                  <FormattedAmountInput
                    label="Library Refund"
                    value={libraryFeeRefundAmount}
                    onChange={handleChangeForLibrary}
                  />
                );
              }
              return (
                <FormattedAmountInput
                  label="Total Refund"
                  value={formatNumber(totalFeeRefundAmount.toString())}
                  onChange={() => { }}


                />
              );

            }
          },

          // { id: 'paidDate', label: 'Paid Date' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return value !== '' ? (
                <Label
                  variant="soft"
                  color={
                    value === 'Overdue'
                      ? 'error'
                      : value === 'Unpaid'
                        ? 'warning'
                        : value === 'Paid'
                          ? 'success'
                          : 'default'
                  }
                >
                  {value}
                </Label>
              ) : (
                <Box />
              );
            },
          },
          // {
          //     id: 'action',
          //     label: 'Action',
          //     render: (datax:any) => (
          //         <ThreeDotsActions
          //             actions={() => (
          //                 <MenuList>
          //                     <MenuItem onClick={() => { /* View Receipt action */ }}>
          //                         <Iconify icon="mdi:check" />
          //                         View Receipt
          //                     </MenuItem>
          //                     <MenuItem onClick={() => { /* Send Reminder action */ }}>
          //                         <Iconify icon="mdi:check" />
          //                         Send Reminder
          //                     </MenuItem>
          //                 </MenuList>
          //             )}
          //         />
          //     ),
          // },
        ]}
        data={[...paymentHistoryData, totalRow]}
      />
      <Box display="flex" justifyContent="flex-end" py={2}>
        <Button
          onClick={() => {
            handleDilog();
          }}
          variant="contained"
          size="small"
        >
          Proceed For Refund
        </Button>
      </Box>
      <Typography variant="h6" sx={{ ml: 2 }}>
        Refund History
      </Typography>
      <CustomizableTable
        columns={[
          { id: 'className', label: 'Class Name' },
          { id: 'grNo', label: 'GrNo' },
          { id: 'receiptNo', label: 'Receipt No' },
          { id: 'refundDate', label: 'Refund Date' },
          { id: 'amount', label: 'Amount' },
          { id: 'modeOfPayment', label: 'Mode Of Payment' },
          { id: 'transactionId', label: 'Transaction Id' },
          { id: 'receiptBook', label: 'Receipt Book' },
        ]}
        data={historyData}
      />

      <Box>
        {dialog.value && selectedEntry && (
          <FeeRefundDialog
            onSave={handleSave}
            dialogValue={dialog.value}
            onClose={closeDialog}
            data={selectedEntry}
            isEdit={isEdit}
            allData={paymentHistoryData}
            total={totalRefundAmount}
            tuitionFeeAmount={tuitionFeeRefundAmount}
            libraryFeeFeeAmount={libraryFeeRefundAmount}
            totalFeeAmount={totalFeeRefundAmount}
          />
        )}
      </Box>
    </>
  );
};

export default FinanceFeeCollectionRefundTab;
