import React from 'react';

import { Box, MenuItem, MenuList, TextField, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const FinanceStudentStructureOverview = () => (
  <>
    <Typography component="span" variant="h6">
      Student Fee Management
    </Typography>
    <Box>
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
          label="Select Action"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 150 } }}
        />
      </Box>
      <TextField
        name="Tuition Fees"
        label="Search by student name or grade"
        // value={formik.values.description}
        // onChange={formik.handleChange}
        size="small"
      />

      <Box>
        <CustomizableTable
          columns={[
            { id: 'studentName', label: 'Student Name' },
            { id: 'gradeLevel', label: 'Grade Level' },
            { id: 'feeStatus', label: 'Fee Status' },

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
                          Mark As Paid
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            //   uploadModal.onTrue();
                            //   popover.onClose();
                          }}
                        >
                          {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
                          Set Reminder
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            //   gradeScalingModal.onTrue();
                            //   popover.onClose();
                          }}
                        >
                          {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
                          Mark as Unpaid
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
              gradeLevel: '10TH A',
              feeStatus: 'paid',

              action: 'View',
            },
            {
              class: '10th',
              studentName: 'Jayvion Simon',
              gradeLevel: '10TH A',
              feeStatus: 'paid',

              action: 'View',
            },
            {
              class: '10th',
              studentName: 'Jayvion Simon',
              gradeLevel: '10TH A',
              feeStatus: 'paid',

              action: 'View',
            },
          ]}
        />
      </Box>
    </Box>
  </>
);

export default FinanceStudentStructureOverview;
