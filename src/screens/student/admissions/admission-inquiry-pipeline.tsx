'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionPipelineItem } from 'src/redux/student/admissions/admission-pipeline-api';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { Box, Paper, Alert, Button } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRef, useMemo, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { academicClassFilterInput } from 'src/utils/student-academic-filter-query';
import {
  useGetAdmissionPipelineQuery,
  useGetAdmissionPipelineOptionsQuery,
} from 'src/redux/student/admissions/admission-pipeline-api';

import { AdmissionQueryError } from './admission-query-error';
import { getAdmissionApplicationStatusLabel } from './application-status';
import AdmissionApplicationDetailScreen from './admission-application-detail';
import { buildAdmissionPipelineColumns } from './pipeline/admission-pipeline-columns';
import { ADMISSION_APPLICATION_PERMISSIONS } from './admission-application-permissions';
import {
  AdmissionAcademicFilters,
  useAdmissionAcademicFilters,
} from './admission-academic-filters';
import {
  admissionPipelineUrl,
  PIPELINE_ACTIVE_STATUSES,
  readAdmissionPipelineState,
  admissionPipelineApplicationUrl,
} from './pipeline/admission-pipeline-state';

const ALL = '__all__';

export default function AdmissionInquiryPipelineScreen() {
  const academic = useAdmissionAcademicFilters();
  const router = useRouter();
  const params = useSearchParams();
  const state = readAdmissionPipelineState(params);
  const permissions = useSelector((value: RootState) => value.auth.permissions);
  const canView = hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.view);
  const update = useCallback(
    (changes: Record<string, string | undefined>, resetPage = true) => {
      router.replace(
        admissionPipelineUrl(new URLSearchParams(params.toString()), changes, resetPage),
        { scroll: false }
      );
    },
    [params, router]
  );
  const previousYear = useRef(academic.academicYearId);
  const academicInput = {
    academicYearId: academic.academicYearId ?? '',
    boardId: academic.boardId || undefined,
    mediumId: academic.mediumId || undefined,
    ...academicClassFilterInput(academic.standardId),
  };
  const skip = !canView || !academic.academicYearId || !academic.boardId || !academic.mediumId;
  const optionsQuery = useGetAdmissionPipelineOptionsQuery(academicInput, {
    skip,
    refetchOnMountOrArgChange: true,
  });
  const listQuery = useGetAdmissionPipelineQuery(
    {
      ...academicInput,
      myCases: state.myCases,
      assignedCounsellorId: state.assignedCounsellorId,
      currentStageCode: state.currentStageCode,
      status: state.status,
      search: state.search || undefined,
      skipCount: state.page * state.rowsPerPage,
      maxResultCount: state.rowsPerPage,
      sorting: state.sorts[0] ? `${state.sorts[0].column} ${state.sorts[0].direction}` : undefined,
    },
    { skip, refetchOnMountOrArgChange: true }
  );
  const data = listQuery.currentData;
  const options = optionsQuery.currentData;
  const myCases = state.myCases ?? options?.defaultMyCases;
  const applicationUrl = useCallback(
    (id: string) => admissionPipelineApplicationUrl(id, new URLSearchParams(params.toString())),
    [params]
  );
  const openDrawer = useCallback(
    (id: string) => {
      if (canView)
        router.push(
          admissionPipelineUrl(new URLSearchParams(params.toString()), { application: id }, false),
          { scroll: false }
        );
    },
    [canView, params, router]
  );
  const columns = useMemo(
    () => buildAdmissionPipelineColumns(applicationUrl, openDrawer),
    [applicationUrl, openDrawer]
  );
  useEffect(() => {
    if (previousYear.current !== academic.academicYearId) {
      previousYear.current = academic.academicYearId;
      update({
        board: undefined,
        medium: undefined,
        class: undefined,
        counsellor: undefined,
        stage: undefined,
      });
      return;
    }
    if (
      data &&
      !listQuery.isFetching &&
      state.page > 0 &&
      state.page * state.rowsPerPage >= data.totalCount
    )
      update({ page: String(Math.max(1, Math.ceil(data.totalCount / state.rowsPerPage))) }, false);
  }, [academic.academicYearId, data, listQuery.isFetching, state.page, state.rowsPerPage, update]);
  const openApplication = (row: AdmissionPipelineItem) => {
    openDrawer(row.id);
  };
  const hasFilters = Boolean(
    state.search ||
    state.assignedCounsellorId ||
    state.currentStageCode ||
    state.status !== undefined ||
    academic.boardId ||
    academic.mediumId ||
    academic.standardId
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Pipeline"
        description="Continue active admissions and follow up with families."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Pipeline' },
        ]}
        slotProps={{
          action: {},
          heading: {},
          moreLink: {},
          breadcrumbs: { display: { xs: 'none', md: 'flex' } },
        }}
        action={
          canView && (
            <Button
              size="small"
              component={Link}
              href={studentPaths.enrollment.applications}
              variant="outlined"
            >
              View all applications
            </Button>
          )
        }
      />
      {!canView ? (
        <Alert severity="warning">
          Application viewing permission is required to access Pipeline.
        </Alert>
      ) : (
        <>
          <AdmissionAcademicFilters
            boardId={academic.boardId}
            mediumId={academic.mediumId}
            standardId={academic.standardId}
            onChange={academic.update}
            onClear={academic.clear}
          />
          {academic.academicYearId && (
            <Paper variant="outlined" sx={{ p: 1, flexShrink: 0 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: 1,
                }}
              >
                <CustomSelect
                  fullWidth
                  label="Cases"
                  value={myCases === undefined ? '' : myCases ? 'my' : 'all'}
                  options={[
                    { label: 'My active cases', value: 'my' },
                    { label: 'All authorized active cases', value: 'all' },
                  ]}
                  isLoading={optionsQuery.isFetching && !options}
                  disabled={!options}
                  onChange={(value) => update({ queue: String(value), counsellor: undefined })}
                />
                <CustomSelect
                  fullWidth
                  label="Counsellor"
                  value={state.assignedCounsellorId ?? ALL}
                  disabled={!options || myCases !== false}
                  options={[
                    { label: 'All counsellors', value: ALL },
                    ...(options?.counsellors ?? []).map((item) => ({
                      label: item.name,
                      value: item.id,
                    })),
                  ]}
                  isSearch
                  onChange={(value) =>
                    update({ counsellor: value === ALL ? undefined : String(value) })
                  }
                />
                <CustomSelect
                  fullWidth
                  label="Current step"
                  value={state.currentStageCode ?? ALL}
                  disabled={!options}
                  options={[
                    { label: 'All steps', value: ALL },
                    ...(options?.stages ?? []).map((item) => ({
                      label: item.name,
                      value: item.code,
                    })),
                  ]}
                  isSearch
                  onChange={(value) => update({ stage: value === ALL ? undefined : String(value) })}
                />
                <CustomSelect
                  fullWidth
                  label="Status"
                  value={state.status === undefined ? ALL : String(state.status)}
                  options={[
                    { label: 'All active statuses', value: ALL },
                    ...PIPELINE_ACTIVE_STATUSES.map((value) => ({
                      label: getAdmissionApplicationStatusLabel(value),
                      value: String(value),
                    })),
                  ]}
                  onChange={(value) =>
                    update({ status: value === ALL ? undefined : String(value) })
                  }
                />
                {hasFilters && (
                  <Button
                    sx={{ flexShrink: 0 }}
                    onClick={() =>
                      update({
                        search: undefined,
                        counsellor: undefined,
                        stage: undefined,
                        status: undefined,
                        board: undefined,
                        medium: undefined,
                        class: undefined,
                      })
                    }
                  >
                    Clear filters
                  </Button>
                )}
              </Box>
            </Paper>
          )}
          {listQuery.isError || optionsQuery.isError ? (
            <AdmissionQueryError
              onRetry={() => {
                if (!skip) {
                  listQuery.refetch();
                  optionsQuery.refetch();
                }
              }}
            />
          ) : (
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <CustomizableTable
                tableId="admission-application-pipeline"
                tableTitle="Active admissions"
                exportLabel="Export current page"
                wrapperProps={{ sx: { height: 1 } }}
                tableContainerProps={{ sx: { height: 1 } }}
                columns={columns}
                data={data?.items ?? []}
                isLoading={!skip && (listQuery.isLoading || listQuery.isFetching)}
                serverSidePagination
                serverSideSearch
                serverSideSort
                serverSideSortMode="single"
                isFilter
                searchTerm={state.search}
                sorts={state.sorts}
                totalCount={data?.totalCount ?? 0}
                onServerSearch={(search) => update({ search: search || undefined })}
                onServerSort={(_, sorts) =>
                  update({ sort: sorts[0]?.column, direction: sorts[0]?.direction })
                }
                page={state.page}
                rowsPerPage={state.rowsPerPage}
                defaultRowsPerPage={25}
                rowsPerPageOptions={[10, 25, 100]}
                isPagination
                onServerPagination={(page, size) =>
                  update({ page: String(page), size: String(size) }, size !== state.rowsPerPage)
                }
                handleRowClick={(row) => openApplication(row as AdmissionPipelineItem)}
                rowProps={(row) => ({
                  tabIndex: 0,
                  role: 'link',
                  'aria-label': `Continue ${row.applicationNumber}`,
                  onKeyDown: (event) => {
                    if (
                      event.target === event.currentTarget &&
                      (event.key === 'Enter' || event.key === ' ')
                    ) {
                      event.preventDefault();
                      openApplication(row as AdmissionPipelineItem);
                    }
                  },
                  sx: { cursor: 'pointer' },
                })}
                searchFieldProps={{
                  placeholder: 'Search applicant, application, inquiry or phone',
                  inputProps: { 'aria-label': 'Search Pipeline' },
                }}
                noDataText={
                  !academic.academicYearId
                    ? 'Select an academic year to view Pipeline'
                    : hasFilters
                      ? 'No active admissions match these filters'
                      : myCases
                        ? 'You have no active admission cases'
                        : 'No active admissions. Move an Interested inquiry to the next stage to start.'
                }
              />
            </Box>
          )}
        </>
      )}
      {canView && params.get('application') && (
        <AdmissionApplicationDetailScreen
          key={params.get('application')}
          applicationId={params.get('application')!}
          onClose={() =>
            router.replace(
              admissionPipelineUrl(
                new URLSearchParams(params.toString()),
                { application: undefined },
                false
              ),
              { scroll: false }
            )
          }
        />
      )}
    </Box>
  );
}
