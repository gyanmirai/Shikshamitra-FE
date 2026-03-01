'use client';

import type { CardProps } from '@mui/material/Card';

import Card from '@mui/material/Card';
import React, { useState } from 'react';
import { Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';

// ----------------------------------------------------------------------

export type VehicleData = {
  vehicleNumber: string; // e.g. "Bus 1"
  driverName: string;
  capacity: number;
  assignedStudents: number;
  route: string; // e.g. "Route 1"
};

type RouteOption = { value: string; label: string };

type Props = CardProps & {
  title?: string;
  subheader?: string;
  data?: VehicleData[];
  routeOptions?: RouteOption[];
};

const DEFAULT_DATA: VehicleData[] = [
  {
    vehicleNumber: 'Bus 1',
    driverName: 'Ramesh Kumar',
    capacity: 40,
    assignedStudents: 38,
    route: 'Route 1',
  },
  {
    vehicleNumber: 'Bus 2',
    driverName: 'Suresh Singh',
    capacity: 40,
    assignedStudents: 28,
    route: 'Route 1',
  },
  {
    vehicleNumber: 'Bus 3',
    driverName: 'Mahesh Yadav',
    capacity: 40,
    assignedStudents: 40,
    route: 'Route 1',
  },
  {
    vehicleNumber: 'Bus 4',
    driverName: 'Dinesh Sharma',
    capacity: 35,
    assignedStudents: 22,
    route: 'Route 2',
  },
  {
    vehicleNumber: 'Bus 5',
    driverName: 'Rajesh Verma',
    capacity: 35,
    assignedStudents: 35,
    route: 'Route 2',
  },
];

const DEFAULT_ROUTE_OPTIONS: RouteOption[] = [
  { value: 'all', label: 'All Routes' },
  { value: 'Route 1', label: 'Route 1' },
  { value: 'Route 2', label: 'Route 2' },
];

// Returns bar color based on utilization %
function getBarColor(assigned: number, capacity: number, theme: any) {
  const pct = assigned / capacity;
  if (pct >= 1.0) return theme.palette.error.main;
  if (pct >= 0.9) return theme.palette.warning.main;
  return theme.palette.primary.main; // blue
}

export default function RouteVehicleUtilizationChart({
  title = 'Route Vehicle Utilization',
  subheader = 'Assigned students vs vehicle capacity per route',
  data = DEFAULT_DATA,
  routeOptions = DEFAULT_ROUTE_OPTIONS,
  ...other
}: Props) {
  const theme = useTheme();
  const [selectedRoute, setSelectedRoute] = useState('all');

  const filtered = selectedRoute === 'all' ? data : data.filter((v) => v.route === selectedRoute);

  const categories = filtered.map((v) => v.vehicleNumber);

  // Build per-bar color options using ApexCharts fill colors array trick
  const chartOptions = useChart({
    chart: {
      type: 'bar',
    },
    colors: [theme.palette.primary.main, theme.palette.grey[400]],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      custom: ({
        dataPointIndex,
        seriesIndex,
      }: {
        dataPointIndex: number;
        seriesIndex: number;
      }) => {
        const vehicle = filtered[dataPointIndex];
        const pct = Math.round((vehicle.assignedStudents / vehicle.capacity) * 100);
        const utilizationColor =
          pct >= 100
            ? theme.palette.error.main
            : pct >= 90
              ? theme.palette.warning.main
              : theme.palette.success.main;
        return `
                  <div style="padding:10px 14px;font-size:13px;line-height:1.8;">
                    <strong>${vehicle.vehicleNumber}</strong><br/>
                    <span>Driver: ${vehicle.driverName}</span><br/>
                    <span>Capacity: ${vehicle.capacity}</span><br/>
                    <span>Assigned: ${vehicle.assignedStudents}</span><br/>
                    <span>Utilization: <b style="color:${utilizationColor}">${pct}%</b></span>
                  </div>`;
      },
    },
    xaxis: {
      categories,
      labels: { style: { fontSize: '12px' } },
      title: {
        text: 'Vehicle Number',
        style: { fontSize: '12px', fontWeight: 600 },
      },
    },
    yaxis: {
      min: 0,
      max: Math.max(...filtered.map((v) => v.capacity), 50) + 5,
      title: {
        text: 'Number of Students',
        style: { fontSize: '12px', fontWeight: 600 },
      },
      labels: {
        formatter: (val: number) => `${val}`,
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
    },
    // Use fill patterns to individually color the "Assigned" bars
    fill: {
      opacity: 1,
    },
  });

  // Override assigned-series colors per bar via chart events approach:
  // We merge per-bar colors into the series data
  const assignedSeries = filtered.map((v, i) => ({
    x: v.vehicleNumber,
    y: v.assignedStudents,
    fillColor: getBarColor(v.assignedStudents, v.capacity, theme),
    strokeColor: getBarColor(v.assignedStudents, v.capacity, theme),
  }));

  const capacitySeries = filtered.map((v) => ({
    x: v.vehicleNumber,
    y: v.capacity,
    fillColor: theme.palette.grey[300],
    strokeColor: theme.palette.grey[400],
  }));

  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Stack direction="row" spacing={1}>
            <CustomSelect
              label="Route"
              options={routeOptions}
              value={selectedRoute}
              onChange={(v) => setSelectedRoute(v as string)}
              formControlProps={{ sx: { minWidth: '110px' } }}
            />
          </Stack>
        }
        sx={{ p: 2 }}
      />

      <Chart
        type="bar"
        series={[
          { name: 'Assigned Students', data: assignedSeries as any },
          { name: 'Vehicle Capacity', data: capacitySeries as any },
        ]}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ pl: 1, pr: 2.5 }}
      />

      {/* Legend */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ px: 3, pt: 1, pb: 2, justifyContent: 'center', flexWrap: 'wrap' }}
      >
        {[
          { color: theme.palette.primary.main, label: 'Normal (< 90%)' },
          { color: theme.palette.warning.main, label: 'Near Capacity (90–99%)' },
          { color: theme.palette.error.main, label: 'Full (100%)' },
          { color: theme.palette.grey[400], label: 'Vehicle Capacity' },
        ].map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: item.color }} />
            <Box component="span" sx={{ fontSize: 11, color: 'text.secondary' }}>
              {item.label}
            </Box>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
