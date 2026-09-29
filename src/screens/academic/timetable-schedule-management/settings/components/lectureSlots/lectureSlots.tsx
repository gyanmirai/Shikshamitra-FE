'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { Add } from '@mui/icons-material';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Card, Stack, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useGetLectureSlotsQuery } from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';
import { TimetableStatusChip } from 'src/components/timetable-status-chip/TimetableStatusChip';
import { TIMETABLE_STATUS_LABEL, normalizeTimetableStatus } from 'src/utils/timetable-capacity';
import { TimetableSettingsSummaryCards } from 'src/screens/academic/components/AcademicSummaryInsights';

import ViewCreateSlots from './ViewCreateSlots';
import AssignSlots from './assignSlotsComponent';
import CreateSlotsForm, { getDayLabel } from './createSlotsForm';

const TIMETABLE_SETTING_STATUS_FILTER_OPTIONS = Object.values(TIMETABLE_STATUS_LABEL).map(
  (label) => ({ value: label, label })
);

const LectureSlots = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [editData, setEditData] = useState<any>(null);
  const [disabled, setDisabled] = useState(false);
  const addLectureSlotDialog = useBoolean(false);
  const [isEdit, setIsEdit] = useState(false);
  const viewSlotsDialog = useBoolean();

  const assignSlotsDialog = useBoolean();

  React.useEffect(() => {
    const action = searchParams.get('action');
    if (!action) {
      addLectureSlotDialog.onFalse();
      assignSlotsDialog.onFalse();
      viewSlotsDialog.onFalse();
      setEditData(null);
      setIsEdit(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname]);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.timetable.settings.lectureSlots}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.timetable.settings.lectureSlots}.View`
  );

  const { data: lectureSlotsData, isLoading: isLectureSlotsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotsQuery,
    params: { AcademicMediumId: medium?.id },
    options: { skip: !medium?.id },
  });

  const tableData = useMemo(
    () =>
      lectureSlotsData?.items?.map((item: any) => {
        const normalizedStatus = normalizeTimetableStatus(item.status);
        const slotConfigurationSummary =
          item.slotConfigurations
            ?.map((config: any) => {
              const fromDay = getDayLabel(config.fromDay);
              const toDay = getDayLabel(config.toDay);
              const daySelection = config.activeDays?.length
                ? config.activeDays.map(getDayLabel).join(', ')
                : config.fromDay === config.toDay
                  ? fromDay
                  : `${fromDay} to ${toDay}`;
              return `${daySelection} ${config.totalSlots} slot${config.totalSlots === 1 ? '' : 's'}`;
            })
            .join(' ') ?? '';

        return {
          ...item,
          statusLabel: normalizedStatus ? TIMETABLE_STATUS_LABEL[normalizedStatus] : '',
          slotConfigurationSummary,
        };
      }) ?? [],
    [lectureSlotsData]
  );

  const summaryCards = useMemo(() => {
    const total = tableData.length;
    const configured = tableData.filter(
      (item: any) => normalizeTimetableStatus(item.status) !== 'PendingSlotSetup'
    ).length;
    const ready = tableData.filter(
      (item: any) => normalizeTimetableStatus(item.status) === 'Balanced'
    ).length;
    const capacityIssues = tableData.filter(
      (item: any) => normalizeTimetableStatus(item.status) === 'OverCapacity'
    ).length;

    return [
      {
        label: 'Total Classes',
        value: total,
        icon: 'mdi:google-classroom',
        color: 'primary' as const,
      },
      {
        label: 'Configured Slots',
        value: configured,
        icon: 'mdi:check-circle-outline',
        color: 'info' as const,
      },
      {
        label: 'Pending Slots',
        value: total - configured,
        icon: 'mdi:clock-alert-outline',
        color: 'warning' as const,
      },
      {
        label: 'Ready for Timetable',
        value: ready,
        icon: 'mdi:calendar-check-outline',
        color: 'success' as const,
      },
      {
        label: 'Capacity Issues',
        value: capacityIssues,
        icon: 'mdi:alert-circle-outline',
        color: 'error' as const,
      },
    ];
  }, [tableData]);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setIsEdit(false);
      setDisabled(false);
      setEditData(null);
      dispatch(setIsChanges(false));
      router.push(pathname);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addLectureSlotDialog.onFalse();
      assignSlotsDialog.onFalse();
      viewSlotsDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addLectureSlotDialog.onFalse();
      assignSlotsDialog.onFalse();
      viewSlotsDialog.onFalse();
      resetState();
    }
  };

  // Mock data with proper structure

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'standardName',
        label: 'Class',
        filterType: 'string',
        align: 'left',
        sticky: true,
        stickyPosition: 'left',
        minWidth: 120,
      },
      {
        id: 'activeDaysCount',
        label: 'Active Days',
        minWidth: 100,
        filterType: 'number',
        align: 'left',
        render: (value) => (value == null ? '—' : `${value} day${value === 1 ? '' : 's'}`),
      },
      {
        id: 'teachingSlotsPerDay',
        label: 'Teaching Slots/Day',
        minWidth: 130,
        filterType: 'number',
        align: 'left',
        render: (value) => (value == null ? '—' : value),
      },
      {
        id: 'weeklyTeachingCapacity',
        label: 'Weekly Teaching Capacity',
        minWidth: 150,
        filterType: 'number',
        align: 'left',
        render: (value) => (value == null ? '—' : `${value}/week`),
      },
      {
        id: 'slotConfigurationSummary',
        label: 'Slot Configuration',
        minWidth: 220,
        isSort: false,
        filterType: 'string',
        align: 'left',
        render: (_: any, row: any) => (
          <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 1 }}>
            {row?.slotConfigurations?.map((item: any, index: number) => {
              const { fromDay, toDay, totalSlots } = item;
              const startLabel = getDayLabel(fromDay);
              const endLabel = getDayLabel(toDay);
              const daySelection = item.activeDays?.length
                ? item.activeDays.map(getDayLabel).join(', ')
                : fromDay === toDay
                  ? startLabel
                  : `${startLabel} → ${endLabel}`;
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: (theme) => theme.vars.palette.background.paper,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1.1,
                      py: 0.1,
                      borderRadius: 1,
                      bgcolor: (theme) => theme.palette.action.selected,
                      color: 'text.primary',
                      fontWeight: 500,
                      fontSize: '0.93em',
                      letterSpacing: 0.1,
                      mr: 0.5,
                    }}
                  >
                    {daySelection}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: (theme) => theme.palette.text.secondary, ml: 1 }}
                  >
                    {totalSlots} slot{totalSlots > 1 ? 's' : ''}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ),
      },
      {
        id: 'statusLabel',
        label: 'Status',
        minWidth: 170,
        isSort: false,
        filterType: 'enum',
        enumOptions: TIMETABLE_SETTING_STATUS_FILTER_OPTIONS,
        align: 'left',
        sticky: true,
        stickyPosition: 'right',
        render: (_value, row) =>
          row.status != null ? <TimetableStatusChip status={row.status} /> : '—',
      },
      {
        id: 'action',
        label: 'Actions',
        sticky: true,
        stickyPosition: 'right',
        align: 'left',
        isSort: false,
        isFilter: false,
        minWidth: 120,
        width: 120,
        render(value, row) {
          const rowActions = [
            ...(canView
              ? [
                  {
                    id: 'view',
                    label: 'View slots',
                    icon: 'solar:eye-bold',
                    onClick: () => {
                      viewSlotsDialog.onTrue();
                      setDisabled(true);
                      setIsEdit(false);
                      setEditData(row as any);
                      router.push(`${pathname}?action=view`);
                    },
                  },
                ]
              : []),
            ...(canAdd
              ? [
                  {
                    id: 'edit',
                    label: 'Edit slots',
                    icon: 'solar:pen-bold',
                    onClick: () => {
                      setDisabled(false);
                      setIsEdit(true);
                      setEditData(row as any);
                      addLectureSlotDialog.onTrue();
                      router.push(`${pathname}?action=edit`);
                    },
                  },
                  {
                    id: 'assign',
                    label: 'Assign to other class',
                    icon: 'mdi:arrow-right-circle',
                    onClick: () => {
                      setEditData(row);
                      assignSlotsDialog.onTrue();
                      router.push(`${pathname}?action=assign`);
                    },
                  },
                ]
              : []),
          ];

          return <AdaptiveThreeDotsActions actions={rowActions} placement="right-top" />;
        },
      },
    ],
    [addLectureSlotDialog, assignSlotsDialog, viewSlotsDialog, canAdd, canView, router, pathname]
  );
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Conditional Breadcrumbs */}
      {viewSlotsDialog.value ? (
        <CustomBreadcrumbs
          sx={{ mb: 1 }}
          heading="View Slots"
          description="View the detailed lecture slots for the selected class."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Timetable', href: '/academic/newTimetable' },
            { name: 'Settings' },
            { name: 'View Slots' },
          ]}
          isBack
          onBack={() => handleClose(null)}
        />
      ) : addLectureSlotDialog.value ? (
        <CustomBreadcrumbs
          sx={{ mb: 1 }}
          heading={`${isEdit ? 'Update' : 'Add'} Lecture Slot`}
          description={`${isEdit ? 'Update' : 'Add'} a new lecture slot for a class.`}
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Timetable', href: '/academic/newTimetable' },
            { name: 'Settings' },
            { name: 'Lecture Slots' },
            { name: `${isEdit ? 'Update' : 'Add'} Lecture Slot` },
          ]}
          isBack
          onBack={() => handleClose(null)}
        />
      ) : assignSlotsDialog.value ? (
        <CustomBreadcrumbs
          sx={{ mb: 1 }}
          heading="Assign Lecture Slot"
          description="Assign this lecture slot configuration to one or more classes."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Timetable', href: '/academic/newTimetable' },
            { name: 'Settings' },
            { name: 'Lecture Slots' },
            { name: 'Assign Lecture Slot' },
          ]}
          isBack
          onBack={() => handleClose(null)}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Lecture Slots"
          description="Configure and manage lecture slots for each class, including periods and breaks."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Timetable', href: '/academic/newTimetable' },
            { name: 'Settings' },
            { name: 'Lecture Slots' },
          ]}
          action={
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="nowrap">
              <TimetableSettingsSummaryCards
                cards={summaryCards}
                buttonSx={{ mb: 0, flexShrink: 0, whiteSpace: 'nowrap' }}
              />
              {canAdd && (
                <Button
                  sx={{ width: '160px' }}
                  startIcon={<Add />}
                  onClick={() => {
                    setEditData(null);
                    setIsEdit(false);
                    addLectureSlotDialog.onTrue();
                    router.push(`${pathname}?action=add`);
                  }}
                  variant="contained"
                  size="small"
                >
                  Lecture Slot
                </Button>
              )}
            </Stack>
          }
        />
      )}

      {/* Conditional Card/Table Rendering */}
      {addLectureSlotDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <CreateSlotsForm
            disabled={disabled}
            handleClose={handleClose}
            data={editData}
            isEdit={isEdit}
          />
        </Card>
      ) : viewSlotsDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ViewCreateSlots data={editData} />
        </Card>
      ) : assignSlotsDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AssignSlots
            onClose={handleClose}
            lectureSlotId={editData?.id}
            sourceClassName={editData?.standardName}
          />
        </Card>
      ) : (
        <CustomizableTable
          tableId="lecture-slots-setting-table"
          noDataText={
            <>
              Lecture slots not configured{' '}
              {canAdd && (
                <Box
                  onClick={() => {
                    addLectureSlotDialog.onTrue();
                  }}
                  color="primary.main"
                  fontWeight={600}
                  sx={{
                    '&:hover': {
                      cursor: 'pointer',
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create Slots
                </Box>
              )}
            </>
          }
          columns={columns}
          data={tableData}
          isLoading={isLectureSlotsLoading}
        />
      )}
    </Box>
  );
};

export default LectureSlots;
