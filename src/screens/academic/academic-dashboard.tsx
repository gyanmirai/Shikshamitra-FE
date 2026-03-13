'use client';

import type { SelectChangeEvent } from '@mui/material';

import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Stack,
  Select,
  MenuItem,
  Typography,
  InputLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';

import AcademicTeacherDashboardScreen from './dashboard';
import AcademicDashboardScreen from './AcademicDashboard';
import AcademicPrincipalDashboardScreen from './AcademicPrincipalDashboard';

const AcademicDashboard = () => {
  const { data: session, status } = useSession() as any;
  const actualRole = session?.profile?.role?.toLowerCase() || 'teacher';

  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    if (actualRole && !selectedRole) {
      setSelectedRole(actualRole);
    }
  }, [actualRole, selectedRole]);

  if (status === 'loading') {
    return (
      <Box
        sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const currentRole = selectedRole || actualRole;

  const handleRoleChange = (event: SelectChangeEvent) => {
    setSelectedRole(event.target.value);
  };

  const renderDashboard = () => {
    switch (currentRole) {
      case 'admin':
        return <AcademicDashboardScreen />;
      case 'teacher':
        return <AcademicTeacherDashboardScreen />;
      case 'principal':
        return <AcademicPrincipalDashboardScreen />;
      default:
        return (
          <Stack sx={{ p: 5, alignItems: 'center' }}>
            <Typography variant="h4">Welcome!</Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              We couldn&apos;t determine your role. Please contact support.
            </Typography>
          </Stack>
        );
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Role View Filter */}
      <Card sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, p: 1 }}>
        <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper' }}>
          <InputLabel id="academic-role-view-filter-label">Role View</InputLabel>
          <Select
            labelId="academic-role-view-filter-label"
            id="academic-role-view-filter"
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

export default AcademicDashboard;
