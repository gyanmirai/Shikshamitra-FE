import React from 'react';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Grid, Card, Typography, LinearProgress } from '@mui/material';
import { Route, LocationOn, AccessTime, Visibility } from '@mui/icons-material';

import ViewStudents from './ViewStudents';
import { mockVehicleData } from './CurrentVehicleCard';

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

export const InfoItem = ({
  icon,
  label,
  value,
  color = 'primary.main',
  fontSize = 17,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color?: string;
  fontSize?: number;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: (theme) => alpha(theme.palette.success.main, 0.15),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 1,
      }}
    >
      {React.cloneElement(
        icon as React.ReactElement<{ sx?: { color: string; fontSize?: number } }>,
        {
          sx: { color, fontSize },
        }
      )}
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

const RouteInformationCard = () => {
  const capacityPercentage = Math.round(
    (mockRouteData.currentStudents / mockRouteData.totalCapacity) * 100
  );
  const viewStudentsDialog = useBoolean(); // Added for View Students dialog

  // eslint-disable-next-line react/no-unstable-nested-components

  return (
    <>
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: 'var(--shadows-4)' }}>
        {/* Header */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          <Box>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Route Details
            </Typography>
            <Typography variant="h6" fontWeight="600">
              {mockRouteData.routeName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mockRouteData.routeCode}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CustomTooltip title="View Assigned Student's">
              <Visibility
                sx={{ fontSize: 18, cursor: 'pointer' }}
                onClick={() => viewStudentsDialog.onTrue()}
              />
            </CustomTooltip>
            <Label variant="soft" color="success">
              {mockRouteData.status}
            </Label>
          </Box>
        </Box>

        {/* Divider */}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 1 }} />

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
              color="success.main"
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
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
          >
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
      <ViewStudents
        open={viewStudentsDialog.value}
        onClose={() => viewStudentsDialog.onFalse()}
        routeData={mockVehicleData} // Pass vehicle/route data if needed
      />
    </>
  );
};

export default RouteInformationCard;
