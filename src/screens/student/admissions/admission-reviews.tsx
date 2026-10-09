'use client';

import { useState, useEffect } from 'react';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { academicClassFilterInput } from 'src/utils/student-academic-filter-query';
import { Box, Alert, Stack, Button, Checkbox, FormControlLabel } from '@mui/material';
import { useGetAdmissionReviewQueueQuery } from 'src/redux/student/admissions/admission-review-api';

import { AdmissionQueryError } from './admission-query-error';
import { ReviewQueueTable } from './review/review-queue-table';
import { useReviewPermissions } from './review/use-review-permissions';
import {
  AdmissionAcademicFilters,
  useAdmissionAcademicFilters,
} from './admission-academic-filters';

export default function AdmissionReviewsScreen() {
  const academic = useAdmissionAcademicFilters();
  const permissions = useReviewPermissions();
  const [filters, setFilters] = useState({ overdueOnly: false, assignedToMe: false });
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 20 });
  const query = useGetAdmissionReviewQueueQuery(
    {
      ...filters,
      academicYearId: academic.academicYearId,
      boardId: academic.boardId || undefined,
      mediumId: academic.mediumId || undefined,
      ...academicClassFilterInput(academic.standardId),
      skipCount: pagination.page * pagination.rowsPerPage,
      maxResultCount: pagination.rowsPerPage,
    },
    {
      skip:
        !permissions.view || !academic.academicYearId || !academic.boardId || !academic.mediumId,
    }
  );
  useEffect(() => {
    setPagination((current) => ({ ...current, page: 0 }));
  }, [academic.academicYearId, academic.boardId, academic.mediumId, academic.standardId]);
  const updateFilter = (name: keyof typeof filters, value: boolean) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPagination((current) => ({ ...current, page: 0 }));
  };
  if (!permissions.view)
    return <Alert severity="info">Review access is required to view this queue.</Alert>;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Application Reviews"
        description="Find assigned reviews, check deadlines and open the application to review its evidence."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Applications', href: studentPaths.enrollment.applications },
          { name: 'Application Reviews' },
        ]}
        action={
          <Button
            variant="outlined"
            disabled={query.isFetching || !academic.academicYearId}
            onClick={query.refetch}
          >
            Refresh
          </Button>
        }
      />
      <AdmissionAcademicFilters
        boardId={academic.boardId}
        mediumId={academic.mediumId}
        standardId={academic.standardId}
        onChange={academic.update}
        onClear={academic.clear}
      />
      <Stack direction="row" gap={2} flexWrap="wrap">
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.assignedToMe}
              onChange={(_, value) => updateFilter('assignedToMe', value)}
            />
          }
          label="Assigned to me"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.overdueOnly}
              onChange={(_, value) => updateFilter('overdueOnly', value)}
            />
          }
          label="Overdue only"
        />
      </Stack>
      {query.isError ? (
        <AdmissionQueryError onRetry={query.refetch} />
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <ReviewQueueTable
            items={query.currentData?.items ?? []}
            loading={query.isFetching}
            totalCount={query.currentData?.totalCount ?? 0}
            {...pagination}
            onPage={(page, rowsPerPage) => setPagination({ page, rowsPerPage })}
          />
        </Box>
      )}
    </Box>
  );
}
