'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionApplicationStatus } from 'src/redux/student/admissions/admission-applications-api';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Stack, Button } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { academicClassFilterInput } from 'src/utils/student-academic-filter-query';
import { useGetAdmissionApplicationsQuery } from 'src/redux/student/admissions/admission-applications-api';

import { AdmissionQueryError } from './admission-query-error';
import { getAdmissionApplicationStatusLabel } from './application-status';
import { serializeQueueColumnFilters } from './admission-queue-column-filters';
import AdmissionDirectRegistrationDialog from './admission-direct-registration-dialog';
import { ADMISSION_APPLICATION_PERMISSIONS } from './admission-application-permissions';
import { getApplicationWorkspaceUrl } from './application-detail/application-return-url';
import { buildAdmissionApplicationsColumns } from './applications/admission-applications-columns';
import { ApplicationWorkspaceRedirect } from './application-detail/application-workspace-redirect';
import {
  AdmissionAcademicFilters,
  useAdmissionAcademicFilters,
} from './admission-academic-filters';
import {
  admissionApplicationsUrl,
  readAdmissionApplicationsState,
} from './applications/admission-applications-state';

export default function AdmissionApplicationsScreen() {
  const academic = useAdmissionAcademicFilters();
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const activeApplications = params.get('dashboard') === 'active-applications';
  const pendingDecisions = params.get('dashboard') === 'admission-decisions';
  const applicationId = params.get('application');
  const state = readAdmissionApplicationsState(params);
  const permissions = useSelector((value: RootState) => value.auth.permissions);
  const canView = hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.view);
  // The backend Start capability aliases Applications.Add; keep that exact permission boundary.
  const canStart = hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage);
  const registration = useBoolean();
  const queryString = params.toString();
  const returnTo = admissionApplicationsUrl(
    pathname,
    new URLSearchParams(queryString),
    { application: undefined },
    false
  );
  const update = useCallback(
    (changes: Record<string, string | undefined>, resetPage = true) => {
      const url = admissionApplicationsUrl(
        pathname,
        new URLSearchParams(queryString),
        changes,
        resetPage
      );
      const currentUrl = queryString ? `${pathname}?${queryString}` : pathname;
      if (url !== currentUrl) router.replace(url, { scroll: false });
    },
    [pathname, queryString, router]
  );
  const previousYear = useRef(academic.academicYearId);
  const [scopeLoading, setScopeLoading] = useState(true);
  const yearChanging = previousYear.current !== academic.academicYearId;
  const skip =
    scopeLoading ||
    yearChanging ||
    Boolean(applicationId) ||
    !canView ||
    !academic.academicYearId ||
    (!academic.dashboardScope && (!academic.boardId || !academic.mediumId));
  const listQuery = useGetAdmissionApplicationsQuery(
    {
      academicYearId: academic.academicYearId,
      boardId: academic.boardId || undefined,
      mediumId: academic.mediumId || undefined,
      ...academicClassFilterInput(academic.standardId),
      status: state.status as AdmissionApplicationStatus | undefined,
      decisionWorkspaceOnly: !activeApplications,
      activeOnly: activeApplications || undefined,
      pendingDecisionOnly: pendingDecisions || undefined,
      divisionId: academic.dashboardScope ? params.get('division') || undefined : undefined,
      maxResultCount: state.rowsPerPage,
      skipCount: state.page * state.rowsPerPage,
      columnFilters: serializeQueueColumnFilters(state.filters, 'applications') || undefined,
      search: state.search || undefined,
      sorting: state.sorts[0] ? `${state.sorts[0].column} ${state.sorts[0].direction}` : undefined,
    },
    { skip, refetchOnMountOrArgChange: true }
  );
  const data = listQuery.currentData;
  const applicationUrl = useCallback(
    (id: string) => getApplicationWorkspaceUrl(id, returnTo, true),
    [returnTo]
  );
  const openApplication = useCallback(
    (id: string) => {
      if (canView) router.push(applicationUrl(id), { scroll: false });
    },
    [applicationUrl, canView, router]
  );
  const columns = useMemo(
    () => buildAdmissionApplicationsColumns({ applicationUrl, onOpen: openApplication }),
    [applicationUrl, openApplication]
  );

  useEffect(() => {
    if (!canView || applicationId) return;
    if (previousYear.current !== academic.academicYearId) {
      previousYear.current = academic.academicYearId;
      update({ board: undefined, medium: undefined, class: undefined });
      return;
    }
    if (
      data &&
      !listQuery.isFetching &&
      state.page > 0 &&
      state.page * state.rowsPerPage >= data.totalCount
    ) {
      update({ page: String(Math.max(1, Math.ceil(data.totalCount / state.rowsPerPage))) }, false);
      return;
    }
    // Old bookmarks must not retain hidden filters removed from this workspace.
    update({}, false);
  }, [
    academic.academicYearId,
    applicationId,
    canView,
    data,
    listQuery.isFetching,
    state.page,
    state.rowsPerPage,
    update,
  ]);

  if (canView && applicationId) {
    return <ApplicationWorkspaceRedirect applicationId={applicationId} returnTo={returnTo} />;
  }

  const emptyState = !academic.academicYearId
    ? 'Select an academic year to view Applications'
    : !academic.dashboardScope && (!academic.boardId || !academic.mediumId)
      ? 'Select a Board and Medium to view Applications'
      : state.search || state.filters.length || state.status !== undefined
        ? 'No applications match the selected search or filters'
        : academic.standardId
          ? 'No applications match the selected classes'
          : activeApplications
            ? 'No active applications match this scope'
            : pendingDecisions
              ? 'No admission decisions are pending in this scope'
              : 'No applications have reached the admission decision phase yet';

  return (
    <Box
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
        heading="Applications"
        description={
          activeApplications
            ? 'Review active applications in the selected dashboard scope.'
            : 'Review admission decisions and finalize approved admissions. Earlier admission work continues in Pipeline.'
        }
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Applications' },
        ]}
        slotProps={{
          action: { alignSelf: { xs: 'flex-end', md: 'center' }, maxWidth: '100%' },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
        }}
        action={
          canView && canStart ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:plus" />}
              disabled={!academic.academicYearId}
              onClick={registration.onTrue}
            >
              Start special registration
            </Button>
          ) : undefined
        }
      />
      {!canView ? (
        <StudentFeedback notificationKey="STU-0021" presentation="persistent" severity="warning">
          Application viewing permission is required to access Applications.
        </StudentFeedback>
      ) : (
        <>
          <AdmissionAcademicFilters
            onLoadingChange={setScopeLoading}
            boardId={academic.boardId}
            mediumId={academic.mediumId}
            standardId={academic.standardId}
            onClear={academic.clear}
            onChange={academic.update}
          />
          {listQuery.isError && !skip && Boolean(data?.items.length) && (
            <AdmissionQueryError onRetry={() => listQuery.refetch()} />
          )}
          <Box
            sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', position: 'relative' }}
          >
            <CustomizableTable
              tableId="admission-applications"
              tableTitle="Admission applications"
              exportLabel="Export"
              wrapperProps={{ sx: { height: 1, flex: 1, minHeight: 0, minWidth: 0 } }}
              tableContainerProps={{ sx: { height: 1 } }}
              columns={columns}
              data={skip ? [] : (data?.items ?? [])}
              isLoading={
                scopeLoading ||
                yearChanging ||
                (!skip &&
                  !listQuery.isError &&
                  (listQuery.isLoading || (listQuery.isFetching && !data)))
              }
              isRefreshing={!skip && listQuery.isFetching && Boolean(data)}
              onClearCriteria={() =>
                update({ search: undefined, filters: undefined, status: undefined })
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
                update({
                  filters: serializeQueueColumnFilters(filters, 'applications', false) || undefined,
                  status: filters.find((filter) => filter.column === 'status')?.value?.toString(),
                })
              }
              serverSidePagination
              serverSideSearch
              serverSideSort
              serverSideSortMode="single"
              totalCount={skip ? 0 : (data?.totalCount ?? 0)}
              searchTerm={state.search}
              sorts={state.sorts}
              page={state.page}
              rowsPerPage={state.rowsPerPage}
              defaultRowsPerPage={25}
              rowsPerPageOptions={[10, 25, 100]}
              onServerSearch={(search) => update({ search: search || undefined })}
              onServerSort={(_, sorts) =>
                update({ sort: sorts[0]?.column, direction: sorts[0]?.direction })
              }
              onServerPagination={(page, size) =>
                update({ page: String(page), size: String(size) }, size !== state.rowsPerPage)
              }
              searchFieldProps={{
                placeholder: 'Search applicant, application or contact',
                inputProps: { 'aria-label': 'Search Applications' },
              }}
              errorContent={
                listQuery.isError && !skip && !data?.items.length ? (
                  <AdmissionQueryError
                    onRetry={() => {
                      listQuery.refetch();
                    }}
                  />
                ) : undefined
              }
              noDataText={
                <Stack spacing={1} alignItems="center">
                  <Box>{emptyState}</Box>
                  {state.search ? (
                    <Button size="small" onClick={() => update({ search: undefined })}>
                      Clear search
                    </Button>
                  ) : state.filters.length || state.status !== undefined ? (
                    <Button
                      size="small"
                      onClick={() => update({ filters: undefined, status: undefined })}
                    >
                      Clear filters
                    </Button>
                  ) : academic.standardId ? (
                    <Button size="small" onClick={academic.clear}>
                      Clear class filter
                    </Button>
                  ) : null}
                </Stack>
              }
            />
          </Box>
        </>
      )}
      {canView && canStart && academic.academicYearId && (
        <AdmissionDirectRegistrationDialog
          key={academic.academicYearId}
          academicYearId={academic.academicYearId}
          open={registration.value}
          onClose={registration.onFalse}
        />
      )}
    </Box>
  );
}
