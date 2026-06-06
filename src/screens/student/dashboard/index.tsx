'use client';

import type { SelectChangeEvent } from '@mui/material';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { Box, Card, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

import AdminDashboard from './admin';
import TeacherDashboard from './teacher';
import PrincipalDashboard from './principal';

const StudentDashboardScreen = () => {
  const { employee } = useSelector((state: any) => state.auth);

  // Normalize role once and keep a controllable "Role View" state, like main dashboard.
  const actualRole = employee?.role?.name?.toLowerCase() || 'admin';
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    if (actualRole && !selectedRole) {
      setSelectedRole(actualRole);
    }
  }, [actualRole, selectedRole]);

  const currentRole = selectedRole || actualRole;

  const handleRoleChange = (event: SelectChangeEvent) => {
    setSelectedRole(event.target.value);
  };

  const renderDashboard = () => {
    switch (currentRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'principal':
        return <PrincipalDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, p: 1 }}>
        <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper' }}>
          <InputLabel id="student-role-view-filter-label">Role View</InputLabel>
          <Select
            labelId="student-role-view-filter-label"
            id="student-role-view-filter"
            value={currentRole}
            label="Role View"
            onChange={handleRoleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="principal">Principal</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
          </Select>
        </FormControl>
      </Card>

      {renderDashboard()}
    </Box>
  );
};

export default StudentDashboardScreen;
