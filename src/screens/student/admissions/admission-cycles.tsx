'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Stack, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  type AdmissionCycle,
  type AdmissionCycleStatus,
  useGetAdmissionCyclesQuery,
  useCloseAdmissionCycleMutation,
  useCreateAdmissionCycleMutation,
  useUpdateAdmissionCycleMutation,
  type CreateUpdateAdmissionCycle,
  useArchiveAdmissionCycleMutation,
  usePublishAdmissionCycleMutation,
} from 'src/redux/student/admissions/admission-cycles-api';

import { AdmissionCycleDialog } from './admission-cycle-dialog';
import { AdmissionQueryError } from './admission-query-error';

const statusLabels: Record<AdmissionCycleStatus, string> = {
  0: 'Draft',
  1: 'Published',
  2: 'Closed',
  3: 'Archived',
};
const statusColors: Record<AdmissionCycleStatus, 'default' | 'success' | 'warning' | 'error'> = {
  0: 'default',
  1: 'success',
  2: 'warning',
  3: 'error',
};

export default function AdmissionCyclesScreen() {
  const dialog = useBoolean();
  const [editingCycle, setEditingCycle] = useState<AdmissionCycle | null>(null);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(permissions, 'Students.Admissions.Create');
  const canEdit = hasGrantedPermission(permissions, 'Students.Admissions.Edit');
  const canPublish = hasGrantedPermission(permissions, 'Students.Admissions.Publish');
  const canClose = hasGrantedPermission(permissions, 'Students.Admissions.Close');
  const canArchive = hasGrantedPermission(permissions, 'Students.Admissions.Archive');
  const { data, isLoading, isError, refetch } = useGetAdmissionCyclesQuery({
    maxResultCount: 100,
    skipCount: 0,
  });
  const [createCycle, { isLoading: creating }] = useCreateAdmissionCycleMutation();
  const [updateCycle, { isLoading: updating }] = useUpdateAdmissionCycleMutation();
  const [publishCycle] = usePublishAdmissionCycleMutation();
  const [closeCycle] = useCloseAdmissionCycleMutation();
  const [archiveCycle] = useArchiveAdmissionCycleMutation();

  const saveCycle = async (values: CreateUpdateAdmissionCycle) => {
    if (editingCycle) await updateCycle({ id: editingCycle.id, body: values }).unwrap();
    else await createCycle(values).unwrap();
    shikshaMitraToast.success({
      message: editingCycle ? 'Admission cycle updated' : 'Admission cycle created',
    });
  };

  const runAction = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message });
    } catch (error) {
      shikshaMitraToast.error({
        message: (error as { data?: { detail?: string } })?.data?.detail || 'Action failed',
      });
    }
  };

  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Cycle name',
      filterType: 'string',
      isFilter: true,
      minWidth: 240,
      render: (value) => <Typography fontWeight={600}>{value}</Typography>,
    },
    { id: 'code', label: 'Code', filterType: 'string', isFilter: true, minWidth: 120 },
    {
      id: 'startDate',
      label: 'Applications open',
      filterType: 'date',
      minWidth: 150,
      render: (value) => dayjs(value).format('DD MMM YYYY'),
    },
    {
      id: 'endDate',
      label: 'Applications close',
      filterType: 'date',
      minWidth: 150,
      render: (value) => dayjs(value).format('DD MMM YYYY'),
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'enum',
      sticky: true,
      enumOptions: Object.entries(statusLabels).map(([value, label]) => ({
        value: Number(value),
        label,
      })),
      render: (value) => (
        <Label color={statusColors[Number(value) as AdmissionCycleStatus]}>
          {statusLabels[Number(value) as AdmissionCycleStatus]}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sticky: true,
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) => {
        const cycle = row as unknown as AdmissionCycle;
        return (
          <Stack direction="row" spacing={0.5}>
            {canEdit && cycle.status === 0 && (
              <Button
                size="small"
                onClick={() => {
                  setEditingCycle(cycle);
                  dialog.onTrue();
                }}
              >
                Edit
              </Button>
            )}
            {canPublish && cycle.status === 0 && (
              <Button
                size="small"
                onClick={() =>
                  runAction(() => publishCycle(cycle.id).unwrap(), 'Admission cycle published')
                }
              >
                Publish
              </Button>
            )}
            {canClose && cycle.status === 1 && (
              <Button
                size="small"
                onClick={() =>
                  runAction(() => closeCycle(cycle.id).unwrap(), 'Admission cycle closed')
                }
              >
                Close
              </Button>
            )}
            {canArchive && (cycle.status === 0 || cycle.status === 2) && (
              <Button
                size="small"
                onClick={() =>
                  runAction(() => archiveCycle(cycle.id).unwrap(), 'Admission cycle archived')
                }
              >
                Archive
              </Button>
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Admission Cycles"
        description="Configure the admission seasons that schools publish for applicants."
        links={[
          { name: 'Students', href: '/student/dashboard' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Admission Cycles' },
        ]}
        action={
          <Button
            variant="contained"
            disabled={!canCreate || !currentYear?.id}
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => {
              setEditingCycle(null);
              dialog.onTrue();
            }}
          >
            Create cycle
          </Button>
        }
      />
      {isError && <AdmissionQueryError onRetry={() => void refetch()} />}
      {!currentYear?.id && (
        <Typography color="text.secondary">
          Select an academic year before creating an admission cycle.
        </Typography>
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="admission-cycles"
          tableTitle="Admission cycles"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          isLoading={isLoading}
          isPagination
          isSearch
          isFilter
          columns={columns}
          data={data?.items ?? []}
          noDataText="No admission cycles configured yet."
        />
      </Box>
      <AdmissionCycleDialog
        open={dialog.value}
        onClose={dialog.onFalse}
        academicYearId={currentYear?.id ?? ''}
        editingCycle={editingCycle}
        saving={creating || updating}
        onSave={saveCycle}
      />
    </Box>
  );
}
