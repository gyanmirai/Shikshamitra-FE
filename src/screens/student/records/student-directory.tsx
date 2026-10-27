'use client';

import type { RootState } from 'src/redux/store';
import type {
  StudentDirectoryItem,
  StudentDirectoryInput,
} from 'src/redux/student/records/student-records-types';

import { useSelector } from 'react-redux';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Chip, Paper, Stack, Button, Typography } from '@mui/material';
import {
  useGetStudentRecordsDirectoryQuery,
  useGetStudentRecordsDirectoryOptionsQuery,
} from 'src/redux/student/records/student-records-api';

import StudentDirectoryTable from './student-directory-table';
import StudentDirectoryFilters from './student-directory-filters';
import StudentDirectoryDocuments from './student-directory-documents';
import { recordsQueryUrl, positivePageValue } from './records-url-state';
import { useStudentDirectoryExport } from './use-student-directory-export';
import { directoryColumnFilters } from './student-directory-column-filters';
import StudentDirectoryAcademicFilters from './student-directory-academic-filters';
import { directoryScope, directoryBulkScopeReady } from './student-directory-scope';

import type { DirectoryRowActions } from './student-directory-columns';
import type { DirectoryDocumentRequest } from './student-directory-documents';

type Props = { rowActions?: DirectoryRowActions };
const MAX_SELECTION = 100;

