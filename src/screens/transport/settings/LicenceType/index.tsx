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

import LicenceTypeForm from './Components/LicenceTypeForm';
import LicenceTypeTable from './Components/LicenceTypeTable';

import type { ILicenceType } from './Components/type';

const LicenceTypeSettingScreen = () => {
  // Dialog control states
  const deleteLicenceTypeDialog = useBoolean(); // Controls delete confirmation dialog
  const addLicenceTypeDialog = useBoolean(); // Controls add/edit licence type dialog
  const [open, setOpen] = useState(false); // Controls table dialog state

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store currently selected licence type for edit/delete operations
  const [selectedLicenceType, setSelectedLicenceType] = useState<ILicenceType | null>(null);

  const dispatch = useDispatch();

  /**
   * Handles closing of add/edit licence type dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset state after dialog closes
    const resetState = () => {
      setTimeout(() => {
        setSelectedLicenceType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // If form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addLicenceTypeDialog.onFalse();
      resetState();
    }
    // If no unsaved changes, simply close dialog
    else if (!isChanges) {
      addLicenceTypeDialog.onFalse();
      setTimeout(() => {
        setSelectedLicenceType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Licence Type"
        description="This screen displays all created license types within the transport system. Admins can add, edit, or deactivate different license categories (e.g., LMV, HMV, etc.) that will be assigned to drivers based on their qualifications."
        links={[
          { name: 'Transport', href: '/transport/dashboard' },
          { name: 'Settings', href: '/transport/settings/vehicleType' },
          { name: 'Licence Type' },
        ]}
        action={
          <Button
            onClick={() => addLicenceTypeDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Licence Type
          </Button>
        }
        sx={{ px: 1 }}
      />

      <LicenceTypeTable
        onDelete={(data) => {
          setSelectedLicenceType(data);
          deleteLicenceTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedLicenceType(data);
          addLicenceTypeDialog.onTrue();
        }}
        open={open}
        onAddLicenceType={addLicenceTypeDialog}
        setOpenDialog={setOpen}
        editData={selectedLicenceType}
        setEditData={setSelectedLicenceType}
      />

      <CustomDialog
        open={addLicenceTypeDialog.value}
        handleClose={() => {
          addLicenceTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedLicenceType(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedLicenceType ? 'Update Licence Type' : 'Add Licence Type'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedLicenceType
                  ? 'Update existing licence type by entering its name (e.g., Light Motor Vehicle, Heavy Motor Vehicle).'
                  : 'Create a new licence type by entering its name (e.g., Light Motor Vehicle, Heavy Motor Vehicle).'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <LicenceTypeForm
          open={addLicenceTypeDialog}
          onClose={handleClose}
          editData={selectedLicenceType}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteLicenceTypeDialog.value}
        onClose={() => {
          setSelectedLicenceType(null);
          deleteLicenceTypeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete licence type{' '}
            <strong>{selectedLicenceType?.typeName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteLicenceTypeDialog.onFalse();
              setSelectedLicenceType(null);
              shikshaMitraToast.success({
                message: `Licence Type: ${selectedLicenceType?.typeName} deleted successfully`,
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

export default LicenceTypeSettingScreen;
