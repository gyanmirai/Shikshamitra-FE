import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { FiberManualRecord } from '@mui/icons-material';
import { Box, List, ListItem, Typography, ListItemText, ListItemIcon } from '@mui/material';

import { CalendarView } from 'src/sections/calendar/view';

const TeacherManagement = () => (
  <Box>
    <Grid2 container spacing={2}>
      <Grid2 xs={8}>
        <CalendarView />
      </Grid2>
      <Grid2 xs={4}>
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
      </Grid2>
    </Grid2>
  </Box>
);

export default TeacherManagement;
