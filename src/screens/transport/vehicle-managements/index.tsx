'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/useBoolean';
import { useSelector, useDispatch } from 'react-redux';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';

import VehicleViewDetails from './vehicle-view-details';
import VehicleTableView from './components/VehicleTableView';
import VehicleFormStepper from './vehicle-form-component/VehicleForm';

import type { IVehicleData } from './components/type';

const VehicleManagement = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [open, setOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [viewVehicle, setViewVehicle] = useState<IVehicleData | null>(null);
  const viewDialog = useBoolean();
  const dispatch = useDispatch();

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedVehicle(null);
    } else if (!isChanges) {
      setOpen(false);
      setSelectedVehicle(null);
    }
  };

  const handleViewClose = () => {
    viewDialog.onFalse();
    setViewVehicle(null);
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {showBreadCumb &&
        (open ? (
          <CustomBreadcrumbs
            heading={selectedVehicle ? 'Update Vehicle' : 'Register Vehicle'}
            description={
              selectedVehicle
                ? 'Update existing vehicle details such as registration, type, and status.'
                : 'Register a new vehicle by entering details like registration, documents, and maintenance.'
            }
            isBack
            onBack={() => handleClose(null, false)}
            links={[
              { name: 'Transport', href: '/transport/dashboard' },
              {
                name: 'Vehicle Management',
                href: '/transport/vehicle-management',
                onClick: () => {
                  setOpen(false);
                  setSelectedVehicle(null);
                },
              },
              {
                name: selectedVehicle ? 'Update Vehicle' : 'Register Vehicle',
                href: '/transport/vehicle-management',
              },
            ]}
            sx={{ px: 1 }}
          />
        ) : viewDialog.value ? (
          <CustomBreadcrumbs
            heading="Vehicle Details"
            description="This modal displays the complete details of a selected vehicle, including its specifications, documents, and status. It helps in quickly reviewing and managing vehicle information."
            isBack
            onBack={handleViewClose}
            links={[
              { name: 'Transport', href: '/transport/dashboard' },
              {
                name: 'Vehicle Management',
                href: '/transport/vehicle-management',
                onClick: handleViewClose,
              },
              {
                name: 'Vehicle Details',
                href: '/transport/vehicle-management',
              },
            ]}
          />
        ) : (
          <CustomBreadcrumbs
            heading="Vehicle Management"
            description="This screen displays all registered vehicles with options to view them in table format, along with the option to register new vehicles. It helps in maintaining accurate vehicle records and ensuring efficient transport management."
            links={[
              { name: 'Transport', href: '/transport/dashboard' },
              { name: 'Vehicle Management' },
            ]}
            action={
              <Button
                startIcon={<Add />}
                variant="contained"
                size="small"
                onClick={() => setOpen(true)}
                sx={{ px: '32px' }}
              >
                Register Vehicle
              </Button>
            }
          />
        ))}

      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: 2 }}>
          <VehicleFormStepper onClose={handleClose} editData={selectedVehicle} />
        </Card>
      ) : viewDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <VehicleViewDetails vehicleData={viewVehicle} />
        </Card>
      ) : (
        <VehicleTableView
          onEdit={(data) => {
            setSelectedVehicle(data);
            setOpen(true);
          }}
          onView={(data) => {
            viewDialog.onTrue();
            setViewVehicle(data);
          }}
        />
      )}
    </Box>
  );
};

export default VehicleManagement;
