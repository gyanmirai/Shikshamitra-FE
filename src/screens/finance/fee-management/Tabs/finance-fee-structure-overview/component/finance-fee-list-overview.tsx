import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, MenuItem, MenuList, TextField, Typography } from '@mui/material';

import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const FinanceFeeListOverviewComponent = () => (
  <>
    <Typography component="span" variant="h6" gutterBottom>
      Fee Overview
    </Typography>
    <Box pb="20px" pt="10px">
      <TextField
        fullWidth
        name="Tuition Fees"
        label="Search by student name or grade"
        // value={formik.values.description}
        // onChange={formik.handleChange}
        size="small"
      />
      <Box display="flex" gap={3} py="10px">
        <CustomSelect
          label="Class/Grade"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 150 } }}
        />
        <CustomSelect
          label="Division"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 150 } }}
        />
        <CustomSelect
          label="Payment Status"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 150 } }}
        />
        <DatePicker
          label="Due Date"
          format="DD-MM-YYYY"
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="Payment Date"
          format="DD-MM-YYYY"
          slotProps={{ textField: { size: 'small' } }}
        />
      </Box>

      <Box>
        <CustomizableTable
          tableId="fee-list-table"
          columns={[
            { id: 'class', label: 'Class' },
            { id: 'studentName', label: 'Student Name' },
            { id: 'feeType', label: 'Fee Type' },
            { id: 'amountDue', label: 'Amount Due' },
            { id: 'amountPaid', label: 'Amount Paid' },
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
                          Add Payment
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
              studentName: 'Jayvion Simon',
              feeType: 'Library Fees',
              amountDue: '0',
              amountPaid: '10000',
              dueDate: '01-01-2024',
              status: 'Paid',
              action: 'View',
            },
            {
              class: '10th',
              studentName: 'Jayvion Simon',
              feeType: 'Tuition Fees',
              amountDue: '0',
              amountPaid: '50000',
              dueDate: '01-01-2024',
              status: 'Paid',
              action: 'View',
            },
          ]}
        />
      </Box>
    </Box>
  </>
);

export default FinanceFeeListOverviewComponent;
