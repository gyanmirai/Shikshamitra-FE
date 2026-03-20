'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Card,
  Stack,
  CardHeader,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

// -----------------------------------------------------------------------

const DEPARTMENTS = [
  { id: 1, name: 'Science', total: 18, present: 16, absent: 2 },
  { id: 2, name: 'Mathematics', total: 14, present: 13, absent: 1 },
  { id: 3, name: 'English', total: 12, present: 10, absent: 2 },
  { id: 4, name: 'Computer', total: 10, present: 9, absent: 1 },
  { id: 5, name: 'Administration', total: 15, present: 12, absent: 3 },
  { id: 6, name: 'HR', total: 8, present: 7, absent: 1 },
  { id: 7, name: 'Library', total: 5, present: 5, absent: 0 },
];

const HRDepartmentOverview = () => {
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        sticky: true,
        label: 'Department',
        align: 'left',
        minWidth: 100,
        render: (value, row) => {
          const isLow = row.absent >= 3;
          return (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" fontSize="13px">
                {value}
              </Typography>
              {isLow && (
                <Label color="error" variant="soft" sx={{ fontSize: '0.6rem' }}>
                  Staff Alert
                </Label>
              )}
            </Stack>
          );
        },
      },
      {
        id: 'total',
        label: 'Total',
        minWidth: 100,
        filterType: 'number',
      },
      {
        id: 'present',
        label: 'Present',
        minWidth: 100,
        filterType: 'number',
        render: (value) => (
          <Typography variant="body2" color="success.main" fontWeight={600}>
            {value}
          </Typography>
        ),
      },
      {
        id: 'absent',
        label: 'Absent',
        minWidth: 100,
        filterType: 'number',
        render: (value) => (
          <Typography
            variant="body2"
            color={value > 0 ? 'error.main' : 'text.disabled'}
            fontWeight={600}
          >
            {value}
          </Typography>
        ),
      },
      {
        id: 'attendance',
        sticky: true,
        label: 'Attendance',
        minWidth: 100,
        filterType: 'number',
        render: (_, row) => {
          const pct = Math.round((row.present / row.total) * 100);
          return (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={48}
                thickness={4.5}
                sx={{ color: (theme) => theme.vars.palette.grey[200] }}
              />
              <CircularProgress
                variant="determinate"
                value={pct}
                size={48}
                thickness={4.5}
                color={pct >= 90 ? 'success' : pct >= 75 ? 'warning' : 'error'}
                sx={{
                  position: 'absolute',
                  left: 0,
                  [`& .MuiCircularProgress-circle`]: { strokeLinecap: 'round' },
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.primary">
                  {pct}%
                </Typography>
              </Box>
            </Box>
          );
        },
      },
    ],
    []
  );

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">Department Staff Overview</Typography>
            <CustomTooltip title="Real-time staffing status by department" placement="top">
              <IconButton size="small" sx={{ p: 0 }}>
                <Iconify
                  icon="solar:info-circle-linear"
                  width={18}
                  sx={{ color: 'text.disabled' }}
                />
              </IconButton>
            </CustomTooltip>
          </Stack>
        }
        sx={{ p: 2 }}
      />
      <Scrollbar sx={{ flexGrow: 1, height: '50vh' }}>
        <Box display="flex" flexDirection="column" gap={2} maxHeight="500px" height="100%" p={1}>
          <CustomizableTable
            tableId="hr-department-overview"
            columns={columns}
            data={DEPARTMENTS}
            isFilter={false}
            isPagination={false}
            isSearch={false}
          />
        </Box>
      </Scrollbar>
    </Card>
  );
};

export default HRDepartmentOverview;
