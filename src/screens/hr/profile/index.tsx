'use client';

import React from 'react';
import { useSelector } from 'react-redux';

import { Box } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EmployeeCard } from '../employee/employee-view';

const HrProfile = () => {
  const { userInfo } = useSelector((store: any) => store.user);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Profile"
        links={[{ name: 'HR' }, { name: 'Profile' }]}
        sx={{ px: 1, pb: 1 }}
      />
      <EmployeeCard employee={userInfo?.employee || {}} />
    </Box>
  );
};

export default HrProfile;
