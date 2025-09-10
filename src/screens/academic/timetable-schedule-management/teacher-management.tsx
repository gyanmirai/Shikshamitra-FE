import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { FiberManualRecord } from '@mui/icons-material';
import CustomSelect from 'src/components/custom-select';
import { CalendarView } from 'src/sections/calendar/view';
import { Box , Grid, List, ListItem, Typography, ListItemText, ListItemIcon } from '@mui/material';


const TeacherManagement = (props: TabComponentType) => {
  const [reassigedTeacher, setReassigedTeacher] = useState<string>('');
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <CalendarView />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} rowSpacing={2}>
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
              onChange={(val) => setReassigedTeacher(val as string)}
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherManagement;
