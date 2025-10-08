'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import VehicleTableView from './Components/VehicleTableView';
import VehicleFormStepper from './VehicleFormComponent/VehicleForm';

const VehicleManagement = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [open, setOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
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
            sx={{ px: 1, mb: 2 }}
          />
        ) : (
          <CustomBreadcrumbs
            heading="Vehicle Management"
            description="This screen displays all registered vehicles with options to view them in table format, along with the option to register new vehicles. It helps in maintaining accurate vehicle records and ensuring efficient transport management."
            links={[
              { name: 'Transport', href: '/transport/dashboard' },
              { name: 'Vehicle Management' },
            ]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                startIcon={<Add />}
                variant="contained"
                size="small"
                onClick={() => setOpen(true)}
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
      ) : (
        <VehicleTableView
          onEdit={(data) => {
            setSelectedVehicle(data);
            setOpen(true);
          }}
        />
      )}
    </Box>
  );
};

export default VehicleManagement;
