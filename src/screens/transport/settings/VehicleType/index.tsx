'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useDeleteVehicleTypeMutation } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import VehicleTypeForm from './Components/VehicleTypeForm';
import VehicleTypeTable from './Components/VehicalTypeTable';

import type { IVehicleType } from './Components/type';

const VehicleTypeSettingScreen = () => {
  // Dialog control states
  const deleteVehicleTypeDialog = useBoolean(); // Controls delete confirmation dialog
  const addVehicleTypeDialog = useBoolean(); // Controls add/edit vehicle type dialog
  const [open, setOpen] = useState(false); // Controls table dialog state

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store currently selected vehicle type for edit/delete operations
  const [selectedVehicleType, setSelectedVehicleType] = useState<IVehicleType | null>(null);

  const dispatch = useDispatch();

  // Delete mutation hook
  const { deleteVehicleType, isLoading: isDeleting } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteVehicleTypeMutation,
  });

  /**
   * Handles closing of add/edit vehicle type dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: React.SyntheticEvent, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedVehicleType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // If form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addVehicleTypeDialog.onFalse();
      resetState();
    }
    // If no unsaved changes, simply close dialog
    else if (!isChanges) {
      addVehicleTypeDialog.onFalse();
      setTimeout(() => {
        setSelectedVehicleType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Vehicle Type"
        description="Admins can view, manage, and maintain the list of vehicle categories. It also provides the option to add new vehicle types, ensuring flexibility for different transport needs."
        links={[
          { name: 'Transport', href: '/transport/dashboard' },
          { name: 'Settings', href: '/transport/settings/vehicleType' },
          { name: 'Vehicle Type' },
        ]}
        action={
          <Button
            onClick={() => addVehicleTypeDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Vehicle Type
          </Button>
        }
        sx={{ mb: 2 }}
      />

      <VehicleTypeTable
        onDelete={(data) => {
          setSelectedVehicleType(data);
          deleteVehicleTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedVehicleType(data);
          addVehicleTypeDialog.onTrue();
        }}
        open={open}
        onAddVehicleType={addVehicleTypeDialog}
        setOpenDialog={setOpen}
        editData={selectedVehicleType}
        setEditData={setSelectedVehicleType}
      />

      <CustomDialog
        open={addVehicleTypeDialog.value}
        handleClose={() => {
          addVehicleTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedVehicleType(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedVehicleType ? 'Update Vehicle Type' : 'Add Vehicle Type'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedVehicleType
                  ? 'Update existing vehicle type by entering its name (e.g., Bus, Van, Auto Rickshaw).'
                  : 'Create a new vehicle type by entering its name (e.g., Bus, Van, Auto Rickshaw).'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <VehicleTypeForm
          open={addVehicleTypeDialog}
          onClose={handleClose}
          editData={selectedVehicleType}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteVehicleTypeDialog.value}
        onClose={() => {
          setSelectedVehicleType(null);
          deleteVehicleTypeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete vehicle type{' '}
            <strong>{selectedVehicleType?.typeName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            disabled={isDeleting}
            onClick={async () => {
              if (!selectedVehicleType?.id) return;

              try {
                const vehicleTypeName = selectedVehicleType?.name || selectedVehicleType?.typeName;
                await deleteVehicleType(selectedVehicleType.id);
                deleteVehicleTypeDialog.onFalse();
                setSelectedVehicleType(null);
                shikshaMitraToast.success({
                  message: `Vehicle Type: ${vehicleTypeName} deleted successfully`,
                });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to delete vehicle type',
                });
              }
            }}
          >
            {isDeleting ? 'Deleting...' : 'Yes'}
          </Button>
        }
      />
    </Box>
  );
};

export default VehicleTypeSettingScreen;
