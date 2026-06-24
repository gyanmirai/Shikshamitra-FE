'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  vehicleSettingsApi,
  useGetVehicleDocumentsQuery,
  useDeleteVehicleDocumentMutation,
} from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import VehicleDocumentForm from './Components/VehicleDocumentForm';
import VehicleDocumentTable from './Components/VehicleDocumentTable';

import type { IVehicleDocument } from './Components/type';

const VehicleDocumentSettingScreen = () => {
  // Dialog control states
  const deleteVehicleDocumentDialog = useBoolean(); // Controls delete confirmation dialog
  const addVehicleDocumentDialog = useBoolean(); // Controls add/edit vehicle document dialog
  const [open, setOpen] = useState(false); // Controls table dialog state

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const currentMedium = useSelector((state: RootState) => state.globalState.currentMedium);
  const vehicleDocumentQueryArgs = { academicMediumId: currentMedium?.id };

  // State to store currently selected vehicle document for edit/delete operations
  const [selectedVehicleDocument, setSelectedVehicleDocument] = useState<IVehicleDocument | null>(
    null
  );

  const dispatch = useDispatch();

  const [deleteVehicleDocument, { isLoading: isDeleting }] = useDeleteVehicleDocumentMutation();

  const {
    data: vehicleDocumentData,
    isLoading: vehicleDocumentsLoading,
    refetch,
  } = useGetVehicleDocumentsQuery(vehicleDocumentQueryArgs, { skip: !currentMedium?.id });

  // Undo functionality hook
  const { confirmWithUndo } = useConfirmWithUndo();

  /**
   * Handles closing of add/edit vehicle document dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset state after dialog closes
    const resetState = () => {
      setTimeout(() => {
        setSelectedVehicleDocument(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // If form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addVehicleDocumentDialog.onFalse();
      resetState();
    }
    // If no unsaved changes, simply close dialog
    else if (!isChanges) {
      addVehicleDocumentDialog.onFalse();
      setTimeout(() => {
        setSelectedVehicleDocument(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Required Vehicle Document"
        description="Admins can view, manage, and maintain the list of required vehicle documents. It provides the option to add new document types for compliance and regulatory purposes."
        links={[
          { name: 'Transport', href: '/transport/dashboard' },
          { name: 'Settings', href: '/transport/settings/vehicleType' },
          { name: 'Required Vehicle Document' },
        ]}
        action={
          <Button
            onClick={() => addVehicleDocumentDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Vehicle Document
          </Button>
        }
      />

      <VehicleDocumentTable
        data={vehicleDocumentData}
        isLoading={vehicleDocumentsLoading}
        onDelete={(data) => {
          setSelectedVehicleDocument(data);
          deleteVehicleDocumentDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedVehicleDocument(data);
          addVehicleDocumentDialog.onTrue();
        }}
        open={open}
        onAddVehicleDocument={addVehicleDocumentDialog}
        setOpenDialog={setOpen}
        editData={selectedVehicleDocument}
        setEditData={setSelectedVehicleDocument}
      />

      <CustomDialog
        open={addVehicleDocumentDialog.value}
        handleClose={() => {
          addVehicleDocumentDialog.onFalse();
          setTimeout(() => {
            setSelectedVehicleDocument(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedVehicleDocument ? 'Update Vehicle Document' : 'Add Vehicle Document'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedVehicleDocument
                  ? 'Update existing vehicle document by entering its name (e.g., RC Book, Insurance, PUC Certificate).'
                  : 'Create a new vehicle document by entering its name (e.g., RC Book, Insurance, PUC Certificate).'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <VehicleDocumentForm
          open={addVehicleDocumentDialog}
          onClose={handleClose}
          editData={selectedVehicleDocument}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteVehicleDocumentDialog.value}
        onClose={() => {
          setSelectedVehicleDocument(null);
          deleteVehicleDocumentDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete vehicle document{' '}
            <strong>{selectedVehicleDocument?.documentName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            disabled={isDeleting}
            onClick={async () => {
              if (!selectedVehicleDocument?.id || !currentMedium?.id) return;

              confirmWithUndo({
                item: selectedVehicleDocument,
                message: `Vehicle Document deleted successfully`,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
                  dispatchFn(
                    vehicleSettingsApi.util.updateQueryData(
                      'getVehicleDocuments',
                      vehicleDocumentQueryArgs,
                      (draft: any) => {
                        const arr = Array.isArray(draft) ? draft : draft?.data;
                        if (!Array.isArray(arr)) return;

                        const index = arr.findIndex(
                          (item: any) => item.id === selectedVehicleDocument.id
                        );
                        if (index !== -1) {
                          setDeleteIndex(index);
                          arr.splice(index, 1);
                        }
                      }
                    )
                  );
                },
                onUndoRestore: () => refetch(),
                onCommit: async () => {
                  await deleteVehicleDocument({
                    documentId: selectedVehicleDocument.id,
                    academicMediumId: currentMedium.id,
                  }).unwrap();
                },
              });

              deleteVehicleDocumentDialog.onFalse();
              setSelectedVehicleDocument(null);
            }}
          >
            {isDeleting ? 'Deleting...' : 'Yes'}
          </Button>
        }
      />
    </Box>
  );
};

export default VehicleDocumentSettingScreen;
