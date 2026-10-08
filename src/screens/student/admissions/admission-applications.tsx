'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import NextLink from 'next/link';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Stack, MenuItem, TextField } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  type AdmissionApplication,
  useGetAdmissionApplicationsQuery,
  useGetAdmissionApplicationCounsellorsQuery,
} from 'src/redux/student/admissions/admission-applications-api';

import { AdmissionQueryError } from './admission-query-error';
import { formatAdmissionReference } from './admission-reference';
import { getAdmissionApplicationStatusLabel } from './application-status';
import { withAdmissionCounsellorFilter } from './admission-application-filters';
import AdmissionDirectRegistrationDialog from './admission-direct-registration-dialog';
import { ADMISSION_APPLICATION_PERMISSIONS } from './admission-application-permissions';
import {
  AdmissionAcademicFilters,
  useAdmissionAcademicFilters,
} from './admission-academic-filters';

type AdmissionApplicationsView = 'applications' | 'pipeline';

export default function AdmissionApplicationsScreen({
  view = 'applications',
}: {
  view?: AdmissionApplicationsView;
}) {
  const academic = useAdmissionAcademicFilters();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [stageSearch, setStageSearch] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const counsellorId = searchParams.get('counsellor') ?? '';
  const counsellors = useGetAdmissionApplicationCounsellorsQuery({});
  const {
    currentData: data,
    isLoading,
    isError,
    refetch,
  } = useGetAdmissionApplicationsQuery(
    {
      academicYearId: academic.academicYearId,
      boardId: academic.boardId || undefined,
      mediumId: academic.mediumId || undefined,
      standardId: academic.standardId || undefined,
      maxResultCount: 100,
      skipCount: 0,
      search: search || undefined,
      status: status === '' ? undefined : (Number(status) as AdmissionApplication['status']),
      currentStageSearch: stageSearch || undefined,
      assignedCounsellorId: counsellorId || undefined,
    },
    { skip: !academic.academicYearId }
  );
  const columns: IColumn[] = [
    {
      id: 'applicationNumber',
      label: 'Application',
      minWidth: 180,
      render: (value, row) => (
        <NextLink href={`/student/admissions/applications/${(row as AdmissionApplication).id}`}>
          {formatAdmissionReference(String(value))}
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
    {
      id: 'assignedCounsellorName',
      label: 'Journey counsellor',
      minWidth: 180,
      render: (value) => String(value || 'Unassigned'),
    },
    { id: 'currentStageName', label: 'Current stage', minWidth: 180 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      render: (value) => getAdmissionApplicationStatusLabel(Number(value)),
    },
    {
      id: 'lastSavedAt',
      label: 'Last saved',
      minWidth: 180,
      render: (value) => (value ? fDateTime(value) : '—'),
    },
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
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: isPipeline ? 'Pipeline' : 'Applications' },
        ]}
      />
      <AdmissionAcademicFilters
        boardId={academic.boardId}
        mediumId={academic.mediumId}
        standardId={academic.standardId}
        onClear={academic.clear}
        onChange={academic.update}
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
          <MenuItem value="10">Enrolled (legacy)</MenuItem>
          <MenuItem value="11">Admission finalized</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Current stage"
          value={stageSearch}
          onChange={(event) => setStageSearch(event.target.value)}
        />
        <TextField
          select
          size="small"
          label="Journey counsellor"
          value={counsellorId}
          onChange={(event) => {
            router.replace(
              `${pathname}${withAdmissionCounsellorFilter(
                searchParams.toString(),
                event.target.value
              )}`
            );
          }}
          sx={{ minWidth: 180 }}
          disabled={counsellors.isLoading || counsellors.isError}
          helperText={counsellors.isError ? 'Could not load counsellors.' : undefined}
        >
          <MenuItem value="">All counsellors</MenuItem>
          {(counsellors.data ?? []).map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name || item.userName}
            </MenuItem>
          ))}
        </TextField>
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
