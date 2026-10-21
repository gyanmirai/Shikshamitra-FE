'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionPipelineItem } from 'src/redux/student/admissions/admission-pipeline-api';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { studentPaths } from 'src/constants/student-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Alert, Button, LinearProgress } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { academicClassFilterInput } from 'src/utils/student-academic-filter-query';
import {
  useGetAdmissionPipelineQuery,
  useGetAdmissionPipelineOptionsQuery,
} from 'src/redux/student/admissions/admission-pipeline-api';

import { AdmissionQueryError } from './admission-query-error';
import { BulkPipelineCounsellor } from './pipeline/bulk-pipeline-counsellor';
import AdmissionApplicationDetailScreen from './admission-application-detail';
import { useBulkPipelineCounsellor } from './pipeline/use-bulk-pipeline-counsellor';
import { buildAdmissionPipelineColumns } from './pipeline/admission-pipeline-columns';
import { ADMISSION_APPLICATION_PERMISSIONS } from './admission-application-permissions';
import { AdmissionPipelineMoreFilters } from './pipeline/admission-pipeline-more-filters';
import {
  AdmissionAcademicFilters,
  useAdmissionAcademicFilters,
} from './admission-academic-filters';
import {
  admissionPipelineUrl,
  readAdmissionPipelineState,
  admissionPipelineApplicationUrl,
} from './pipeline/admission-pipeline-state';

const EMPTY_PIPELINE_ROWS: AdmissionPipelineItem[] = [];

