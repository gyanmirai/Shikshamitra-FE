'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { StudentFeedback } from 'src/components/student-feedback';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useStudentAcademicScope } from 'src/hooks/use-student-academic-scope';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import {
  studentGroupApi,
  useGetAllGroupQuery,
  useDeleteGroupMutation,
} from 'src/redux/student/student-group/student-group';

import HouseSettingsForm from './house-settings-form';
import { StudentAcademicScopeFilters } from '../student-academic-scope-filters';

import type { IGroup } from './type';

export default function HouseSetting() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canWrite = hasGrantedPermission(permissions, 'Students.Records.Settings.Add');
  const canDelete = hasGrantedPermission(permissions, 'Students.Records.Settings.Delete');
  const { currentMedium } = useStudentAcademicScope();
  const [form, setForm] = useState<{ record: IGroup | null; mediumId: string } | null>(null);
  const [deleting, setDeleting] = useState<IGroup | null>(null);
  const { currentData, refetch, isError, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllGroupQuery,
    params: currentMedium?.id,
    options: { skip: !currentMedium?.id },
  });
  const [deleteGroup, deleteState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteGroupMutation,
  });
  const { confirmWithUndo } = useConfirmWithUndo();
  const openForm = (record: IGroup | null) => {
    if (canWrite && currentMedium?.id) setForm({ record, mediumId: currentMedium.id });
  };
  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'House name',
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SubjectColorIndicator color={row.color} />
          {value}
        </Box>
      ),
    },
    {
      id: 'action',
      label: 'Actions',
      isSort: false,
      isFilter: false,
      sticky: true,
      width: 96,
      minWidth: 96,
      render: (_value, row) => (
        <ThreeDotsActions
          showEditIcon={canWrite}
          showDeleteIcon={canDelete}
          showThreeDots={false}
          handleEditClick={() => openForm(row as IGroup)}
          handleDeleteClick={() => setDeleting(row as IGroup)}
        />
      ),
    },
  ];
  return (
    <Box sx={{ minHeight: 0, height: 1, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Settings"
        description="Manage house names, colors, logos and descriptions for the selected academic medium."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.studentList },
          { name: 'Settings' },
        ]}
        action={
          <Button
            size="small"
            variant="contained"
            aria-label="Add house"
            disabled={!canWrite || !currentMedium?.id}
            startIcon={<Iconify icon={GlobalIcons.addIcon} />}
            onClick={() => openForm(null)}
          >
            House
          </Button>
        }
      />
      <StudentAcademicScopeFilters />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableTitle="House Settings"
          tableId="group-management-table"
          columns={columns}
          data={currentMedium?.id && !isError ? (currentData?.data ?? []) : []}
          totalCount={currentMedium?.id && !isError ? (currentData?.data?.length ?? 0) : 0}
          isLoading={isLoading}
          noDataText={
            currentMedium?.id ? (
              <>
                No houses have been added.
                {canWrite && <Button onClick={() => openForm(null)}>Add house</Button>}
              </>
            ) : (
              'Select an academic medium to view houses.'
            )
          }
          errorContent={
            isError ? (
              <StudentFeedback
                notificationKey="STU-HOUSE-SETTINGS-LOAD"
                presentation="toast"
                severity="error"
              >
                House settings could not be loaded.
              </StudentFeedback>
            ) : undefined
          }
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
        />
      </Box>
      {form && canWrite && (
        <HouseSettingsForm
          key={form.record?.id ?? 'new'}
          record={form.record}
          mediumId={form.mediumId}
          onClose={() => setForm(null)}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleting) && canDelete}
        onClose={() => !deleteState.isLoading && setDeleting(null)}
        disableCancel={deleteState.isLoading}
        title="Delete House?"
        content={
          <>
            Delete house <strong>{deleting?.name}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            loading={deleteState.isLoading}
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={() => {
              if (!canDelete || !deleting) return;
              confirmWithUndo({
                item: deleting,
                onOptimisticRemove: (dispatch, setDeleteIndex) =>
                  dispatch(
                    studentGroupApi.util.updateQueryData(
                      'getAllGroup',
                      currentMedium?.id,
                      (draft: { data?: IGroup[] }) => {
                        const index =
                          draft.data?.findIndex((group) => group.id === deleting.id) ?? -1;
                        setDeleteIndex(index);
                        if (index !== -1) draft.data?.splice(index, 1);
                      }
                    )
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () => deleteGroup(deleting.id),
              });
              setDeleting(null);
            }}
          >
            Delete
          </Button>
        }
      />
    </Box>
  );
}
