'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  House,
  HouseStudent,
  HouseDivision,
} from 'src/redux/student/house-management/house-management-types';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { useRef, useState, useEffect } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import { useStudentAcademicScope } from 'src/hooks/use-student-academic-scope';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import {
  Box,
  Tab,
  Link,
  Chip,
  Alert,
  Stack,
  Button,
  Avatar,
  Checkbox,
  Typography,
} from '@mui/material';
import {
  useGetManagedHousesQuery,
  useGetHouseStudentsQuery,
  useGetHouseDivisionsQuery,
  useSetHouseLeaderMutation,
  useSetDivisionLeaderMutation,
  useCreateManagedHouseMutation,
  useUpdateManagedHouseMutation,
  useDeleteManagedHouseMutation,
  useCommitHouseAssignmentMutation,
  usePreviewHouseAssignmentMutation,
} from 'src/redux/student/house-management/house-management-api';

import { HousePicker } from './house-pickers';
import HouseFormDialog from './house-form-dialog';
import HouseLeaderDialog from './house-leader-dialog';
import HouseAssignmentDrawer from './house-assignment-drawer';
import { recordsQueryUrl } from '../records/records-url-state';
import { houseWorkspaceState, selectionForContext } from './house-management-model';

type Session =
  | { kind: 'house'; house?: House }
  | { kind: 'leader'; type: 'house' | 'division'; record: House | HouseDivision }
  | { kind: 'assignment'; mode: 'assign' | 'remove'; ids: string[] }
  | { kind: 'delete'; house: House };

