import type { LabelColor } from 'src/components/label';

import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { RouteStatus, RouteStatusColor } from 'src/enums/route-status';
import { Box, Card, Chip, Grid, Stack, Typography, CardContent } from '@mui/material';
import {
  AltRouteOutlined as RouteIcon,
  NumbersOutlined as NumbersIcon,
  LocationOnOutlined as LocationIcon,
} from '@mui/icons-material';

// Reusable Info Item matching the reference design
const InfoItem = ({
  icon,
  label,
  value,
  color = 'primary',
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}) => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          bgcolor: alpha(theme.palette[color].main, 0.1),
          color: theme.palette[color].main,
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon as React.ReactElement<any>, { fontSize: 'small' })}
      </Box>
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: '0.5px',
            display: 'block',
            mb: 0.25,
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} color="text.primary" lineHeight={1.2}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
};

const RouteTopHeader = ({ routeDetails }: { routeDetails?: any }) => {
  const theme = useTheme();

  if (!routeDetails) {
    return null;
  }

  const finalRouteDetails = routeDetails;

  const status = finalRouteDetails.status as unknown as RouteStatus;
  const statusLabel = RouteStatus[status] || finalRouteDetails.status;
  const statusColorKey = RouteStatusColor[status] as LabelColor | undefined;

  // Map label colors to palette colors for consistency
  const getStatusPaletteColor = (key?: LabelColor) => {
    switch (key) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'primary';
    }
  };

  const statusPaletteColor = getStatusPaletteColor(statusColorKey);
  const mainColor = theme.palette.primary.main;

  return (
    <Card style={{ marginBottom: '10px' }}>
      <CardContent sx={{ p: 2 }}>
        {/* Header Row */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              bgcolor: alpha(mainColor, 0.1),
              color: mainColor,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            ROUTE DETAILS
          </Box>
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette[statusPaletteColor].main, 0.1),
              color: theme.palette[statusPaletteColor].main,
              fontWeight: 700,
              fontSize: '0.7rem',
              borderRadius: 1,
              height: 22,
            }}
          />
        </Stack>

        <Grid container spacing={2} alignItems="center">
          {/* Route Name & ID */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <RouteIcon />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="text.primary"
                  lineHeight={1.2}
                >
                  {finalRouteDetails.routeName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                  <NumbersIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    {finalRouteDetails.routeId}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* Start Point */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem
              icon={<LocationIcon />}
              label="Start Point"
              value={finalRouteDetails.startPoint}
              color="success"
            />
          </Grid>

          {/* End Point */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem
              icon={<LocationIcon />}
              label="End Point"
              value={finalRouteDetails.endPoint}
              color="error"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RouteTopHeader;
