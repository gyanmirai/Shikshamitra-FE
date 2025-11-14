'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import DriverConductorForm from './Components/AssignRouteForm';
import DriverConductorTable from './Components/DriverManagementTable';

import type { IDriverConductor } from './Components/type';

const DriverManagementScreen = () => {
  // Dialog control states
  const addDriverDialog = useBoolean(); // Controls add/edit driver/conductor dialog
  const [open, setOpen] = useState(false); // Controls table dialog state

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store currently selected driver/conductor for edit/delete operations
  const [selectedDriverConductor, setSelectedDriverConductor] = useState<IDriverConductor | null>(
    null
  );

  const dispatch = useDispatch();

  /**
   * Handles closing of add/edit driver/conductor dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset state after dialog closes
    const resetState = () => {
      setTimeout(() => {
        addDriverDialog.onFalse();

        setSelectedDriverConductor(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // If form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      resetState();
    }
    // If no unsaved changes, simply close dialog
    else if (!isChanges) {
      resetState();
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Transport Staff Management"
        description="This screen displays a list of all registered drivers and conductors within the institution. It helps in managing driver information and ensuring smooth allocation for transportation services."
        links={[
          { name: 'Transport', href: '/transport/dashboard' },
          { name: 'Transport Staff Management' },
        ]}
        sx={{ mb: 2 }}
      />

      <DriverConductorTable
        open={open}
        onAddDriverConductor={addDriverDialog}
        setOpenDialog={setOpen}
        setEditData={setSelectedDriverConductor}
        editData={null}
      />

      <CustomDialog
        open={addDriverDialog.value}
        handleClose={() => {
          addDriverDialog.onFalse();
          setTimeout(() => {
            setSelectedDriverConductor(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedDriverConductor ? 'Update Driver/Conductor' : 'Add Driver/Conductor'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedDriverConductor
                  ? 'Update existing driver or conductor information including personal details, license information, and route assignments.'
                  : 'Add a new driver or conductor by entering their personal details, license information, and assigning routes.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <DriverConductorForm
          onClose={handleClose}
          editData={selectedDriverConductor}
          driverData={null}
        />
      </CustomDialog>
    </Box>
  );
};

export default DriverManagementScreen;
