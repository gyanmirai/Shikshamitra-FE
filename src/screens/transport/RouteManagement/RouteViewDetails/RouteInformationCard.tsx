import React from 'react';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Box, Grid, Card, Typography, LinearProgress } from '@mui/material';
import { Route, LocationOn, AccessTime } from '@mui/icons-material';

// Mock route data - replace with actual props/API data
const mockRouteData = {
  routeName: 'Parvat Patiya Route',
  routeCode: 'RT112',
  status: 'Active',
  startPoint: 'Parvat Patiya',
  endPoint: 'Deep Darshan School',
  distance: '15 km',
  estimatedTime: '35 minutes',
  currentStudents: 38,
  totalCapacity: 45,
};

const RouteInformationCard = () => {
  const capacityPercentage = Math.round(
    (mockRouteData.currentStudents / mockRouteData.totalCapacity) * 100
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const InfoItem = ({
    icon,
    label,
    value,
    color = 'primary.main',
  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    color?: string;
  }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: (theme) => alpha(theme.palette.success.main, 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 1,
        }}
      >
        {React.cloneElement(icon as React.ReactElement<{ sx?: { color: string } }>, {
          sx: { color },
        })}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="600">
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Card sx={{ p: 3, borderRadius: 2, boxShadow: 4, mb: 2 }}>
      {/* Header */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
      >
        <Box>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            Route Details
          </Typography>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            {mockRouteData.routeName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mockRouteData.routeCode}
          </Typography>
        </Box>
        <Label variant="soft" color="success">
          {mockRouteData.status}
        </Label>
      </Box>

      {/* Divider */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }} />

      <Grid container spacing={3}>
        {/* Start Point */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            icon={<LocationOn />}
            label="Start Point"
            value={mockRouteData.startPoint}
            color="success.main"
          />
        </Grid>

        {/* End Point */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            icon={<LocationOn />}
            label="End Point"
            value={mockRouteData.endPoint}
            color="error.main"
          />
        </Grid>

        {/* Distance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            icon={<Route />}
            label="Distance"
            value={mockRouteData.distance}
            color="primary.main"
          />
        </Grid>

        {/* Estimated Time */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            icon={<AccessTime />}
            label="Estimated Time"
            value={mockRouteData.estimatedTime}
            color="primary.main"
          />
        </Grid>
      </Grid>

      {/* Capacity Utilisation */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Capacity Utilisation
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {mockRouteData.currentStudents}/{mockRouteData.totalCapacity} students
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={capacityPercentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.2),
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'success.main',
              borderRadius: 4,
            },
          }}
        />
      </Box>
    </Card>
  );
};

export default RouteInformationCard;
