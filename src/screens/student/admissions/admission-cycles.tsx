'use client';

import type { RootState } from 'src/redux/store';
import type { AcademicYear } from 'src/types/school';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionCycle,
  CloneAdmissionCycle,
  AdmissionCycleAction,
  AdmissionCycleStatus,
  ReopenAdmissionCycle,
  ScheduleAdmissionCycle,
  AdmissionCycleValidation,
  AdmissionCycleWindowStatus,
  CreateUpdateAdmissionCycle,
  UpdateAdmissionCycleWindow,
} from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatDateOnly } from 'src/utils/date-only';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import CustomTooltip from 'src/components/custom-tooltip';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { Box, Paper, Stack, Button, MenuItem, TextField, Typography } from '@mui/material';
import {
  useGetAdmissionCyclesQuery,
  useCloseAdmissionCycleMutation,
  useCloneAdmissionCycleMutation,
  useCreateAdmissionCycleMutation,
  useUpdateAdmissionCycleMutation,
  useDeleteAdmissionCycleMutation,
  useReopenAdmissionCycleMutation,
  useArchiveAdmissionCycleMutation,
  usePublishAdmissionCycleMutation,
  useScheduleAdmissionCycleMutation,
  useValidateAdmissionCycleMutation,
  useUpdateAdmissionCycleWindowMutation,
} from 'src/redux/student/admissions/admission-cycles-api';

import { AdmissionTableText } from './admission-table-text';
import { AdmissionQueryError } from './admission-query-error';
import { AdmissionCycleDialog } from './admission-cycle-dialog';
import { useAdmissionCycleFilters } from './use-admission-cycle-filters';
import { AdmissionCycleActionDialog } from './admission-cycle-action-dialog';
import { AdmissionCycleDetailsDialog } from './admission-cycle-details-dialog';
import { AdmissionCycleCapacityDialog } from './admission-cycle-capacity-dialog';
import { AdmissionCycleConfigurationDialog } from './admission-cycle-configuration-dialog';
import {
  canEditCycle,
  windowLabels,
  canCloseCycle,
  canDeleteCycle,
  canReopenCycle,
  canArchiveCycle,
  canPublishCycle,
  lifecycleLabels,
  cycleScheduleSummary,
} from './admission-cycle-model';

import type { CycleGuardedAction } from './admission-cycle-action-dialog';
import type { CycleConfigurationMode } from './admission-cycle-configuration-dialog';

const lifecycleColors: Record<AdmissionCycleStatus, 'default' | 'success' | 'warning' | 'error'> = {
  0: 'default',
  1: 'success',
  2: 'warning',
  3: 'error',
};
const windowColors: Record<
  AdmissionCycleWindowStatus,
  'default' | 'success' | 'warning' | 'error'
> = {
  0: 'default',
  1: 'success',
  2: 'warning',
  3: 'warning',
  4: 'error',
};

const getAcademicYearSortValue = (year: AcademicYear): number => {
  const startDate = dayjs(year.startDate);
  if (startDate.isValid()) return startDate.valueOf();
  const firstYear = year.name.match(/\d{4}/)?.[0];
  return firstYear ? Number(firstYear) : Number.MIN_SAFE_INTEGER;
};

const getErrorMessage = (error: unknown): string =>
  (error as { data?: { detail?: string; error?: { message?: string } } })?.data?.detail ||
  (error as { data?: { error?: { message?: string } } })?.data?.error?.message ||
  'Action failed';

