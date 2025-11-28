'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';

import AdminDashboard from './admin';
import TeacherDashboard from './teacher';
import PrincipalDashboard from './principal';

const ClassManagementDashboard = () => {
  const { employee } = useSelector((state: any) => state.auth);
  const role = employee?.role?.name;

  return (
    <Box>
      {role === 'Admin' && <AdminDashboard />}
      {role === 'Principal' && <PrincipalDashboard />}
      {role === 'Teacher' && <TeacherDashboard />}
      {/* Fallback to Admin dashboard if role not recognized */}
      {!['Admin', 'Principal', 'Teacher'].includes(role) && <AdminDashboard />}
    </Box>
  );
};

export default ClassManagementDashboard;
