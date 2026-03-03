import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Card,
  Stack,
  Avatar,
  Tooltip,
  CardHeader,
  Typography,
  IconButton,
} from '@mui/material';

const studentsAtRisk = [
  {
    id: '1',
    name: 'Rahul Singh',
    attendance: 65,
    performance: 32,
    issues: ['Low Attendance', 'Failing Grades'],
    avatarUrl: '',
    status: 'rational', // critical
  },
  {
    id: '2',
    name: 'Priya Sharma',
    attendance: 72,
    performance: 45,
    issues: ['Low Attendance'],
    avatarUrl: '',
    status: 'warning',
  },
  {
    id: '3',
    name: 'Amit Patel',
    attendance: 88,
    performance: 28,
    issues: ['Failing Grades', 'Behavior'],
    avatarUrl: '',
    status: 'critical',
  },
  {
    id: '4',
    name: 'Sneha Gupta',
    attendance: 60,
    performance: 55,
    issues: ['Chronic Absenteeism'],
    avatarUrl: '',
    status: 'critical',
  },
];

const StudentsNeedingAttention = () => {
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Student',
        render: (value, row) => (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar src={row.avatarUrl} alt={row.name} sx={{ width: 36, height: 36 }} />
            <Box>
              <Typography variant="subtitle2" noWrap>
                {row.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {row.issues.join(' • ')}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        id: 'attendance',
        label: 'Attendance',
        render: (value, row) => (
          <Stack spacing={0.5}>
            <Typography
              variant="body2"
              sx={{
                color: row.attendance < 75 ? 'error.main' : 'text.primary',
                fontWeight: 'bold',
                fontSize: 13,
              }}
            >
              {row.attendance}%
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'performance',
        label: 'Avg. Score',
        render: (value, row) => (
          <Stack spacing={0.5}>
            <Typography
              variant="body2"
              sx={{
                color: row.performance < 35 ? 'error.main' : 'text.primary',
                fontWeight: 'bold',
                fontSize: 13,
              }}
            >
              {row.performance}%
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        render: (value, row) => (
          <Label
            variant="soft"
            color={
              row.status === 'critical' || row.performance < 35 || row.attendance < 75
                ? 'error'
                : 'warning'
            }
          >
            Action Needed
          </Label>
        ),
      },
      {
        id: 'action',
        label: 'Action',
        align: 'left',
        render: (value, row) => (
          <Stack direction="row" spacing={1} justifyContent="flex-start">
            <Tooltip title="Contact Parent">
              <IconButton size="small" sx={{ color: 'primary.main', bgcolor: 'primary.lighter' }}>
                <Iconify icon="mdi:phone" width={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Profile">
              <IconButton size="small">
                <Iconify icon="eva:person-outline" width={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    []
  );

  return (
    <Card sx={{ mb: 1 }}>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:alert-decagram" sx={{ color: 'error.main' }} />
            <Typography variant="h6">Students Needing Attention</Typography>
          </Stack>
        }
        sx={{ pb: 0, ml: -1, mt: -1 }}
      />
      <Box sx={{ p: 1 }}>
        <CustomizableTable
          tableId="students-attention-table"
          columns={columns}
          data={studentsAtRisk}
          isPagination={false}
          isFilter={false}
          isShowedDense={false}
        />
      </Box>
    </Card>
  );
};

export default StudentsNeedingAttention;
