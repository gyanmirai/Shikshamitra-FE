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
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
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

  const assignmentTypes = assignmentTypeData?.data || [];
  const totalTypes = assignmentTypes.length;
  const activeTypes = assignmentTypes.filter((t: any) => t.status === 0).length;
  const inactiveTypes = assignmentTypes.filter((t: any) => t.status === 1).length;
  
  let mostUsedType = '-';
  let maxUsage = 0;
  assignmentTypes.forEach((t: any) => {
    if (t.usageCount && t.usageCount > maxUsage) {
      maxUsage = t.usageCount;
      mostUsedType = t.assignmentTypeName;
    }
  });
  const unusedTypes = assignmentTypes.filter((t: any) => !t.usageCount).length;

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

      {/* Summary Cards */}
      <Box display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }} gap={2} mb={3}>
        {[
          { label: 'Total Types', value: totalTypes, color: 'primary.main' },
          { label: 'Active Types', value: activeTypes, color: 'success.main' },
          { label: 'Inactive Types', value: inactiveTypes, color: 'error.main' },
          { label: 'Most Used Type', value: mostUsedType, color: 'warning.main' },
          { label: 'Unused Types', value: unusedTypes, color: 'text.secondary' },
        ].map((card, idx) => (
          <Box
            key={idx}
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: 'background.neutral',
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {card.label}
            </Typography>
            <Typography variant="h5" color={card.color} sx={{ fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {card.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <AssignmentTypeTable
        isLoading={isFetching}
        data={assignmentTypes}
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
              try {
                await deleteAssignmentType({
                  academicMediumId: (currentMedium as any).id,
                  assignmentTypeId: selectedData?.id,
                }).unwrap();
                shikshaMitraToast.success({ message: 'Assignment Type deleted successfully' });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to delete Assignment Type',
                });
              }
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
