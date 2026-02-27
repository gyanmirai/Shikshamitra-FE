'use client';

import type { SelectChangeEvent } from '@mui/material';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { Box, Card, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

import AdminDashboard from './admin';
import TeacherDashboard from './teacher';
import PrincipalDashboard from './principal';

// Placeholder for role checking logic
// You might need to adjust this based on your actual Redux state structure

const StudentDashboardScreen = () => {
  const { employee } = useSelector((state: any) => state.auth);
  const actualRole = employee?.role?.name;

  // Create a local state to capture the override role functionality for testing purposes
  const [testRole, setTestRole] = useState<string>('');

  useEffect(() => {
    if (actualRole && !testRole) {
      setTestRole(actualRole);
    }
  }, [actualRole, testRole]);

  const handleRoleChange = (event: SelectChangeEvent) => {
    setTestRole(event.target.value);
  };

  const currentRole = testRole || actualRole || 'Teacher';

  return (
    <Box sx={{ width: '100%' }}>
      {/* Test Role Filter */}
      <Card sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, p: 1 }}>
        <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper' }}>
          <InputLabel id="test-role-filter-label">Role View</InputLabel>
          <Select
            labelId="test-role-filter-label"
            id="test-role-filter"
            value={currentRole}
            label="Role View"
            onChange={handleRoleChange}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Principal">Principal</MenuItem>
            <MenuItem value="Teacher">Teacher</MenuItem>
          </Select>
        </FormControl>
      </Card>

      {currentRole === 'Admin' && <AdminDashboard />}
      {currentRole === 'Principal' && <PrincipalDashboard />}
      {currentRole === 'Teacher' && <TeacherDashboard />}
      {/* Fallback or default view if needed */}
      {!['Admin', 'Principal', 'Teacher'].includes(currentRole) && <AdminDashboard />}
    </Box>
  );
};

export default StudentDashboardScreen;
