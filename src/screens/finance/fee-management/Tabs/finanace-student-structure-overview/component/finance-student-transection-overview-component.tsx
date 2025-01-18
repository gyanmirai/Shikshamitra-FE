import React from 'react';

import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const data = [
  {
    date: '10-10-2024',
    amountDue: '600',
    amountPaid: '1000',
    totalAmount: '1600',
    status: 'Unpaid',
    action: 'View',
  },
  {
    date: '10-10-2024',
    amountDue: '600',
    amountPaid: '1000',
    totalAmount: '1600',
    status: 'Unpaid',
    action: 'View',
  },
  {
    date: '10-10-2024',
    amountDue: '600',
    amountPaid: '1000',
    totalAmount: '1600',
    status: 'Unpaid',
    action: 'View',
  },
];

const FinanceStudentTransectionOverviewComponent = () => (
  <Box pt="10px" pb="20px">
    <Typography component="span" variant="h6">
      Transaction Overview
    </Typography>

    <CustomizableTable
      tableId="finance-student-transection-overview-table"
      columns={[
        { id: 'date', label: 'Date' },
        { id: 'amountDue', label: 'Amount Due' },
        { id: 'amountPaid', label: 'Amount Paid' },
        { id: 'totalAmount', label: 'Total Amount' },
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
          render(value, row) {
            return (
              <ThreeDotsActions
                actions={({ popover }: any) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        //   modal.onTrue();
                        //   popover.onClose();
                      }}
                    >
                      {/* <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} /> */}
                      Set Reminder
                    </MenuItem>
                    <MenuItem onClick={() => {}}>
                      {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
                      Update Payment Status
                    </MenuItem>
                  </MenuList>
                )}
              />
            );
          },
        },
      ]}
      data={data}
    />
  </Box>
);

export default FinanceStudentTransectionOverviewComponent;
