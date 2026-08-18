'use client';

import type { RootState } from 'src/redux/store';
import type { AcademicYear } from 'src/types/school';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import { hasGrantedPermission } from 'src/utils/permissions';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Button, MenuItem, MenuList, Typography } from '@mui/material';
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

import { AdmissionQueryError } from './admission-query-error';
import { AdmissionCycleDialog } from './admission-cycle-dialog';

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

const getAcademicYearSortValue = (year: AcademicYear): number => {
  if (year.startDate) {
    const startDate = dayjs(year.startDate);
    if (startDate.isValid()) return startDate.valueOf();
  }

  const firstYear = year.name.match(/\d{4}/)?.[0];
  return firstYear ? Number(firstYear) : Number.MIN_SAFE_INTEGER;
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
  const {
    data: academicYearsData,
    isLoading: academicYearsLoading,
    isError: academicYearsError,
  } = useGetYearQuery(undefined, { skip: !dialog.value });
  const { data, isLoading, isError, refetch } = useGetAdmissionCyclesQuery({
    maxResultCount: 100,
    skipCount: 0,
  });
  const [createCycle, { isLoading: creating }] = useCreateAdmissionCycleMutation();
  const [updateCycle, { isLoading: updating }] = useUpdateAdmissionCycleMutation();
  const [publishCycle] = usePublishAdmissionCycleMutation();
  const [closeCycle] = useCloseAdmissionCycleMutation();
  const [archiveCycle] = useArchiveAdmissionCycleMutation();

  const recentAcademicYears = useMemo(() => {
    const years = (academicYearsData?.items ?? []) as AcademicYear[];
    const sortedYears = [...years].sort(
      (left, right) => getAcademicYearSortValue(right) - getAcademicYearSortValue(left)
    );
    const selectedYear = sortedYears.find((year) => year.id === currentYear?.id) ?? sortedYears[0];

    if (!selectedYear) return [];

    const selectedYearSortValue = getAcademicYearSortValue(selectedYear);
    return sortedYears
      .filter((year) => getAcademicYearSortValue(year) <= selectedYearSortValue)
      .slice(0, 2);
  }, [academicYearsData?.items, currentYear?.id]);

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
      stickyPosition: 'right',
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
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) => {
        const cycle = row as unknown as AdmissionCycle;
        return (
          <ThreeDotsActions
            placement="right-top"
            moreLabel={`More actions for ${cycle.name}`}
            actions={({ popover }) => (
              <MenuList>
                {canEdit && cycle.status === 0 && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      setEditingCycle(cycle);
                      dialog.onTrue();
                    }}
                  >
                    <Iconify icon={GlobalIcons.edit} />
                    Edit
                  </MenuItem>
                )}
                {canPublish && cycle.status === 0 && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      runAction(() => publishCycle(cycle.id).unwrap(), 'Admission cycle published');
                    }}
                  >
                    <Iconify icon={GlobalIcons.publish} />
                    Publish
                  </MenuItem>
                )}
                {canClose && cycle.status === 1 && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      runAction(() => closeCycle(cycle.id).unwrap(), 'Admission cycle closed');
                    }}
                  >
                    <Iconify icon={GlobalIcons.lockIcon} />
                    Close
                  </MenuItem>
                )}
                {canArchive && (cycle.status === 0 || cycle.status === 2) && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      runAction(() => archiveCycle(cycle.id).unwrap(), 'Admission cycle archived');
                    }}
                  >
                    <Iconify icon={GlobalIcons.archive} />
                    Archive
                  </MenuItem>
                )}
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
            disabled={!canCreate}
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
      {isError && (
        <AdmissionQueryError
          onRetry={() => {
            refetch();
          }}
        />
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
        academicYearId={currentYear?.id ?? recentAcademicYears[0]?.id ?? ''}
        academicYears={recentAcademicYears}
        academicYearsLoading={academicYearsLoading}
        academicYearsError={academicYearsError}
        editingCycle={editingCycle}
        saving={creating || updating}
        onSave={saveCycle}
      />
    </Box>
  );
}
