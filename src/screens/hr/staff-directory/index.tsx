'use client';

import React from 'react';

import { Search } from '@mui/icons-material';
import { Box, TextField, InputAdornment } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const StaffDirectoryScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Staff Directory"
      links={[{ name: 'HR' }, { name: 'Staff Directory' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <TextField
      fullWidth
      placeholder="Search by department or designation"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
      sx={{
        backgroundColor: 'background.paper',
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        },
      }}
    />
    <CustomizableTable
      columns={[
        { id: 'name', label: 'Name' },
        { id: 'designation', label: 'Designation' },
        { id: 'department', label: 'Department' },
        { id: 'status', label: 'Status' },
      ]}
      data={[
        {
          id: 1,
          name: 'John Doe',
          designation: 'Software Engineer',
          department: 'Engineering',
          status: 'Active',
        },
        {
          id: 2,
          name: 'Jane Smith',
          designation: 'HR Manager',
          department: 'Human Resources',
          status: 'Active',
        },
        {
          id: 3,
          name: 'Mike Johnson',
          designation: 'Product Manager',
          department: 'Product',
          status: 'Leave',
        },
        {
          id: 4,
          name: 'Sarah Williams',
          designation: 'Marketing Director',
          department: 'Marketing',
          status: 'Active',
        },
        {
          id: 5,
          name: 'David Brown',
          designation: 'Financial Analyst',
          department: 'Finance',
          status: 'Active',
        },
        {
          id: 6,
          name: 'Emily Davis',
          designation: 'UX Designer',
          department: 'Design',
          status: 'Active',
        },
        {
          id: 7,
          name: 'Robert Wilson',
          designation: 'Sales Manager',
          department: 'Sales',
          status: 'Leave',
        },
        {
          id: 8,
          name: 'Lisa Anderson',
          designation: 'Content Writer',
          department: 'Marketing',
          status: 'Active',
        },
      ]}
    />
  </Box>
);

export default StaffDirectoryScreen;