export default function AdmissionCyclesScreen() {
  const editDialog = useBoolean();
  const [editingCycle, setEditingCycle] = useState<AdmissionCycle | null>(null);
  const [detailsCycle, setDetailsCycle] = useState<AdmissionCycle | null>(null);
  const [capacityCycle, setCapacityCycle] = useState<AdmissionCycle | null>(null);
  const [actionCycle, setActionCycle] = useState<AdmissionCycle | null>(null);
  const [guardedAction, setGuardedAction] = useState<CycleGuardedAction | null>(null);
  const [configurationMode, setConfigurationMode] = useState<CycleConfigurationMode | null>(null);
  const [publishValidation, setPublishValidation] = useState<AdmissionCycleValidation | null>(null);
  const { filters, update: updateFilters, clear: clearFilters } = useAdmissionCycleFilters();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Admissions.View');
  const canAdd = hasGrantedPermission(permissions, 'Students.Admissions.Add');
  const canDelete = hasGrantedPermission(permissions, 'Students.Admissions.Delete');

  const {
    data: academicYearsData,
    isLoading: academicYearsLoading,
    isError: academicYearsError,
  } = useGetYearQuery(undefined);
  const academicYears = useMemo(
    () =>
      [...((academicYearsData?.items ?? []) as AcademicYear[])].sort(
        (left, right) => getAcademicYearSortValue(right) - getAcademicYearSortValue(left)
      ),
    [academicYearsData?.items]
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetAdmissionCyclesQuery({
    search: filters.search || undefined,
    academicYearId: filters.academicYearId || undefined,
    status: filters.status === '' ? undefined : filters.status,
    windowStatus: filters.windowStatus === '' ? undefined : filters.windowStatus,
    maxResultCount: filters.rowsPerPage,
    skipCount: filters.page * filters.rowsPerPage,
  });

  const hasActiveFilters = Boolean(
    filters.academicYearId || filters.status !== '' || filters.windowStatus !== '' || filters.search
  );

  const [createCycle, { isLoading: creating }] = useCreateAdmissionCycleMutation();
  const [updateCycle, { isLoading: updating }] = useUpdateAdmissionCycleMutation();
  const [publishCycle, { isLoading: publishing }] = usePublishAdmissionCycleMutation();
  const [closeCycle, { isLoading: closing }] = useCloseAdmissionCycleMutation();
  const [reopenCycle, { isLoading: reopening }] = useReopenAdmissionCycleMutation();
  const [archiveCycle, { isLoading: archiving }] = useArchiveAdmissionCycleMutation();
  const [deleteCycle, { isLoading: deleting }] = useDeleteAdmissionCycleMutation();
  const [cloneCycle, { isLoading: cloning }] = useCloneAdmissionCycleMutation();
  const [updateWindow, { isLoading: updatingWindow }] = useUpdateAdmissionCycleWindowMutation();
  const [scheduleCycle, { isLoading: scheduling }] = useScheduleAdmissionCycleMutation();
  const [validateCycle] = useValidateAdmissionCycleMutation();

  const actionBusy = publishing || closing || reopening || archiving || deleting;
  const configurationBusy = cloning || updatingWindow || scheduling;

  const closeGuardedDialog = () => {
    setGuardedAction(null);
    setActionCycle(null);
    setPublishValidation(null);
  };

  const openGuardedAction = async (action: CycleGuardedAction, cycle: AdmissionCycle) => {
    setActionCycle(cycle);
    setGuardedAction(action);
    setPublishValidation(null);
    if (action === 'publish') {
      try {
        setPublishValidation(await validateCycle(cycle.id).unwrap());
      } catch (error) {
        closeGuardedDialog();
        shikshaMitraToast.error({ message: getErrorMessage(error) });
      }
    }
  };

  const openConfiguration = (mode: CycleConfigurationMode, cycle: AdmissionCycle) => {
    setActionCycle(cycle);
    setConfigurationMode(mode);
  };

  const saveCycle = async (values: CreateUpdateAdmissionCycle) => {
    if (editingCycle) {
      await updateCycle({
        id: editingCycle.id,
        body: { ...values, concurrencyStamp: editingCycle.concurrencyStamp },
      }).unwrap();
    } else {
      await createCycle(values).unwrap();
    }
    shikshaMitraToast.success({
      message: editingCycle ? 'Admission cycle updated' : 'Admission cycle draft created',
    });
  };

  const confirmGuardedAction = async (payload: AdmissionCycleAction | ReopenAdmissionCycle) => {
    if (!actionCycle || !guardedAction) return;
    try {
      if (guardedAction === 'publish') {
        await publishCycle({
          id: actionCycle.id,
          concurrencyStamp: actionCycle.concurrencyStamp,
        }).unwrap();
      } else if (guardedAction === 'close') {
        await closeCycle({ id: actionCycle.id, body: payload }).unwrap();
      } else if (guardedAction === 'reopen') {
        await reopenCycle({ id: actionCycle.id, body: payload }).unwrap();
      } else if (guardedAction === 'archive') {
        await archiveCycle({ id: actionCycle.id, body: payload }).unwrap();
      } else {
        await deleteCycle({
          id: actionCycle.id,
          concurrencyStamp: actionCycle.concurrencyStamp,
        }).unwrap();
      }
      const successMessages: Record<CycleGuardedAction, string> = {
        publish: 'Admission cycle published',
        close: 'Admission cycle closed',
        reopen: 'Admission cycle reopened',
        archive: 'Admission cycle archived',
        delete: 'Unused draft deleted',
      };
      shikshaMitraToast.success({ message: successMessages[guardedAction] });
      closeGuardedDialog();
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const confirmConfiguration = async (
    payload: CloneAdmissionCycle | UpdateAdmissionCycleWindow | ScheduleAdmissionCycle
  ) => {
    if (!actionCycle || !configurationMode) return;
    try {
      if (configurationMode === 'clone') {
        await cloneCycle(payload as CloneAdmissionCycle).unwrap();
      } else if (configurationMode === 'window') {
        await updateWindow({
          id: actionCycle.id,
          body: payload as UpdateAdmissionCycleWindow,
        }).unwrap();
      } else {
        await scheduleCycle({
          id: actionCycle.id,
          body: payload as ScheduleAdmissionCycle,
        }).unwrap();
      }
      shikshaMitraToast.success({
        message:
          configurationMode === 'clone'
            ? 'Draft copy created'
            : configurationMode === 'window'
              ? 'Application window updated'
              : 'Admission cycle schedule saved',
      });
      setConfigurationMode(null);
      setActionCycle(null);
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Cycle',
      minWidth: 230,
      render: (_, row) => {
        const cycle = row as unknown as AdmissionCycle;
        return (
          <AdmissionTableText
            text={cycle.name}
            secondary={`${cycle.code} · ${cycle.academicYearName || 'Academic year'}`}
            strong
          />
        );
      },
    },
    {
      id: 'startDate',
      label: 'Application window',
      minWidth: 210,
      render: (_, row) => {
        const cycle = row as unknown as AdmissionCycle;
        const dates = `${formatDateOnly(cycle.startDate)} – ${formatDateOnly(cycle.endDate)}`;
        const schedule = cycleScheduleSummary(cycle);
        return (
          <AdmissionTableText text={dates} tooltip={schedule ? `${dates} · ${schedule}` : dates} />
        );
      },
    },

    {
      id: 'applicationCount',
      label: 'Usage',
      minWidth: 150,
      render: (_, row) => {
        const cycle = row as unknown as AdmissionCycle;
        return (
          <AdmissionTableText
            text={`${cycle.linkedOfferingCount} offerings · ${cycle.applicationCount} applications`}
          />
        );
      },
    },
    {
      id: 'status',
      label: 'Lifecycle',
      minWidth: 110,
      sticky: true,
      stickyPosition: 'right',
      stickyOnMobile: false,
      headerSx: { display: { xs: 'none', sm: 'table-cell' } },
      cellSx: { display: { xs: 'none', sm: 'table-cell' } },
      render: (value) => (
        <Label color={lifecycleColors[Number(value) as AdmissionCycleStatus]}>
          {lifecycleLabels[Number(value) as AdmissionCycleStatus]}
        </Label>
      ),
    },
    {
      id: 'windowStatus',
      label: <><Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Window</Box><Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Statuses</Box></>,
      minWidth: 110,
      sticky: true,
      stickyPosition: 'right',
      render: (value, row) => {
        const lifecycle = Number((row as AdmissionCycle).status) as AdmissionCycleStatus;
        const windowStatus = Number(value) as AdmissionCycleWindowStatus;
        const windowLabel = <Label color={windowColors[windowStatus]}>{windowLabels[windowStatus]}</Label>;
        return (
          <>
            <CustomTooltip title={`Lifecycle: ${lifecycleLabels[lifecycle]} · Window: ${windowLabels[windowStatus]}`} arrow>
              <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                <Label color={lifecycleColors[lifecycle]}>{lifecycleLabels[lifecycle]}</Label>
                {windowLabel}
              </Box>
            </CustomTooltip>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{windowLabel}</Box>
          </>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 160,
      minWidth: 150,
      headerSx: { width: { xs: 76, sm: 160 }, minWidth: { xs: 76, sm: 150 } },
      cellSx: { width: { xs: 76, sm: 160 }, minWidth: { xs: 76, sm: 150 } },
      align: 'left',
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) => {
        const cycle = row as unknown as AdmissionCycle;
        const actions = [
          ...(canAdd
            ? [
                {
                  id: 'edit',
                  label: `Edit ${cycle.name}`,
                  icon: 'solar:pen-bold',
                  disabled: !canEditCycle(cycle),
                  onClick: () => {
                    setEditingCycle(cycle);
                    editDialog.onTrue();
                  },
                },
              ]
            : []),
          ...(canDelete
            ? [
                {
                  id: 'delete',
                  label: `Delete ${cycle.name}`,
                  icon: 'solar:trash-bin-trash-bold',
                  color: canDeleteCycle(cycle) ? 'error.main' : 'text.disabled',
                  disabled: !canDeleteCycle(cycle),
                  tooltip: !canDeleteCycle(cycle)
                    ? 'Only unused draft admission cycles can be deleted.'
                    : undefined,
                  onClick: () => openGuardedAction('delete', cycle),
                },
              ]
            : []),
          ...(canView
            ? [
                {
                  id: 'capacity',
                  label: `Capacity & reservations for ${cycle.name}`,
                  icon: 'mdi:seat-outline',
                  onClick: () => setCapacityCycle(cycle),
                },
              ]
            : []),
          ...(canAdd && canPublishCycle(cycle)
            ? [
                {
                  id: 'publish',
                  label: `Validate & publish ${cycle.name}`,
                  icon: GlobalIcons.publish,
                  onClick: () => openGuardedAction('publish', cycle),
                },
              ]
            : []),
          ...(canAdd && canReopenCycle(cycle)
            ? [
                {
                  id: 'reopen',
                  label: `Reopen ${cycle.name}`,
                  icon: 'mdi:lock-open-outline',
                  onClick: () => openGuardedAction('reopen', cycle),
                },
              ]
            : []),
          ...(canAdd && (cycle.status === 1 || cycle.status === 2)
            ? [
                {
                  id: 'window',
                  label: `Revise window for ${cycle.name}`,
                  icon: GlobalIcons.calendar,
                  onClick: () => openConfiguration('window', cycle),
                },
              ]
            : []),
          ...(canAdd && (cycle.status === 0 || cycle.status === 1)
            ? [
                {
                  id: 'schedule',
                  label: `Schedule actions for ${cycle.name}`,
                  icon: GlobalIcons.clock,
                  onClick: () => openConfiguration('schedule', cycle),
                },
              ]
            : []),
          ...(canAdd
            ? [
                {
                  id: 'clone',
                  label: `Clone ${cycle.name} as draft`,
                  icon: GlobalIcons.copy,
                  onClick: () => openConfiguration('clone', cycle),
                },
              ]
            : []),
          ...(canDelete && canCloseCycle(cycle)
            ? [
                {
                  id: 'close',
                  label: `Close ${cycle.name}`,
                  icon: GlobalIcons.lockIcon,
                  onClick: () => openGuardedAction('close', cycle),
                },
              ]
            : []),
          ...(canDelete && canArchiveCycle(cycle)
            ? [
                {
                  id: 'archive',
                  label: `Archive ${cycle.name}`,
                  icon: GlobalIcons.archive,
                  onClick: () => openGuardedAction('archive', cycle),
                },
              ]
            : []),
        ];
        return (
          <AdaptiveThreeDotsActions
            placement="right-top"
            moreLabel={`More actions for ${cycle.name}`}
            mobileDirectActionLimit={0}
            sx={{ gap: 0, '& .MuiIconButton-root': { width: { xs: 44, sm: 30 }, height: { xs: 44, sm: 30 } } }}
            actions={actions}
          />
        );
      },
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Admission Periods"
        description="Create, publish, monitor, close and retain controlled admission periods."
        links={[
          { name: 'Students', href: '/student/dashboard' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Admission Setup', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Periods' },
        ]}
        sx={{
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          rowGap: { xs: 0.5, md: 0 },
          '& > :first-of-type': { flexGrow: { xs: 1, md: 0 } },
          '& > :nth-of-type(2)': {
            order: { xs: 3, md: 0 },
            flexBasis: { xs: '100%', md: 'auto' },
          },
        }}
        slotProps={{
          action: { order: { xs: 2, md: 0 } },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
        }}
        action={
          <Button
            size="small"
            variant="contained"
            disabled={!canAdd}
            startIcon={<Iconify icon="mdi:plus" />}
            sx={{ minHeight: { xs: 44, sm: 32 } }}
            onClick={() => {
              setEditingCycle(null);
              editDialog.onTrue();
            }}
          >
            Create cycle
          </Button>
        }
      />

      <Paper variant="outlined" sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
          <TextField
            select
            size="small"
            label="Academic year"
            value={filters.academicYearId}
            disabled={academicYearsLoading}
            onChange={(event) => updateFilters({ academicYearId: event.target.value })}
            slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
            sx={{ minWidth: 180, flex: { sm: 1 } }}
          >
            <MenuItem value="">All Academic Years</MenuItem>
            {academicYears.map((year) => (
              <MenuItem key={year.id} value={year.id}>
                {year.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Lifecycle"
            value={filters.status}
            onChange={(event) =>
              updateFilters({
                status:
                  event.target.value === ''
                    ? ''
                    : (Number(event.target.value) as AdmissionCycleStatus),
              })
            }
            slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
            sx={{ minWidth: 170, flex: { sm: 1 } }}
          >
            <MenuItem value="">All Lifecycles</MenuItem>
            {Object.entries(lifecycleLabels).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Application window"
            value={filters.windowStatus}
            onChange={(event) =>
              updateFilters({
                windowStatus:
                  event.target.value === ''
                    ? ''
                    : (Number(event.target.value) as AdmissionCycleWindowStatus),
              })
            }
            slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
            sx={{ minWidth: 190, flex: { sm: 1 } }}
          >
            <MenuItem value="">All Application Windows</MenuItem>
            {Object.entries(windowLabels).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          {hasActiveFilters && (
            <Button
              color="inherit"
              startIcon={<Iconify icon="solar:restart-bold" />}
              onClick={clearFilters}
              sx={{ minHeight: 44, flexShrink: 0 }}
            >
              Clear filters
            </Button>
          )}
        </Stack>
      </Paper>

      {isError && <AdmissionQueryError onRetry={() => refetch()} />}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="admission-cycles"
          tableTitle="Admission periods"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          isLoading={isLoading || isFetching}
          isPagination
          isSearch
          isFilter={false}
          serverSidePagination
          serverSideSearch
          page={filters.page}
          rowsPerPage={filters.rowsPerPage}
          searchTerm={filters.search}
          totalCount={data?.totalCount ?? 0}
          maxServerRowsPerPage={100}
          onServerPagination={(nextPage, nextRows) =>
            updateFilters({ page: Math.max(nextPage - 1, 0), rowsPerPage: nextRows })
          }
          onServerSearch={(term) => updateFilters({ search: term.trim() })}
          columns={columns}
          data={data?.items ?? []}
          handleRowClick={(row) => canView && setDetailsCycle(row as unknown as AdmissionCycle)}
          rowProps={(row) => ({
            tabIndex: canView ? 0 : -1,
            sx: { cursor: canView ? 'pointer' : 'default' },
            onKeyDown: (event) => {
              if (
                canView &&
                event.target === event.currentTarget &&
                (event.key === 'Enter' || event.key === ' ')
              ) {
                event.preventDefault();
                setDetailsCycle(row as unknown as AdmissionCycle);
              }
            },
          })}
          noDataText={
            <Stack spacing={1} alignItems="center">
              <Typography color="text.secondary">
                {hasActiveFilters
                  ? 'No admission periods match the selected filters.'
                  : 'No admission periods have been created yet.'}
              </Typography>
              {hasActiveFilters && (
                <Button color="inherit" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </Stack>
          }
        />
      </Box>

      <AdmissionCycleDialog
        open={editDialog.value}
        onClose={editDialog.onFalse}
        academicYearId={currentYear?.id ?? academicYears[0]?.id ?? ''}
        academicYears={academicYears}
        academicYearsLoading={academicYearsLoading}
        academicYearsError={academicYearsError}
        editingCycle={editingCycle}
        saving={creating || updating}
        onSave={saveCycle}
      />
      <AdmissionCycleDetailsDialog cycle={detailsCycle} onClose={() => setDetailsCycle(null)} />
      <AdmissionCycleCapacityDialog
        cycle={capacityCycle}
        canManage={canAdd}
        onClose={() => setCapacityCycle(null)}
      />
      <AdmissionCycleActionDialog
        action={guardedAction}
        cycle={actionCycle}
        validation={publishValidation}
        busy={actionBusy}
        onClose={closeGuardedDialog}
        onConfirm={confirmGuardedAction}
      />
      <AdmissionCycleConfigurationDialog
        mode={configurationMode}
        cycle={actionCycle}
        academicYears={academicYears}
        busy={configurationBusy}
        onClose={() => {
          setConfigurationMode(null);
          setActionCycle(null);
        }}
        onConfirm={confirmConfiguration}
      />
    </Box>
  );
}
