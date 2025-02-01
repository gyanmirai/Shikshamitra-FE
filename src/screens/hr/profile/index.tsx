'use client';

import React from 'react';
import { useSelector } from 'react-redux';

import { Box } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EmployeeCard } from '../employee/employee-view';

const HrProfile = () => {
  const { employee } = useSelector((store: any) => store.auth);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Profile"
        links={[{ name: 'HR' }, { name: 'Profile' }]}
        sx={{ px: 1, pb: 1 }}
      />
      <EmployeeCard employee={employee || {}} />
    </Box>
  );
};

export default HrProfile;
