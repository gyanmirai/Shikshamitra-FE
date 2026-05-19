'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';

import AdminDashboard from './admin';
import TeacherDashboard from './teacher';
import PrincipalDashboard from './principal';

// Placeholder for role checking logic
// You might need to adjust this based on your actual Redux state structure

const StudentDashboardScreen = () => {
  const { employee } = useSelector((state: any) => state.auth);
  const role = employee?.role?.name;
  return (
    <Box sx={{ width: '100%' }}>
      {role === 'Admin' && <AdminDashboard />}
      {role === 'Principal' && <PrincipalDashboard />}
      {role === 'Teacher' && <TeacherDashboard />}
      {/* Fallback or default view if needed */}
      {!['Admin', 'Principal', 'Teacher'].includes(role) && <AdminDashboard />}
    </Box>
  );
};

export default StudentDashboardScreen;
