'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { alpha } from '@mui/material/styles';
import { Box, Paper, Stack, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useGetHomeworkTypesQuery,
  useDeleteHomeworkTypeMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/HomeworkTypesApi';

import HomeworkTypeForm from './homeworkTypeForm';
import HomeworkTypeTable from './homeworkTypeTable';

import type { IHomeworkType } from './type';

const HomeworkTypeCreation = () => {
  // Dialog control for add/Update Homework Type
  const addHomeworkTypeDialog = useBoolean();

  // Dialog control for delete confirmation
  const deleteDialog = useBoolean();

  // Modal open/close state
  const [, setOpen] = useState(false);

  // Track unsaved changes from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Get current medium from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.homework.settings.homeworkTypes}.Add`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.homework.settings.homeworkTypes}.Delete`
  );

  // Currently selected homework type for edit/delete
  const [selectedData, setSelectedData] = useState<IHomeworkType | null>(null);

  // Redux dispatch function
  const dispatch = useDispatch();

  // Delete mutation hook
  const [deleteHomeworkType, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteHomeworkTypeMutation,
  });

  /**
   * Handles closing of the add/edit dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setOpen(false);
        setSelectedData(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust delay as needed
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addHomeworkTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addHomeworkTypeDialog.onFalse();
      resetState();
    }
  };

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: homeworkTypeData,
    isLoading,
    isFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHomeworkTypesQuery,
    params: { academicMediumId: (medium as Medium)?.id },
    options: {
      skip: !(medium as Medium)?.id,
    },
  });

  const homeworkTypes = homeworkTypeData?.data || [];
  const totalTypes = homeworkTypes.length;
  const activeTypes = homeworkTypes.filter((t: any) => t.status === 0).length;
  const inactiveTypes = homeworkTypes.filter((t: any) => t.status === 1).length;
  
  let mostUsedType = '-';
  let maxUsage = 0;
  homeworkTypes.forEach((t: any) => {
    if (t.usageCount && t.usageCount > maxUsage) {
      maxUsage = t.usageCount;
      mostUsedType = t.homeworkTypeName;
    }
  });
  const unusedTypes = homeworkTypes.filter((t: any) => !t.usageCount).length;

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Homework Type"
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework & Assignment' },
          { name: 'Settings' },
          { name: 'Homework Type' },
        ]}
        description="Create and manage homework types for homework and assignments. Add, edit, or delete assignment types as needed."
        action={
          canAdd ? (
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={addHomeworkTypeDialog.onTrue}
              size="small"
              sx={{ px: '32px' }}
            >
              Homework Type
            </Button>
          ) : null
        }
      />

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            md: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 1,
          mb: 3,
        }}
      >
        {[
          { label: 'Total Types', value: totalTypes, color: 'text.primary' },
          { label: 'Active Types', value: activeTypes, color: 'success.main' },
          { label: 'Inactive Types', value: inactiveTypes, color: 'error.main' },
          { label: 'Most Used Type', value: mostUsedType, color: 'warning.main' },
          { label: 'Unused Types', value: unusedTypes, color: 'text.secondary' },
        ].map((card) => (
          <Paper
            key={card.label}
            variant="outlined"
            sx={{
              p: 1.25,
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
            }}
          >
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {card.label}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: card.color,
                  lineHeight: 1.1,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {card.value}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Box>

      <HomeworkTypeTable
        isLoading={isLoading || isFetching}
        data={homeworkTypes}
        canAdd={canAdd}
        canDelete={canDelete}
        onEdit={(data) => {
          setSelectedData(data);
          addHomeworkTypeDialog.onTrue();
        }}
        onDelete={(data) => {
          setSelectedData(data);
          deleteDialog.onTrue();
        }}
      />

      <CustomDialog
        open={addHomeworkTypeDialog.value}
        handleClose={() => {
          addHomeworkTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedData(null);
          }, 300); // Adjust delay if your dialog's animation is longer
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedData ? 'Update Homework Type' : 'Add Homework Type'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedData
                  ? 'You can update the homework type details entering the name.'
                  : 'You can create a new homework type by entering the name.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <HomeworkTypeForm
          open={addHomeworkTypeDialog}
          onClose={handleClose}
          editData={selectedData}
          existingTypes={homeworkTypeData?.data ?? []}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedData(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete Homework Type{' '}
            <strong>{selectedData?.homeworkTypeName}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            size="small"
            color="error"
            onClick={async () => {
              try {
                await deleteHomeworkType({
                  academicMediumId: (medium as Medium)?.id,
                  homeworkTypeId: selectedData?.id,
                }).unwrap();
                shikshaMitraToast.success({ message: 'Homework Type deleted successfully' });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to delete Homework Type',
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

export default HomeworkTypeCreation;
