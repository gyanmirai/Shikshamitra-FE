'use client';

import type { LabelColor } from 'src/components/label';

import React from 'react';
import Link from 'next/link';

import { Box, Grid, Card, Typography, CardContent } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import Overview from './overview';
import EventsHoliday from './events-holiday';
import DashboardChart from './dashboard-chart';
import EmployeeBirthDay from './employee-birthday';

const Dashboard = () => (
  <Box sx={{ p: 3 }}>
    <Grid container spacing={3}>
      {/* Statistics Cards */}
      <Overview />

      {/* Graphs and Charts */}
      <DashboardChart />
      {/* Employee Birthdays & Anniversary */}
      <EmployeeBirthDay />

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6">Events & Holidays</Typography>
            <EventsHoliday />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default Dashboard;

interface DashboardCardProps {
  title: string;
  icon: string;
  value?: number | string;
  labels?: { name: string; color: LabelColor }[];
  color: string;
  href?: string;
}

export const EmployeeDashboardCard = ({
  title,
  icon,
  value,
  labels = [],
  href = '',
  color,
}: DashboardCardProps) => (
  <Box component={Link} href={href} sx={{ textDecoration: 'none' }}>
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 'var(--shadows-8)',
          scale: 1.03,
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Box sx={{ typography: 'subtitle1' }}>{title}</Box>
            {/* <Typography variant="h6">Total Employees</Typography> */}
          </Box>
          {typeof value === 'number' && (
            <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{fNumber(value)}</Box>
          )}
          {typeof value === 'string' && (
            <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{value}</Box>
          )}
          {/* <Typography variant="h4">{stats.totalEmployees}</Typography> */}
          <Box
            sx={{
              mt: 1.5,
              mb: 1,
              typography: 'subtitle2',
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {labels.map((label, index) => (
              <Label color={label.color || 'success'}>{label.name}</Label>
            ))}
          </Box>
        </Box>
        <Iconify icon={icon} sx={{ width: 50, height: 50, color }} />
        {/* <Typography variant="body2"></Typography> */}
      </CardContent>
    </Card>
  </Box>
);
