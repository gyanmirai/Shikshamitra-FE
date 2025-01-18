import React from 'react';

import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const AssessmentDashboardListComponent = () => {
  const modal = useBoolean();
  const uploadModal = useBoolean();
  const gradeScalingModal = useBoolean();
  return (
    <Box>
      <Typography component="span" variant="h6" gutterBottom>
        Assessment List View
      </Typography>
      <Box display="flex" flexDirection="row" gap={3} sx={{ pt: '20px', pb: '20px' }}>
        <CustomSelect
          label="Class"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
        <CustomSelect
          label="Subject"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
        <CustomSelect
          label="Teacher"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
      </Box>
      <CustomizableTable
        tableId="assessment-list-table"
        columns={[
          { id: 'assessmentTitle', label: 'Assessment Title' },
          { id: 'subject', label: 'Subject' },
          { id: 'dueDate', label: 'Due Date' },
          { id: 'assignedTeach', label: 'Assigned Teach' },

          {
            id: 'status',
            label: 'Status',
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
                          modal.onTrue();
                          popover.onClose();
                        }}
                      >
                        {/* <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} /> */}
                        Reschedule
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          uploadModal.onTrue();
                          popover.onClose();
                        }}
                      >
                        {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
                        Approved
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          gradeScalingModal.onTrue();
                          popover.onClose();
                        }}
                      >
                        {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
                        Archive
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
            assessmentTitle: '10th Grade',
            subject: 'Mathematics',
            dueDate: '12-01-2021',
            assignedTeach: 'Written',
            status: 'Completed',
            action: 'View',
          },
          {
            assessmentTitle: '10th Grade',
            subject: 'Mathematics',
            dueDate: '12-01-2021',
            assignedTeach: 'Written',
            status: 'Completed',
            action: 'View',
          },
        ]}
      />
    </Box>
  );
};

export default AssessmentDashboardListComponent;
