import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { SwapHoriz, Visibility } from '@mui/icons-material';
import { Box, Card, Button, Typography } from '@mui/material';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import ViewStudents from './ViewStudents';
import ChangeVehicleForm from './ChangeVehicleForm';

// Mock vehicle data - replace with actual props/API data
const mockVehicleData = {
  vehicleNumber: 'GJ-05-AD-2711',
  busCode: 'Bus-001',
  contactNumber: '+91 6355030866',
  totalStudents: 35,
};

const CurrentVehicleCard = () => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const changeVehicleDialog = useBoolean();
  const viewStudentsDialog = useBoolean(); // Added for View Students dialog
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      changeVehicleDialog.onFalse();
      setSelectedVehicle(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      changeVehicleDialog.onFalse();
      setSelectedVehicle(null);
    }
  };

  return (
    <>
      <Card sx={{ p: 3, borderRadius: 2, boxShadow: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            Current Vehicle
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SwapHoriz />}
              onClick={() => {
                setSelectedVehicle(mockVehicleData);
                changeVehicleDialog.onTrue();
              }}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Change Vehicle
            </Button>

            <Button
              size="small"
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => viewStudentsDialog.onTrue()} // Added onClick handler
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              View
            </Button>
          </Box>
        </Box>

        {/* Vehicle Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              {mockVehicleData.vehicleNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mockVehicleData.busCode} {mockVehicleData.contactNumber}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h5" fontWeight="600" color="text.primary">
                {mockVehicleData.totalStudents}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Change Vehicle Dialog */}
      <CustomDialog
        open={changeVehicleDialog.value}
        handleClose={() => {
          changeVehicleDialog.onFalse();
          setSelectedVehicle(null);
        }}
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Change Vehicle</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal allows users to change the assigned vehicle for a particular transport route. It ensures flexibility and smooth adjustments in transportation management."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ChangeVehicleForm onClose={handleClose} />
      </CustomDialog>

      {/* View Students Dialog */}
      <ViewStudents
        open={viewStudentsDialog.value}
        onClose={() => viewStudentsDialog.onFalse()}
        routeData={mockVehicleData} // Pass vehicle/route data if needed
      />
    </>
  );
};

export default CurrentVehicleCard;
