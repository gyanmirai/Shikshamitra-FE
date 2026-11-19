'use client';

import type { RootState } from 'src/redux/store';
import type { Theme } from '@mui/material/styles';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';
import type {
  House,
  HouseStudent,
  HouseDivision,
} from 'src/redux/student/house-management/house-management-types';

import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { useRef, useState, useEffect } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import { useStudentAcademicScope } from 'src/hooks/use-student-academic-scope';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useStudentSetupEmbedding, StudentSetupManagerHeader as CustomBreadcrumbs } from 'src/screens/student/setup/embedding';
import {
  Box,
  Tab,
  Card,
  Chip,
  Link,
  Alert,
  Stack,
  Button,
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
import HouseLogoAvatar from './house-logo-avatar';
import HouseLeaderDialog from './house-leader-dialog';
import HouseAssignmentDrawer from './house-assignment-drawer';
import { recordsQueryUrl } from '../records/records-url-state';
import StudentPhotoAvatar from '../components/student-photo-avatar';
import { studentAcademicFilterRowSx } from '../student-academic-filter-layout';
import { houseWorkspaceState, selectionForContext } from './house-management-model';

type Session =
  | { kind: 'house'; house?: House }
  | { kind: 'leader'; role: 'house'; record: House }
  | { kind: 'leader'; role: 'division'; record: HouseDivision }
  | { kind: 'assignment'; mode: 'assign' | 'remove'; ids: string[] }
  | { kind: 'delete'; house: House };

function classDivisionLabel(standardName: string, divisionName?: string | null) {
  return divisionName ? `${standardName} / ${divisionName}` : standardName;
}

const classDivisionValue = (value: unknown, row: IData) =>
  classDivisionLabel(String(value ?? '—'), row.divisionName);

const divisionPlacementValue = (value: unknown, row: IData) =>
  classDivisionLabel(row.standardName, String(value ?? '—'));

const leaderTints = { house: 'success', division: 'info', both: 'error' } as const;

function studentLeadershipRowProps(student: HouseStudent) {
  const role = student.isHouseLeader
    ? student.isDivisionLeader
      ? 'both'
      : 'house'
    : student.isDivisionLeader
      ? 'division'
      : undefined;
  if (!role) return {};

  const tint = leaderTints[role];
  return {
    'data-leadership': role,
    sx: {
      bgcolor: (theme: Theme) => varAlpha(theme.vars.palette[tint].mainChannel, 0.12),
      '&.MuiTableRow-hover:hover': {
        bgcolor: (theme: Theme) => varAlpha(theme.vars.palette[tint].mainChannel, 0.18),
      },
    },
  };
}

function StudentLeaderIcon({
  title,
  icon,
  color,
}: {
  title: string;
  icon: 'mdi:crown' | 'mdi:account-tie-hat-outline';
  color: 'success' | 'info';
}) {
  return (
    <CustomTooltip title={title} placement="right" arrow>
      <Box
        component="span"
        role="img"
        tabIndex={0}
        aria-label={title}
        sx={(theme) => ({
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: 0,
          color: theme.vars.palette[color].dark,
          borderRadius: 0.5,
          ...theme.applyStyles('dark', { color: theme.vars.palette[color].light }),
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        })}
      >
        <Iconify icon={icon} width={16} aria-hidden />
      </Box>
    </CustomTooltip>
  );
}

export default function HouseManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const routeParams = useSearchParams();
  const { embedded } = useStudentSetupEmbedding();
  const [embeddedQuery, setEmbeddedQuery] = useState('');
  const params = embedded ? new URLSearchParams(embeddedQuery) : routeParams;
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
  const requestedBoard = params.get('board');
  const requestedMedium = params.get('medium');
  const board = requestedBoard
    ? academic.boards.find((item) => item.id === requestedBoard)
    : academic.currentBoard;
  const mediums = board?.educationMediums ?? [];
  // A board change leaves the medium empty until the user chooses one for that board.
  const selectedMediumId =
    requestedMedium ?? (requestedBoard ? undefined : academic.currentMedium?.id);
  const medium = mediums.find((item) => item.id === selectedMediumId);
  const mediumId = medium?.id ?? '';
  const standards = medium?.educationMediumStages.flatMap((stage) => stage.standards) ?? [];
  const standard = standards.find((item) => item.id === params.get('class'));
  const standardId = standard?.id ?? '';
  const divisions = standard?.divisions ?? [];
  const divisionId = divisions.find((item) => item.id === params.get('division'))?.id ?? '';
  const houseId = params.get('house') ?? '';
  const unassignedOnly = params.get('assignment') === 'unassigned';
  const validScope = Boolean(medium);
  const awaitingMedium = Boolean(board && requestedBoard && !requestedMedium);
  const ready = validScope && !academic.isLoading && !academic.isError;
  const hasSelectedDivision = Boolean(divisionId);
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
    {
      ...input,
      standardId: standardId || undefined,
      divisionId: divisionId || undefined,
    },
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
  const moreFiltersPopover = usePopover();
  const moreFiltersCount = (houseId ? 1 : 0) + (unassignedOnly ? 1 : 0);
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
    canManage && hasSelectedDivision && ready && !query.isError
      ? selectionForContext(selection, context)
      : [];
  const currentSession = session?.context === context ? session.value : null;
  useEffect(() => {
    setSession((previous) => (previous?.context === context ? previous : null));
  }, [context]);
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
    if (embedded) {
      const lastPage = Math.max(0, Math.ceil(settledTotal / state.pageSize) - 1);
      if (state.page > lastPage) setEmbeddedQuery(new URL(recordsQueryUrl(pathname, currentQuery, { page: lastPage || undefined }), 'https://local.invalid').search.slice(1));
      return;
    }
    const lastPage = Math.max(0, Math.ceil(settledTotal / state.pageSize) - 1);
    if (state.page > lastPage)
      router.replace(recordsQueryUrl(pathname, currentQuery, { page: lastPage || undefined }), {
        scroll: false,
      });
  }, [ready, settledTotal, state.page, state.pageSize, router, pathname, currentQuery, embedded]);
  const update = (changes: Record<string, string | number | undefined>) => {
    const url = recordsQueryUrl(pathname, currentQuery, changes);
    if (embedded) { setEmbeddedQuery(new URL(url, 'https://local.invalid').search.slice(1)); return; }
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
    if (!canManage || !hasSelectedDivision || !ready || query.isFetching || query.isError) return;
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
        sx={{ typography: 'body2', fontWeight: 'fontWeightSemiBold', overflowWrap: 'anywhere' }}
      >
        {student.studentName}
      </Link>
    ) : (
      <Typography
        component="span"
        variant="body2"
        sx={{ fontWeight: 'fontWeightSemiBold', overflowWrap: 'anywhere' }}
      >
        {student.studentName}
      </Typography>
    );
  const leader = (student: HouseStudent | null | undefined, canManageRole: boolean) =>
    student ? name(student) : canManageRole ? (
      <Label color="default" sx={{ typography: 'caption', height: 22 }}>
        Vacant
      </Label>
    ) : (
      <Typography component="span" variant="body2" color="text.disabled">
        Not available
      </Typography>
    );
  const disabled = !ready || query.isFetching || query.isError;
  const membershipSelectionDisabled = disabled || !hasSelectedDivision;
  const houseColumns: IColumn[] = [
    {
      id: 'name',
      label: 'House',
      isSort: true,
      isFilter: true,
      filterType: 'string',
      minWidth: 180,
      render: (_, row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <SubjectColorIndicator color={row.color} />
          <HouseLogoAvatar name={String(row.name)} logoUrl={row.logoUrl} />
          <Typography
            variant="body2"
            sx={{ fontWeight: 'fontWeightSemiBold', overflowWrap: 'anywhere' }}
          >
            {row.name}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'memberCount',
      label: 'Visible students',
      align: 'right',
      minWidth: 130,
      isFilter: true,
      filterType: 'number',
      render: (value) => (
        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {value ?? 0}
        </Typography>
      ),
    },
    {
      id: 'leader',
      label: 'House leader',
      minWidth: 160,
      isFilter: false,
      render: (_, row) => leader(row.leader, row.canManage),
      exportValue: (_, row) => row.leader?.studentName ?? null,
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200,
      isFilter: true,
      filterType: 'string',
      render: (value) => value || '—',
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      minWidth: 125,
      excludeFromExport: true,
      sticky: true,
      stickyPosition: 'right',
      render: (_, data) => {
        const row = data as House;
        return (
          <AdaptiveThreeDotsActions
            directActionLimit={2}
            collapseOnOverflow={false}
            moreLabel={`More actions for ${row.name}`}
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
                      label: 'Manage leader',
                      ariaLabel: `Manage leader for ${row.name}`,
                      icon: 'mdi:account-switch-outline',
                      disabled: disabled || !row.canManage,
                      tooltip: !row.canManage ? 'Full house scope is required.' : undefined,
                      onClick: () => open({ kind: 'leader', role: 'house', record: row }),
                    },
                  ]
                : []),
              ...(canDelete
                ? [
                    {
                      id: 'delete',
                      label: 'Delete',
                      ariaLabel: `Delete ${row.name}`,
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
    ...(canManage && hasSelectedDivision
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
                disabled={membershipSelectionDisabled}
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
                  membershipSelectionDisabled ||
                  (!selected.includes(row.enrollmentId) && selected.length >= 500)
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
      isFilter: true,
      filterType: 'string',
      minWidth: 220,
      width: '34%',
      render: (_, data) => {
        const row = data as HouseStudent;
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <StudentPhotoAvatar
              studentId={row.studentId}
              alt={row.studentName}
              lazy
              sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
                bgcolor: 'background.neutral',
                color: 'text.secondary',
                fontSize: 12,
              }}
            >
              {String(row.studentName)
                .split(' ')
                .filter(Boolean)
                .map((part) => part.charAt(0))
                .join('')
                .slice(0, 2)
                .toUpperCase() || '—'}
            </StudentPhotoAvatar>
            <Stack
              component="span"
              direction="row"
              gap={0.75}
              alignItems="center"
              sx={{ minWidth: 0 }}
            >
              {name(row)}
              {row.isHouseLeader && (
                <StudentLeaderIcon
                  title={row.houseName ? `House leader · ${row.houseName}` : 'House leader'}
                  icon="mdi:crown"
                  color="success"
                />
              )}
              {row.isDivisionLeader && (
                <StudentLeaderIcon
                  title={`Division leader · ${classDivisionLabel(row.standardName, row.divisionName)}`}
                  icon="mdi:account-tie-hat-outline"
                  color="info"
                />
              )}
            </Stack>
          </Stack>
        );
      },
    },
    {
      id: 'admissionNumber',
      label: 'GR number',
      minWidth: 140,
      isSort: false,
      isFilter: true,
      filterType: 'string',
      render: (value) => value || '—',
    },
    {
      id: 'standardName',
      label: 'Class / Division',
      isSort: true,
      isFilter: true,
      filterType: 'string',
      minWidth: 140,
      render: classDivisionValue,
      filterValue: classDivisionValue,
      exportValue: classDivisionValue,
    },
    {
      id: 'rollNumber',
      label: 'Roll number',
      minWidth: 100,
      isFilter: true,
      filterType: 'number',
      render: (value) => (
        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {value ?? '—'}
        </Typography>
      ),
    },
    {
      id: 'houseName',
      label: 'House',
      isSort: true,
      isFilter: true,
      filterType: 'string',
      minWidth: 140,
      render: (_value, row) =>
        row.houseName ? (
          <Typography variant="body2">{row.houseName}</Typography>
        ) : (
          <Label color="default" sx={{ typography: 'caption', height: 22 }}>
            Unassigned
          </Label>
        ),
    },
  ];
  const divisionColumns: IColumn[] = [
    {
      id: 'name',
      label: 'Class / Division',
      isSort: true,
      minWidth: 180,
      isFilter: true,
      filterType: 'string',
      render: divisionPlacementValue,
      filterValue: divisionPlacementValue,
      exportValue: divisionPlacementValue,
    },
    {
      id: 'leader',
      label: 'Division leader',
      minWidth: 180,
      isFilter: false,
      render: (_, row) => leader(row.leader, row.canManage),
      exportValue: (_, row) => row.leader?.studentName ?? null,
    },
    ...(canManage
      ? [
          {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            width: 100,
            sticky: true,
            stickyPosition: 'right',
            excludeFromExport: true,
            render: (_: unknown, row: HouseDivision) => (
              <AdaptiveThreeDotsActions
                directActionLimit={2}
                collapseOnOverflow={false}
                sx={{ justifyContent: 'flex-end' }}
                actions={[
                  {
                    id: 'leader',
                    label: 'Manage division leader',
                    ariaLabel: `Manage division leader for ${row.standardName} / ${row.name}`,
                    icon: 'mdi:account-switch-outline',
                    disabled: disabled || !row.canManage,
                    tooltip: !row.canManage ? 'Full division scope is required.' : undefined,
                    onClick: () => open({ kind: 'leader', role: 'division', record: row }),
                  },
                ]}
              />
            ),
          } as IColumn,
        ]
      : []),
  ];
  const mediumPrompt = mediums.length
    ? 'Select a medium to view records.'
    : 'No mediums are available for this board.';
  const tableError = academic.isError
    ? 'Academic scope could not be loaded. Refresh the page and try again.'
    : !validScope && !academic.isLoading && !awaitingMedium
      ? 'Choose an available board and medium.'
      : ready && query.isError
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
        gap: 1,
      }}
    >
      <CustomBreadcrumbs
        editorOpen={Boolean(currentSession)} busy={deleting.isLoading}
        heading="House Management"
        description="Manage medium-wise houses, cross-class membership, and separate House and Division leaders. Counts and leaders reflect your academic scope."
        descriptionDisplay="tooltip"
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.root },
          { name: 'House Management' },
        ]}
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
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <CustomTabs
          value={state.tab}
          variant="scrollable"
          scrollButtons="auto"
          guardUnsavedChanges={false}
          onChange={embedded ? (_, tab: string) => !currentSession && update({ tab, search: undefined, sort: undefined, page: undefined }) : undefined}
          aria-label="House management sections"
          sx={{ bgcolor: 'transparent' }}
          slotProps={{ scroller: { px: 0.75, py: 0.5 }, tab: { px: 1.25 } }}
        >
          <Tab
            value="houses"
            component={embedded ? 'button' : RouterLink}
            href={embedded ? undefined : recordsQueryUrl(pathname, currentQuery, {
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
            component={embedded ? 'button' : RouterLink}
            href={embedded ? undefined : recordsQueryUrl(pathname, currentQuery, {
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
            component={embedded ? 'button' : RouterLink}
            href={embedded ? undefined : recordsQueryUrl(pathname, currentQuery, {
              tab: 'divisions',
              search: undefined,
              sort: undefined,
              page: undefined,
            })}
            id="house-management-tab-divisions"
            aria-controls="house-management-panel"
            label="Assign Leaders"
            icon={<Iconify icon="mdi:account-switch-outline" />}
            iconPosition="start"
          />
        </CustomTabs>
      </Card>
      <Card
        variant="outlined"
        sx={{
          px: 2,
          py: 1.25,
          borderRadius: 2,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          gap={1}
          alignItems={{ xs: 'stretch', lg: 'center' }}
        >
          <Box sx={{ ...studentAcademicFilterRowSx, flex: 1 }}>
            <CustomSelect
              label="Board"
              value={board?.id ?? ''}
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
                  leaderHouse: undefined,
                  leaderHouseName: undefined,
                  page: undefined,
                })
              }
            />
            <CustomSelect
              label="Medium"
              value={mediumId}
              options={mediums}
              labelKey="name"
              valueKey="id"
              isLoading={academic.isLoading}
              disabled={!board}
              onChange={(value) =>
                update({
                  medium: String(value),
                  class: undefined,
                  division: undefined,
                  house: undefined,
                  houseName: undefined,
                  leaderHouse: undefined,
                  leaderHouseName: undefined,
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
                disabled={!medium}
                onChange={(value) =>
                  update({
                    class: value === 'all' ? undefined : String(value),
                    division: undefined,
                    page: undefined,
                  })
                }
              />
            )}
            {state.tab !== 'houses' && (
              <CustomSelect
                label="Division"
                value={divisionId || 'all'}
                options={[{ id: 'all', name: 'All divisions' }, ...divisions]}
                labelKey="name"
                valueKey="id"
                disabled={!standard}
                onChange={(value) =>
                  update({ division: value === 'all' ? undefined : String(value), page: undefined })
                }
              />
            )}
          </Box>
          {state.tab === 'students' && (
            <Box sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', lg: 'center' } }}>
              <Button
                variant="outlined"
                color={moreFiltersCount ? 'primary' : 'inherit'}
                size="medium"
                onClick={moreFiltersPopover.onOpen}
                startIcon={<Iconify icon="mdi:tune" width={18} />}
                aria-haspopup="dialog"
                aria-expanded={moreFiltersPopover.open}
                aria-controls={
                  moreFiltersPopover.open ? 'house-management-more-filters' : undefined
                }
                sx={{
                  height: 40,
                  whiteSpace: 'nowrap',
                  px: 1.5,
                  borderRadius: 1,
                  width: { xs: 1, lg: 'auto' },
                }}
              >
                Filters
                {moreFiltersCount > 0 && (
                  <Label color="primary" variant="soft" sx={{ ml: 0.75 }}>
                    {moreFiltersCount}
                  </Label>
                )}
              </Button>
            </Box>
          )}
        </Stack>
        {state.tab === 'students' && (Boolean(houseId) || unassignedOnly) && (
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
            aria-label="Applied house filters"
            sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider', mt: 1.5 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 'fontWeightMedium' }}
            >
              Applied filters:
            </Typography>
            {Boolean(houseId) && (
              <Chip
                size="small"
                variant="outlined"
                color="primary"
                label={`House: ${params.get('houseName') || selectedHouseFilter?.name || 'Selected'}`}
                onDelete={() => {
                  setSelectedHouseFilter(null);
                  update({ house: undefined, houseName: undefined, page: undefined });
                }}
              />
            )}
            {unassignedOnly && (
              <Chip
                size="small"
                variant="outlined"
                color="primary"
                label="Assignment: Unassigned only"
                onDelete={() => update({ assignment: undefined, page: undefined })}
              />
            )}
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                setSelectedHouseFilter(null);
                update({
                  house: undefined,
                  houseName: undefined,
                  assignment: undefined,
                  page: undefined,
                });
              }}
            >
              Reset more filters
            </Button>
          </Stack>
        )}
        {!canManage && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Read-only access. House changes require Add permission.
          </Typography>
        )}
        {canManage && state.tab === 'houses' && houses.currentData && !mediumCanManage && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            House creation and catalogue changes require access to the entire selected medium.
          </Typography>
        )}
      </Card>
      {state.tab === 'students' && (
        <CustomPopover
          open={moreFiltersPopover.open}
          anchorEl={moreFiltersPopover.anchorEl}
          onClose={moreFiltersPopover.onClose}
          slotProps={{
            paper: {
              role: 'dialog',
              id: 'house-management-more-filters',
              'aria-labelledby': 'house-management-more-filters-title',
              sx: {
                p: 2.5,
                width: 340,
                maxWidth: 'calc(100vw - 32px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              },
            },
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography id="house-management-more-filters-title" variant="subtitle1">
              More Filters
            </Typography>
            {moreFiltersCount > 0 && (
              <Button
                variant="text"
                color="inherit"
                size="small"
                startIcon={<Iconify icon="mdi:restore" width={16} />}
                onClick={() => {
                  setSelectedHouseFilter(null);
                  update({
                    house: undefined,
                    houseName: undefined,
                    assignment: undefined,
                    page: undefined,
                  });
                }}
              >
                Reset
              </Button>
            )}
          </Stack>
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
                      houseLeaderCount: 0,
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
          <Stack direction="row" justifyContent="flex-end" sx={{ pt: 0.5 }}>
            <Button variant="contained" size="small" onClick={moreFiltersPopover.onClose}>
              Done
            </Button>
          </Stack>
        </CustomPopover>
      )}
      {canManage && state.tab === 'students' && (
        <Card
          variant="outlined"
          sx={{
            px: 2,
            py: 0.75,
            borderRadius: 2,
            borderColor: 'divider',
            bgcolor: selected.length > 0 ? 'action.selected' : 'background.paper',
            flexShrink: 0,
          }}
        >
          <Stack
            role="toolbar"
            aria-label="Selected students"
            direction="row"
            gap={0.5}
            flexWrap="wrap"
            alignItems="center"
          >
            <Typography variant="body2" sx={{ mr: 'auto', fontWeight: 'fontWeightMedium' }}>
              {hasSelectedDivision
                ? `${selected.length} selected`
                : 'Select a division to change house membership.'}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={!selected.length || membershipSelectionDisabled}
              startIcon={<Iconify icon={GlobalIcons.assigned} />}
              onClick={() => open({ kind: 'assignment', mode: 'assign', ids: selected })}
            >
              Assign or move
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={!selected.length || membershipSelectionDisabled}
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
        </Card>
      )}
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
                : 'Assign Leaders'
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
          rowProps={
            state.tab === 'students'
              ? (row) => studentLeadershipRowProps(row as HouseStudent)
              : undefined
          }
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{
            sx: { height: 1 },
            'aria-label':
              state.tab === 'houses'
                ? 'Houses'
                : state.tab === 'students'
                  ? 'House membership students'
                  : 'Assign Leaders',
          }}
          serverSidePagination
          serverSideSearch
          serverSideSort
          serverSideSortMode="single"
          showExport
          isFilter
          isSearch
          searchFieldProps={{
            placeholder:
              state.tab === 'students'
                ? 'Search name or GR number'
                : state.tab === 'houses'
                  ? 'Search house name'
                  : 'Search class or division',
            inputProps: {
              'aria-label':
                state.tab === 'students'
                  ? 'Search students'
                  : state.tab === 'houses'
                    ? 'Search houses'
                    : 'Search divisions',
            },
          }}
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
          sorts={
            state.sorting
              ? [
                  {
                    column: state.sorting.split(' ')[0],
                    direction: state.sorting.endsWith('desc') ? 'desc' : 'asc',
                  },
                ]
              : []
          }
          onClearCriteria={() =>
            update({
              search: undefined,
              class: undefined,
              division: undefined,
              house: undefined,
              houseName: undefined,
              leaderHouse: undefined,
              leaderHouseName: undefined,
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
            awaitingMedium
              ? mediumPrompt
              : state.search ||
                  standardId ||
                  divisionId ||
                  (state.tab === 'students' && (houseId || unassignedOnly))
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
          academicMediumId={mediumId}
          role={currentSession.role}
          record={currentSession.record}
          onClose={() => setSession(null)}
          onSave={async (values) => {
            await (currentSession.role === 'house'
              ? setHouseLeader(values)
              : setDivisionLeader(values)).unwrap();
            success('Leader updated.');
          }}
        />
      )}
      {currentSession?.kind === 'assignment' && canManage && hasSelectedDivision && (
        <HouseAssignmentDrawer
          key={context}
          academicMediumId={mediumId}
          divisionId={divisionId}
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
