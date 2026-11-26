'use client';

import type { RootState, AppDispatch } from 'src/redux/store';
import type { AdmissionPipelineItem } from 'src/redux/student/admissions/admission-pipeline-api';

import Link from 'next/link';
import { Box, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { studentPaths } from 'src/constants/student-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { usePendingNavigation } from 'src/hooks/use-pending-navigation';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { academicClassFilterInput } from 'src/utils/student-academic-filter-query';
import {
  useGetAdmissionPipelineQuery,
  useGetAdmissionPipelineOptionsQuery,
} from 'src/redux/student/admissions/admission-pipeline-api';

import { ADMISSION_PAGE_SIZES } from './admission-page-sizes';
import { AdmissionQueryError } from './admission-query-error';
import { getAdmissionApplicationStatusLabel } from './application-status';
import AdmissionApplicationDetailScreen from './admission-application-detail';
import { serializeQueueColumnFilters } from './admission-queue-column-filters';
import { buildAdmissionPipelineColumns } from './pipeline/admission-pipeline-columns';
import { ADMISSION_APPLICATION_PERMISSIONS } from './admission-application-permissions';
import { AdmissionPipelineMoreFilters } from './pipeline/admission-pipeline-more-filters';
import { loadApplicationRuntimeForm } from './application-detail/application-workspace-panels';
import { preloadAdmissionApplication } from './application-detail/preload-admission-application';
import { AdmissionApplicationPrintDialog } from './form-print/admission-application-print-dialog';
import {
  AdmissionAcademicFilters,
  useAdmissionAcademicFilters,
} from './admission-academic-filters';
import {
  admissionPipelineUrl,
  readAdmissionPipelineState,
  admissionPipelineApplicationUrl,
} from './pipeline/admission-pipeline-state';

export default function AdmissionInquiryPipelineScreen() {
  const academic = useAdmissionAcademicFilters();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { pendingKey, isPending, navigate } = usePendingNavigation(router.push);
  const params = useSearchParams();
  const applicationId = params.get('application');
  const openAssessmentBooking = params.get('assessment') === 'book';
  const [printApplicationId, setPrintApplicationId] = useState<string | null>(null);
  const worklistRef = useRef<HTMLDivElement>(null);
  const previousApplication = useRef(applicationId);
  const restoreApplicationFocus = useRef<string | null>(null);
  const state = readAdmissionPipelineState(params);
  const permissions = useSelector((value: RootState) => value.auth.permissions);
  const tenantId = useSelector((value: RootState) => value.auth.sessionContext?.tenantId);
  const userId = useSelector((value: RootState) => value.auth.user?.sub);
  const canView = hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.view);
  const interactionLocked = useRef(false);
  interactionLocked.current = isPending;
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
  const yearChanging = previousYear.current !== academic.academicYearId;
  const skip =
    scopeLoading ||
    yearChanging ||
    !canView ||
    !academic.academicYearId ||
    !academic.boardId ||
    !academic.mediumId;
  const optionsQuery = useGetAdmissionPipelineOptionsQuery(academicInput, {
    skip,
    refetchOnMountOrArgChange: true,
  });
  const listFilters = {
    ...academicInput,
    myCases: false,
    currentStageCode: state.currentStageCode,
    status: state.status,
    columnFilters: serializeQueueColumnFilters(state.filters, 'pipeline') || undefined,
    search: state.search || undefined,
    maxResultCount: state.rowsPerPage,
  };
  const sorting = state.sorts[0]
    ? `${state.sorts[0].column} ${state.sorts[0].direction}`
    : undefined;
  const listQuery = useGetAdmissionPipelineQuery(
    {
      ...listFilters,
      skipCount: state.page * state.rowsPerPage,
      sorting,
    },
    { skip, refetchOnMountOrArgChange: true }
  );
  const data = listQuery.currentData;
  const listScope = JSON.stringify([tenantId, userId, listFilters]);
  const lastList = useRef<
    | {
        scope: string;
        sorting: string | undefined;
        page: number;
        data: NonNullable<typeof data>;
      }
    | undefined
  >(undefined);
  useEffect(() => {
    if (skip) lastList.current = undefined;
    else if (data) lastList.current = { scope: listScope, sorting, page: state.page, data };
  }, [data, listScope, skip, sorting, state.page]);
  const previousList = lastList.current;
  // A sort can reset the page. Retain the prior rows only within the same authorized filter scope.
  const displayData =
    data ??
    (!skip &&
    previousList?.scope === listScope &&
    previousList.sorting !== sorting &&
    (previousList.page === state.page || state.page === 0)
      ? previousList.data
      : undefined);
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
  const myCases = false;
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
    (id: string, assessmentAction?: 'book') =>
      admissionPipelineApplicationUrl(id, new URLSearchParams(params.toString()), assessmentAction),
    [params]
  );
  const openWorkspace = useCallback(
    (id: string, assessmentAction?: 'book') => {
      if (canView && !interactionLocked.current) {
        preloadAdmissionApplication(dispatch, id);
        // The list is only a code-loading hint; the server workflow still owns routing/access.
        if (displayData?.items.find((row) => row.id === id)?.stageType === 1)
          loadApplicationRuntimeForm().catch(() => undefined);
        navigate(id, applicationUrl(id, assessmentAction), { scroll: false });
      }
    },
    [canView, applicationUrl, displayData, dispatch, navigate]
  );
  const columns = useMemo(
    () =>
      buildAdmissionPipelineColumns(
        applicationUrl,
        openWorkspace,
        undefined,
        canView
          ? (id) => {
              if (!interactionLocked.current) setPrintApplicationId(id);
            }
          : undefined
      ),
    [applicationUrl, openWorkspace, canView]
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
    state.filters.length ||
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
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: 1,
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <CustomBreadcrumbs
        heading="Pipeline"
        description="Continue Active Admissions and Follow Up with Families."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Pipeline' },
        ]}
        slotProps={{
          action: { alignSelf: { xs: 'flex-end', md: 'center' }, maxWidth: '100%' },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
        }}
        action={
          canView && (
            <Button
              size="small"
              component={Link}
              href={studentPaths.enrollment.applications}

              variant="outlined"
            >
              Open Applications
            </Button>
          )
        }
      />
      {!canView ? (
        <StudentFeedback notificationKey="STU-0085" presentation="persistent" severity="warning">
          Application viewing permission is required to access Pipeline.
        </StudentFeedback>
      ) : (
        <>
          <AdmissionAcademicFilters
            matchSelectHeights
            onLoadingChange={setScopeLoading}
            boardId={academic.boardId}
            mediumId={academic.mediumId}
            standardId={academic.standardId}
            onChange={updateAcademic}

            filterAction={
              <AdmissionPipelineMoreFilters
                key={JSON.stringify([tenantId, userId, academicInput])}
                values={state}
                options={options}
                isLoading={optionsQuery.isFetching}
                isError={optionsQuery.isError}
                disabled={skip}
                onRetry={() => {
                  if (!skip && !interactionLocked.current) optionsQuery.refetch();
                }}
                onApply={updateInteractive}
              />
            }
          />
          {((listQuery.isError && Boolean(displayData?.items.length)) || optionsQuery.isError) &&
            !skip &&
            !scopeLoading && (
              <AdmissionQueryError
                onRetry={() => {
                  if (!skip && !interactionLocked.current) {
                    listQuery.refetch();
                    optionsQuery.refetch();
                  }
                }}
              />
            )}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CustomizableTable
              tableId="admission-application-pipeline"
              tableTitle="Active Admissions"
              exportLabel="Export"
              wrapperProps={{
                sx: {
                  height: 1,
                  flex: 1,
                  minHeight: 0,
                  minWidth: 0,
                  '& .MuiLinearProgress-root': {
                    height: 2,
                    bgcolor: 'transparent',
                    '& .MuiLinearProgress-bar': { bgcolor: 'text.disabled' },
                  },
                },
              }}
              tableContainerProps={{ sx: { height: 1 } }}
              columns={columns}
              data={skip ? [] : (displayData?.items ?? [])}
              isLoading={
                yearChanging ||
                scopeLoading ||
                (!skip && !listQuery.isError && !displayData)
              }
              isRefreshing={
                Boolean(displayData) && listQuery.isFetching && !skip && !applicationId
              }
              errorContent={
                listQuery.isError && !skip && !displayData?.items.length ? (
                  <AdmissionQueryError
                    onRetry={() => {
                      listQuery.refetch();
                      optionsQuery.refetch();
                    }}
                  />
                ) : undefined
              }
              onClearCriteria={() =>
                updateInteractive({ search: undefined, filters: undefined, status: undefined })
              }
              serverSideFilter
              filters={[
                ...state.filters,
                ...(state.status !== undefined
                  ? [
                      {
                        column: 'status',
                        type: 'equals',
                        value: state.status,
                        valueType: 'enum',
                        label: 'Status',
                        displayValue: getAdmissionApplicationStatusLabel(state.status),
                      },
                    ]
                  : []),
              ]}
              onServerFilter={(filters) =>
                updateInteractive({
                  filters: serializeQueueColumnFilters(filters, 'pipeline', false) || undefined,
                  status: filters.find((filter) => filter.column === 'status')?.value?.toString(),
                })
              }
              serverSidePagination
              serverSideSearch
              serverSideSort
              serverSideSortMode="single"
              isFilter
              searchTerm={state.search}
              sorts={state.sorts}
              totalCount={skip ? 0 : (displayData?.totalCount ?? 0)}
              onServerSearch={(search) => updateInteractive({ search: search || undefined })}
              onServerSort={(_, sorts) =>
                updateInteractive({ sort: sorts[0]?.column, direction: sorts[0]?.direction })
              }
              page={state.page}
              rowsPerPage={state.rowsPerPage}
              defaultRowsPerPage={25}
              rowsPerPageOptions={ADMISSION_PAGE_SIZES}
              isPagination
              onServerPagination={(page, size) =>
                updateInteractive(
                  { page: String(page), size: String(size) },
                  size !== state.rowsPerPage
                )
              }
              handleRowClick={(row) => openApplication(row as AdmissionPipelineItem)}
              getRowAction={(row) => ({
                label: `Continue ${row.applicationNumber}`,
                onClick: () => openApplication(row as AdmissionPipelineItem),
                disabled: isPending,
                pending: pendingKey === row.id,
              })}
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
                placeholder: 'Search name, number or phone',
                inputProps: { 'aria-label': 'Search Pipeline' },
              }}
              noDataText={
                !academic.academicYearId
                  ? 'Select an Academic Year to View Pipeline'
                  : !academic.boardId || !academic.mediumId
                    ? 'Select an Available Board and Medium to View Pipeline'
                    : hasFilters
                      ? 'No Active Admissions Match These Filters'
                      : myCases
                        ? 'You Have No Active Admission Cases'
                        : 'No Active Admissions. Move an Interested Inquiry to the Next Stage to Start.'
              }
            />
          </Box>
        </>
      )}
      {canView && printApplicationId && (
        <AdmissionApplicationPrintDialog
          key={printApplicationId}
          applicationId={printApplicationId}
          initialMode="auto"
          onClose={() => setPrintApplicationId(null)}
        />
      )}
      {canView && applicationId && (
        <AdmissionApplicationDetailScreen
          key={applicationId}
          applicationId={applicationId}
          presentation="drawer"
          openAssessmentBooking={openAssessmentBooking}
          onAssessmentBookingOpened={() => update({ assessment: undefined }, false)}
          onClose={() => update({ application: undefined, assessment: undefined }, false)}
        />
      )}
    </Box>
  );
}
