import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetSuggestedRouteDataQuery } from 'src/redux/transport/vehicle-management/routeStopApi';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Avatar,
  Skeleton,
  Typography,
  CardActionArea,
} from '@mui/material';

import RouteStopDetails from './RouteStopDetails';

import type { ITransportApplicationPayload } from '../../type';

export interface IStop {
  id: string;
  stopName: string;
  arrivalTime: string;
  departureTime: string;
  isLatestAdded?: boolean;
}

export interface IRoute {
  routeId: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  capacity: number;
  students: number;
  status: 'Active' | 'Inactive' | 'Maintenance';
  stops: IStop[];
}

const TransportApplicationRouteDetail = ({
  onClose,
  selectedApplication,
  formik,
}: {
  onClose?: (e: any, isSubmit: boolean) => void;
  selectedApplication: ITransportApplicationPayload | null;
  formik: any;
}) => {
  const { data: apiRouteData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSuggestedRouteDataQuery,
    params: selectedApplication?.id,
  });

  const routeData = apiRouteData || [];

  const [setSelectedRoute] = useState<any>(formik.values.selectedRoute);

  const theme = useTheme();
  return (
    <Grid container spacing={3} mt={0}>
      <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%' }}>
        <SectionCard title={`Suggested Routes (${routeData?.length || 0})`}>
          <Scrollbar sx={{ maxHeight: 600, pr: 1 }}>
            <Stack spacing={2} pb={1}>
              {isLoading && !routeData?.length ? (
                // Skeleton Loader
                Array.from(new Array(3)).map((_, index) => (
                  <Card key={index} sx={{ p: 2, borderRadius: 2 }} elevation={0} variant="outlined">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ width: '100%' }}>
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width="40%" height={16} />
                      </Box>
                    </Stack>
                  </Card>
                ))
              ) : routeData?.length ? (
                routeData.map((route: any, index: any) => {
                  const isSelected = formik.values.selectedRoute?.routeId === route.routeId;
                  const statusColor =
                    route.status === 'Active'
                      ? 'success'
                      : route.status === 'Maintenance'
                        ? 'warning'
                        : 'default';

                  return (
                    <Card
                      key={index}
                      elevation={isSelected ? 4 : 0}
                      variant={isSelected ? 'elevation' : 'outlined'}
                      sx={{
                        borderRadius: 2,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: isSelected
                          ? `1px solid ${theme.palette.primary.main}`
                          : `1px solid ${theme.palette.divider}`,
                        borderLeft: isSelected
                          ? `6px solid ${theme.palette.primary.main}`
                          : `1px solid ${theme.palette.divider}`,
                        backgroundColor: isSelected
                          ? alpha(theme.palette.primary.main, 0.04)
                          : theme.palette.background.paper,
                      }}
                    >
                      <CardActionArea
                        onClick={() => {
                          setSelectedRoute(route);
                          formik.setFieldValue('selectedRoute', route);
                          formik.setFieldValue('stops', route.stops || []);
                        }}
                        sx={{ p: 2 }}
                      >
                        <Stack spacing={1.5}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Chip
                              label={route.status}
                              size="small"
                              color={statusColor}
                              variant={isSelected ? 'filled' : 'outlined'}
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}
                            />
                            {isSelected && (
                              <Iconify
                                icon="solar:check-circle-bold"
                                color="primary.main"
                                width={18}
                              />
                            )}
                          </Stack>

                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: isSelected
                                  ? alpha(theme.palette.primary.main, 0.1)
                                  : alpha(theme.palette.grey[500], 0.08),
                                color: isSelected
                                  ? theme.palette.primary.main
                                  : theme.palette.text.secondary,
                                borderRadius: 1.5,
                              }}
                            >
                              <Iconify icon="solar:bus-bold-duotone" width={24} />
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="subtitle2" noWrap fontWeight={700}>
                                {route.routeName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="flex"
                                alignItems="center"
                                gap={0.5}
                              >
                                <Iconify icon="solar:users-group-rounded-bold" width={14} />
                                {route.students}/{route.capacity} Verified
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </CardActionArea>
                    </Card>
                  );
                })
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No routes available
                  </Typography>
                </Box>
              )}
            </Stack>
          </Scrollbar>
        </SectionCard>
      </Grid>
      <Grid size={{ xs: 12, md: 9 }} sx={{ height: '100%' }}>
        <RouteStopDetails formik={formik} />
      </Grid>
    </Grid>
  );
};
export default TransportApplicationRouteDetail;
