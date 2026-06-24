'use client';

import type { RootState } from 'src/redux/store';
import type { TransportDashboardAlert } from 'src/redux/transport/vehicle-management/dashboard-report-api';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { transportPaths } from 'src/constants/transport-menu';
import {
  useGetTransportDashboardAlertsQuery,
  useGetTransportDashboardSummaryQuery,
} from 'src/redux/transport/vehicle-management/dashboard-report-api';
import {
  Box,
  Card,
  Grid,
  Stack,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  LinearProgress,
} from '@mui/material';

const formatNumber = (value?: number | null) => Number(value ?? 0).toLocaleString('en-IN');

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const severityColor = (severity: string): 'error' | 'warning' | 'info' =>
  severity.toLowerCase() === 'high'
    ? 'error'
    : severity.toLowerCase() === 'medium'
      ? 'warning'
      : 'info';

const TransportAdminDashboard = () => {
  const { currentMedium, currentYear } = useSelector((state: RootState) => state.globalState);
  const queryArgs = {
    academicMediumId: currentMedium?.id,
    academicYearId: currentYear?.id,
  };

  const { data: summary, isLoading: isSummaryLoading } = useGetTransportDashboardSummaryQuery(
    queryArgs,
    { skip: !currentMedium?.id }
  );
  const { data: alerts, isLoading: isAlertsLoading } = useGetTransportDashboardAlertsQuery(
    { ...queryArgs, pageNumber: 1, pageSize: 8 },
    { skip: !currentMedium?.id }
  );

  const kpis = [
    {
      title: 'Active Routes',
      value: formatNumber(summary?.activeRoutes),
      helper: `${formatNumber(summary?.unassignedRoutes)} without assignment`,
      icon: 'mdi:routes',
      href: transportPaths.routeManagement,
    },
    {
      title: 'Vehicles Ready',
      value: formatNumber(summary?.activeVehicles),
      helper: `${formatNumber(summary?.maintenanceVehicles)} in maintenance`,
      icon: 'mdi:bus',
      href: transportPaths.vehicleManagement,
    },
    {
      title: 'Transport Staff',
      value: formatNumber((summary?.activeDrivers ?? 0) + (summary?.activeConductors ?? 0)),
      helper: `${formatNumber(summary?.activeDrivers)} drivers, ${formatNumber(summary?.activeConductors)} conductors`,
      icon: 'mdi:account-tie-hat',
      href: transportPaths.driverManagement,
    },
    {
      title: 'Active Members',
      value: formatNumber(summary?.activeMembers),
      helper: `${formatNumber(summary?.studentMembers)} students, ${formatNumber(summary?.employeeMembers)} employees`,
      icon: 'mdi:account-group',
      href: transportPaths.applicationManagement,
    },
    {
      title: 'Pending Applications',
      value: formatNumber(summary?.pendingApplications),
      helper: `${formatNumber(summary?.heldApplications)} on hold`,
      icon: 'mdi:file-clock-outline',
      href: transportPaths.applicationManagement,
    },
    {
      title: 'Pending Dues',
      value: formatCurrency(summary?.pendingDueAmount),
      helper: `${formatNumber(summary?.pendingFeeDues)} dues pending`,
      icon: 'mdi:currency-inr',
      href: transportPaths.reports,
    },
    {
      title: 'Compliance Alerts',
      value: formatNumber(
        (summary?.missingRequiredDocuments ?? 0) + (summary?.expiringComplianceItems ?? 0)
      ),
      helper: `${formatNumber(summary?.missingRequiredDocuments)} missing documents`,
      icon: 'mdi:clipboard-alert-outline',
      href: transportPaths.vehicleManagement,
    },
    {
      title: 'Capacity Used',
      value: `${summary?.routeCapacityUsagePercent ?? 0}%`,
      helper: `${formatNumber(summary?.occupiedSeats)} of ${formatNumber(summary?.routeCapacity)} seats`,
      icon: 'mdi:seat-passenger',
      href: transportPaths.routeManagement,
    },
  ];

  if (!currentMedium?.id) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6">Transport dashboard unavailable</Typography>
        <Typography variant="body2" color="text.secondary">
          Select an academic medium to view transport dashboard data.
        </Typography>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {isSummaryLoading && <LinearProgress />}

      <Grid container spacing={1.5}>
        {kpis.map((kpi) => (
          <Grid key={kpi.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Iconify icon={kpi.icon} width={28} />
                  <Button size="small" href={kpi.href}>
                    View
                  </Button>
                </Stack>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {kpi.title}
                  </Typography>
                  <Typography variant="h4">{kpi.value}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {kpi.helper}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Operational Alerts</Typography>
                {isAlertsLoading && <Typography variant="caption">Loading</Typography>}
              </Stack>

              <Stack spacing={1}>
                {(alerts?.data ?? []).length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No active transport alerts.
                  </Typography>
                )}

                {(alerts?.data ?? []).map((alert: TransportDashboardAlert) => (
                  <Box
                    key={alert.id}
                    sx={{
                      p: 1.5,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Label color={severityColor(alert.severity)}>{alert.severity}</Label>
                      <Typography variant="caption" color="text.secondary">
                        {alert.category}
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2">{alert.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {alert.message}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Route Capacity
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Route</TableCell>
                    <TableCell>Vehicle</TableCell>
                    <TableCell align="right">Occupied</TableCell>
                    <TableCell align="right">Capacity</TableCell>
                    <TableCell align="right">Usage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(summary?.routeCapacityUsage ?? []).slice(0, 8).map((route) => (
                    <TableRow key={route.routeId}>
                      <TableCell>
                        <Typography variant="body2">{route.routeName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {route.routeCode}
                        </Typography>
                      </TableCell>
                      <TableCell>{route.vehicleRegistrationNo || 'Unassigned'}</TableCell>
                      <TableCell align="right">{route.occupiedSeats}</TableCell>
                      <TableCell align="right">{route.capacity}</TableCell>
                      <TableCell align="right">{route.usagePercent}%</TableCell>
                    </TableRow>
                  ))}
                  {(summary?.routeCapacityUsage ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">
                          No route capacity data available.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6">Active Route Operations</Typography>
          <Button size="small" href={transportPaths.routeManagement}>
            Route Management
          </Button>
        </Stack>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Route</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Conductor</TableCell>
                <TableCell align="right">Stops</TableCell>
                <TableCell align="right">Members</TableCell>
                <TableCell align="right">Capacity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(summary?.activeRouteOperations ?? []).map((route) => (
                <TableRow key={route.routeId}>
                  <TableCell>
                    <Typography variant="body2">{route.routeName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {route.routeCode}
                    </Typography>
                  </TableCell>
                  <TableCell>{route.vehicle || 'Unassigned'}</TableCell>
                  <TableCell>{route.driver || 'Unassigned'}</TableCell>
                  <TableCell>{route.conductor || '-'}</TableCell>
                  <TableCell align="right">{route.stops}</TableCell>
                  <TableCell align="right">{route.members}</TableCell>
                  <TableCell align="right">{route.capacity}</TableCell>
                </TableRow>
              ))}
              {(summary?.activeRouteOperations ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography variant="body2" color="text.secondary">
                      No active route operations available.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
};

export default TransportAdminDashboard;
