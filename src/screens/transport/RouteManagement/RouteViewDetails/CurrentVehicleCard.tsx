import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { Person, SwapHoriz, DirectionsBus } from '@mui/icons-material';
import { Box, Card, Button, Divider, Typography } from '@mui/material';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import ChangeVehicleForm from './ChangeVehicleForm';

export const mockVehicleData = {
  currentVehicleData: {
    vehicleNumber: 'GJ-05-AB-1234',
    schoolAssignedNumber: '01',
    studentName: 'Dharmik Jinjala',
  },
  PhoneNumber: '+91 6355030866',
};

const CurrentVehicleCard = () => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const changeVehicleDialog = useBoolean();
  const [, setSelectedVehicle] = useState<any>(null);

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
      <Card
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          minHeight: 120,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            pb: 2,
            borderBottom: '2px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="overline"
            color="primary"
            fontWeight="700"
            sx={{
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
            }}
          >
            Current Vehicle & Driver
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SwapHoriz />}
            onClick={() => {
              setSelectedVehicle(mockVehicleData?.currentVehicleData);
              changeVehicleDialog.onTrue();
            }}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
              py: 1,
              fontSize: '0.8rem',
              fontWeight: 600,
              borderWidth: 1.5,
            }}
          >
            Change Vehicle
          </Button>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 2, sm: 3 },
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          {/* Vehicle Info */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            minWidth={{ xs: '100%', sm: 220 }}
            sx={{
              p: 2,
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {/* Vehicle Icon */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <DirectionsBus sx={{ fontSize: 28, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{
                  fontSize: '1rem',
                  mb: 0.5,
                }}
              >
                {mockVehicleData?.currentVehicleData.vehicleNumber}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                School Assigned No: {mockVehicleData?.currentVehicleData.schoolAssignedNumber}
              </Typography>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ width: '2px' }} />

          {/* Driver Info */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            minWidth={{ xs: '100%', sm: 220 }}
            sx={{
              p: 2,
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {/* Driver Icon */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'success.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Person sx={{ fontSize: 28, color: 'success.main' }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{
                  fontSize: '1rem',
                  mb: 0.5,
                }}
              >
                {mockVehicleData?.currentVehicleData.studentName}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {mockVehicleData.PhoneNumber}
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
    </>
  );
};

export default CurrentVehicleCard;
