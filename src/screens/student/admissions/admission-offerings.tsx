'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Organization } from 'src/types/school';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Stack, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  type AdmissionCycle,
  type AdmissionOffering,
  useGetAdmissionCyclesQuery,
  useGetAdmissionOfferingsQuery,
  useCreateAdmissionOfferingMutation,
  useUpdateAdmissionOfferingMutation,
  type CreateUpdateAdmissionOffering,
  useSetAdmissionOfferingActiveMutation,
} from 'src/redux/student/admissions/admission-cycles-api';

import { AdmissionOfferingDialog } from './admission-offering-dialog';
import { AdmissionQueryError } from './admission-query-error';

export default function AdmissionOfferingsScreen() {
  const dialog = useBoolean();
  const [editingOffering, setEditingOffering] = useState<AdmissionOffering | null>(null);
  const { currentBoard, currentMedium } = useSelector((state: RootState) => state.globalState) as {
    currentBoard: { id?: string; name?: string };
    currentMedium: Medium;
  };
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManage = hasGrantedPermission(permissions, 'Students.Admissions.Offerings.Manage');
  const [cycleId, setCycleId] = useState('');
  const { data: cyclesData } = useGetAdmissionCyclesQuery({ maxResultCount: 100, skipCount: 0 });
  const cycles = cyclesData?.items ?? [];
  const { data, isLoading, isError, refetch } = useGetAdmissionOfferingsQuery(
    { admissionCycleId: cycleId, skipCount: 0, maxResultCount: 100 },
    { skip: !cycleId }
  );
  const [createOffering, { isLoading: creating }] = useCreateAdmissionOfferingMutation();
  const [updateOffering, { isLoading: updating }] = useUpdateAdmissionOfferingMutation();
  const [setActive] = useSetAdmissionOfferingActiveMutation();
  const stages = currentMedium?.educationMediumStages ?? [];
  const standards = stages.flatMap((stage) => stage.standards ?? []);

  const saveOffering = async (values: CreateUpdateAdmissionOffering) => {
    try {
      if (editingOffering) await updateOffering({ id: editingOffering.id, body: values }).unwrap();
      else await createOffering({ admissionCycleId: cycleId, body: values }).unwrap();
      shikshaMitraToast.success({
        message: editingOffering ? 'Offering updated' : 'Offering created',
      });
    } catch (error) {
      shikshaMitraToast.error({
        message:
          (error as { data?: { detail?: string } })?.data?.detail || 'Failed to save offering',
      });
      throw error;
    }
  };

  const runActive = async (offering: AdmissionOffering) => {
    try {
      await setActive({ id: offering.id, isActive: !offering.isActive }).unwrap();
      shikshaMitraToast.success({
        message: offering.isActive ? 'Offering deactivated' : 'Offering activated',
      });
    } catch (error) {
      shikshaMitraToast.error({
        message:
          (error as { data?: { detail?: string } })?.data?.detail || 'Failed to update offering',
      });
    }
  };

  const columns: IColumn[] = [
    {
      id: 'code',
      label: 'Offering',
      filterType: 'string',
      isFilter: true,
      minWidth: 160,
      render: (value) => <Typography fontWeight={600}>{value}</Typography>,
    },
    {
      id: 'boardId',
      label: 'Board',
      minWidth: 120,
      render: () => currentBoard?.name ?? 'Configured board',
    },
    {
      id: 'mediumId',
      label: 'Medium',
      minWidth: 120,
      render: () => currentMedium?.name ?? 'Configured medium',
    },
    {
      id: 'standardId',
      label: 'Standard',
      minWidth: 140,
      render: (value) => standards.find((standard) => standard.id === value)?.name ?? value,
    },
    {
      id: 'openDate',
      label: 'Open',
      filterType: 'date',
      minWidth: 130,
      render: (value) => dayjs(value).format('DD MMM YYYY'),
    },
    {
      id: 'closeDate',
      label: 'Close',
      filterType: 'date',
      minWidth: 130,
      render: (value) => dayjs(value).format('DD MMM YYYY'),
    },
    {
      id: 'isActive',
      label: 'Status',
      sticky: true,
      render: (value) => (
        <Label color={value ? 'success' : 'default'}>{value ? 'Active' : 'Inactive'}</Label>
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
        const offering = row as unknown as AdmissionOffering;
        return (
          <Stack direction="row" spacing={0.5}>
            {canManage && (
              <Button
                size="small"
                onClick={() => {
                  setEditingOffering(offering);
                  dialog.onTrue();
                }}
              >
                Edit
              </Button>
            )}
            {canManage && (
              <Button size="small" onClick={() => runActive(offering)}>
                {offering.isActive ? 'Deactivate' : 'Activate'}
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
        heading="Admission Offerings"
        description="Define the academic combinations available in each admission cycle."
        links={[
          { name: 'Students', href: '/student/dashboard' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Admission Offerings' },
        ]}
        action={
          <Button
            variant="contained"
            disabled={!canManage || !cycleId || !currentBoard?.id || !currentMedium?.id}
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => {
              setEditingOffering(null);
              dialog.onTrue();
            }}
          >
            Add offering
          </Button>
        }
      />
      {isError && <AdmissionQueryError onRetry={() => void refetch()} />}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <CustomSelect
          options={cycles as AdmissionCycle[]}
          label="Admission cycle"
          value={cycleId}
          onChange={(value) => setCycleId(value as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { minWidth: 280 }, size: 'small' }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
          {currentBoard?.name ?? 'Board'} · {currentMedium?.name ?? 'Medium'}
        </Typography>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="admission-offerings"
          tableTitle="Admission offerings"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          isLoading={isLoading}
          isPagination
          isSearch
          isFilter
          columns={columns}
          data={data?.items ?? []}
          noDataText={
            cycleId
              ? 'No offerings configured for this cycle.'
              : 'Select an admission cycle to view offerings.'
          }
        />
      </Box>
      <AdmissionOfferingDialog
        open={dialog.value}
        onClose={dialog.onFalse}
        editingOffering={editingOffering}
        saving={creating || updating}
        boardId={currentBoard?.id ?? ''}
        mediumId={currentMedium?.id ?? ''}
        stages={stages as Organization[]}
        standards={standards}
        onSave={saveOffering}
      />
    </Box>
  );
}
