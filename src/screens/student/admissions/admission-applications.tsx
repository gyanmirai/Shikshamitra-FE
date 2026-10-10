'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRef, useMemo, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Alert, Button, LinearProgress } from '@mui/material';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { academicClassFilterInput } from 'src/utils/student-academic-filter-query';
import { useGetAdmissionApplicationsQuery } from 'src/redux/student/admissions/admission-applications-api';

import { AdmissionQueryError } from './admission-query-error';
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
  const applicationId = params.get('application');
  const state = readAdmissionApplicationsState(params);
  const permissions = useSelector((value: RootState) => value.auth.permissions);
  const canView = hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.view);
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
  const skip =
    Boolean(applicationId) ||
    !canView ||
    !academic.academicYearId ||
    !academic.boardId ||
    !academic.mediumId;
  const listQuery = useGetAdmissionApplicationsQuery(
    {
      academicYearId: academic.academicYearId,
      boardId: academic.boardId || undefined,
      mediumId: academic.mediumId || undefined,
      ...academicClassFilterInput(academic.standardId),
      decisionWorkspaceOnly: true,
      maxResultCount: state.rowsPerPage,
      skipCount: state.page * state.rowsPerPage,
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
    : !academic.boardId || !academic.mediumId
      ? 'Select a Board and Medium to view Applications'
      : state.search
        ? 'No applications match your search'
        : academic.standardId
          ? 'No applications match the selected classes'
          : 'No applications have reached the admission decision phase yet';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Applications"
        description="Review admission decisions and finalize approved admissions. Earlier admission work continues in Pipeline."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Applications' },
        ]}
      />
      {!canView ? (
        <Alert severity="warning">
          Application viewing permission is required to access Applications.
        </Alert>
      ) : (
        <>
          <AdmissionAcademicFilters
            boardId={academic.boardId}
            mediumId={academic.mediumId}
            standardId={academic.standardId}
            onClear={academic.clear}
            onChange={academic.update}
          />
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
            {data && listQuery.isFetching ? (
              <LinearProgress
                aria-label="Refreshing applications"
                sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}
              />
            ) : null}
            <CustomizableTable
              tableId="admission-applications"
              tableTitle="Admission applications"
              exportLabel="Export current page"
              wrapperProps={{ sx: { height: 1 } }}
              tableContainerProps={{ sx: { height: 1 } }}
              columns={columns}
              data={skip || listQuery.isError ? [] : (data?.items ?? [])}
              isLoading={!skip && (listQuery.isLoading || (listQuery.isFetching && !data))}
              serverSidePagination
              serverSideSearch
              serverSideSort
              serverSideSortMode="single"
              totalCount={skip || listQuery.isError ? 0 : (data?.totalCount ?? 0)}
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
                listQuery.isError && !skip ? (
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
    </Box>
  );
}
