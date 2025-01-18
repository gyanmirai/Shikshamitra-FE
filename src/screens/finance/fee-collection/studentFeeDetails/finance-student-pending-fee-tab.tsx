import React from 'react';

import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const FinanceStudentPendingFeeTab = () => {
  const overDuePaymentList = [
    {
      id: 1,
      feeName: 'Tuition Fee',

      amountDue: '5000',
      dueDate: '23-12-2024',
      action: 'mark as paid',
      status: 'Overdue',
    },
    {
      id: 2,
      feeName: 'Sports Fee',

      amountDue: '2500',
      dueDate: '23-01-2025',
      action: 'mark as paid',
      status: 'Upcoming',
    },
  ];

  const upcomingPaymentList = [
    {
      id: 1,
      feeName: 'Sports Fee',

      amountDue: '2500',
      dueDate: '23-01-2025',
      action: 'mark as paid',
    },
  ];
  return (
    <>
      {/* <Typography sx={{ mt: '14px', fontSize: '14px', fontWeight: 'bold' }}>
        Overdue Payments List
      </Typography> */}
      <CustomizableTable
        tableId="finance-student-overdue-payment-table"
        isShowedDense={false}
        isSearch={false}
        columns={[
          { id: 'feeName', label: 'Fee Name' },
          // { id: 'statusId', label: 'Status Id' },
          {
            id: 'amountDue',
            label: 'Amount Due',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.amountDue, 'INR')}</Typography>;
            },
          },
          { id: 'dueDate', label: 'Due Date' },
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
                      : value === 'Upcoming'
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
          {
            id: 'action',
            label: 'Action',
            render: (data, popover) => (
              <ThreeDotsActions
                placement="right-top"
                actions={() => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                      }}
                    >
                      <Iconify icon="mdi:check" />
                      Mark As Paid
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={overDuePaymentList}
      />

      {/* <Typography sx={{ mt: '14px', fontSize: '14px', fontWeight: 'bold' }}>
        Upcoming Payments List
      </Typography>
      <CustomizableTable
        isShowedDense={false}
        isFilter={false}
        isSearch={false}
        columns={[
          { id: 'feeName', label: 'Fee Name' },
          // { id: 'statusId', label: 'Status Id' },
          {
            id: 'amountDue',
            label: 'Amount Due',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.amountDue, 'INR')}</Typography>;
            },
          },
          { id: 'dueDate', label: 'Due Date' },
          {
            id: 'action',
            label: 'Action',
            render: (data, popover) => (
              <ThreeDotsActions
                placement="right-top"
                actions={() => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                      }}
                    >
                      <Iconify icon="mdi:check" />
                      Mark As Paid
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={upcomingPaymentList}
      /> */}
      <Box pb="20px" />
    </>
  );
};

export default FinanceStudentPendingFeeTab;
