import React, { useState, useEffect } from 'react';

import { Box, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceChequeBounceChargeCollectDialog from './component/finance-cheque-bounce-charge-collect';

const FinanceFeeCollectionCharges = () => {
  const chargesData = [
    {
      srNo: 1,
      grNumber: '674773',
      chequeNumber: '123456',
      chequeDate: '15-08-2024',
      bounceDate: '20-08-2024',
      reason: 'Insufficient Funds',
      amount: '₹5000',
      status: 'Pending',
      chargesAmount: '300',
      feeHead: 'Tuition',
      studentName: 'john Doe',
    },
    {
      srNo: 2,
      chequeNumber: '789012',
      chequeDate: '10-09-2024',
      bounceDate: '15-09-2024',
      reason: 'Account Closed',
      amount: '₹25000',
      status: 'Pending',
      chargesAmount: '300',
      feeHead: 'Tuition',
      studentName: 'john Doe',
      grNumber: '674773',
    },
    {
      srNo: 3,
      chequeNumber: '345678',
      chequeDate: '01-10-2024',
      bounceDate: '05-10-2024',
      reason: 'Signature Mismatch',
      amount: '₹12000',
      status: 'Paid',
      chargesAmount: '300',
      feeHead: 'Tuition',
      studentName: 'john Doe',
      grNumber: '674773',
    },
    {
      srNo: 4,
      chequeNumber: '901234',
      chequeDate: '25-11-2024',
      bounceDate: '28-11-2024',
      reason: 'Funds Not Cleared',
      amount: '₹8000',
      status: 'Paid',
      chargesAmount: '300',
      feeHead: 'Tuition',
      studentName: 'john Doe',
      grNumber: '674773',
    },
    {
      srNo: 5,
      chequeNumber: '567890',
      chequeDate: '10-12-2024',
      bounceDate: '15-12-2024',
      reason: 'Stale Cheque',
      amount: '₹15000',
      status: 'Paid',
      chargesAmount: '300',
      feeHead: 'Tuition',
      studentName: 'john Doe',
      grNumber: '674773',
    },
  ];
  const dialog = useBoolean();

  const [selectedEntry, setSelectedEntry] = useState<any>();

  const closeDialog = () => {
    dialog.onFalse();
  };

  const handleSave = () => { };

  useEffect(() => { }, [selectedEntry]);
  return (
    <>
      <Box>{/* <Typography variant="h6" gutterBottom >Charges </Typography> */}</Box>
      <CustomizableTable
        columns={[
          //  {id:"srNo", label:"SR No"},
          { id: 'grNumber', label: 'Gr No' },
          { id: 'chequeNumber', label: 'Cheque Number' },
          { id: 'chequeDate', label: 'Cheque Date' },
          { id: 'bounceDate', label: 'Bounce Date' },
          { id: 'reason', label: 'Reason' },
          {
            id: 'amount',
            label: 'Fee Amount',
            render(value, row) {
              return <Typography fontSize="12px">{row.amount}</Typography>;
            },
          },
          {
            id: 'chargesAmount',
            label: 'Charges Amount',
            render(value, row) {
              return <Typography fontSize="12px">{row.chargesAmount}</Typography>;
            },
          },
          // { id: 'studentName', label: 'Student Name' },
          { id: 'feeHead', label: 'Fee Head' },
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
                      : value === 'Pending'
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
          //   id: 'action',
          //   label: 'Action',
          //   render(value, row: any) {
          //     return (
          //       <ThreeDotsActions
          //         actions={({ popover }: any) => (
          //           <MenuList>
          //             {row.status === 'Pending' && (
          //               <MenuItem
          //                 onClick={() => {
          //                   // setIsClearCheck(false)
          //                   setSelectedEntry(row);

          //                   dialog.onTrue();
          //                 }}
          //               >
          //                 <Iconify icon="fluent:check-24-regular" />
          //                 Collect Charges
          //               </MenuItem>
          //             )}
          //             {row.status === 'Paid' && (
          //               <MenuItem
          //                 onClick={() => {
          //                   // setIsClearCheck(true)
          //                   // setSelectedEntry(row);
          //                   // dialog.onTrue();
          //                 }}
          //               >
          //                 <Iconify icon="circum:receipt" />
          //                 Generate Receipt
          //               </MenuItem>
          //             )}
          //           </MenuList>
          //         )}
          //       />
          //     );
          //   },
          // },
        ]}
        data={chargesData}
      />

      {dialog.value && (
        <FinanceChequeBounceChargeCollectDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
        />
      )}
    </>
  );
};

export default FinanceFeeCollectionCharges;
