'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';

import AdminDashboard from './admin';
import PrincipalDashboard from './principal';

const LibraryDashboard = () => {
  const { employee } = useSelector((state: any) => state.auth);
  const role = employee?.role?.name;

  return (
    <Box>
      {(role === 'Librarian' || role === 'Admin') && <AdminDashboard />}
      {role === 'Principal' && <PrincipalDashboard />}
      {/* Fallback to Principal dashboard if role not recognized */}
      {!['Librarian', 'Admin', 'Principal'].includes(role) && <PrincipalDashboard />}
    </Box>
  );
};

export default LibraryDashboard;
