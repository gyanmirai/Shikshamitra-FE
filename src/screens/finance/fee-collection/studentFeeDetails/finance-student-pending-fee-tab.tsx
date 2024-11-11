import React from 'react';

import { MenuItem, MenuList, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const FinanceStudentPendingFeeTab = () => {
  const overDuePaymentList = [
    {
      id: 1,
      feeName: 'Tuition Fee',
      // statusId: '1234',
      amountDue: '500',
      dueDate: '23-12-2024',
      action: 'mark as paid',
    },
  ];

  const upcomingPaymentList = [
    {
      id: 1,
      feeName: 'Sports Fee',
      // statusId: '1234',
      amountDue: '2500',
      dueDate: '23-01-2025',
      action: 'mark as paid',
    },
  ];
  return (
    <>
      <Typography variant="h6" sx={{ pt: '10px' }}>
        Overdue Payments List
      </Typography>
      <CustomizableTable
        columns={[
          { id: 'feeName', label: 'Fee Name' },
          // { id: 'statusId', label: 'Status Id' },
          { id: 'amountDue', label: 'Amount Due' },
          { id: 'dueDate', label: 'Due Date' },
          {
            id: 'action',
            label: 'Action',
            render: (data) => (
              <ThreeDotsActions
                actions={() => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        // popover.onClose();
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

      <Typography variant="h6" sx={{ mt: '10px' }}>
        Upcoming Payments List
      </Typography>
      <CustomizableTable
        columns={[
          { id: 'feeName', label: 'Fee Name' },
          // { id: 'statusId', label: 'Status Id' },
          { id: 'amountDue', label: 'Amount Due' },
          { id: 'dueDate', label: 'Due Date' },
          {
            id: 'action',
            label: 'Action',
            render: (data) => (
              <ThreeDotsActions
                actions={() => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        // popover.onClose();
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
      />
    </>
  );
};

export default FinanceStudentPendingFeeTab;
