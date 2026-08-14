'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import NextLink from 'next/link';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Stack, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  type AdmissionForm,
  useGetAdmissionFormQuery,
  useGetAdmissionFormsQuery,
  useCloneAdmissionFormMutation,
  useCreateAdmissionFormMutation,
  useUpdateAdmissionFormMutation,
  type CreateUpdateAdmissionForm,
  usePublishAdmissionFormMutation,
  useValidateAdmissionFormMutation,
} from 'src/redux/student/admissions/admission-forms-api';

import { AdmissionFormDialog } from './admission-form-dialog';
import { AdmissionQueryError } from './admission-query-error';

export default function AdmissionFormsScreen() {
  const dialog = useBoolean();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: editing } = useGetAdmissionFormQuery(editingId ?? '', { skip: !editingId });
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManage = hasGrantedPermission(permissions, 'Students.Admissions.Forms.Manage');
  const canPublish = hasGrantedPermission(permissions, 'Students.Admissions.Forms.Publish');
  const { data, isLoading, isError, refetch } = useGetAdmissionFormsQuery({
    maxResultCount: 100,
    skipCount: 0,
  });
  const [create] = useCreateAdmissionFormMutation();
  const [update, updateState] = useUpdateAdmissionFormMutation();
  const [clone] = useCloneAdmissionFormMutation();
  const [validate] = useValidateAdmissionFormMutation();
  const [publish] = usePublishAdmissionFormMutation();
  const saveForm = async (values: CreateUpdateAdmissionForm) => {
    if (editingId) await update({ id: editingId, body: values }).unwrap();
    else await create(values).unwrap();
    shikshaMitraToast.success({ message: 'Form draft saved' });
  };
  const action = async (fn: () => Promise<unknown>, message: string) => {
    try {
      await fn();
      shikshaMitraToast.success({ message });
    } catch {
      shikshaMitraToast.error({ message: 'Form action failed' });
    }
  };
  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Form',
      minWidth: 220,
      render: (v) => <Typography fontWeight={600}>{v}</Typography>,
    },
    { id: 'code', label: 'Code' },
    { id: 'version', label: 'Version' },
    { id: 'status', label: 'Status', render: (v) => ['Draft', 'Published', 'Archived'][Number(v)] },
    {
      id: 'sections',
      label: 'Sections',
      render: (_, row) => (row as unknown as AdmissionForm).sections?.length ?? 0,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 300,
      render: (_, row) => {
        const form = row as unknown as AdmissionForm;
        return (
          <Stack direction="row" spacing={0.5}>
            {canManage && (
              <Button
                size="small"
                component={NextLink}
                href={`/student/admissions/settings/forms/${form.id}/preview`}
              >
                Preview
              </Button>
            )}
            {canManage && (
              <Button
                size="small"
                onClick={() => {
                  setEditingId(form.id);
                  dialog.onTrue();
                }}
              >
                Edit
              </Button>
            )}
            {canManage && (
              <Button
                size="small"
                onClick={() => action(() => clone(form.id).unwrap(), 'Form cloned')}
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
                      validate(form.id)
                        .unwrap()
                        .then((r) => {
                          if (!r.isValid) throw new Error(r.errors.join(', '));
                        }),
                    'Form is valid'
                  )
                }
              >
                Validate
              </Button>
            )}
            {canPublish && form.status === 0 && (
              <Button
                size="small"
                onClick={() => action(() => publish(form.id).unwrap(), 'Form published')}
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
        heading="Form Builder"
        description="Define reusable inquiry and application fields before publishing."
        links={[
          { name: 'Students', href: '/student' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Settings' },
          { name: 'Form Builder' },
        ]}
        sx={{ mb: 3 }}
        action={
          canManage ? (
            <Button
              variant="contained"
              disabled={creating}
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() => {
                setEditingId(null);
                dialog.onTrue();
              }}
            >
              Create form
            </Button>
          ) : undefined
        }
      />
      {isError && <AdmissionQueryError onRetry={() => void refetch()} />}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="admission-forms"
          tableTitle="Admission forms"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          isPagination
          isSearch
          isFilter
          noDataText="No forms configured yet."
        />
      </Box>
      <AdmissionFormDialog
        open={dialog.value}
        onClose={() => {
          dialog.onFalse();
          setEditingId(null);
        }}
        editing={editing}
        saving={updateState.isLoading}
        onSave={saveForm}
      />
    </Box>
  );
}
