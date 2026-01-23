'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useDeleteBuildingMutation } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';

import BuildingForm from './components/buildingForm';
import BuildingTable from './components/buildingTable';

import type { IBuilding } from './types';

const BuildingManagement = () => {
  // Dialog control hooks for add/edit and delete building modals
  const addBuildingDialog = useBoolean();
  const deleteBuildingDialog = useBoolean();
  const [open, setOpen] = useState(false);

  const [deleteBuilding, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteBuildingMutation,
  });
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State for managing selected building and building data
  const [selectedBuilding, setSelectedBuilding] = useState<IBuilding | null>(null);

  // Redux dispatch hook
  const dispatch = useDispatch();

  /**
   * Handles closing of the add/edit building dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset component state
    const resetState = () => {
      setTimeout(() => {
        setSelectedBuilding(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // Close dialog if form submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addBuildingDialog.onFalse();
      resetState();
    }
    // Close dialog if no unsaved changes
    else if (!isChanges) {
      addBuildingDialog.onFalse();
      setTimeout(() => {
        setSelectedBuilding(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {addBuildingDialog.value ? (
        <CustomBreadcrumbs
          heading="Building Management"
          description="Update and modify existing building details by revising key information, floor mappings, and room assignments for improved facility management."
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
          links={[
            { name: 'Institute Setup', href: '/academic/dashboard' },
            { name: 'Rooms Management', href: '/academic/curriculumSubjects' },
            { name: 'Building Management', href: '/academic/curriculumSubjects' },
          ]}
          sx={{ px: 1, mb: 1 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Building Management"
          description="Define and organize building infrastructure by setting up buildings, floors and rooms to ensure effective facility management."
          links={[
            { name: 'Institute Setup', href: '/academic/dashboard' },
            { name: 'Rooms Management', href: '/academic/curriculumSubjects' },
            { name: 'Building Management' },
          ]}
          sx={{ px: 1, mb: 1 }}
          action={
            <Button
              variant="contained"
              onClick={addBuildingDialog.onTrue}
              startIcon={<Add />}
              size="small"
              sx={{
                width: '130px',
              }}
            >
              Building
            </Button>
          }
        />
      )}

      {addBuildingDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <BuildingForm
            open={addBuildingDialog}
            onClose={handleClose}
            editData={selectedBuilding}
          />
        </Card>
      ) : (
        <BuildingTable
          onDelete={(data) => {
            setSelectedBuilding(data);
            deleteBuildingDialog.onTrue();
          }}
          onEdit={(data) => {
            setSelectedBuilding(data);
            addBuildingDialog.onTrue();
          }}
          open={open}
          onAddBuilding={addBuildingDialog}
          setOpenDialog={setOpen}
          editData={selectedBuilding}
          setEditData={setSelectedBuilding}
        />
      )}

      <ConfirmDialog
        open={deleteBuildingDialog.value}
        onClose={() => {
          setSelectedBuilding(null);
          deleteBuildingDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete building{' '}
            <strong>{selectedBuilding?.buildingName}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              await deleteBuilding(selectedBuilding?.id);
              deleteBuildingDialog.onFalse();
              setSelectedBuilding(null);
              shikshaMitraToast.success({
                message: `Building "${selectedBuilding?.buildingName}" deleted successfully`,
              });
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default BuildingManagement;
