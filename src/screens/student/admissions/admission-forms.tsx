'use client';

import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionFormsQuery } from 'src/redux/student/admissions/admission-forms-api';

import { createFormColumns } from './form-list/form-columns';
import { AdmissionFormDialog } from './admission-form-dialog';
import { AdmissionQueryError } from './admission-query-error';
import { useFormListActions } from './form-list/use-form-list-actions';

export default function AdmissionFormsScreen() {
  const actions = useFormListActions();
  const query = useGetAdmissionFormsQuery({ maxResultCount: 100, skipCount: 0 });
  const columns = createFormColumns({
    canManage: actions.canManage,
    canPublish: actions.canPublish,
    onPreview: (form) => actions.preview(form.id),
    onEdit: (form) => actions.edit(form.id),
    onClone: (form) => actions.clone(form.id),
    onValidate: (form) => actions.validate(form.id),
    onPublish: (form) => actions.publish(form.id),
    onCreateVersion: (form) => actions.createVersion(form.id),
    onArchive: (form) => actions.archive(form.id),
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Form Builder"
        description="Define reusable inquiry and application fields before publishing."
        links={[
          { name: 'Students', href: '/student/dashboard' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Settings' },
          { name: 'Form Builder' },
        ]}
        sx={{ mb: 1 }}
        action={
          <Button size="small" variant="contained" disabled={!actions.canManage} startIcon={<Iconify icon="mdi:plus" />} onClick={actions.create}>
            Create form
          </Button>
        }
      />
      {query.isError && <AdmissionQueryError onRetry={() => query.refetch()} />}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="admission-forms"
          tableTitle="Admission forms"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={columns}
          data={query.data?.items ?? []}
          isLoading={query.isLoading}
          isPagination
          isSearch
          isFilter
          noDataText="No forms configured yet. Create a draft to begin."
        />
      </Box>
      <AdmissionFormDialog
        open={actions.dialog.value}
        onClose={actions.close}
        editing={actions.editing}
        saving={actions.saving}
        onSave={actions.save}
      />
    </Box>
  );
}
