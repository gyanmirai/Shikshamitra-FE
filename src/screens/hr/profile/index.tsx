'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EmployeeCard } from '../employee/employee-view';

const HrProfile = () => {
  const { employee } = useSelector((store: any) => store.auth);
  return (
    <Box>
      <CustomBreadcrumbs heading="Profile" links={[{ name: 'HR' }, { name: 'Profile' }]} />
      <EmployeeCard employee={employee || {}} setSearchParams={() => {}} />
    </Box>
  );
};

export default HrProfile;
