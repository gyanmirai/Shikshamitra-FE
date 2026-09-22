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
import { studentPaths } from 'src/constants/student-menu';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import { hasGrantedPermission } from 'src/utils/permissions';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Button, MenuItem, MenuList, TextField, Typography } from '@mui/material';
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

import { AdmissionQueryError } from './admission-query-error';
import { AdmissionCycleDialog } from './admission-cycle-dialog';
import { AdmissionCycleActionDialog } from './admission-cycle-action-dialog';
import { AdmissionCycleDetailsDialog } from './admission-cycle-details-dialog';
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
const windowColors: Record<AdmissionCycleWindowStatus, 'default' | 'success' | 'warning' | 'error'> = {
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
  const [actionCycle, setActionCycle] = useState<AdmissionCycle | null>(null);
  const [guardedAction, setGuardedAction] = useState<CycleGuardedAction | null>(null);
  const [configurationMode, setConfigurationMode] = useState<CycleConfigurationMode | null>(null);
  const [publishValidation, setPublishValidation] = useState<AdmissionCycleValidation | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AdmissionCycleStatus | ''>('');
  const [windowStatus, setWindowStatus] = useState<AdmissionCycleWindowStatus | ''>('');

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Admissions.View');
  const canAdd = hasGrantedPermission(permissions, 'Students.Admissions.Add');
  const canDelete = hasGrantedPermission(permissions, 'Students.Admissions.Delete');

  const { data: academicYearsData, isLoading: academicYearsLoading, isError: academicYearsError } =
    useGetYearQuery(undefined);
  const academicYears = useMemo(
    () =>
      ([...((academicYearsData?.items ?? []) as AcademicYear[])]).sort(
        (left, right) => getAcademicYearSortValue(right) - getAcademicYearSortValue(left)
      ),
    [academicYearsData?.items]
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetAdmissionCyclesQuery({
    search: search || undefined,
    status: status === '' ? undefined : status,
    windowStatus: windowStatus === '' ? undefined : windowStatus,
    maxResultCount: rowsPerPage,
    skipCount: page * rowsPerPage,
  });

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
        await publishCycle({ id: actionCycle.id, concurrencyStamp: actionCycle.concurrencyStamp }).unwrap();
      } else if (guardedAction === 'close') {
        await closeCycle({ id: actionCycle.id, body: payload }).unwrap();
      } else if (guardedAction === 'reopen') {
        await reopenCycle({ id: actionCycle.id, body: payload }).unwrap();
      } else if (guardedAction === 'archive') {
        await archiveCycle({ id: actionCycle.id, body: payload }).unwrap();
      } else {
        await deleteCycle({ id: actionCycle.id, concurrencyStamp: actionCycle.concurrencyStamp }).unwrap();
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
        await updateWindow({ id: actionCycle.id, body: payload as UpdateAdmissionCycleWindow }).unwrap();
      } else {
        await scheduleCycle({ id: actionCycle.id, body: payload as ScheduleAdmissionCycle }).unwrap();
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
          <Box>
            <Typography fontWeight={600}>{cycle.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {cycle.code} · {cycle.academicYearName || 'Academic year'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'startDate',
      label: 'Application window',
      minWidth: 210,
      render: (_, row) => {
        const cycle = row as unknown as AdmissionCycle;
        return (
          <Box>
            <Typography variant="body2">{dayjs(cycle.startDate).format('DD MMM YYYY')} – {dayjs(cycle.endDate).format('DD MMM YYYY')}</Typography>
            {cycleScheduleSummary(cycle) && <Typography variant="caption" color="text.secondary">{cycleScheduleSummary(cycle)}</Typography>}
          </Box>
        );
      },
    },
    {
      id: 'windowStatus',
      label: 'Window',
      minWidth: 110,
      render: (value) => (
        <Label color={windowColors[Number(value) as AdmissionCycleWindowStatus]}>
          {windowLabels[Number(value) as AdmissionCycleWindowStatus]}
        </Label>
      ),
    },
    {
      id: 'applicationCount',
      label: 'Usage',
      minWidth: 150,
      render: (_, row) => {
        const cycle = row as unknown as AdmissionCycle;
        return <Typography variant="body2">{cycle.linkedOfferingCount} offerings · {cycle.applicationCount} applications</Typography>;
      },
    },
    {
      id: 'status',
      label: 'Lifecycle',
      minWidth: 110,
      sticky: true,
      stickyPosition: 'right',
      render: (value) => (
        <Label color={lifecycleColors[Number(value) as AdmissionCycleStatus]}>
          {lifecycleLabels[Number(value) as AdmissionCycleStatus]}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 160,
      minWidth: 150,
      align: 'right',
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) => {
        const cycle = row as unknown as AdmissionCycle;
        const hasOverflowActions =
          canAdd ||
          (canDelete && (canCloseCycle(cycle) || canArchiveCycle(cycle)));
        return (
          <ThreeDotsActions
            placement="right-top"
            showViewIcon={canView}
            viewIcon="mdi:eye-outline"
            viewLabel={`View ${cycle.name}`}
            handleViewClick={() => setDetailsCycle(cycle)}
            showEditIcon={canAdd}
            editLabel={`Edit ${cycle.name}`}
            disableEditIcon={!canEditCycle(cycle)}
            handleEditClick={() => {
              setEditingCycle(cycle);
              editDialog.onTrue();
            }}
            showDeleteIcon={canDelete}
            deleteLabel={`Delete ${cycle.name}`}
            disableDeleteIcon={!canDeleteCycle(cycle)}
            handleDeleteClick={() => openGuardedAction('delete', cycle)}
            showThreeDots={hasOverflowActions}
            moreLabel={`More actions for ${cycle.name}`}
            actions={({ popover }) => (
              <MenuList dense>
                {canAdd && canPublishCycle(cycle) && <MenuItem onClick={() => { popover.onClose(); openGuardedAction('publish', cycle); }}><Iconify icon={GlobalIcons.publish} />Validate & publish</MenuItem>}
                {canAdd && canReopenCycle(cycle) && <MenuItem onClick={() => { popover.onClose(); openGuardedAction('reopen', cycle); }}><Iconify icon="mdi:lock-open-outline" />Reopen</MenuItem>}
                {canAdd && (cycle.status === 1 || cycle.status === 2) && <MenuItem onClick={() => { popover.onClose(); openConfiguration('window', cycle); }}><Iconify icon={GlobalIcons.calendar} />Revise window</MenuItem>}
                {canAdd && (cycle.status === 0 || cycle.status === 1) && <MenuItem onClick={() => { popover.onClose(); openConfiguration('schedule', cycle); }}><Iconify icon={GlobalIcons.clock} />Schedule actions</MenuItem>}
                {canAdd && <MenuItem onClick={() => { popover.onClose(); openConfiguration('clone', cycle); }}><Iconify icon={GlobalIcons.copy} />Clone as draft</MenuItem>}
                {canDelete && canCloseCycle(cycle) && <MenuItem onClick={() => { popover.onClose(); openGuardedAction('close', cycle); }}><Iconify icon={GlobalIcons.lockIcon} />Close</MenuItem>}
                {canDelete && canArchiveCycle(cycle) && <MenuItem onClick={() => { popover.onClose(); openGuardedAction('archive', cycle); }}><Iconify icon={GlobalIcons.archive} />Archive</MenuItem>}
              </MenuList>
            )}
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
        links={[{ name: 'Students', href: '/student/dashboard' }, { name: 'Admissions', href: '/student/admissions' }, { name: 'Admission Setup', href: studentPaths.enrollment.settings.root }, { name: 'Admission Periods' }]}
        action={
          <Button size="small" variant="contained" disabled={!canAdd} startIcon={<Iconify icon="mdi:plus" />} onClick={() => { setEditingCycle(null); editDialog.onTrue(); }}>
            Create cycle
          </Button>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField select size="small" label="Lifecycle" value={status} onChange={(event) => { setStatus(event.target.value === '' ? '' : Number(event.target.value) as AdmissionCycleStatus); setPage(0); }} sx={{ minWidth: 160 }}>
          <MenuItem value="">All lifecycle states</MenuItem>
          {Object.entries(lifecycleLabels).map(([value, label]) => <MenuItem key={value} value={Number(value)}>{label}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Application window" value={windowStatus} onChange={(event) => { setWindowStatus(event.target.value === '' ? '' : Number(event.target.value) as AdmissionCycleWindowStatus); setPage(0); }} sx={{ minWidth: 180 }}>
          <MenuItem value="">All window states</MenuItem>
          {Object.entries(windowLabels).map(([value, label]) => <MenuItem key={value} value={Number(value)}>{label}</MenuItem>)}
        </TextField>
      </Stack>

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
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={data?.totalCount ?? 0}
          maxServerRowsPerPage={100}
          onServerPagination={(nextPage, nextRows) => { setPage(Math.max(nextPage - 1, 0)); setRowsPerPage(nextRows); }}
          onServerSearch={(term) => { setSearch(term.trim()); setPage(0); }}
          columns={columns}
          data={data?.items ?? []}
          handleRowClick={(row) => canView && setDetailsCycle(row as unknown as AdmissionCycle)}
          noDataText="No admission cycles match the selected filters."
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
        onClose={() => { setConfigurationMode(null); setActionCycle(null); }}
        onConfirm={confirmConfiguration}
      />
    </Box>
  );
}
