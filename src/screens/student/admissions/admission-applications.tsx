'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import NextLink from 'next/link';
import { useState } from 'react';
import { Box, Stack, MenuItem, TextField } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  type AdmissionApplication,
  useGetAdmissionApplicationsQuery,
} from 'src/redux/student/admissions/admission-applications-api';

import { AdmissionQueryError } from './admission-query-error';
import { getAdmissionApplicationStatusLabel } from './application-status';

type AdmissionApplicationsView = 'applications' | 'pipeline';

export default function AdmissionApplicationsScreen({
  view = 'applications',
}: {
  view?: AdmissionApplicationsView;
}) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [stageSearch, setStageSearch] = useState('');
  const { data, isLoading, isError, refetch } = useGetAdmissionApplicationsQuery({
    maxResultCount: 100,
    skipCount: 0,
    search: search || undefined,
    status: status === '' ? undefined : (Number(status) as AdmissionApplication['status']),
    currentStageSearch: stageSearch || undefined,
  });
  const columns: IColumn[] = [
    {
      id: 'applicationNumber',
      label: 'Application',
      minWidth: 180,
      render: (value, row) => (
        <NextLink href={`/student/admissions/applications/${(row as AdmissionApplication).id}`}>
          {String(value)}
        </NextLink>
      ),
    },
    {
      id: 'applicantName',
      label: 'Applicant',
      minWidth: 220,
      render: (value, row) => (
        <NextLink
          href={`/student/admissions/applicants/${(row as AdmissionApplication).applicantId}`}
        >
          {String(value || (row as AdmissionApplication).applicantId)}
        </NextLink>
      ),
    },
    { id: 'offeringCode', label: 'Offering', minWidth: 180 },
    { id: 'currentStageName', label: 'Current stage', minWidth: 180 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      render: (value) => getAdmissionApplicationStatusLabel(Number(value)),
    },
    { id: 'lastSavedAt', label: 'Last saved', minWidth: 180 },
  ];
  const isPipeline = view === 'pipeline';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading={isPipeline ? 'Pipeline' : 'Applications'}
        description={
          isPipeline
            ? 'Track applicants through their current admission stage and continue applicant work.'
            : 'Find applications, review their current stage, and continue applicant work.'
        }
        links={[
          { name: 'Students', href: '/student' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: isPipeline ? 'Pipeline' : 'Applications' },
        ]}
        sx={{ mb: 3 }}
      />
      {isError && (
        <AdmissionQueryError
          onRetry={() => {
            refetch();
          }}
        />
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
        <TextField
          size="small"
          label="Search application or applicant"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="0">Draft</MenuItem>
          <MenuItem value="1">Submitted</MenuItem>
          <MenuItem value="2">Withdrawn</MenuItem>
          <MenuItem value="3">Rejected</MenuItem>
          <MenuItem value="4">In review</MenuItem>
          <MenuItem value="5">Waitlisted</MenuItem>
          <MenuItem value="6">Approved</MenuItem>
          <MenuItem value="7">Offer issued</MenuItem>
          <MenuItem value="8">Offer accepted</MenuItem>
          <MenuItem value="9">Offer declined</MenuItem>
          <MenuItem value="10">Enrolled</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Current stage"
          value={stageSearch}
          onChange={(event) => setStageSearch(event.target.value)}
        />
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="admission-applications"
          tableTitle={isPipeline ? 'Admission pipeline' : 'Admission applications'}
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={columns}
          data={(data?.items ?? []) as AdmissionApplication[]}
          isLoading={isLoading}
          isPagination
          isSearch={false}
        />
      </Box>
    </Box>
  );
}
