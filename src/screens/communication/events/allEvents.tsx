'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import { Search as SearchIcon } from '@mui/icons-material';
import { Box, Card, Grid, TextField, Typography, IconButton, CardContent } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CalendarView } from 'src/sections/calendar/view';

const AllEvents = (props: TabComponentType) => {
  // State to track the selected event type (schoolWise, classWise, extraCurricular)
  const [selectedEvent, setSelectedEvent] = useState('');
  // Dialog state for adding new events
  return (
    <Box>
      <CustomBreadcrumbs
        heading="All Events"
        description="View and manage all events including school-wise, class-wise and extra-curricular activities"
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Events' },
          { name: 'All Events' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        <CustomSelect
          options={[
            { value: 'schoolWise', label: 'School Wise' },
            { value: 'classWise', label: 'Class Wise' },
            { value: 'extraCurricular', label: 'Extra Curricular' },
          ]}
          value={selectedEvent}
          onChange={(val) => {
            setSelectedEvent(val as string);
          }}
          label="Filter Event"
          formControlProps={{ sx: { minWidth: 200 } }}
        />
        <TextField
          label="Search Event"
          variant="outlined"
          size="small"
          value=""
          onChange={() => {}}
          InputProps={{
            endAdornment: (
              <IconButton size="small">
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
      <Grid item xs={12} mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Event Calendar</Typography>
            <CalendarView />
          </CardContent>
        </Card>
      </Grid>
    </Box>
  );
};

export default AllEvents;
