import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify/iconify';
import { Box, Grid, Card, Stack, Button, Divider, Typography } from '@mui/material';

import type { StudentTabsComponentType } from '.';

const StudentTransportProfile = (props: StudentTabsComponentType) => {
  const theme = useTheme();

  // Mock transport data (replace with real props.student values)
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
    { label: 'Pickup Time', value: transport.pickupTime, icon: 'mdi:clock-start' },
    { label: 'Drop Time', value: transport.dropTime, icon: 'mdi:clock-end' },
  ];

  const driverDetails = [
    { label: 'Vehicle No.', value: transport.vehicle.number, icon: 'mdi:bus' },
    { label: 'Vehicle Type', value: transport.vehicle.type, icon: 'mdi:bus-school' },
    { label: 'Capacity', value: `${transport.vehicle.capacity} Seats`, icon: 'mdi:account-group' },
    { label: 'Vehicle Status', value: transport.vehicle.status, icon: 'mdi:shield-check' },
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

  return (
    <Box sx={{ gap: 2, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
      {/* Action Button */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" flexWrap="wrap" gap={2}>
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="solar:bus-bold-duotone" />}
          sx={{
            fontWeight: 500,
            px: 2,
            py: 0.5,

            boxShadow: theme.customShadows?.z8 || 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.customShadows?.z16 || 4,
            },
          }}
        >
          Request Transport
        </Button>
      </Box>
      {/* Cards Grid */}
      <Grid container spacing={1}>
        {/* Route Details Card */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 2,
              boxShadow: 'none',
              border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.customShadows?.z8 || 3,
                borderColor: 'transparent',
                transform: 'translateY(-4px)',
              },
            }}
          >
            {/* Card Header */}
            <Box sx={{ p: 1, pb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    borderRadius: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                  }}
                >
                  <Iconify icon="solar:routing-2-bold-duotone" width={28} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    Route Details
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Student transport route information
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            {/* Card Content */}
            <Box sx={{ p: 1 }}>
              <Grid container spacing={3}>
                {routeDetails.map((detail) => (
                  <Grid key={detail.label} size={{ xs: 12, sm: 3 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            display: 'flex',
                            borderRadius: 1.5,
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.info.main, 0.08),
                            color: 'info.main',
                          }}
                        >
                          <Iconify icon={detail.icon} width={20} />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ fontSize: '0.75rem', lineHeight: 1.4, mb: 0.25 }}
                          >
                            {detail.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                            sx={{ fontSize: '0.875rem' }}
                            noWrap
                            title={String(detail.value)}
                          >
                            {detail.value}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Card>
        </Grid>
        {/* Driver & Vehicle Details Card */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 2,
              boxShadow: 'none',
              border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.customShadows?.z8 || 3,
                borderColor: 'transparent',
                transform: 'translateY(-4px)',
              },
            }}
          >
            {/* Card Header */}
            <Box sx={{ p: 1, pb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    borderRadius: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                  }}
                >
                  <Iconify icon="solar:bus-bold-duotone" width={28} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    Driver & Vehicle Details
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vehicle and staff information
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            {/* Card Content */}
            <Box sx={{ p: 1 }}>
              <Grid container spacing={3}>
                {driverDetails.map((detail) => (
                  <Grid key={detail.label} size={{ xs: 12, sm: 3 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            display: 'flex',
                            borderRadius: 1.5,
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.success.main, 0.08),
                            color: 'success.main',
                          }}
                        >
                          <Iconify icon={detail.icon} width={20} />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ fontSize: '0.75rem', lineHeight: 1.4, mb: 0.25 }}
                          >
                            {detail.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                            sx={{ fontSize: '0.875rem' }}
                            noWrap
                            title={String(detail.value)}
                          >
                            {detail.value}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentTransportProfile;
