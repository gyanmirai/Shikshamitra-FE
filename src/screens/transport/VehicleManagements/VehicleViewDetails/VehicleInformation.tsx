import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import BadgeIcon from '@mui/icons-material/Badge';
import RouteIcon from '@mui/icons-material/Route';
import { alpha, useTheme } from '@mui/material/styles';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStationOutlined';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import { useGetVehicleDetailsQuery } from 'src/redux/transport/vehicle-management/vehicle-management-api';

import { VehicleStatusType, VehicleStatusTypeColors } from '../Components/type';

interface VehicleInformationCardProps {
  vehicleId: string;
}

const VehicleInformationCard = ({ vehicleId }: VehicleInformationCardProps) => {
  const theme = useTheme();
  const currentMedium = useSelector((state: RootState) => state.globalState.currentMedium);

  const { data: vehicle } = useGetVehicleDetailsQuery(
    { vehicleId, academicMediumId: currentMedium?.id },
    { skip: !vehicleId || !currentMedium?.id }
  );

  const status = vehicle?.status as VehicleStatusType | undefined;
  const statusLabel =
    vehicle?.statusName || (status ? VehicleStatusType[status] : undefined) || 'Active';
  const statusColor = status
    ? (VehicleStatusTypeColors[status] as 'success' | 'error' | 'warning')
    : 'success';

  // Helper to get colors for different fields to match the reference image style
  const getFieldStyles = (type: string) => {
    switch (type) {
      case 'registration':
        return {
          bg: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.main,
          icon: <BadgeIcon />,
        };
      case 'model':
        return {
          bg: alpha(theme.palette.warning.main, 0.1),
          color: theme.palette.warning.main,
          icon: <DirectionsCarIcon />,
        };
      case 'type':
        return {
          bg: alpha(theme.palette.secondary.main, 0.1),
          color: theme.palette.secondary.main,
          icon: <DirectionsBusIcon />,
        };
      case 'capacity':
        return {
          bg: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
          icon: <AirlineSeatReclineNormalIcon />,
        };
      default:
        return {
          bg: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.main,
          icon: <DirectionsCarIcon />,
        };
    }
  };

  const renderDetailItem = (
    label: string,
    value: string | undefined,
    fallback: string,
    styleType: string,
    customIcon?: React.ReactNode,
    isRoute = false
  ) => {
    const styles = getFieldStyles(styleType);
    const displayValue = value || fallback;
    const finalIcon = customIcon || styles.icon;

    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1.5,
            bgcolor: styles.bg,
            color: styles.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {React.cloneElement(finalIcon as React.ReactElement<any>, { fontSize: 'medium' })}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              display: 'block',
              mb: 0.25,
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1.2,
              ...(isRoute && {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }),
            }}
            title={isRoute ? displayValue : undefined}
          >
            {isRoute && displayValue.length > 20 ? `${displayValue.slice(0, 20)}...` : displayValue}
          </Typography>
        </Box>
      </Stack>
    );
  };

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        position: 'relative',
        overflow: 'visible', // Ensure tooltip or dropdowns aren't clipped if added later
        mb: 3,
        borderLeft: `6px solid ${theme.palette.info.main}`, // Accent border from reference
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box
          sx={{
            py: 0.75,
            px: 1.5,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.info.main, 0.1),
            color: 'info.dark',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: 0.5 }}
          >
            VEHICLE DETAILS
          </Typography>
        </Box>

        <Label
          color={statusColor}
          variant="soft"
          sx={{ fontWeight: 700, textTransform: 'uppercase' }}
        >
          {statusLabel}
        </Label>
      </Stack>

      <Grid container spacing={4} rowSpacing={1}>
        {/* Row 1 - Matching the image fields */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {renderDetailItem(
            'Registration No.',
            vehicle?.registrationNo || 'GJ-05-AD-2711',
            'GJ-05-AD-2711',
            'registration',
            <BadgeIcon />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {renderDetailItem(
            'Make & Model',
            vehicle?.model,
            'Tata StarBus',
            'model',
            <DirectionsCarIcon />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {renderDetailItem(
            'Vehicle Type',
            vehicle?.vehicleType,
            'Bus',
            'type',
            <DirectionsBusIcon />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {renderDetailItem(
            'Capacity',
            `${vehicle?.seatingCapacity || '45'} Seats`,
            '45 Seats',
            'capacity',
            <AirlineSeatReclineNormalIcon />
          )}
        </Grid>

        {/* Row 2 - Remaining fields */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {renderDetailItem(
            'Bus No.',
            vehicle?.schoolAssignedNumber,
            '01',
            'default',
            <LooksOneIcon />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {renderDetailItem(
            'Fuel Type',
            vehicle?.fuelType,
            'Diesel',
            'default',
            <LocalGasStationIcon />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {renderDetailItem(
            'Insurance',
            vehicle?.insuranceExpiry,
            '10-12-2024',
            'default',
            <VerifiedUserIcon />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {renderDetailItem('Route', vehicle?.route, 'Route-CC', 'default', <RouteIcon />, true)}
        </Grid>
      </Grid>
    </Card>
  );
};

export default VehicleInformationCard;
