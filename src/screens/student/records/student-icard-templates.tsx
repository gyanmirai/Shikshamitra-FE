'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { IdCardTemplate } from 'src/redux/student/records/student-record-documents-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Link, Alert, Button, Typography } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import {
  useGetRecordIdTemplatesQuery,
  useDeleteRecordIdTemplateMutation,
} from 'src/redux/student/records/student-record-documents-api';

import { StudentCardPreview } from './components/student-card-preview';
import StudentICardTemplateEditor from './student-icard-template-editor';

export default function StudentICardTemplates() {
  const form = useBoolean();
  const preview = useBoolean();
  const [selected, setSelected] = useState<IdCardTemplate | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { requestNavigation, confirmation } = useUnsavedNavigation(form.value && dirty, {
    blockNavigation: form.value && busy,
    push: router.push,
    title: 'Discard I-Card Changes?',
    description:
      'Your template changes have not been saved. Keep editing or discard these changes.',
  });
  const [templateToDelete, setTemplateToDelete] = useState<IdCardTemplate | null>(null);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Records.StudentICard.View');
  const canEdit = hasGrantedPermission(permissions, 'Students.Records.StudentICard.Add');
  const canDelete = hasGrantedPermission(permissions, 'Students.Records.StudentICard.Delete');
  const templates = useGetRecordIdTemplatesQuery(undefined, { skip: !canView });
  const [deleteTemplate, deleting] = useDeleteRecordIdTemplateMutation();
  const deleteRestricted = Boolean(
    templateToDelete?.selectionRestricted ||
    templates.currentData?.some((row) => row.id === templateToDelete?.id && row.selectionRestricted)
  );

  const openCreate = () => {
    setDirty(false);
    setSelected(null);
    form.onTrue();
  };
  const openEdit = (row: IdCardTemplate) => {
    setDirty(false);
    setSelected(row);
    form.onTrue();
  };
  const openPreview = (row: IdCardTemplate) => {
    setSelected(row);
    preview.onTrue();
  };
  const closeForm = () => {
    form.onFalse();
    setSelected(null);
    setDirty(false);
  };
  const requestCloseForm = () => requestNavigation(closeForm);
  const closeDeleteDialog = () => {
    if (!deleting.isLoading) setTemplateToDelete(null);
  };
  const deleteRow = async () => {
    if (!templateToDelete?.id || deleting.isLoading || !canDelete || deleteRestricted) return;
    try {
      await deleteTemplate(templateToDelete.id).unwrap();
      setTemplateToDelete(null);
      shikshaMitraToast.success({ message: 'I-Card template deleted.' });
    } catch (failure: unknown) {
      const { errorCode } = parseApiProblemDetail(failure);
      if (errorCode === 'Students:Records:IdTemplateAssigned') {
        setTemplateToDelete(null);
        shikshaMitraToast.error({
          message: 'Reassign or remove this template’s class assignments before deleting it.',
        });
      } else {
        shikshaMitraToast.error({ message: 'I-Card template could not be deleted.' });
      }
    }
  };

  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Template',
      align: 'left',
      rowHeader: true,
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
      width: 260,
      minWidth: 220,
      render: (_value, data) => {
        const row = data as IdCardTemplate;
        return (
          <Link
            component="button"
            type="button"
            color="inherit"
            underline="hover"
            aria-label={`Preview ${row.name}`}
            onClick={() => openPreview(row)}
            sx={{ typography: 'body2', textAlign: 'left', overflowWrap: 'anywhere' }}
          >
            {row.name}
          </Link>
        );
      },
    },
    { id: 'schoolName', label: 'School', align: 'left', width: 220, minWidth: 180 },
    { id: 'orientation', label: 'Orientation', align: 'left', width: 132, minWidth: 120 },
    {
      id: 'cardsPerPage',
      label: 'Cards per page',
      align: 'left',
      width: 150,
      minWidth: 130,
      filterType: 'number' as const,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'left',
      sticky: true,
      stickyPosition: 'right',
      width: 108,
      minWidth: 96,
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_value, data) => {
        const row = data as IdCardTemplate;
        return (
          <AdaptiveThreeDotsActions
            actions={[
              ...(canEdit
                ? [
                    {
                      id: 'edit',
                      label: 'Edit',
                      ariaLabel: `Edit ${row.name}`,
                      icon: GlobalIcons.edit,
                      onClick: () => openEdit(row),
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
                      disabled: row.selectionRestricted,
                      tooltip: row.selectionRestricted
                        ? 'Student assignments are restricted in your current academic scope.'
                        : `Delete ${row.name}`,
                      onClick: () => {
                        if (!row.selectionRestricted) setTemplateToDelete(row);
                      },
                    },
                  ]
                : []),
            ]}
            directActionLimit={2}
            collapseOnOverflow={false}
            placement="right-top"
            moreLabel={`More actions for ${row.name}`}
            sx={{ justifyContent: 'flex-start' }}
          />
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'auto', sm: 1 },
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <CustomBreadcrumbs
        heading="I-Card Templates"
        description="Design reusable student identity cards."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.root },
          { name: 'I-Card Templates' },
        ]}
        sx={{ flexShrink: 0 }}
        action={
          canView &&
          canEdit && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:plus" />}
              aria-label="Create I-Card template"
              onClick={openCreate}
            >
              I-Card template
            </Button>
          )
        }
      />
      {!canView ? (
        <Alert severity="warning">You do not have permission to view I-Card templates.</Alert>
      ) : (
        <CustomizableTable
          tableId="student-icard-templates"
          tableTitle="I-Card Templates"
          columns={columns}
          data={templates.isError ? [] : (templates.currentData ?? [])}
          getRowAction={(data) => {
            const row = data as IdCardTemplate;
            return { label: `Preview ${row.name}`, onClick: () => openPreview(row) };
          }}
          isLoading={templates.isLoading}
          isRefreshing={
            templates.isFetching && Boolean(templates.currentData) && !templates.isError
          }
          showExport
          isPagination
          isSearch
          noDataText="No I-Card templates found."
          errorContent={
            templates.isError ? (
              <StudentFeedback
                notificationKey="STUDENT-ICARD-TEMPLATES-LOAD"
                presentation="toast"
                severity="error"
              >
                I-Card templates could not be loaded.
              </StudentFeedback>
            ) : undefined
          }
          wrapperProps={{
            sx: {
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: { sm: 'hidden' },
            },
          }}
          tableContainerProps={{ sx: { height: 1 }, 'aria-label': 'I-Card templates' }}
        />
      )}
      <CustomDialog
        fullScreen
        hasForm={false}
        open={form.value}
        title={selected ? 'Edit I-Card Template' : 'Create I-Card Template'}
        titleInfo="Configure the card layout, fields and school identity."
        handleClose={requestCloseForm}
        disableClose={busy}
        guardUnsavedChanges={false}
        paperProps={{ sx: { borderRadius: 0, backgroundImage: 'none' } }}
      >
        <Box sx={{ flex: 1, minHeight: 0, p: 1, bgcolor: 'background.neutral' }}>
          {form.value && (
            <StudentICardTemplateEditor
              key={selected?.id ?? 'new'}
              initialTemplate={selected}
              canEdit={canEdit}
              onClose={requestCloseForm}
              onSaved={closeForm}
              onBusyChange={setBusy}
              onDirtyChange={setDirty}
            />
          )}
        </Box>
      </CustomDialog>
      {confirmation}
      <CustomDialog
        open={preview.value}
        handleClose={preview.onFalse}
        title="I-Card Preview"
        maxWidth="sm"
      >
        {selected && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <StudentCardPreview template={selected} showTrim />
          </Box>
        )}
      </CustomDialog>
      <ConfirmDialog
        open={Boolean(templateToDelete)}
        onClose={closeDeleteDialog}
        disableBackdropClick
        disableCancel={deleting.isLoading}
        title="Delete I-Card Template"
        icon="error"
        content={
          <Typography id="student-icard-delete-description" variant="body2">
            “{templateToDelete?.name}” will be removed. Issued cards will keep their saved design.
            This cannot be undone.
            {deleteRestricted &&
              ' Student assignments are restricted in your current academic scope.'}
          </Typography>
        }
        aria-describedby="student-icard-delete-description"
        action={
          <Button
            variant="contained"
            color="error"
            loading={deleting.isLoading}
            disabled={deleting.isLoading || !canDelete || deleteRestricted}
            onClick={deleteRow}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          >
            {deleting.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        }
      />
    </Box>
  );
}
