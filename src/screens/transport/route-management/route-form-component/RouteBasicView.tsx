import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { RouteType } from 'src/enums/route-type-options';
import { Box, Card, Grid, Typography } from '@mui/material';
import { Route, PinDrop, AccessTime, DirectionsBus } from '@mui/icons-material';

import type { IRoutePayload } from '../components/type';

interface Props {
  values: IRoutePayload;
}

export default function RouteDetailsView({ values }: Props) {
  return (
    <Card sx={{ p: 2, borderRadius: 2, boxShadow: 4 }}>
      <Typography variant="h6" color="primary" mb={1}>
        Route Details
      </Typography>

      <Grid container spacing={3}>
        {/* Route Name */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 1,
              }}
            >
              <Route color="primary" sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Route Name
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {values.routeName || '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Route Code */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 1,
              }}
            >
              <DirectionsBus color="primary" sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Route Code
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {values.routeCode || '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>
        {/* Route Type */}
        <Grid size={{ xs: 12, md: 4 }}>
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
              <PinDrop sx={{ color: 'success.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Route Type
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {values.routeType || '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Pickup Schedule */}
        {(values.routeType === RouteType.pickup || values.routeType === RouteType.both) && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 1,
                }}
              >
                <AccessTime sx={{ color: 'info.main', fontSize: 17 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Pickup Schedule
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {values.pickupSchedule
                    ? `${dayjs(values.pickupSchedule.startTime).format('hh:mm A')} - ${dayjs(
                        values.pickupSchedule.endTime
                      ).format('hh:mm A')}`
                    : '—'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Dropoff Schedule */}
        {(values.routeType === RouteType.drop || values.routeType === RouteType.both) && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 33,
                  height: 33,
                  borderRadius: '50%',
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 1,
                }}
              >
                <AccessTime sx={{ color: 'error.main', fontSize: 17 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Dropoff Schedule
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {values.dropoffSchedule
                    ? `${dayjs(values.dropoffSchedule.startTime).format('hh:mm A')} - ${dayjs(
                        values.dropoffSchedule.endTime
                      ).format('hh:mm A')}`
                    : '—'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 1,
              }}
            >
              <PinDrop sx={{ color: 'info.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Start Point
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {values?.startPoint}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 1,
              }}
            >
              <PinDrop sx={{ color: 'info.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                End Point
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {values?.endPoint}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}
