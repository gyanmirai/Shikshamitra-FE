import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { fNumber, fPercent } from 'src/utils/format-number';
import { Box, Card, Stack, CardHeader, Typography, LinearProgress } from '@mui/material';

// ----------------------------------------------------------------------

const houseData = [
  { label: 'Red House', value: 145, color: '#FF4560' },
  { label: 'Green House', value: 142, color: '#00E396' },
  { label: 'Blue House', value: 138, color: '#008FFB' },
  { label: 'Yellow House', value: 135, color: '#FEB019' },
];

export default function HouseDistribution() {
  const chartSeries = houseData.map((i) => i.value);
  const chartColors = houseData.map((i) => i.color);
  const totalStudents = houseData.reduce((a, b) => a + b.value, 0);

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    colors: chartColors,
    labels: houseData.map((i) => i.label),
    stroke: {
      colors: ['#fff'],
    },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: false, // We will use custom center text
          },
        },
      },
    },
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="House Distribution" />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <Chart
            dir="ltr"
            type="donut"
            series={chartSeries}
            options={chartOptions}
            width={200}
            height={200}
          />

          {/* Center Total */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {fNumber(totalStudents)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Students
            </Typography>
          </Box>
        </Box>

        {/* Leaderboard */}
        <Stack spacing={2}>
          {houseData
            .sort((a, b) => b.value - a.value)
            .map((house, index) => (
              <Stack key={house.label} spacing={0.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {index === 0 && <Iconify icon="mdi:crown" width={16} color="warning.main" />}
                    <Typography variant="body2" sx={{ fontWeight: index === 0 ? 700 : 400 }}>
                      {house.label}
                    </Typography>
                  </Stack>
                  <Typography variant="subtitle2">
                    {house.value}{' '}
                    <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                      ({fPercent((house.value / totalStudents) * 100)})
                    </Typography>
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(house.value / totalStudents) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    bgcolor: (theme) => theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      bgcolor: house.color,
                    },
                  }}
                />
              </Stack>
            ))}
        </Stack>
      </Stack>
    </Card>
  );
}