export default function AdmissionInquiryPipelineScreen() {
  const academic = useAdmissionAcademicFilters();
  const router = useRouter();
  const params = useSearchParams();
  const applicationId = params.get('application');
  const worklistRef = useRef<HTMLDivElement>(null);
  const previousApplication = useRef(applicationId);
  const restoreApplicationFocus = useRef<string | null>(null);
  const state = readAdmissionPipelineState(params);
  const permissions = useSelector((value: RootState) => value.auth.permissions);
  const tenantId = useSelector((value: RootState) => value.auth.sessionContext?.tenantId);
  const userId = useSelector((value: RootState) => value.auth.user?.sub);
  const canView = hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.view);
  const canAssign =
    canView && hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage);
  const interactionLocked = useRef(false);
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
  const [scopeLoading, setScopeLoading] = useState(true);
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
  useEffect(() => {
    if (previousApplication.current && !applicationId)
      restoreApplicationFocus.current = previousApplication.current;
    previousApplication.current = applicationId;
    if (applicationId || !restoreApplicationFocus.current || listQuery.isFetching || scopeLoading)
      return undefined;
    const frame = requestAnimationFrame(() => {
      const row = Array.from(
        worklistRef.current?.querySelectorAll<HTMLElement>('[data-application-id]') ?? []
      ).find((element) => element.dataset.applicationId === restoreApplicationFocus.current);
      const target =
        row?.querySelector<HTMLElement>('a') ??
        row ??
        worklistRef.current?.querySelector<HTMLElement>('[aria-label="Search Pipeline"]');
      target?.focus();
      restoreApplicationFocus.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [applicationId, listQuery.isFetching, scopeLoading, data]);
  const options = optionsQuery.currentData;
  const myCases = state.myCases ?? options?.defaultMyCases;
  const queryBusy =
    skip ||
    listQuery.isFetching ||
    listQuery.isError ||
    optionsQuery.isFetching ||
    optionsQuery.isError ||
    !data ||
    !options;
  const bulk = useBulkPipelineCounsellor({
    rows: data?.items ?? EMPTY_PIPELINE_ROWS,
    scopeKey: JSON.stringify([tenantId, userId, academicInput, params.toString(), myCases]),
    canAssign: canAssign && !applicationId,
    disabled: queryBusy,
  });
  interactionLocked.current = bulk.busy;
  const updateInteractive = useCallback(
    (changes: Record<string, string | undefined>, resetPage = true) => {
      if (!interactionLocked.current) update(changes, resetPage);
    },
    [update]
  );
  const { update: changeAcademic } = academic;
  const updateAcademic = useCallback(
    (...changes: Parameters<typeof changeAcademic>) => {
      if (!interactionLocked.current) changeAcademic(...changes);
    },
    [changeAcademic]
  );
  const applicationUrl = useCallback(
    (id: string) => admissionPipelineApplicationUrl(id, new URLSearchParams(params.toString())),
    [params]
  );
  const openWorkspace = useCallback(
    (id: string) => {
      if (canView && !interactionLocked.current) router.push(applicationUrl(id), { scroll: false });
    },
    [canView, applicationUrl, router]
  );
  const columns = useMemo(
    () =>
      buildAdmissionPipelineColumns(
        applicationUrl,
        openWorkspace,
        canAssign
          ? {
              selectedIds: bulk.selectedIds,
              eligibleIds: bulk.eligibleIds,
              disabled: queryBusy || bulk.busy,
              onToggle: bulk.toggleSelection,
              onToggleAll: bulk.toggleAll,
            }
          : undefined
      ),
    [
      applicationUrl,
      openWorkspace,
      canAssign,
      bulk.selectedIds,
      bulk.eligibleIds,
      bulk.busy,
      bulk.toggleSelection,
      bulk.toggleAll,
      queryBusy,
    ]
  );
  useEffect(() => {
    if (applicationId) return;
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
  }, [
    applicationId,
    academic.academicYearId,
    data,
    listQuery.isFetching,
    state.page,
    state.rowsPerPage,
    update,
  ]);
  const openApplication = (row: AdmissionPipelineItem) => {
    openWorkspace(row.id);
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
    <Box
      ref={worklistRef}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}
    >
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
              disabled={bulk.busy}
              variant="outlined"
            >
              Open Applications
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
            onLoadingChange={setScopeLoading}
            boardId={academic.boardId}
            mediumId={academic.mediumId}
            standardId={academic.standardId}
            onChange={updateAcademic}
            disabled={bulk.busy}
            filterAction={
              <AdmissionPipelineMoreFilters
                key={JSON.stringify([tenantId, userId, academicInput])}
                values={state}
                options={options}
                isLoading={optionsQuery.isFetching}
                isError={optionsQuery.isError}
                disabled={bulk.busy || skip}
                onRetry={() => {
                  if (!skip && !interactionLocked.current) optionsQuery.refetch();
                }}
                onApply={updateInteractive}
              />
            }
          />
          <BulkPipelineCounsellor assignment={bulk} disabled={queryBusy || !canAssign} />
          {listQuery.isError || optionsQuery.isError ? (
            <AdmissionQueryError
              onRetry={() => {
                if (!skip && !interactionLocked.current) {
                  listQuery.refetch();
                  optionsQuery.refetch();
                }
              }}
            />
          ) : (
            <Box
              inert={bulk.busy || undefined}
              sx={{
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {data && listQuery.isFetching && !scopeLoading && !skip && (
                <LinearProgress aria-label="Refreshing Pipeline" />
              )}
              <CustomizableTable
                tableId="admission-application-pipeline"
                tableTitle="Active admissions"
                exportLabel="Export current page"
                wrapperProps={{ sx: { height: 1 } }}
                tableContainerProps={{ sx: { height: 1 } }}
                columns={columns}
                data={skip || scopeLoading ? [] : (data?.items ?? [])}
                isLoading={scopeLoading || (!skip && (listQuery.isLoading || !data))}
                serverSidePagination
                serverSideSearch
                serverSideSort
                serverSideSortMode="single"
                isFilter
                searchTerm={state.search}
                sorts={state.sorts}
                totalCount={data?.totalCount ?? 0}
                onServerSearch={(search) => updateInteractive({ search: search || undefined })}
                onServerSort={(_, sorts) =>
                  updateInteractive({ sort: sorts[0]?.column, direction: sorts[0]?.direction })
                }
                page={state.page}
                rowsPerPage={state.rowsPerPage}
                defaultRowsPerPage={25}
                rowsPerPageOptions={[10, 25, 100]}
                isPagination
                onServerPagination={(page, size) =>
                  updateInteractive(
                    { page: String(page), size: String(size) },
                    size !== state.rowsPerPage
                  )
                }
                handleRowClick={(row) => openApplication(row as AdmissionPipelineItem)}
                rowProps={(row) => ({
                  tabIndex: 0,
                  role: 'link',
                  'data-application-id': row.id,
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
                  sx: {
                    cursor: 'pointer',
                    '& > .MuiTableCell-sizeSmall': { py: 0.5 },
                    '& > .MuiTableCell-sizeMedium': { py: 1.5 },
                  },
                })}
                searchFieldProps={{
                  placeholder: 'Search applicant, application, inquiry or phone',
                  inputProps: { 'aria-label': 'Search Pipeline' },
                }}
                noDataText={
                  !academic.academicYearId
                    ? 'Select an academic year to view Pipeline'
                    : !academic.boardId || !academic.mediumId
                      ? 'Select an available Board and Medium to view Pipeline'
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
      {canView && applicationId && (
        <AdmissionApplicationDetailScreen
          key={applicationId}
          applicationId={applicationId}
          presentation="drawer"
          onClose={() => update({ application: undefined }, false)}
        />
      )}
    </Box>
  );
}
