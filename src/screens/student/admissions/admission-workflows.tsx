'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Stack, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  type AdmissionWorkflow,
  useGetAdmissionWorkflowQuery,
  useGetAdmissionWorkflowsQuery,
  useCloneAdmissionWorkflowMutation,
  useCreateAdmissionWorkflowMutation,
  useUpdateAdmissionWorkflowMutation,
  type CreateUpdateAdmissionWorkflow,
  usePublishAdmissionWorkflowMutation,
  useValidateAdmissionWorkflowMutation,
} from 'src/redux/student/admissions/admission-workflows-api';

import { AdmissionQueryError } from './admission-query-error';
import { AdmissionWorkflowDialog } from './admission-workflow-dialog';

const status = ['Draft', 'Published', 'Archived'];
export default function AdmissionWorkflowsScreen() {
  const dialog = useBoolean();
  const [editing, setEditing] = useState<AdmissionWorkflow | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManage = hasGrantedPermission(permissions, 'Students.Admissions.Workflows.Manage');
  const canPublish = hasGrantedPermission(permissions, 'Students.Admissions.Workflows.Publish');
  const { data, isLoading, isError, refetch } = useGetAdmissionWorkflowsQuery({
    maxResultCount: 100,
    skipCount: 0,
  });
  const { data: selected } = useGetAdmissionWorkflowQuery(selectedId ?? '', { skip: !selectedId });
  const [create, createState] = useCreateAdmissionWorkflowMutation();
  const [update, updateState] = useUpdateAdmissionWorkflowMutation();
  const [clone] = useCloneAdmissionWorkflowMutation();
  const [validate] = useValidateAdmissionWorkflowMutation();
  const [publish] = usePublishAdmissionWorkflowMutation();
  const save = async (values: CreateUpdateAdmissionWorkflow) => {
    if (editing) await update({ id: editing.id, body: values }).unwrap();
    else await create(values).unwrap();
    shikshaMitraToast.success({ message: 'Workflow draft saved' });
  };
  const action = async (fn: () => Promise<unknown>, success: string) => {
    try {
      await fn();
      shikshaMitraToast.success({ message: success });
    } catch (error) {
      shikshaMitraToast.error({
        message:
          (error as { data?: { detail?: string } })?.data?.detail || 'Workflow action failed',
      });
    }
  };
  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Workflow',
      minWidth: 220,
      render: (value) => <Typography fontWeight={600}>{value}</Typography>,
    },
    { id: 'code', label: 'Code', minWidth: 120 },
    { id: 'version', label: 'Version', minWidth: 80 },
    { id: 'status', label: 'Status', render: (value) => status[Number(value)] },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 280,
      render: (_, row) => {
        const workflow = row as unknown as AdmissionWorkflow;
        return (
          <Stack direction="row" spacing={0.5}>
            <Button
              size="small"
              onClick={() => {
                setSelectedId(workflow.id);
                setEditing(null);
                dialog.onTrue();
              }}
            >
              Edit
            </Button>
            {canManage && (
              <Button
                size="small"
                onClick={() => action(() => clone(workflow.id).unwrap(), 'Workflow cloned')}
              >
                Clone
              </Button>
            )}
            {canManage && (
              <Button
                size="small"
                onClick={() =>
                  action(
                    () =>
                      validate(workflow.id)
                        .unwrap()
                        .then((r) => {
                          if (!r.isValid) throw new Error(r.errors.join(', '));
                        }),
                    'Workflow is valid'
                  )
                }
              >
                Validate
              </Button>
            )}
            {canPublish && workflow.status === 0 && (
              <Button
                size="small"
                onClick={() => action(() => publish(workflow.id).unwrap(), 'Workflow published')}
              >
                Publish
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
        heading="Workflow Builder"
        description="Build and publish the stage path used by applications."
        links={[
          { name: 'Students', href: '/student' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Settings' },
          { name: 'Workflow Builder' },
        ]}
        sx={{ mb: 3 }}
        action={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() => {
                setEditing(null);
                setSelectedId(null);
                dialog.onTrue();
              }}
            >
              Create workflow
            </Button>
          ) : undefined
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
          tableId="admission-workflows"
          tableTitle="Admission workflows"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          isPagination
          isSearch
          isFilter
          noDataText="No admission workflows configured yet."
        />
      </Box>
      <AdmissionWorkflowDialog
        open={dialog.value}
        onClose={() => {
          dialog.onFalse();
          setSelectedId(null);
        }}
        editing={editing ?? selected}
        saving={createState.isLoading || updateState.isLoading}
        onSave={save}
      />
    </Box>
  );
}
