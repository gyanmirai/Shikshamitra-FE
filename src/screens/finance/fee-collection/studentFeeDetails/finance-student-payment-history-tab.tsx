import React from 'react';

import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

export const FinanceStudentPaymentHistoryTab = () => {
  const data = [
    {
      id: 1,
      date: '25-12-2024',
      amount: '10000',
      paymentMode: 'Cash',
      feeType: 'Tuition',
    },
    {
      id: 2,
      date: '25-03-2025',
      amount: '5000',
      paymentMode: 'Cash',
      feeType: 'Tuition',
    },
    {
      id: 3,
      date: '25-05-2025',
      amount: '15000',
      paymentMode: 'Cash',
      feeType: 'Tuition',
    },
  ];
  return (
    <>
      <CustomizableTable
        columns={[
          { id: 'date', label: 'Date' },
          { id: 'feeType', label: 'Fee Type' },
          {
            id: 'amount',
            label: 'Amount',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.amount, 'INR')}</Typography>;
            },
          },
          { id: 'paymentMode', label: 'Payment Mode' },
          {
            id: 'action',
            label: 'Action',
            render: (row: any, popover) => (
              <ThreeDotsActions
                actions={() => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                      }}
                    >
                      <Iconify icon="mdi:eye" />
                      View Receipt
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={data}
      />
      <Box pb="20px" />
    </>
  );
};