export default function HouseManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentQuery = params.toString();
  const state = houseWorkspaceState(new URLSearchParams(currentQuery));
  const academic = useStudentAcademicScope();
  const permissions = useSelector((store: RootState) => store.auth.permissions);
  const canManage = hasGrantedPermission(
    permissions,
    studentPermissions.records.manageHouseManagement
  );
  const canDelete = hasGrantedPermission(
    permissions,
    studentPermissions.records.deleteHouseManagement
  );
  const canViewProfile = hasGrantedPermission(permissions, studentPermissions.records.studentList);
  const mediumId = academic.currentMedium?.id ?? '';
  const standards =
    academic.currentMedium?.educationMediumStages.flatMap((stage) => stage.standards) ?? [];
  const standardId = params.get('class') ?? '';
  const divisions = standards
    .filter((item) => !standardId || item.id === standardId)
    .flatMap((item) =>
      item.divisions.map((division) => ({
        ...division,
        label: standardId ? division.name : `${item.name} / ${division.name}`,
      }))
    );
  const divisionId = params.get('division') ?? '';
  const houseId = params.get('house') ?? '';
  const unassignedOnly = params.get('assignment') === 'unassigned';
  const validScope = Boolean(
    mediumId &&
    (!standardId || standards.some((item) => item.id === standardId)) &&
    (!divisionId || divisions.some((item) => item.id === divisionId))
  );
  const ready = validScope && !academic.isLoading && !academic.isError;
  const input = {
    academicMediumId: mediumId,
    filter: state.search,
    sorting: state.sorting,
    skipCount: state.page * state.pageSize,
    maxResultCount: state.pageSize,
  };
  const houses = useGetManagedHousesQuery(input, { skip: !ready || state.tab !== 'houses' });
  const students = useGetHouseStudentsQuery(
    {
      ...input,
      standardId: standardId || undefined,
      divisionId: divisionId || undefined,
      houseId: unassignedOnly ? undefined : houseId || undefined,
      unassignedOnly: unassignedOnly || undefined,
    },
    { skip: !ready || state.tab !== 'students' }
  );
  const divisionQuery = useGetHouseDivisionsQuery(
    { ...input, standardId: standardId || undefined },
    { skip: !ready || state.tab !== 'divisions' }
  );
  const query =
    state.tab === 'houses' ? houses : state.tab === 'students' ? students : divisionQuery;
  const rows = ready ? (query.currentData?.items ?? []) : [];
  const mediumCanManage = houses.currentData?.canManage === true;
  const [createHouse] = useCreateManagedHouseMutation();
  const [updateHouse] = useUpdateManagedHouseMutation();
  const [deleteHouse, deleting] = useDeleteManagedHouseMutation();
  const [previewAssignment] = usePreviewHouseAssignmentMutation();
  const [commitAssignment] = useCommitHouseAssignmentMutation();
  const [setHouseLeader] = useSetHouseLeaderMutation();
  const [setDivisionLeader] = useSetDivisionLeaderMutation();
  const [session, setSession] = useState<{ context: string; value: Session } | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [selectedHouseFilter, setSelectedHouseFilter] = useState<House | null>(null);
  const context = JSON.stringify([
    academic.currentYear?.id,
    mediumId,
    academic.scopeRevision,
    state.tab,
    standardId,
    divisionId,
    houseId,
    unassignedOnly,
    state.search,
    state.sorting,
    canManage,
    canDelete,
  ]);
  const [selection, setSelection] = useState<{ context: string; ids: string[] }>({
    context,
    ids: [],
  });
  const selected =
    canManage && ready && !query.isError ? selectionForContext(selection, context) : [];
  const currentSession = session?.context === context ? session.value : null;
  const previousData = useRef<{ context: string; page: number; data: unknown } | null>(null);
  useEffect(() => {
    if (academic.isError || query.isError) {
      setSelection({ context, ids: [] });
      return;
    }
    setSelection((previous) => (previous.context === context ? previous : { context, ids: [] }));
    if (!query.currentData || query.isFetching) return;
    const previous = previousData.current;
    if (
      previous?.context === context &&
      previous.page === state.page &&
      previous.data !== query.currentData
    ) {
      setSelection({ context, ids: [] });
    }
    previousData.current = { context, page: state.page, data: query.currentData };
  }, [context, state.page, query.currentData, query.isFetching, query.isError, academic.isError]);
  const settledTotal =
    !query.isFetching && !query.isError ? query.currentData?.totalCount : undefined;
  useEffect(() => {
    if (!ready || settledTotal === undefined) return;
    const lastPage = Math.max(0, Math.ceil(settledTotal / state.pageSize) - 1);
    if (state.page > lastPage)
      router.replace(recordsQueryUrl(pathname, currentQuery, { page: lastPage || undefined }), {
        scroll: false,
      });
  }, [ready, settledTotal, state.page, state.pageSize, router, pathname, currentQuery]);
  const update = (changes: Record<string, string | number | undefined>) => {
    const url = recordsQueryUrl(pathname, currentQuery, changes);
    if (url !== `${pathname}${currentQuery ? `?${currentQuery}` : ''}`)
      router.push(url, { scroll: false });
  };
  const open = (value: Session) => {
    setDeleteError('');
    setSession({ context, value });
  };
  const success = (message: string) => {
    shikshaMitraToast.success({ message });
    setSelection({ context, ids: [] });
  };
  const toggle = (ids: string[], checked: boolean) => {
    if (!canManage || query.isFetching || !ready) return;
    setSelection((previous) => {
      const next = new Set(selectionForContext(previous, context));
      ids.forEach((id) => {
        if (!checked) next.delete(id);
        else if (next.size < 500) next.add(id);
      });
      return { context, ids: [...next] };
    });
  };
  const name = (student: HouseStudent) =>
    canViewProfile ? (
      <Link
        component={RouterLink}
        color="inherit"
        underline="hover"
        href={`${studentPaths.records.studentList}?student=${encodeURIComponent(student.studentId)}`}
        sx={{ typography: 'body2', overflowWrap: 'anywhere' }}
      >
        {student.studentName}
      </Link>
    ) : (
      student.studentName
    );
  const leader = (record: House | HouseDivision) =>
    record.leader ? name(record.leader) : record.canManage ? 'Vacant' : 'Not available';
  const disabled = !ready || query.isFetching || query.isError;
  const houseColumns: IColumn[] = [
    {
      id: 'name',
      label: 'House',
      isSort: true,
      minWidth: 180,
      render: (_, row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <SubjectColorIndicator color={row.color} />
          <Avatar
            src={row.logoUrl || undefined}
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'background.neutral',
              color: 'text.secondary',
            }}
          >
            {String(row.name).slice(0, 1)}
          </Avatar>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {row.name}
          </Typography>
        </Stack>
      ),
    },
    { id: 'memberCount', label: 'Visible students', align: 'right', minWidth: 130 },
    {
      id: 'leader',
      label: 'House leader',
      minWidth: 160,
      render: (_, row) => leader(row as House),
    },
    { id: 'description', label: 'Description', minWidth: 200, render: (value) => value || '—' },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      minWidth: 125,
      excludeFromExport: true,
      render: (_, data) => {
        const row = data as House;
        return (
          <AdaptiveThreeDotsActions
            actions={[
              {
                id: 'members',
                label: `View students in ${row.name}`,
                icon: GlobalIcons.family,
                onClick: () => {
                  setSelectedHouseFilter(row);
                  update({
                    tab: 'students',
                    house: row.id,
                    houseName: row.name,
                    assignment: undefined,
                    search: undefined,
                    sort: undefined,
                    page: undefined,
                  });
                },
              },
              ...(canManage
                ? [
                    {
                      id: 'edit',
                      label: `Edit ${row.name}`,
                      icon: GlobalIcons.edit,
                      disabled: disabled || !row.canManage,
                      tooltip: !row.canManage ? 'Full house scope is required.' : undefined,
                      onClick: () => open({ kind: 'house', house: row }),
                    },
                    {
                      id: 'leader',
                      label: `Manage leader for ${row.name}`,
                      icon: GlobalIcons.admissionStudent,
                      disabled: disabled || !row.canManage,
                      tooltip: !row.canManage ? 'Full house scope is required.' : undefined,
                      onClick: () => open({ kind: 'leader', type: 'house', record: row }),
                    },
                  ]
                : []),
              ...(canDelete
                ? [
                    {
                      id: 'delete',
                      label: `Delete ${row.name}`,
                      icon: GlobalIcons.delete,
                      color: 'error.main',
                      disabled: disabled || !row.canManage || row.memberCount > 0,
                      tooltip:
                        row.memberCount > 0
                          ? 'Remove all students before deleting this house.'
                          : !row.canManage
                            ? 'Full house scope is required.'
                            : undefined,
                      onClick: () => open({ kind: 'delete', house: row }),
                    },
                  ]
                : []),
            ]}
          />
        );
      },
    },
  ];
  const visibleStudents = students.currentData?.items ?? [];
  const studentColumns: IColumn[] = [
    ...(canManage
      ? [
          {
            id: 'selected',
            label: (
              <Checkbox
                size="small"
                inputProps={{ 'aria-label': 'Select current page' }}
                checked={
                  visibleStudents.length > 0 &&
                  visibleStudents.every((row) => selected.includes(row.enrollmentId))
                }
                indeterminate={
                  visibleStudents.some((row) => selected.includes(row.enrollmentId)) &&
                  !visibleStudents.every((row) => selected.includes(row.enrollmentId))
                }
                disabled={disabled}
                onChange={(_, checked) =>
                  toggle(
                    visibleStudents.map((row) => row.enrollmentId),
                    checked
                  )
                }
              />
            ),
            width: 60,
            excludeFromExport: true,
            render: (_: unknown, row: HouseStudent) => (
              <Checkbox
                size="small"
                inputProps={{ 'aria-label': `Select ${row.studentName}` }}
                checked={selected.includes(row.enrollmentId)}
                disabled={
                  disabled || (!selected.includes(row.enrollmentId) && selected.length >= 500)
                }
                onChange={(_event, checked) => toggle([row.enrollmentId], checked)}
              />
            ),
          } as IColumn,
        ]
      : []),
    {
      id: 'studentName',
      label: 'Student',
      isSort: true,
      minWidth: 180,
      render: (_, row) => name(row as HouseStudent),
    },
    { id: 'admissionNumber', label: 'GR number', minWidth: 140, render: (value) => value || '—' },
    { id: 'standardName', label: 'Class', isSort: true, minWidth: 100 },
    { id: 'divisionName', label: 'Division', minWidth: 100, render: (value) => value || '—' },
    {
      id: 'houseName',
      label: 'House',
      isSort: true,
      minWidth: 140,
      render: (_value, row) => row.houseName || 'Unassigned',
    },
    {
      id: 'leadership',
      label: 'Leadership',
      minWidth: 180,
      render: (_, row) => (
        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
          {row.isHouseLeader && <Chip size="small" label="House leader" />}
          {row.isDivisionLeader && <Chip size="small" label="Division leader" />}
          {!row.isHouseLeader && !row.isDivisionLeader && '—'}
        </Stack>
      ),
    },
  ];
  const divisionColumns: IColumn[] = [
    { id: 'standardName', label: 'Class', minWidth: 140 },
    { id: 'name', label: 'Division', isSort: true, minWidth: 140 },
    { id: 'studentCount', label: 'Visible students', align: 'right', minWidth: 130 },
    {
      id: 'leader',
      label: 'Division leader',
      minWidth: 180,
      render: (_, row) => leader(row as HouseDivision),
    },
    ...(canManage
      ? [
          {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            width: 100,
            render: (_: unknown, row: HouseDivision) => (
              <AdaptiveThreeDotsActions
                actions={[
                  {
                    id: 'leader',
                    label: `Manage leader for ${row.standardName} / ${row.name}`,
                    icon: GlobalIcons.admissionStudent,
                    disabled: disabled || !row.canManage,
                    tooltip: !row.canManage ? 'Full division scope is required.' : undefined,
                    onClick: () => open({ kind: 'leader', type: 'division', record: row }),
                  },
                ]}
              />
            ),
          } as IColumn,
        ]
      : []),
  ];
  const tableError = academic.isError
    ? 'Academic scope could not be loaded. Refresh the page and try again.'
    : !validScope && !academic.isLoading
      ? 'Choose an available board, medium, class and division.'
      : query.isError
        ? parseApiProblemDetail(query.error).detail
        : undefined;
  return (
    <Box
      sx={{
        height: { xs: 'auto', md: 1 },
        minHeight: 0,
        minWidth: 0,
        flexShrink: { xs: 0, md: 1 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CustomBreadcrumbs
        heading="House Management"
        description="Manage medium-wise houses, cross-class membership and independent leaders. Counts include only students in your academic scope; leadership outside your access is not shown."
        links={[{ name: 'Student', href: studentPaths.dashboard }, { name: 'House Management' }]}
        action={
          canManage && state.tab === 'houses' ? (
            <Button
              size="small"
              variant="contained"
              color="inherit"
              disabled={disabled || !mediumCanManage}
              onClick={() => open({ kind: 'house' })}
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
            >
              Create house
            </Button>
          ) : undefined
        }
      />
      <CustomTabs
        value={state.tab}
        variant="scrollable"
        scrollButtons="auto"
        guardUnsavedChanges={false}
        aria-label="House management sections"
      >
        <Tab
          value="houses"
          component={RouterLink}
          href={recordsQueryUrl(pathname, currentQuery, {
            tab: 'houses',
            search: undefined,
            sort: undefined,
            page: undefined,
          })}
          id="house-management-tab-houses"
          aria-controls="house-management-panel"
          label="Houses"
          icon={<Iconify icon={GlobalIcons.building} />}
          iconPosition="start"
        />
        <Tab
          value="students"
          component={RouterLink}
          href={recordsQueryUrl(pathname, currentQuery, {
            tab: 'students',
            search: undefined,
            sort: undefined,
            page: undefined,
          })}
          id="house-management-tab-students"
          aria-controls="house-management-panel"
          label="Students"
          icon={<Iconify icon={GlobalIcons.family} />}
          iconPosition="start"
        />
        <Tab
          value="divisions"
          component={RouterLink}
          href={recordsQueryUrl(pathname, currentQuery, {
            tab: 'divisions',
            search: undefined,
            sort: undefined,
            page: undefined,
          })}
          id="house-management-tab-divisions"
          aria-controls="house-management-panel"
          label="Division Leaders"
          icon={<Iconify icon={GlobalIcons.admissionStudent} />}
          iconPosition="start"
        />
      </CustomTabs>
      <Stack spacing={1} sx={{ p: 1, mb: 1, flexShrink: 0 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          <CustomSelect
            label="Board"
            value={academic.currentBoard?.id ?? ''}
            options={academic.boards}
            labelKey="name"
            valueKey="id"
            isLoading={academic.isLoading}
            onChange={(value) =>
              update({
                board: String(value),
                medium: undefined,
                class: undefined,
                division: undefined,
                house: undefined,
                houseName: undefined,
                page: undefined,
              })
            }
          />
          <CustomSelect
            label="Medium"
            value={mediumId}
            options={academic.mediums}
            labelKey="name"
            valueKey="id"
            isLoading={academic.isLoading}
            onChange={(value) =>
              update({
                medium: String(value),
                class: undefined,
                division: undefined,
                house: undefined,
                houseName: undefined,
                page: undefined,
              })
            }
          />
          {state.tab !== 'houses' && (
            <CustomSelect
              label="Class"
              value={standardId || 'all'}
              options={[{ id: 'all', name: 'All classes' }, ...standards]}
              labelKey="name"
              valueKey="id"
              disabled={!ready && !standardId}
              onChange={(value) =>
                update({
                  class: value === 'all' ? undefined : String(value),
                  division: undefined,
                  page: undefined,
                })
              }
            />
          )}
          {state.tab === 'students' && (
            <CustomSelect
              label="Division"
              value={divisionId || 'all'}
              options={[{ id: 'all', label: 'All divisions' }, ...divisions]}
              labelKey="label"
              valueKey="id"
              disabled={!mediumId}
              onChange={(value) =>
                update({ division: value === 'all' ? undefined : String(value), page: undefined })
              }
            />
          )}
          {state.tab === 'students' && (
            <HousePicker
              key={mediumId}
              academicMediumId={mediumId}
              value={
                houseId
                  ? selectedHouseFilter?.id === houseId
                    ? selectedHouseFilter
                    : {
                        id: houseId,
                        name: params.get('houseName') || 'Selected house',
                        color: '',
                        memberCount: 0,
                        leader: null,
                        canManage: false,
                        concurrencyStamp: '',
                      }
                  : null
              }
              onChange={(house) => {
                setSelectedHouseFilter(house);
                update({
                  house: house?.id,
                  houseName: house?.name,
                  assignment: undefined,
                  page: undefined,
                });
              }}
              disabled={!ready || unassignedOnly}
              label="House"
            />
          )}
          {state.tab === 'students' && (
            <CustomSelect
              label="Assignment"
              value={unassignedOnly ? 'unassigned' : 'all'}
              options={[
                { value: 'all', label: 'All students' },
                { value: 'unassigned', label: 'Unassigned only' },
              ]}
              onChange={(value) =>
                update({
                  assignment: value === 'unassigned' ? 'unassigned' : undefined,
                  house: undefined,
                  houseName: undefined,
                  page: undefined,
                })
              }
            />
          )}
        </Box>
        {!canManage && (
          <Typography variant="caption" color="text.secondary">
            Read-only access. House changes require Add permission.
          </Typography>
        )}
        {canManage && state.tab === 'houses' && houses.currentData && !mediumCanManage && (
          <Typography variant="caption" color="text.secondary">
            House creation and catalogue changes require access to the entire selected medium.
          </Typography>
        )}
        {canManage && state.tab === 'students' && (
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
            <Typography variant="body2">{selected.length} selected</Typography>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={!selected.length || disabled}
              startIcon={<Iconify icon={GlobalIcons.assigned} />}
              onClick={() => open({ kind: 'assignment', mode: 'assign', ids: selected })}
            >
              Assign or move
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={!selected.length || disabled}
              startIcon={<Iconify icon={GlobalIcons.delete} />}
              onClick={() => open({ kind: 'assignment', mode: 'remove', ids: selected })}
            >
              Remove from house
            </Button>
            {selected.length > 0 && (
              <Button
                size="small"
                color="inherit"
                onClick={() => setSelection({ context, ids: [] })}
              >
                Clear selection
              </Button>
            )}
          </Stack>
        )}
      </Stack>
      <Box
        role="tabpanel"
        id="house-management-panel"
        aria-labelledby={`house-management-tab-${state.tab}`}
        sx={{
          flex: 1,
          // Mobile filters scroll with the page while the roster retains usable space.
          minHeight: { xs: 400, md: 0 },
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <CustomizableTable
          tableId={`student-house-management-${state.tab}`}
          tableTitle={
            state.tab === 'houses'
              ? 'Houses'
              : state.tab === 'students'
                ? 'House membership students'
                : 'Division leaders'
          }
          showColumns
          showFullScreen
          columns={(state.tab === 'houses'
            ? houseColumns
            : state.tab === 'students'
              ? studentColumns
              : divisionColumns
          ).map((column) => ({ ...column, isSort: column.isSort === true }))}
          data={rows}
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{
            sx: { height: 1 },
            'aria-label':
              state.tab === 'houses'
                ? 'Houses'
                : state.tab === 'students'
                  ? 'House membership students'
                  : 'Division leaders',
          }}
          serverSidePagination
          serverSideSearch
          serverSideSort
          serverSideSortMode="single"
          showExport={false}
          isFilter={false}
          isSearch
          isLoading={
            academic.isLoading || query.isLoading || (query.isFetching && !query.currentData)
          }
          isRefreshing={query.isFetching && Boolean(query.currentData)}
          error={tableError}
          errorContent={
            tableError ? (
              <Alert
                severity="error"
                action={
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => {
                      if (academic.isError) window.location.reload();
                      else if (!validScope)
                        update({
                          board: undefined,
                          medium: undefined,
                          class: undefined,
                          division: undefined,
                        });
                      else query.refetch();
                    }}
                  >
                    {!validScope && !academic.isError ? 'Clear filters' : 'Retry'}
                  </Button>
                }
              >
                {tableError}
              </Alert>
            ) : undefined
          }
          totalCount={ready ? (query.currentData?.totalCount ?? 0) : 0}
          page={state.page}
          rowsPerPage={state.pageSize}
          rowsPerPageOptions={[10, 25, 50, 100]}
          maxServerRowsPerPage={100}
          searchTerm={state.search}
          sorts={[
            {
              column: state.sorting.split(' ')[0],
              direction: state.sorting.endsWith('desc') ? 'desc' : 'asc',
            },
          ]}
          onClearCriteria={() =>
            update({
              search: undefined,
              class: undefined,
              division: undefined,
              house: undefined,
              houseName: undefined,
              assignment: undefined,
              page: undefined,
            })
          }
          onServerPagination={(page, pageSize) => update({ page: page - 1 || undefined, pageSize })}
          onServerSearch={(search) => update({ search: search || undefined, page: undefined })}
          onServerSort={(_, sorts) =>
            update({
              sort: sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
              page: undefined,
            })
          }
          noDataText={
            state.search || standardId || divisionId || houseId || unassignedOnly
              ? 'No records match these filters.'
              : state.tab === 'houses'
                ? canManage && mediumCanManage
                  ? 'No houses in this medium. Create a house to get started.'
                  : 'No houses in this medium.'
                : state.tab === 'students'
                  ? 'No enrolled students in this medium.'
                  : 'No divisions in this medium.'
          }
        />
      </Box>
      {currentSession?.kind === 'house' && canManage && (
        <HouseFormDialog
          key={`${context}:${currentSession.house?.id ?? 'new'}`}
          academicMediumId={mediumId}
          house={currentSession.house}
          onClose={() => setSession(null)}
          onSave={async (values) => {
            if (currentSession.house)
              await updateHouse({
                ...values,
                id: currentSession.house.id,
                concurrencyStamp: currentSession.house.concurrencyStamp,
              }).unwrap();
            else await createHouse(values).unwrap();
            success('House saved.');
          }}
        />
      )}
      {currentSession?.kind === 'leader' && canManage && (
        <HouseLeaderDialog
          key={`${context}:${currentSession.record.id}`}
          kind={currentSession.type}
          academicMediumId={mediumId}
          record={currentSession.record}
          onClose={() => setSession(null)}
          onSave={async (values) => {
            await (
              currentSession.type === 'house' ? setHouseLeader(values) : setDivisionLeader(values)
            ).unwrap();
            success('Leader updated.');
          }}
        />
      )}
      {currentSession?.kind === 'assignment' && canManage && (
        <HouseAssignmentDrawer
          key={context}
          academicMediumId={mediumId}
          enrollmentIds={currentSession.ids}
          initialMode={currentSession.mode}
          onClose={() => setSession(null)}
          onPreview={(values) => previewAssignment(values).unwrap()}
          onCommit={async (values) => {
            await commitAssignment(values).unwrap();
            success('House membership updated.');
          }}
        />
      )}
      <ConfirmDialog
        open={currentSession?.kind === 'delete' && canDelete}
        title="Delete House?"
        onClose={() => setSession(null)}
        disableCancel={deleting.isLoading}
        bodyBusy={deleting.isLoading}
        content={
          <Stack spacing={1}>
            <Typography variant="body2">
              Delete {currentSession?.kind === 'delete' ? currentSession.house.name : 'this house'}?
              This house must have no students.
            </Typography>
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
          </Stack>
        }
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            disabled={deleting.isLoading}
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={async () => {
              if (currentSession?.kind !== 'delete' || deleting.isLoading) return;
              try {
                await deleteHouse({
                  academicMediumId: mediumId,
                  id: currentSession.house.id,
                  concurrencyStamp: currentSession.house.concurrencyStamp,
                }).unwrap();
                success('House deleted.');
                setSession(null);
              } catch (failure) {
                setDeleteError(parseApiProblemDetail(failure).detail);
              }
            }}
          >
            Delete house
          </Button>
        }
      />
    </Box>
  );
}