export default function StudentDirectory({ rowActions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentQuery = params.toString();
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const population = params.get('population') === 'Former' ? 'Former' : 'Active';
  const year =
    params.get('dashboard') === 'directory'
      ? params.get('year') || currentYear?.id || ''
      : (currentYear?.id ?? '');
  const options = useGetStudentRecordsDirectoryOptionsQuery(
    { academicYearId: year },
    { skip: !year }
  );
  const scope = useMemo(
    () => directoryScope(new URLSearchParams(currentQuery), options.currentData),
    [currentQuery, options.currentData]
  );
  const page = positivePageValue(params.get('page'), 0, 100000);
  const pageSize = Math.max(10, positivePageValue(params.get('pageSize'), 25, 100));
  const search = params.get('search') ?? '';
  const sorting = params.get('sort') ?? '';
  const columnFilters = directoryColumnFilters(params.get('columnFilters'));
  const update = useCallback(
    (values: Record<string, string | number | undefined>) => {
      const url = recordsQueryUrl(pathname, currentQuery, {
        ...values,
        year: params.get('dashboard') === 'directory' ? year : undefined,
      });
      if (url !== `${pathname}${currentQuery ? `?${currentQuery}` : ''}`)
        router.push(url, { scroll: false });
    },
    [currentQuery, pathname, router, params, year]
  );
  const input: StudentDirectoryInput = {
    population,
    academicYearId: year || undefined,
    boardId: scope.board || undefined,
    mediumId: scope.medium || undefined,
    standardId: scope.classes.length === 1 ? scope.classes[0] : undefined,
    standardIds: scope.classes.length > 1 ? scope.classes : undefined,
    divisionId: scope.divisions.length === 1 ? scope.divisions[0] : undefined,
    divisionIds: scope.divisions.length > 1 ? scope.divisions : undefined,
    search,
    sorting: sorting || undefined,
    columnFilters: columnFilters.length ? columnFilters : undefined,
    skipCount: page * pageSize,
    maxResultCount: pageSize,
  };
  const academicYearReady = Boolean(year && scope.ready);
  const query = useGetStudentRecordsDirectoryQuery(input, { skip: !academicYearReady });
  const exportDirectory = useStudentDirectoryExport(input, [
    `Academic year: ${currentYear?.id === year ? currentYear.name : year}`,
    `Board: ${options.currentData?.boards.find((item) => item.id === scope.board)?.name ?? ''}`,
    `Medium: ${options.currentData?.mediums.find((item) => item.id === scope.medium)?.name ?? ''}`,
    `Classes: ${scope.classes.length ? scope.classes.map((id) => options.currentData?.standards.find((item) => item.id === id)?.name ?? id).join(', ') : 'All matching classes'}`,
    `Divisions: ${scope.divisions.length ? scope.divisions.map((id) => options.currentData?.divisions.find((item) => item.id === id)?.name ?? id).join(', ') : 'All matching divisions'}`,
  ]);
  const hasAction = (feature: string) =>
    hasGrantedPermission(permissions, `${feature}.View`) &&
    hasGrantedPermission(permissions, `${feature}.Add`);
  const canPrintIds = hasAction('Students.Records.StudentICard');
  const canGenerateCertificates = hasAction('Students.Records.Certificates');
  const selectionEnabled =
    directoryBulkScopeReady(scope, population) &&
    (canPrintIds || canGenerateCertificates) &&
    !query.isError &&
    !options.isError;
  const scopeKey = JSON.stringify([
    year,
    scope,
    population,
    search,
    sorting,
    columnFilters,
    canPrintIds,
    canGenerateCertificates,
    query.isError,
  ]);
  const [selection, setSelection] = useState<{
    key: string;
    students: Record<string, StudentDirectoryItem>;
  }>({ key: scopeKey, students: {} });
  const selected =
    selection.key === scopeKey && selectionEnabled ? Object.values(selection.students) : [];
  const [documentRequest, setDocumentRequest] = useState<DirectoryDocumentRequest | null>(null);
  const lastCompletedPage = useRef<{ key: string; data: typeof query.currentData } | null>(null);
  useEffect(() => {
    setSelection((previous) =>
      previous.key !== scopeKey ? { key: scopeKey, students: {} } : previous
    );
    if (!query.currentData || query.isFetching) return;
    const pageKey = `${scopeKey}:${page}:${pageSize}`;
    const refreshed =
      lastCompletedPage.current?.key === pageKey &&
      lastCompletedPage.current.data !== query.currentData;
    lastCompletedPage.current = { key: pageKey, data: query.currentData };
    setSelection((previous) => {
      // Paging preserves the cohort; refreshing it invalidates previously selected membership.
      if (previous.key !== scopeKey || refreshed) return { key: scopeKey, students: {} };
      const currentRows = new Map(
        (query.currentData?.items ?? []).map((row) => [row.studentId, row])
      );
      let changed = false;
      const students = { ...previous.students };
      Object.keys(students).forEach((id) => {
        const row = currentRows.get(id);
        if (!row) return;
        if (
          (row.maskedFields ?? []).includes('Identity') ||
          row.standardId !== scope.classes[0] ||
          row.divisionId !== scope.divisions[0] ||
          ![6, 'Enrolled', 'Active'].includes(row.status)
        ) {
          delete students[id];
          changed = true;
        } else if (students[id] !== row) {
          students[id] = row;
          changed = true;
        }
      });
      return changed ? { key: scopeKey, students } : previous;
    });
  }, [
    scopeKey,
    page,
    pageSize,
    query.currentData,
    query.isFetching,
    scope.classes,
    scope.divisions,
  ]);
  const toggleStudents = (rows: StudentDirectoryItem[], checked: boolean) => {
    if (!selectionEnabled || query.isFetching) return;
    setSelection((previous) => {
      const students = previous.key === scopeKey ? { ...previous.students } : {};
      rows.forEach((row) => {
        if (!checked) delete students[row.studentId];
        else if (
          Object.keys(students).length < MAX_SELECTION &&
          !(row.maskedFields ?? []).includes('Identity') &&
          row.standardId === scope.classes[0] &&
          row.divisionId === scope.divisions[0]
        )
          students[row.studentId] = row;
      });
      return { key: scopeKey, students };
    });
  };
  const openDocuments = (
    kind: DirectoryDocumentRequest['kind'],
    students: StudentDirectoryItem[],
    lockAcademicScope = false
  ) => {
    if (
      !year ||
      !students.length ||
      students.length > MAX_SELECTION ||
      query.isError ||
      options.isError ||
      !academicYearReady ||
      (kind === 'id-card' ? !canPrintIds : !canGenerateCertificates)
    )
      return;
    setDocumentRequest({
      kind,
      students,
      academicYearId: year,
      academicScope: {
        boardIds: [scope.board],
        mediumIds: [scope.medium],
        standardIds: [
          ...new Set(
            students.flatMap((student) => (student.standardId ? [student.standardId] : []))
          ),
        ],
        divisionIds: [
          ...new Set(
            students.flatMap((student) => (student.divisionId ? [student.divisionId] : []))
          ),
        ],
      },
      lockAcademicScope,
    });
  };
  const profileHref = useCallback(
    (studentId: string) =>
      recordsQueryUrl(studentPaths.records.studentList, currentQuery, {
        board: scope.board || undefined,
        medium: scope.medium || undefined,
        student: studentId,
        view: undefined,
        edit: undefined,
        section: undefined,
        tab: undefined,
        year: undefined,
      }),
    [currentQuery, scope.board, scope.medium]
  );
  const clearScope = () =>
    update({
      class: undefined,
      division: undefined,
      search: undefined,
      columnFilters: undefined,
      page: 0,
    });
  const selectionReason = !directoryBulkScopeReady(scope, population)
    ? 'Select exactly one class and one division in Active students to use bulk actions.'
    : !canPrintIds && !canGenerateCertificates
      ? 'Your permissions do not allow bulk student documents.'
      : 'Reload student records and filter choices before selecting students.';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Student List"
        description="Find active and former students and open their permanent profile."
        descriptionDisplay="tooltip"
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.root },
          { name: 'Student List' },
        ]}
      />
      {options.isError && (
        <StudentFeedback
          notificationKey="STU-0853"
          presentation="persistent"
          severity="error"
          action={
            <Button color="inherit" onClick={() => options.refetch()}>
              Retry filters
            </Button>
          }
        >
          Academic filter choices could not be loaded. The current view is preserved.
        </StudentFeedback>
      )}
      {year && options.currentData && !scope.ready && !options.isError && (
        <StudentFeedback
          notificationKey="STUDENT-DIRECTORY-SCOPE"
          presentation="inline"
          severity="warning"
          action={
            <Button
              color="inherit"
              onClick={() =>
                update({
                  board: scope.board,
                  medium: scope.medium,
                  class: undefined,
                  division: undefined,
                  page: 0,
                })
              }
            >
              Reset academic filters
            </Button>
          }
        >
          Some academic selections are unavailable. Reset the filters or choose an available board
          and medium.
        </StudentFeedback>
      )}
      <Paper variant="outlined" sx={{ p: 1, mb: 1, borderRadius: 2, flexShrink: 0 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', lg: 'center' }}
        >
          <StudentDirectoryAcademicFilters
            scope={scope}
            options={options.currentData}
            isLoading={options.isLoading || (options.isFetching && !options.currentData)}
            disabled={!year || options.isError}
            onChange={(changes) => update({ ...changes, page: 0 })}
          />
          <StudentDirectoryFilters
            population={population}
            onApply={(value) =>
              update({ population: value === 'Active' ? undefined : value, page: 0 })
            }
          />
        </Stack>
        {(scope.classes.length > 0 || scope.divisions.length > 0) && (
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
            aria-label="Applied academic filters"
            sx={{ pt: 1 }}
          >
            {scope.classes.length > 0 && (
              <Chip
                size="small"
                variant="outlined"
                label={`${scope.classes.length} ${scope.classes.length === 1 ? 'class' : 'classes'} selected`}
                onDelete={() => update({ class: undefined, division: undefined, page: 0 })}
              />
            )}
            {scope.divisions.length > 0 && (
              <Chip
                size="small"
                variant="outlined"
                label={`${scope.divisions.length} ${scope.divisions.length === 1 ? 'division' : 'divisions'} selected`}
                onDelete={() => update({ division: undefined, page: 0 })}
              />
            )}
            <Button
              size="small"
              color="inherit"
              onClick={() => update({ class: undefined, division: undefined, page: 0 })}
            >
              Reset academic filters
            </Button>
          </Stack>
        )}
      </Paper>
      {selected.length > 0 && (
        <Stack
          role="toolbar"
          aria-label="Selected students"
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          alignItems="center"
          sx={{ px: 2, py: 1, mb: 1, borderRadius: 1, bgcolor: 'action.selected', flexShrink: 0 }}
        >
          <Typography variant="subtitle2" sx={{ mr: 'auto' }}>
            {selected.length} {selected.length === 1 ? 'student' : 'students'} selected
          </Typography>
          {canPrintIds && (
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              disabled={query.isFetching}
              onClick={() => openDocuments('id-card', selected, true)}
            >
              Print I-cards
            </Button>
          )}
          {canGenerateCertificates && (
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              disabled={query.isFetching}
              onClick={() => openDocuments('certificate', selected)}
            >
              Generate certificates
            </Button>
          )}
          <Button
            color="inherit"
            size="small"
            onClick={() => setSelection({ key: scopeKey, students: {} })}
          >
            Clear selection
          </Button>
          <Typography variant="caption" color="text.secondary">
            Up to {MAX_SELECTION} students
          </Typography>
        </Stack>
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
        <StudentDirectoryTable
          {...{
            query,
            page,
            pageSize,
            search,
            sorting,
            update,
            columnFilters,
            population,
            academicYearReady,
            profileHref,
            rowActions,
          }}
          onProfileOpen={(studentId) => router.push(profileHref(studentId))}
          academicOptionsLoading={Boolean(year) && options.isLoading}
          academicContextMessage={
            !year
              ? 'Select an academic year to view students.'
              : 'Choose an available board and medium to view students.'
          }
          onExport={exportDirectory}
          canPrintIds={canPrintIds}
          canGenerateCertificates={canGenerateCertificates}
          onDocumentAction={openDocuments}
          selection={{
            selected,
            enabled: selectionEnabled && !query.isFetching,
            disabledReason: selectionReason,
            onToggle: (row, checked) => toggleStudents([row], checked),
            onTogglePage: toggleStudents,
          }}
          onClearFilters={clearScope}
          hasFilters={Boolean(
            scope.classes.length || scope.divisions.length || search || columnFilters.length
          )}
        />
      </Box>
      <StudentDirectoryDocuments
        request={documentRequest}
        onClose={() => setDocumentRequest(null)}
      />
    </Box>
  );
}
