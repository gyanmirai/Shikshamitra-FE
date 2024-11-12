import React, { useState } from 'react';

import { Box, Button, MenuItem, MenuList, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FeeRefundDialog from './component/fee-refund-dialog';


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
      paymentId: 'jack7765',
      feeHead: 'Tuition',
      paidAmount: '1000',
      refundAmount: 0,

      paidDate: '20-04-2024',
      status: 'Paid',
    },
    {
      paymentId: 'jack875340',
      feeHead: 'Transportation',
      paidAmount: '80000',
      refundAmount: 0,

      paidDate: '15-05-2024',
      status: 'Paid',
    },
    {
      paymentId: 'jack98765',
      feeHead: 'Sports',
      paidAmount: '60000',
      refundAmount: 0,
      paidDate: '30-04-2024',
      status: 'Paid',
    },
    {
      paymentId: 'jack7785',
      feeHead: 'Activity',
      paidAmount: '30000',
      refundAmount: 0,
      paidDate: '10-06-2024',
      status: 'Paid',
    },
  ];


  const dataForRefund = [
    { 
     studentId:123,
     name: "John Doe",
     grade: 10,
     paymentTerm: "Monthly",
     totalPending:38000,
     totalPaid:40000,
     discountAmount:0,
     fixedReduction:0,
     overAllDueDate:"20-04-2025",
     totalFees:78000,
     totalDueAfterDiscount:0,
     fees: [
       {
         feeHeadId:198,
         feeHead: "Tuition",
         totalFees:60000,
         amount: 5000,
         paymentDates: [
           { month:"June-2024",  date: "15-01-2024", status: "Paid", amount:5000 },
           {month:"July-2024" ,  date: "15-02-2024", status: "Paid", amount:5000 },
           { month:"Aug-2024",   date: "15-03-2024", status: "Paid", amount:5000 },
           { month:"Sep-2024",   date: "15-03-2024", status: "Paid", amount:5000 },
           { month:"Oct-2024",   date: "15-03-2024", status: "Paid", amount:5000 },
           { month:"Nov-2024",   date: "15-03-2024", status: "Paid", amount:5000 },
           { month:"Dec-2024",   date: "15-03-2024", status: "Paid", amount:5000 },
           { month:"Jan-2025",   date: "15-03-2024", status: "Paid", amount:5000 },
           { month:"Feb-2025",   date: "15-03-2024", status: "Unpaid" , amount:5000},
           { month:"April-2025", date: "15-03-2024", status: "Unpaid" , amount:5000},
           { month:"May-2025",   date: "15-03-2024", status: "Unpaid", amount:5000 },
         ],
       },
       {
         feeHeadId:230,
         feeHead: "Library",
         totalFees:18000,
         amount: 1500,
         paymentDates: [
           { month:"June-2024",date: "15-01-2024", status: "Paid", amount:1500 },
           {month:"July-2024" ,date: "15-02-2024", status: "Paid",amount:1500 },
           { month:"Aug-2024",date: "15-03-2024", status: "Paid",amount:1500 },
           { month:"Sep-2024",date: "15-03-2024", status: "Paid",amount:1500 },
           { month:"Oct-2024",date: "15-03-2024", status: "Paid",amount:1500 },
           { month:"Nov-2024",date: "15-03-2024", status: "Paid",amount:1500 },
           { month:"Dec-2024",date: "15-03-2024", status: "Paid",amount:1500 },
           { month:"Jan-2025",date: "15-03-2024", status: "Paid",amount:1500 },
           { month:"Feb-2025",date: "15-03-2024", status: "Unpaid",amount:1500 },
           { month:"April-2025",date: "15-03-2024", status: "Unpaid", amount:1500 },
           { month:"May-2025",date: "15-03-2024", status: "Unpaid" , amount:1500},
         ],
       },
      
     ],}
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

  const handleSave = () => {};

  const closeDialog = () => {
    dialog.onFalse();
  };

  const handleDilog = () => {
    setIsEdit(true);
    setSelectedEntry(paymentHistoryData);

    dialog.onTrue();
  };


  return (
    <>
    <CustomizableTable
      columns={[
        { id: 'paymentId', label: 'Payment Id' },
        { id: 'date', label: 'Date' },
        { id: 'feeHead', label: 'Fee Head' },
        {
          id: 'amount', label: 'Amount', render(value, row) {
            return <Typography sx={{ fontSize: '12px' }}>{formatNumber(Number(row.amount), "INR")}</Typography>;
          },
        },
        { id: 'dueDate', label: 'Due Date' },

        {
          id: 'status',
          label: 'Status',
          render(value, row) {
            return (
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
            );
          },
        },
        {
          id: 'action',
          label: 'Action',
          render: (row, popover) => (
            <ThreeDotsActions
              actions={() => (
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                    }}
                  >
                    <Iconify icon="mdi:eye" />
                   Fee Refund
                  </MenuItem>
                  {/* <MenuItem
                    onClick={() => {
                      // popover.onClose();
                    }}
                  >
                    <Iconify icon="mdi:check" />
                    Mark as Check
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      // popover.onClose();
                    }}
                  >
                    <Iconify icon="mdi:pen" />
                    Edit
                  </MenuItem> */}
                </MenuList>
              )}
            />
          ),
        },
      ]}
      data={paymentHistoryData}
    />
      <Box display="flex" flexDirection="row" gap={2}>
        <Box py="15px" display="flex" flexDirection="row" gap={3}>
          <CustomSelect
            label="Class/Grade"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <CustomSelect
            label="Division"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <TextField
            label="Search by student name"
            variant="outlined"
            size="small"
            fullWidth
            value=""
            onChange={(e) => {}}
          />
        </Box>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'paymentId', label: 'Payment Id' },
          { id: 'feeHead', label: 'Fee Head' },
          { id: 'paidAmount', label: 'Paid Amount' },
          {
            id: 'refundAmount',
            label: 'Refund Amount',
            render: (value: any, row: any) => (
              <TextField
                disabled={row.paidAmount === 'Total'}
                type="number"
                variant="outlined"
                size="small"
                value={row.refundAmount || ''}
                onChange={(e) => handleRefundChange(row.paymentId, e.target.value)}
              />
            ),
          },

          { id: 'paidDate', label: 'Paid Date' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
            return (
              value !== "" ?   <Label
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
                </Label> : <Box/>
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
          Next
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
          />
        )}
      </Box>
    </>
  );
};

export default FinanceFeeCollectionRefundTab;
