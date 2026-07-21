'use client';

import { useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Card,
  Chip,
  Stack,
  Skeleton,
  Typography,
  CardContent,
  LinearProgress,
} from '@mui/material';

import { useRoomUsageReport } from '../roomAvailability.hooks';

import type { UsageReportData } from '../types';

const KPI_CARDS = (data: UsageReportData[]) => {
  const total = data.length;
  const avg = total ? Math.round(data.reduce((s, r) => s + r.utilizationPercentage, 0) / total) : 0;
  const mostUsed = data
    .slice()
    .sort((a, b) => b.utilizationPercentage - a.utilizationPercentage)[0];
  const leastUsed = data
    .slice()
    .sort((a, b) => a.utilizationPercentage - b.utilizationPercentage)[0];
  const totalConflicts = data.reduce((s, r) => s + r.conflictCount, 0);
  const totalCancellations = data.reduce((s, r) => s + r.cancellationCount, 0);
  const totalMaintenance = data.reduce((s, r) => s + r.maintenanceCount, 0);

  return [
    {
      label: 'Total Rooms',
      value: total,
      icon: 'mdi:door',
      color: 'primary.main',
      bg: 'primary.lighter',
    },
    {
      label: 'Avg Utilization',
      value: `${avg}%`,
      icon: 'mdi:chart-bar',
      color: 'info.main',
      bg: 'info.lighter',
    },
    {
      label: 'Most Used',
      value: mostUsed?.roomName || '—',
      icon: 'mdi:fire',
      color: 'error.main',
      bg: 'error.lighter',
    },
    {
      label: 'Least Used',
      value: leastUsed?.roomName || '—',
      icon: 'mdi:leaf',
      color: 'success.main',
      bg: 'success.lighter',
    },
    {
      label: 'Total Conflicts',
      value: totalConflicts,
      icon: 'mdi:alert-circle',
      color: 'warning.main',
      bg: 'warning.lighter',
    },
    {
      label: 'Cancellations',
      value: totalCancellations,
      icon: 'mdi:calendar-remove',
      color: 'error.main',
      bg: 'error.lighter',
    },
    {
      label: 'Maintenance Events',
      value: totalMaintenance,
      icon: 'mdi:wrench',
      color: 'warning.main',
      bg: 'warning.lighter',
    },
  ];
};

export const RoomUsageReport = () => {
  const { data, isLoading, fetch } = useRoomUsageReport();

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <Stack spacing={1}>
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, 1fr)',
            },
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Box key={i}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            </Box>
          ))}
        </Box>
        <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
      </Stack>
    );
  }

  const kpis = KPI_CARDS(data);

  return (
    <Stack spacing={1}>
      {/* KPI Cards */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Usage Overview
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(7, minmax(0, 1fr))',
            },
          }}
        >
          {kpis.map((kpi) => (
            <Box key={kpi.label}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: kpi.bg,
                        color: kpi.color,
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon={kpi.icon} width={22} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" sx={{ lineHeight: 1.2 }} noWrap>
                        {kpi.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {kpi.label}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Utilization Bars */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Room Utilization
        </Typography>
        <Card sx={{ p: 2.5 }}>
          <Stack spacing={1}>
            {data
              .slice()
              .sort((a, b) => b.utilizationPercentage - a.utilizationPercentage)
              .map((room) => (
                <Box key={room.roomId}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {room.roomName}
                      </Typography>
                      <Chip
                        size="small"
                        label={room.type}
                        variant="outlined"
                        sx={{ fontSize: 10, height: 18 }}
                      />
                      <Chip
                        size="small"
                        label={room.buildingName}
                        variant="outlined"
                        sx={{ fontSize: 10, height: 18 }}
                      />
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        {room.occupiedPeriods}/{room.totalPeriods} periods
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={
                          room.utilizationPercentage >= 80
                            ? 'error.main'
                            : room.utilizationPercentage >= 50
                              ? 'warning.main'
                              : 'success.main'
                        }
                      >
                        {room.utilizationPercentage}%
                      </Typography>
                    </Stack>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={room.utilizationPercentage}
                    color={
                      room.utilizationPercentage >= 80
                        ? 'error'
                        : room.utilizationPercentage >= 50
                          ? 'warning'
                          : 'success'
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
          </Stack>
        </Card>
      </Box>

      {/* Detailed Table */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Room-wise Report
        </Typography>
        <CustomizableTable
          tableId="room-usage-report-enhanced"
          tableTitle="Room Usage Report"
          data={data}
          columns={[
            { id: 'roomName', label: 'Room', minWidth: 140, sticky: true },
            { id: 'buildingName', label: 'Building', minWidth: 120 },
            { id: 'type', label: 'Type', minWidth: 130 },
            { id: 'capacity', label: 'Capacity', filterType: 'number', minWidth: 100 },
            { id: 'totalPeriods', label: 'Total Periods', filterType: 'number', minWidth: 120 },
            { id: 'occupiedPeriods', label: 'Occupied', filterType: 'number', minWidth: 110 },
            { id: 'freePeriods', label: 'Free', filterType: 'number', minWidth: 90 },
            {
              id: 'utilizationPercentage',
              label: 'Utilization',
              filterType: 'number',
              minWidth: 130,
              render: (v) => (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LinearProgress
                    variant="determinate"
                    value={v}
                    color={v >= 80 ? 'error' : v >= 50 ? 'warning' : 'success'}
                    sx={{ flex: 1, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption">{v}%</Typography>
                </Stack>
              ),
            },
            {
              id: 'reservationCount',
              label: 'Reservations',
              filterType: 'number',
              minWidth: 120,
            },
            {
              id: 'conflictCount',
              label: 'Conflicts',
              filterType: 'number',
              minWidth: 100,
              render: (v) => (
                <Chip size="small" label={v} color={v > 0 ? 'error' : 'default'} variant="soft" />
              ),
            },
            {
              id: 'cancellationCount',
              label: 'Cancellations',
              filterType: 'number',
              minWidth: 120,
            },
            { id: 'mainUsageType', label: 'Main Usage', minWidth: 140 },
          ]}
        />
      </Box>
    </Stack>
  );
};
