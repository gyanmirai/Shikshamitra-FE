'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  assignmentTypesApi,
  useGetAssignmentTypesQuery,
  useDeleteAssignmentTypeMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/AssignmentTypesApi';

import AssignmentTypeForm from './assignmentTypeForm';
import AssignmentTypeTable from './assignmentTypeTable';

import type { IAssignmentType } from './type';

const AssignmentTypeCreation = () => {
  // Dialog control for add/edit form
  const addAssignmentTypeDialog = useBoolean();
  // Dialog control for delete confirmation
  const deleteDialog = useBoolean();
  // State to control modal visibility (unused)
  const [, setOpen] = useState(false);
  // Get changes status from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Get current medium from global state
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.homework.settings.assignmentTypes}.Add`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.homework.settings.assignmentTypes}.Delete`
  );

  // Selected assignment type data for edit/delete operations
  const [selectedData, setSelectedData] = useState<IAssignmentType | null>(null);

  // Redux dispatch function
  const dispatch = useDispatch();

  // Delete mutation hook
  const [deleteAssignmentType, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteAssignmentTypeMutation,
  });
  const { confirmWithUndo } = useConfirmWithUndo();

  /**
   * Handles dialog close with form submission check
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setOpen(false);
        setSelectedData(null);
        dispatch(setIsChanges(false));
      }, 300); // Optional: adjust delay to match your dialog close animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addAssignmentTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addAssignmentTypeDialog.onFalse();
      resetState();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    data: assignmentTypeData,
    refetch,
    isLoading: isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentTypesQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
  });

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework & Assignment' },
          { name: 'Settings' },
          { name: 'Assignment Type' },
        ]}
        heading="Assignment Type"
        description="Create and manage assignment types for homework and assignments. Add, edit, or delete assignment types as needed."
        action={
          canAdd ? (
            <Button
              startIcon={<Iconify icon="eva:plus-fill" />}
              variant="contained"
              onClick={addAssignmentTypeDialog.onTrue}
              size="small"
              sx={{ px: '32px' }}
            >
              Assignment Type
            </Button>
          ) : null
        }
      />

      <AssignmentTypeTable
        isLoading={isFetching}
        data={assignmentTypeData?.data || []}
        canAdd={canAdd}
        canDelete={canDelete}
        onEdit={(data) => {
          setSelectedData(data);
          addAssignmentTypeDialog.onTrue();
        }}
        onDelete={(data) => {
          setSelectedData(data);
          deleteDialog.onTrue();
        }}
      />
      {/* Add/Edit Assignment Type Dialog */}
      <CustomDialog
        open={addAssignmentTypeDialog.value}
        handleClose={() => {
          addAssignmentTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedData(null);
          }, 200); // Match this delay to your dialog's transition duration
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedData ? 'Update Assignment Type' : 'Add Assignment Type'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedData
                  ? 'You can update the assignment type details entering the name.'
                  : 'You can create a new assignment type by entering the name.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AssignmentTypeForm
          open={addAssignmentTypeDialog}
          onClose={handleClose}
          editData={selectedData}
          existingTypes={assignmentTypeData?.data ?? []}
        />
      </CustomDialog>
      {/* Delete Assignment Type Dialog */}
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedData(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete assignment type{' '}
            <strong>{selectedData?.assignmentTypeName}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: selectedData,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    assignmentTypesApi.util.updateQueryData(
                      'getAssignmentTypes',
                      { academicMediumId: (currentMedium as Medium).id },
                      (draft: any) => {
                        const index = draft?.data?.findIndex(
                          (item: any) => item.id === selectedData?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1 && draft?.data) draft.data.splice(index, 1);
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) => refetch(),
                onCommit: () =>
                  deleteAssignmentType({
                    academicMediumId: (currentMedium as any).id,
                    assignmentTypeId: selectedData?.id,
                  }),
              });
              deleteDialog.onFalse();
              setSelectedData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default AssignmentTypeCreation;
