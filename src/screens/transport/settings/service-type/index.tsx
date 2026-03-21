'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/custom-dialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import {
  vehicleSettingsApi,
  useGetServiceTypesQuery,
  useDeleteServiceTypeMutation,
} from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import ServiceTypeForm from './components/ServiceTypeForm';
import ServiceTypeTable from './components/ServiceTypeTable';

import type { IServiceType } from './components/type';

const ServiceTypeSettingScreen = () => {
  // Dialog control states
  const deleteServiceTypeDialog = useBoolean(); // Controls delete confirmation dialog
  const addServiceTypeDialog = useBoolean(); // Controls add/edit service type dialog
  const [open, setOpen] = useState(false); // Controls table dialog state

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store currently selected service type for edit/delete operations
  const [selectedServiceType, setSelectedServiceType] = useState<IServiceType | null>(null);

  const dispatch = useDispatch();

  // Delete mutation hook
  const { deleteServiceType, isLoading: isDeleting } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteServiceTypeMutation,
  });

  const {
    data: serviceTypeData,
    isLoading: serviceTypesLoading,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetServiceTypesQuery,
  });

  // Undo functionality hook
  const { confirmWithUndo } = useConfirmWithUndo();

  /**
   * Handles closing of add/edit service type dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset state after dialog closes
    const resetState = () => {
      setTimeout(() => {
        setSelectedServiceType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // If form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addServiceTypeDialog.onFalse();
      resetState();
    }
    // If no unsaved changes, simply close dialog
    else if (!isChanges) {
      addServiceTypeDialog.onFalse();
      setTimeout(() => {
        setSelectedServiceType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Servicing Type"
        description="This screen displays a list of all created service types used for vehicle maintenance and operations (e.g., oil change, tire replacement, general servicing). It helps standardize service categories across the transport module. Admins can view existing service types, manage them, and add new ones when required."
        links={[
          { name: 'Transport', href: '/transport/dashboard' },
          { name: 'Settings', href: '/transport/settings/vehicleType' },
          { name: 'Servicing Type', href: '/transport/setting/service-type' },
        ]}
        action={
          <Button
            onClick={() => addServiceTypeDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Service Type
          </Button>
        }
      />

      <ServiceTypeTable
        data={serviceTypeData}
        isLoading={serviceTypesLoading}
        onDelete={(data) => {
          setSelectedServiceType(data);
          deleteServiceTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedServiceType(data);
          addServiceTypeDialog.onTrue();
        }}
        open={open}
        onAddServiceType={addServiceTypeDialog}
        setOpenDialog={setOpen}
        editData={selectedServiceType}
        setEditData={setSelectedServiceType}
      />

      <CustomDialog
        open={addServiceTypeDialog.value}
        handleClose={() => {
          addServiceTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedServiceType(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedServiceType ? 'Update Service Type' : 'Add Service Type'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedServiceType
                  ? 'Update existing service type by entering its name (e.g., Oil Change, Tire Replacement).'
                  : 'Create a new service type by entering its name (e.g., Oil Change, Tire Replacement).'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ServiceTypeForm
          open={addServiceTypeDialog}
          onClose={handleClose}
          editData={selectedServiceType}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteServiceTypeDialog.value}
        onClose={() => {
          setSelectedServiceType(null);
          deleteServiceTypeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete service type{' '}
            <strong>{selectedServiceType?.typeName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            disabled={isDeleting}
            onClick={async () => {
              if (!selectedServiceType?.id) return;

              confirmWithUndo({
                item: selectedServiceType,
                message: `Service Type: ${selectedServiceType?.name || selectedServiceType?.typeName} deleted successfully`,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
                  dispatchFn(
                    vehicleSettingsApi.util.updateQueryData(
                      'getServiceTypes',
                      undefined,
                      (draft: any) => {
                        const arr = Array.isArray(draft) ? draft : draft?.data;
                        if (!Array.isArray(arr)) return;

                        const index = arr.findIndex(
                          (item: any) => item.id === selectedServiceType.id
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
                  await deleteServiceType(selectedServiceType.id);
                },
              });

              deleteServiceTypeDialog.onFalse();
              setSelectedServiceType(null);
            }}
          >
            {isDeleting ? 'Deleting...' : 'Yes'}
          </Button>
        }
      />
    </Box>
  );
};

export default ServiceTypeSettingScreen;
