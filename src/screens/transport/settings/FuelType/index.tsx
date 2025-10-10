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
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import FuelTypeForm from './Components/FuelTypeForm';
import FuelTypeTable from './Components/FuelTypeTable';

import type { IFuelType } from './Components/type';

const FuelTypeSettingScreen = () => {
  // Dialog control states
  const deleteFuelTypeDialog = useBoolean(); // Controls delete confirmation dialog
  const addFuelTypeDialog = useBoolean(); // Controls add/edit fuel type dialog
  const [open, setOpen] = useState(false); // Controls table dialog state

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store currently selected fuel type for edit/delete operations
  const [selectedFuelType, setSelectedFuelType] = useState<IFuelType | null>(null);

  const dispatch = useDispatch();

  /**
   * Handles closing of add/edit fuel type dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset state after dialog closes
    const resetState = () => {
      setTimeout(() => {
        setSelectedFuelType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // If form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addFuelTypeDialog.onFalse();
      resetState();
    }
    // If no unsaved changes, simply close dialog
    else if (!isChanges) {
      addFuelTypeDialog.onFalse();
      setTimeout(() => {
        setSelectedFuelType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Fuel Type"
        description="This screen displays all created fuel types. You can manage existing types or add new ones as needed."
        links={[
          { name: 'Transport', href: '/transport/dashboard' },
          { name: 'Settings', href: '/transport/settings/vehicleType' },
          { name: 'Fuel Type' },
        ]}
        action={
          <Button
            onClick={() => addFuelTypeDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Fuel Type
          </Button>
        }
        sx={{ px: 1, mb: 1 }}
      />

      <FuelTypeTable
        onDelete={(data) => {
          setSelectedFuelType(data);
          deleteFuelTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedFuelType(data);
          addFuelTypeDialog.onTrue();
        }}
        open={open}
        onAddFuelType={addFuelTypeDialog}
        setOpenDialog={setOpen}
        editData={selectedFuelType}
        setEditData={setSelectedFuelType}
      />

      <CustomDialog
        open={addFuelTypeDialog.value}
        handleClose={() => {
          addFuelTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedFuelType(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedFuelType ? 'Update Fuel Type' : 'Add Fuel Type'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedFuelType
                  ? 'Update existing fuel type by entering its name (e.g., Diesel, Petrol, CNG).'
                  : 'Create a new fuel type by entering its name (e.g., Diesel, Petrol, CNG).'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <FuelTypeForm open={addFuelTypeDialog} onClose={handleClose} editData={selectedFuelType} />
      </CustomDialog>

      <ConfirmDialog
        open={deleteFuelTypeDialog.value}
        onClose={() => {
          setSelectedFuelType(null);
          deleteFuelTypeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete fuel type <strong>{selectedFuelType?.typeName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteFuelTypeDialog.onFalse();
              setSelectedFuelType(null);
              shikshaMitraToast.success({
                message: `Fuel Type: ${selectedFuelType?.typeName} deleted successfully`,
              });
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default FuelTypeSettingScreen;
