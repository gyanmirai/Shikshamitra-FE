import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { SwapHoriz, Visibility } from '@mui/icons-material';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Card, Button, Avatar, Divider, Typography } from '@mui/material';

import ViewStudents from './ViewStudents';
import ChangeVehicleForm from './ChangeVehicleForm';

// Mock vehicle data - replace with actual props/API data
const mockVehicleData = {
  vehicleNumber: 'GJ-05-AD-2711',
  imageUrl: 'https://cdn-icons-png.flaticon.com/512/296/296216.png',
  busCode: 'Bus-001',
  schoolAssignedNumber: '05',
  studentName: 'Dharmik Jinjala',
  PhoneNumber: '9876543210',
  avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
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
      <Card sx={{ p: 3, borderRadius: 2, boxShadow: 4, position: 'relative', minHeight: 120 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            Current Vehicle & Driver
          </Typography>
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
              bgcolor: 'background.paper',
              boxShadow: 1,
            }}
          >
            Change Vehicle
          </Button>
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Vehicle Info */}
          <Box display="flex" alignItems="center" gap={2} minWidth={220}>
            <Avatar
              src={mockVehicleData.imageUrl || '/static/vehicle/bus-1.png'}
              sx={{ width: 56, height: 56 }}
              variant="rounded"
            />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {mockVehicleData.vehicleNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                School Assigned No: {mockVehicleData.schoolAssignedNumber}
              </Typography>
            </Box>
          </Box>

          {/* Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              height: 56,
              borderRightWidth: 3,
              bgcolor: 'primary.main',
              borderColor: 'primary.main',
              width: '3px',
              borderRadius: '10px',
            }}
          />

          {/* Total Students */}
          <Box display="flex" alignItems="center" gap={2} minWidth={220}>
            <Avatar
              src={mockVehicleData.avatarUrl || '/static/avatars/default-avatar.jpg'}
              sx={{
                width: 56,
                height: 56,
                border: '1px solid ',
              }}
            />
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                {mockVehicleData.studentName}
                <Visibility
                  sx={{ fontSize: 18, ml: 4, cursor: 'pointer' }}
                  onClick={() => viewStudentsDialog.onTrue()}
                />
              </Typography>
              <Typography color="text.primary">{mockVehicleData.PhoneNumber}</Typography>
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
