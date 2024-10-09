import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const FinanceFeeStructureOverviewComponent = () => (
  <Box pb="10px">
    <Typography component="span" variant="h6" gutterBottom>
      Fee Structure Overview
    </Typography>
    <Box display="flex" gap={3} py="10px">
      <CustomSelect
        label="Subject"
        options={[]}
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { minWidth: 150 } }}
      />
      <CustomSelect
        label="Fee Status"
        options={[]}
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { minWidth: 150 } }}
      />
      <DatePicker
        label="To Date"
        format="DD-MM-YYYY"
        slotProps={{ textField: { size: 'small' } }}
      />
      <DatePicker
        label="End Date"
        format="DD-MM-YYYY"
        slotProps={{ textField: { size: 'small' } }}
      />
    </Box>
    <CustomizableTable
      columns={[
        { id: 'class', label: 'Class' },

        { id: 'feeType', label: 'Fee Type' },
        { id: 'amount', label: 'Amount' },

        { id: 'dueDate', label: 'Due Date' },
        { id: 'status', label: 'Status' },
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
                      Reschedule
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        //   uploadModal.onTrue();
                        //   popover.onClose();
                      }}
                    >
                      {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
                      Cancel
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        //   gradeScalingModal.onTrue();
                        //   popover.onClose();
                      }}
                    >
                      {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
                      Mark as Completed
                    </MenuItem>
                  </MenuList>
                )}
              />
            );
          },
        },
      ]}
      data={[
        {
          class: '10th',

          feeType: 'Jayvion Simon',

          amount: '$1000',
          dueDate: '01-01-2024',
          status: 'Completed',
          action: 'View',
        },

        {
          class: '10th',

          feeType: 'Jayvion Simon',

          amount: '$1000',
          dueDate: '01-01-2024',
          status: 'Completed',
          action: 'View',
        },
        {
          class: '10th',

          feeType: 'Jayvion Simon',

          amount: '$1000',
          dueDate: '01-01-2024',
          status: 'Completed',
          action: 'View',
        },
      ]}
    />
  </Box>
);

export default FinanceFeeStructureOverviewComponent;
