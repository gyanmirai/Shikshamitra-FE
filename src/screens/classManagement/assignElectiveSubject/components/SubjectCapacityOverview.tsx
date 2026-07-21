'use client';

import { Chart, useChart } from 'src/components/chart';
import { Box, Card, Stack, Typography } from '@mui/material';

import type { SubjectCapacityRow } from '../types';

interface SubjectCapacityOverviewProps {
  subjects: SubjectCapacityRow[];
  totalStudents: number;
  sx?: object;
}

export default function SubjectCapacityOverview({
  subjects,
  totalStudents,
  sx,
}: SubjectCapacityOverviewProps) {
  const assignedTotal = subjects.reduce((total, subject) => total + subject.assignedCount, 0);
  const unassignedTotal = Math.max(totalStudents - assignedTotal, 0);
  const chartRows = [
    ...subjects.map((subject) => ({
      label: subject.subjectName,
      value: subject.assignedCount,
      color: subject.subjectColor || '#3b82f6',
    })),
    ...(unassignedTotal > 0
      ? [{ label: 'Unassigned', value: unassignedTotal, color: '#ff5630' }]
      : []),
  ].filter((item) => item.value > 0);

  const labels = chartRows.length > 0 ? chartRows.map((item) => item.label) : ['No allocation'];
  const colors = chartRows.length > 0 ? chartRows.map((item) => item.color) : ['#dfe3e8'];
  const series = chartRows.length > 0 ? chartRows.map((item) => item.value) : [1];

  const chartOptions = useChart({
    labels,
    colors,
    stroke: {
      colors: ['background.paper'],
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `${value} student${value === 1 ? '' : 's'}`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '58%',
          labels: {
            show: false,
          },
        },
      },
    },
  });

  if (subjects.length === 0) return null;

  return (
    <Card
      sx={{
        p: 1.25,
        mb: 1.5,
        minHeight: 94,
        maxHeight: 104,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 0.75, lineHeight: 1.2 }}>
        Subject Allocation Progress
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ width: 56, minWidth: 56 }} dir="ltr">
          <Chart type="donut" series={series} options={chartOptions} height={56} />
        </Box>
        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          {chartRows.length > 0 ? (
            chartRows.map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption" fontWeight={600} noWrap sx={{ flex: 1 }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {item.value}/{totalStudents}
                </Typography>
              </Box>
            ))
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#dfe3e8',
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                No allocation yet
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
