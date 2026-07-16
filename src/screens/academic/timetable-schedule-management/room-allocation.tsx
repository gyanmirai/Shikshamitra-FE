import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { FiberManualRecord } from '@mui/icons-material';
import { CalendarView } from 'src/sections/calendar/view';
import { Box, Grid, List, ListItem, Typography, ListItemText, ListItemIcon } from '@mui/material';

const RoomAllocation = (props: TabComponentType) => (
  <Box>
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 8 }}>
        <CalendarView />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="h6">List of Available Rooms</Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <FiberManualRecord fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Room 1" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FiberManualRecord fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Room 2" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FiberManualRecord fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Room 3" />
          </ListItem>
        </List>
      </Grid>
    </Grid>
  </Box>
);

export default RoomAllocation;
