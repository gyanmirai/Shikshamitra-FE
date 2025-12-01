'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';

import AdminDashboard from './admin';
import PrincipalDashboard from './principal';

const CalendarDashboard = () => {
  const { employee } = useSelector((state: any) => state.auth);
  const role = employee?.role?.name;

  return (
    <Box>
      {role === 'Admin' && <AdminDashboard />}
      {role === 'Principal' && <PrincipalDashboard />}
      {/* Fallback to AdminDashboard for other roles or if role is undefined */}
      {!['Admin', 'Principal'].includes(role) && <AdminDashboard />}
    </Box>
  );
};

export default CalendarDashboard;
