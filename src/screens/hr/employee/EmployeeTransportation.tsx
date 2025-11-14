import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify/iconify';
import { Box, Grid, Card, Stack, Button, Typography, CardContent } from '@mui/material';

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
    <Grid container spacing={2}>
      {/* Action Button */}
      <Grid size={{ xs: 12 }}>
        <Box display="flex" justifyContent="flex-end" alignItems="center" flexWrap="wrap" gap={2}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mdi:bus" />}
            sx={{
              fontWeight: 600,
              px: 2,
            }}
          >
            Request Transport
          </Button>
        </Box>
      </Grid>

      {/* Route Details Card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          sx={{
            boxShadow: 1,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              color="primary.main"
              mb={2.5}
              display="flex"
              alignItems="center"
              gap={0.75}
            >
              <Iconify icon="mdi:routes" width={24} />
              Route Details
            </Typography>
            <hr
              style={{
                border: 'none',
                borderTop: '1px solid #e0e0e0',
                margin: '1px',
                marginBottom: '20px',
              }}
            />

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'space-between',
              }}
            >
              {routeDetails.map((d) => (
                <Box
                  key={d.label}
                  sx={{
                    maxWidth: 140,
                    width: '100%',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon={d.icon} width={20} color="text.secondary" />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                      >
                        {d.label}:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                        sx={{ fontSize: '0.8rem' }}
                        noWrap
                        title={String(d.value)}
                      >
                        {d.value}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Driver & Vehicle Details Card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          sx={{
            boxShadow: 1,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              color="primary.main"
              mb={2.5}
              display="flex"
              alignItems="center"
              gap={0.75}
            >
              <Iconify icon="mdi:account-tie" width={24} />
              Driver & Vehicle Details
            </Typography>
            <hr
              style={{
                border: 'none',
                borderTop: '1px solid #e0e0e0',
                margin: '1px',
                marginBottom: '20px',
              }}
            />

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'space-between',
              }}
            >
              {driverDetails.map((d) => (
                <Box
                  key={d.label}
                  sx={{
                    maxWidth: 140,
                    width: '100%',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon={d.icon} width={20} color="text.secondary" />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                      >
                        {d.label}:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                        sx={{ fontSize: '0.8rem' }}
                        noWrap
                        title={String(d.value)}
                      >
                        {d.value}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default EmployeeTransportation;
