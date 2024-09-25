import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { FiberManualRecord } from '@mui/icons-material';
import { Box, List, ListItem, Typography, ListItemIcon, ListItemText } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

import { CalendarView } from 'src/sections/calendar/view';

const TeacherManagement = () => (
  <Box>
    <Grid2 container spacing={2}>
      <Grid2 xs={8}>
        <CalendarView />
      </Grid2>
      <Grid2 xs={4}>
        <Typography variant="h6">Available Teachers</Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <FiberManualRecord fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Teacher 1" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FiberManualRecord fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Teacher 2" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FiberManualRecord fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Teacher 3" />
          </ListItem>
        </List>
        <CustomSelect
          options={[]}
          value=""
          onChange={() => {}}
          label="Reassign Teacher"
          formControlProps={{ sx: { mt: 2, maxWidth: 250, width: '100%' } }}
        />
        <CustomSelect
          options={[]}
          value=""
          onChange={() => {}}
          label="Available Teachers"
          formControlProps={{ sx: { mt: 2, maxWidth: 250, width: '100%' } }}
        />
      </Grid2>
    </Grid2>
  </Box>
);

export default TeacherManagement;
