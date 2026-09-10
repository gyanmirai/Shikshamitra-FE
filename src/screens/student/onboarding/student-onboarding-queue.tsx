'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  StudentOnboardingCase,
  StudentOnboardingStatus,
} from 'src/redux/student/admissions/student-onboarding-api';

import NextLink from 'next/link';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetStudentOnboardingCasesQuery,
  useGetStudentOnboardingAnalyticsQuery,
  useGetStudentOnboardingFilterOptionsQuery,
} from 'src/redux/student/admissions/student-onboarding-api';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';

import { getOnboardingStatusColor, getOnboardingStatusLabel } from './student-onboarding-status';

export default function StudentOnboardingQueueScreen() {
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.sub as string | undefined
  );
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [standardId, setStandardId] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine' | 'unassigned'>('all');
  const filterOptions = useGetStudentOnboardingFilterOptionsQuery();
  const analytics = useGetStudentOnboardingAnalyticsQuery();
  const query = useGetStudentOnboardingCasesQuery({
    search: search || undefined,
    status: status === '' ? undefined : Number(status),
    academicYearId: academicYearId || undefined,
    standardId: standardId || undefined,
    overdueOnly: overdueOnly || undefined,
    assignedToUserId: ownerFilter === 'mine' ? currentUserId : undefined,
    unassignedOnly: ownerFilter === 'unassigned' || undefined,
    skipCount: 0,
    maxResultCount: 100,
  });

  const columns: IColumn[] = [
    {
      id: 'studentName',
      label: 'Student',
      minWidth: 220,
      render: (value, row) => (
        <NextLink href={`/student/onboarding/${(row as StudentOnboardingCase).id}`}>
          {String(value)}
        </NextLink>
      ),
    },
    { id: 'applicationNumber', label: 'Application', minWidth: 170 },
    { id: 'academicYearName', label: 'Academic year', minWidth: 150 },
    { id: 'intendedStandardName', label: 'Intended standard', minWidth: 150 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 170,
      render: (value) => (
        <Chip
          size="small"
          label={getOnboardingStatusLabel(Number(value))}
          color={getOnboardingStatusColor(Number(value) as StudentOnboardingStatus)}
        />
      ),
    },
    {
      id: 'progressPercent',
      label: 'Progress',
      minWidth: 180,
      render: (value) => (
        <Stack spacing={0.5}>
          <LinearProgress variant="determinate" value={Number(value)} sx={{ minWidth: 120 }} />
          <Typography variant="caption">{Number(value)}%</Typography>
        </Stack>
      ),
    },
    {
      id: 'divisionName',
      label: 'Division',
      minWidth: 120,
      render: (value) => String(value || 'Not assigned'),
    },
    {
      id: 'assignedToUserName',
      label: 'Owner',
      minWidth: 150,
      render: (value) => String(value || 'Unassigned'),
    },
    {
      id: 'primaryBlocker',
      label: 'Next action / blocker',
      minWidth: 210,
      render: (value) => String(value || 'No blockers'),
    },
    {
      id: 'isOverdue',
      label: 'SLA',
      minWidth: 110,
      render: (value, row) => (
        <Stack spacing={0.25}>
          <Chip
            size="small"
            color={value ? 'error' : 'default'}
            label={value ? 'Overdue' : 'On track'}
          />
          <Typography variant="caption">
            Due {new Date((row as StudentOnboardingCase).dueAt).toLocaleString()}
          </Typography>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Student Onboarding"
        description="Complete profile readiness, placement, identifiers, and activation after Admissions has finalized the Student identity."
        links={[{ name: 'Students', href: '/student/dashboard' }, { name: 'Student Onboarding' }]}
        sx={{ mb: 2 }}
      />
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Unable to load onboarding cases.
        </Alert>
      )}
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
        <Chip label={`Active ${analytics.data?.activeCases ?? 0}`} color="primary" variant="outlined" />
        <Chip label={`Ready ${analytics.data?.readyForActivation ?? 0}`} color="success" variant="outlined" />
        <Chip label={`Needs attention ${analytics.data?.needsAttention ?? 0}`} color="warning" variant="outlined" />
        <Chip label={`Overdue ${analytics.data?.overdue ?? 0}`} color="error" variant="outlined" />
        <Chip label={`Completed ${analytics.data?.completed ?? 0}`} variant="outlined" />
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 1 }}>
        <TextField
          size="small"
          label="Search student or application"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          sx={{ minWidth: 190 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {Object.entries({
            0: 'Pending',
            1: 'In progress',
            2: 'Ready for activation',
            3: 'Needs attention',
            4: 'Completed',
            5: 'Cancelled',
          }).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Academic year"
          value={academicYearId}
          onChange={(event) => setAcademicYearId(event.target.value)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">All academic years</MenuItem>
          {(filterOptions.data?.academicYears ?? []).map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Standard"
          value={standardId}
          onChange={(event) => setStandardId(event.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All standards</MenuItem>
          {(filterOptions.data?.standards ?? []).map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Owner"
          value={ownerFilter}
          onChange={(event) => setOwnerFilter(event.target.value as 'all' | 'mine' | 'unassigned')}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All owners</MenuItem>
          <MenuItem value="mine" disabled={!currentUserId}>
            Assigned to me
          </MenuItem>
          <MenuItem value="unassigned">Unassigned</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="SLA"
          value={overdueOnly ? 'overdue' : 'all'}
          onChange={(event) => setOverdueOnly(event.target.value === 'overdue')}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="overdue">Overdue only</MenuItem>
        </TextField>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="student-onboarding-queue"
          tableTitle="Onboarding queue"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={columns}
          data={query.data?.items ?? []}
          isLoading={query.isLoading}
          isPagination
          isSearch={false}
        />
      </Box>
    </Box>
  );
}
