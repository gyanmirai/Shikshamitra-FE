import React from 'react';

import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import data from 'src/json/finance/fee-details-student/fee-payment-history.json';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

export const FinanceStudentPaymentHistoryTab = () => (
  <>
    <CustomizableTable
      tableId="financeStudentPaymentHistory"
      columns={[
        { id: 'date', label: 'Date' },
        { id: 'feeType', label: 'Fee Type' },
        {
          id: 'amount',
          label: 'Amount',
          align: 'right',
          filterType: 'formattedNumber',
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
