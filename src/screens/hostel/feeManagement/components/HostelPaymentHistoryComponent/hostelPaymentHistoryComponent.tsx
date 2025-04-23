import React from 'react';

import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import PaymentReceipt from './paymentReceipt';

const HostelPaymentHistoryComponent = () => {
  // State for managing the receipt dialog visibility
  const receiptDialog = useBoolean();
  return (
    <Box>
      <CustomizableTable
        tableId="hostel-fee-collection-payment-history-table"
        noDataText="No Payment History Found"
        searchFieldProps={{
          placeholder: 'Search Date, Fee Type...',
          label: 'Search Date, Fee Type...',
        }}
        columns={[
          { id: 'date', label: 'Paid Date', filterType: 'date' },
          {
            id: 'feeType',
            label: 'Fee Type',
            filterType: 'number',
          },
          {
            id: 'feePaid',
            label: 'Fee Paid',
            filterType: 'number',
            render(value, row: any) {
              return <Typography fontSize="12px">{formatNumber(row.amountPaid, 'INR')}</Typography>;
            },
          },
          {
            id: 'paymentMode',
            label: 'Payment Mode',
          },
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
            isFilter: false,
            isSort: false,
            minWidth: 40,
            sticky: true,
            render: (value, row) => (
              <ThreeDotsActions
                actions={() => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        receiptDialog.onTrue();
                      }}
                    >
                      <Iconify icon="tabler:receipt" />
                      View Receipt
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={[
          {
            id: 1,
            date: '2025-04-01',
            feeType: 'Hostel Fee - April',
            amountPaid: 5000,
            paymentMode: 'UPI',
            status: 'Paid',
          },
          {
            id: 2,
            date: '2025-03-01',
            feeType: 'Hostel Fee - March',
            amountPaid: 5000,
            paymentMode: 'Cash',
            status: 'Paid',
          },
          {
            id: 3,
            date: '2025-02-01',
            feeType: 'Hostel Fee - February',
            amountPaid: 0,
            paymentMode: '—',
            status: 'Unpaid',
          },
          {
            id: 4,
            date: '2025-01-10',
            feeType: 'Hostel Fee - January',
            amountPaid: 5000,
            paymentMode: 'Bank Transfer',
            status: 'Paid',
          },
          {
            id: 5,
            date: '2024-12-01',
            feeType: 'Hostel Fee - December',
            amountPaid: 0,
            paymentMode: '—',
            status: 'Overdue',
          },
        ]}
      />
      <CustomDialog
        open={receiptDialog.value}
        title=""
        handleClose={receiptDialog.onFalse}
        maxWidth="md"
        fullWidth
      >
        <PaymentReceipt />
      </CustomDialog>
    </Box>
  );
};

export default HostelPaymentHistoryComponent;
