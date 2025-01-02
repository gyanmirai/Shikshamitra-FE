import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { FiberManualRecord } from '@mui/icons-material';
import { Box, List, ListItem, Typography, ListItemText, ListItemIcon } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

import { CalendarView } from 'src/sections/calendar/view';

const TeacherManagement = (props: TabComponentType) => {
  const [reassigedTeacher, setReassigedTeacher] = useState<string>('');
  return (
    <Box>
      <Grid2 container spacing={2}>
        <Grid2 xs={8}>
          <CalendarView />
        </Grid2>
        <Grid2 xs={4} rowSpacing={2}>
          <Typography>List Of Teacher</Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <FiberManualRecord fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Item 1" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FiberManualRecord fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Item 2" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FiberManualRecord fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Item 3" />
            </ListItem>
          </List>
          <Box display="flex" flexDirection="column" gap={2}>
            <CustomSelect
              label="Reassign Teacher"
              options={[
                { value: 'riya', label: 'riya' },
                { value: 'siya', label: 'siya' },
                { value: 'priya', label: 'priya' },
                { value: 'jiya', label: 'jiya' },
              ]}
              value={reassigedTeacher}
              onChange={(val) => {
                setReassigedTeacher(val as string);
              }}
              formControlProps={{ sx: { minWidth: 220 } }}
            />
            <CustomSelect
              label="Available Teachers"
              options={[
                { value: 'riya', label: 'riya' },
                { value: 'siya', label: 'siya' },
                { value: 'priya', label: 'priya' },
                { value: 'jiya', label: 'jiya' },
              ]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 220 } }}
            />
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default TeacherManagement;
