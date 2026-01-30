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
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      p: 1.5,
      borderRadius: 2,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        bgcolor: 'action.hover',
        transform: 'translateY(-2px)',
      },
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        },
      }}
    >
      {React.cloneElement(
        icon as React.ReactElement<{ sx?: { color: string; fontSize?: number } }>,
        {
          sx: { color, fontSize: fontSize + 1 },
        }
      )}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        fontWeight="600"
        sx={{
          fontSize: '0.95rem',
          mt: 0.25,
          color: 'text.primary',
        }}
      >
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
      <Card
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
            pb: 2,
            borderBottom: '2px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography
              variant="overline"
              color="primary"
              fontWeight="700"
              sx={{
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                mb: 0.5,
                display: 'block',
              }}
            >
              Route Details
            </Typography>
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                mb: 0.5,
                color: 'text.primary',
                lineHeight: 1.3,
              }}
            >
              {mockRouteData.routeName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                fontFamily: 'monospace',
              }}
            >
              {mockRouteData.routeCode}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CustomTooltip title="View Assigned Student's">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  bgcolor: 'action.hover',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: 'action.selected',
                    transform: 'scale(1.05)',
                  },
                }}
                onClick={() => viewStudentsDialog.onTrue()}
              >
                <Visibility sx={{ fontSize: 20 }} />
              </Box>
            </CustomTooltip>
            <Label
              variant="soft"
              color="success"
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: 1.5,
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              {mockRouteData.status}
            </Label>
          </Box>
        </Box>

        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
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
        <Box
          sx={{
            mt: 3,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              Capacity Utilisation
            </Typography>
            <Typography
              variant="body1"
              fontWeight="700"
              sx={{
                fontSize: '0.95rem',
                color: capacityPercentage > 85 ? 'warning.main' : 'success.main',
              }}
            >
              {mockRouteData.currentStudents}/{mockRouteData.totalCapacity} students
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={capacityPercentage}
            sx={{
              height: 5,
              borderRadius: 5,
              backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.15),
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                background: (theme) =>
                  capacityPercentage > 85
                    ? `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
                    : `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                borderRadius: 5,
                transition: 'all 0.4s ease-in-out',
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 0.75,
              display: 'block',
              textAlign: 'right',
              fontSize: '0.7rem',
            }}
          >
            {capacityPercentage}% utilized
          </Typography>
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
