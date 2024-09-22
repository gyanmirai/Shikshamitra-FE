import React from 'react';

import { Edit } from '@mui/icons-material';
import { Box, MenuList, MenuItem, Typography, ListItemIcon, ListItemText } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const Teacher = () => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
      <Typography variant="h4">Subject-wise Teacher Assignment Table</Typography>

      <CustomSelect
        label="Class"
        name="class"
        options={[]}
        formControlProps={{ sx: { width: '200px' } }}
        value=""
        onChange={(value) => {}}
      />
    </Box>
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
      <CustomSelect
        label="Grade"
        name="grade"
        options={[]}
        formControlProps={{ sx: { width: '200px' } }}
        value=""
        onChange={(value) => {}}
      />
      <CustomSelect
        label="Subject"
        name="subject"
        options={[]}
        formControlProps={{ sx: { width: '200px' } }}
        value=""
        onChange={(value) => {}}
      />
    </Box>
    <CustomizableTable
      columns={[
        {
          id: 'subject',
          label: 'Subject',
        },
        {
          id: 'assignedTeacher',
          label: 'Assigned Teacher',
        },
        {
          id: 'action',
          label: 'Action',
          render(value, row) {
            return (
              <ThreeDotsActions
                actions={() => (
                  <MenuList>
                    <MenuItem onClick={() => {}}>
                      <ListItemIcon>
                        <Edit />
                      </ListItemIcon>
                      <ListItemText>Edit</ListItemText>
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
          subject: 'Mathematics',
          assignedTeacher: 'John Doe',
        },
        {
          subject: 'Science',
          assignedTeacher: 'Jane Smith',
        },
        {
          subject: 'English',
          assignedTeacher: 'Robert Johnson',
        },
        {
          subject: 'History',
          assignedTeacher: 'Emily Brown',
        },
        {
          subject: 'Physical Education',
          assignedTeacher: 'Michael Wilson',
        },
      ]}
    />
  </Box>
);

export default Teacher;
