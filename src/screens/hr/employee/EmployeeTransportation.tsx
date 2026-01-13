import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify/iconify';
import {
  Box,
  Grid,
  Card,
  Stack,
  Button,
  Divider,
  Typography,
  CardHeader,
  CardContent,
} from '@mui/material';

interface EmployeeTransportationProps {
  employee?: any;
}

const EmployeeTransportation = ({ employee }: EmployeeTransportationProps) => {
  const theme = useTheme();

  // Mock transport data (replace with real employee transport data from API)
  const transport = {
    routeName: 'Route A-1',
    routeType: 'Pickup And Drop',
    startPoint: 'Main Gate',
    endPoint: 'School Campus',
    stopName: 'Central Square',
    pickupTime: '7:30 AM',
    dropTime: '4:00 PM',
    driver: { name: 'Rajesh Kumar', phone: '+91 98765 43210' },
    conductor: { name: 'Suresh Patel', phone: '+91 91234 56780' },
    vehicle: { number: 'MH 12 AB 4589', type: 'School Bus', capacity: 40, status: 'Active' },
  };

  const routeDetails = [
    { label: 'Route Name', value: transport.routeName, icon: 'mdi:routes' },
    { label: 'Route Type', value: transport.routeType, icon: 'mdi:road-variant' },
    { label: 'Start Point', value: transport.startPoint, icon: 'mdi:map-marker-check' },
    { label: 'End Point', value: transport.endPoint, icon: 'mdi:map-marker' },
    { label: 'Stop Name', value: transport.stopName, icon: 'mdi:bus-stop' },
    { label: 'Pickup Time', value: transport.pickupTime, icon: 'mdi:clock-start', color: 'info' },
    { label: 'Drop Time', value: transport.dropTime, icon: 'mdi:clock-end', color: 'info' },
  ];

  const driverDetails = [
    { label: 'Vehicle No.', value: transport.vehicle.number, icon: 'mdi:bus' },
    { label: 'Vehicle Type', value: transport.vehicle.type, icon: 'mdi:bus-school' },
    { label: 'Capacity', value: `${transport.vehicle.capacity} Seats`, icon: 'mdi:account-group' },
    {
      label: 'Status',
      value: transport.vehicle.status,
      icon: 'mdi:shield-check',
      color: 'success',
    },
    { label: 'Driver', value: transport.driver.name, icon: 'mdi:account-tie' },
    { label: 'Driver Contact', value: transport.driver.phone, icon: 'mdi:phone', isPhone: true },
    { label: 'Conductor', value: transport.conductor.name, icon: 'mdi:account' },
    {
      label: 'Conductor Contact',
      value: transport.conductor.phone,
      icon: 'mdi:phone',
      isPhone: true,
    },
  ];

  const renderDetailItem = (item: any) => (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        <Iconify icon={item.icon} width={20} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          display="block"
          sx={{ mb: 0.5 }}
        >
          {item.label}
        </Typography>
        <Typography variant="subtitle2" color="text.primary" noWrap>
          {item.value}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Stack spacing={3}>
      {/* Header / Actions */}
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<Iconify icon="mdi:bus" />}
          size="small"
          sx={{
            boxShadow: theme.shadows[8],
            px: 3,
            py: 1,
            borderRadius: 1,
          }}
        >
          Request Transport
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Route Details Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              height: '100%',
              boxShadow: (t) => t.customShadows?.card || t.shadows[4], // Fallback if customShadows doesn't exist
              borderRadius: 2,
            }}
          >
            <CardHeader
              title="Route Details"
              subheader="Daily pickup and drop information"
              avatar={
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                    color: 'primary.dark',
                    display: 'flex',
                  }}
                >
                  <Iconify icon="mdi:routes" width={24} />
                </Box>
              }
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider sx={{ borderStyle: 'dashed' }} />
            <CardContent>
              <Grid container spacing={3}>
                {routeDetails.map((item, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6 }}>
                    {renderDetailItem(item)}
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Driver & Vehicle Details Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              height: '100%',
              boxShadow: (t) => t.customShadows?.card || t.shadows[4],
              borderRadius: 2,
            }}
          >
            <CardHeader
              title="Driver & Vehicle"
              subheader="Bus and contact details"
              avatar={
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: (t) => alpha(t.palette.info.main, 0.12),
                    color: 'info.dark',
                    display: 'flex',
                  }}
                >
                  <Iconify icon="mdi:bus-school" width={24} />
                </Box>
              }
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider sx={{ borderStyle: 'dashed' }} />
            <CardContent>
              <Grid container spacing={3}>
                {driverDetails.map((item, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6 }}>
                    {renderDetailItem(item)}
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default EmployeeTransportation;
