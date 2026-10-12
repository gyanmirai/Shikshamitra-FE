'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { IdCardTemplate } from 'src/redux/student/records/student-record-documents-api';

import { Add } from '@mui/icons-material';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomDialog from 'src/components/customDialog';
import { useConfirmDialog } from 'src/hooks/use-confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Button, Alert } from '@mui/material';
import {
  useGetRecordIdTemplatesQuery,
  useDeleteRecordIdTemplateMutation,
} from 'src/redux/student/records/student-record-documents-api';
import { useGetStudentRecordsDirectoryQuery } from 'src/redux/student/records/student-records-api';

import StudentICardBuilder, { StudentCardPreview } from './student-icard-builder';

export default function StudentICardTemplates() {
  const form = useBoolean();
  const preview = useBoolean();
  const [selected, setSelected] = useState<IdCardTemplate | null>(null);
  const [showConfirm, ConfirmDialog] = useConfirmDialog();
  const yearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Records.StudentICard.View');
  const canEdit = hasGrantedPermission(permissions, 'Students.Records.StudentICard.Add');
  const canDelete = hasGrantedPermission(permissions, 'Students.Records.StudentICard.Delete');
  const templates = useGetRecordIdTemplatesQuery(undefined, { skip: !canView });
  const students = useGetStudentRecordsDirectoryQuery({
    population: 'Active', academicYearId: yearId, skipCount: 0, maxResultCount: 1,
  }, { skip: !canView || !yearId });
  const tableRows = (templates.currentData ?? []).map((row) => ({
    ...row,
    assignedStudents: !yearId || students.isError || !students.currentData
      ? '—'
      : row.selection?.academicYearId && row.selection.academicYearId !== yearId
        ? 'Other academic year'
        : `${row.selection?.studentIds?.length ?? 0} / ${students.currentData.totalCount}`,
  }));
  const [deleteTemplate, deleting] = useDeleteRecordIdTemplateMutation();

  const openCreate = () => { setSelected(null); form.onTrue(); };
  const openEdit = (row: IdCardTemplate) => { setSelected(row); form.onTrue(); };
  const openPreview = (row: IdCardTemplate) => { setSelected(row); preview.onTrue(); };
  const closeForm = () => { form.onFalse(); setSelected(null); };
  const deleteRow = async (row: IdCardTemplate) => {
    if (!row.id || deleting.isLoading) return;
    const confirmed = await showConfirm({
      title: 'Delete Student I-Card Template',
      message: `Delete "${row.name}"? Issued cards keep their saved design. This cannot be undone.`,
      icon: 'warning',
    });
    if (!confirmed) return;
    try {
      await deleteTemplate(row.id).unwrap();
      shikshaMitraToast.success({ message: 'Student I-Card template deleted.' });
    } catch {
      shikshaMitraToast.error({ message: 'Student I-Card template could not be deleted.' });
    }
  };

  const columns: IColumn[] = [
    { id: 'name', label: 'Template', align: 'left', sticky: true, width: 260, minWidth: 220 },
    { id: 'schoolName', label: 'School', align: 'left', width: 220, minWidth: 180 },
    { id: 'orientation', label: 'Orientation', align: 'left', width: 132, minWidth: 120 },
    { id: 'assignedStudents', label: 'Students assigned / total', align: 'left', width: 205, minWidth: 190,
      isSort: false, isFilter: false,
    },
    { id: 'cardsPerPage', label: 'Cards per page', align: 'left', width: 150, minWidth: 130, filterType: 'number' },
    {
      id: 'actions', label: 'Action', align: 'left', sticky: true, width: 108, minWidth: 96,
      isSort: false, isFilter: false, excludeFromExport: true,
      render: (_value, data) => {
        const row = data as IdCardTemplate;
        return <ThreeDotsActions
          showViewIcon showEditIcon={canEdit} showDeleteIcon={canDelete} showThreeDots={false}
          viewLabel={`View ${row.name}`} editLabel={`Edit ${row.name}`} deleteLabel={`Delete ${row.name}`}
          handleViewClick={() => openPreview(row)}
          handleEditClick={() => openEdit(row)}
          handleDeleteClick={() => deleteRow(row)}
        />;
      },
    },
  ];

  return <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
    {form.value ? <>
      <CustomBreadcrumbs
        heading={selected ? 'Update Student I-Card' : 'Create Student I-Card'}
        description="Design and export student identity cards."
        links={[{ name: 'Student', href: studentPaths.dashboard }, { name: 'Student Records', href: studentPaths.records.root }, { name: 'Student I-Card' }]}
        isBack onBack={closeForm}
      />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <StudentICardBuilder key={selected?.id ?? 'new'} initialTemplate={selected} onClose={closeForm} />
      </Box>
    </> : <>
      <CustomBreadcrumbs
        heading="Student I-Card"
        description="Manage templates and export student identity cards."
        links={[{ name: 'Student', href: studentPaths.dashboard }, { name: 'Student Records', href: studentPaths.records.root }, { name: 'Student I-Card' }]}
        action={<Button variant="contained" size="small" startIcon={<Add />} disabled={!yearId || !canEdit} onClick={openCreate}>
          Create Student I-Card
        </Button>}
      />
      {!canView ? <Alert severity="warning">You do not have permission to view Student I-Card templates.</Alert> : <>
        {templates.isError && <Alert severity="error" action={<Button size="small" onClick={() => templates.refetch()}>Retry</Button>}>
          Student I-Card templates could not be loaded.
        </Alert>}
        <CustomizableTable
          tableId="student-icard-templates"
          columns={columns}
          data={tableRows}
          isLoading={templates.isLoading}
          isPagination isSearch
          noDataText="No Student I-Card templates found."
          wrapperProps={{ sx: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }}
          tableContainerProps={{ sx: { height: 1 } }}
        />
      </>}
    </>}
    <CustomDialog open={preview.value} handleClose={preview.onFalse} title="Student I-Card Preview" maxWidth="sm">
      {selected && <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <StudentCardPreview template={selected} />
      </Box>}
    </CustomDialog>
    {ConfirmDialog}
  </Box>;
}
