import React, { useState } from 'react';

import { MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceStudentPaymentHistoryDialog from './finance-student-payment-history-dialog';

const paymentHistoryData = [
  {
    paymentId: 'john233',
    date: '12-06-2024',
    dueDate: '15 June',
    amountPaid: 25000,
    amountPending: 5000,
    status: 'Paid',
    paymentHistory: [
      {
        paymentMode: 'Cash',
        amount: '20000',
        paymentId: '54j8',
        paymentStatus: 'Success',
        isRefunded: false,
        refundAmount: '',
        refundDate: '',
        refundReason: '',
        feeHead: 'Library',
      },
      {
        paymentMode: 'Cheque',
        amount: '5000',
        paymentId: '54j8',
        paymentStatus: 'Success',
        isRefunded: false,
        refundAmount: '',
        refundDate: '',
        refundReason: '',
        feeHead: 'Tuition',
      },
    ],
  },
];

const FinanceFeeCollectionPaymentHistoryComponent = () => {
  const dialog = useBoolean();

  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const closeDialog = () => {
    dialog.onFalse();
  };

  const handleSave = () => {};
  return (
    <>
      <CustomizableTable
        tableId="finance-fee-collection-payment-history"
        columns={[
          { id: 'date', label: 'Paid Date' },

          {
            id: 'amountPaid',
            label: 'Amount',
            render(value, row: any) {
              return <Typography fontSize="12px">{formatNumber(row.amountPaid, 'INR')}</Typography>;
            },
          },
          {
            id: 'amountPending',
            label: 'Amount Pending',
            render(value, row: any) {
              return (
                <Typography fontSize="12px">{formatNumber(row.amountPending, 'INR')}</Typography>
              );
            },
          },
          // { id: 'dueDate', label: 'Due Date' },

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
            render: (value, row) => (
              <ThreeDotsActions
                placement="right-top"
                showViewIcon
                handleViewClick={() => {
                  dialog.onTrue();
                  setSelectedEntry(row);
                }}
                actions={(popover) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        // popover.onClose();
                      }}
                    >
                      <Iconify icon="tabler:receipt" />
                      View Receipt
                    </MenuItem>
                    {/* <MenuItem
                      onClick={() => {
                        console.log('data row', row);

                      }}
                    >
                      <Iconify icon="mdi:eye" />
                      View Details
                    </MenuItem> */}
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={paymentHistoryData}
      />

      {dialog.value && (
        <FinanceStudentPaymentHistoryDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
        />
      )}
    </>
  );
};

export default FinanceFeeCollectionPaymentHistoryComponent;
