import React from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const AssignmentOverview = () => (
  <Box>
    <CustomizableTable
      columns={[
        { id: 'title', label: 'Title' },
        { id: 'subject', label: 'Subject' },
        { id: 'assignedDate', label: 'Assigned Date' },
        { id: 'dueDate', label: 'Due Date' },
        { id: 'status', label: 'Status' },
        {
          id: 'action',
          label: 'Action',
          render(value, row) {
            return (
              <ThreeDotsActions
                actions={() => (
                  <MenuList>
                    <MenuItem>
                      <Iconify icon="mdi:bell-ring" />
                      Send Reminder
                    </MenuItem>
                    <MenuItem>
                      <Iconify icon="mdi:calendar-clock" />
                      Deadline Extensions
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
          title: 'Math Homework',
          subject: 'Mathematics',
          assignedDate: '2023-05-01',
          dueDate: '2023-05-08',
          status: 'Pending',
        },
        {
          title: 'History Essay',
          subject: 'History',
          assignedDate: '2023-04-28',
          dueDate: '2023-05-12',
          status: 'In Progress',
        },
        {
          title: 'Science Project',
          subject: 'Biology',
          assignedDate: '2023-04-15',
          dueDate: '2023-05-15',
          status: 'Completed',
        },
      ]}
    />
  </Box>
);

export default AssignmentOverview;
