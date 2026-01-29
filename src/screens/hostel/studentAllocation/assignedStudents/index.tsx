'use client';

import React from 'react';
import { Box, TextField, Autocomplete } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AllocatedRoomsTable from './components/allocatedRoomsTable';

const AssignedStudents = () => (
  <Box display="flex" flexDirection="column">
    <CustomBreadcrumbs
      heading="Allocated Rooms"
      description="Student Allocation For Hostel"
      links={[
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Student Allocation', href: '' },
        { name: 'Allocated Rooms', href: '' },
      ]}
    />
    <Box display="flex" alignItems="center" mb={2} mt={2} gap={1}>
      <Autocomplete
        options={[
          { id: '1', name: 'Hostel1' },
          { id: '2', name: 'Hostel 2' },
          { id: '3', name: 'Hostel 3' },
        ]}
        getOptionLabel={(option) => option.name || ''}
        onChange={(_, value) => {
          // setStudent(value?.id || '');
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Hostel Type"
            name="hostelType"
            variant="outlined"
            fullWidth
            size="small"
          />
        )}
        sx={{ maxWidth: '200px', width: '100%' }}
      />
      <Autocomplete
        options={[
          { id: '1', name: 'Hostel1' },
          { id: '2', name: 'Hostel 2' },
          { id: '3', name: 'Hostel 3' },
        ]}
        getOptionLabel={(option) => option.name || ''}
        onChange={(_, value) => {
          // setStudent(value?.id || '');
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Hostel Name"
            name="hostelName"
            variant="outlined"
            fullWidth
            size="small"
          />
        )}
        sx={{ maxWidth: '200px', width: '100%' }}
      />
      <Autocomplete
        options={[
          { id: '101', name: 'Room 101' },
          { id: '102', name: 'Room 102' },
          { id: '103', name: 'Room 103' },
        ]}
        getOptionLabel={(option) => option.name || ''}
        onChange={(_, value) => {
          // setRoom(value?.id || '');
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Room Number"
            name="roomNumber"
            variant="outlined"
            fullWidth
            size="small"
          />
        )}
        sx={{ maxWidth: '200px', width: '100%' }}
      />
    </Box>
    <AllocatedRoomsTable />
  </Box>
);

export default AssignedStudents;
