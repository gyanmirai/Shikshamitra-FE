import { useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import { Box, Card, Stack, Divider, CardHeader, Typography } from '@mui/material';

const OnTimePerformanceCard = () => {
  const theme = useTheme();

  const series = [82, 12, 6];

  const chartColors = [
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.warning.light,
  ];

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    colors: chartColors,
    labels: ['On Time', 'Delayed', 'Not Started'],
    stroke: { colors: [theme.palette.background.paper] },
    legend: { show: false },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `${value}%`,
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            value: {
              formatter: (val: number | string) => `${val}%`,
            },
            total: {
              show: true,
              label: 'On Time',
              color: theme.palette.text.secondary,
              formatter: () => '82%',
            },
          },
        },
      },
    },
  });

  return (
    <Card>
      <CardHeader title="On-Time Performance" />

      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Chart type="donut" series={series} options={chartOptions} width={240} height={240} />
      </Box>

      <Divider />

      <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} sx={{ py: 2 }}>
        <Box sx={{ width: 1, textAlign: 'center' }}>
          <Typography variant="h6">11</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            On-Time
          </Typography>
        </Box>
        <Box sx={{ width: 1, textAlign: 'center' }}>
          <Typography variant="h6">2</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Delayed
          </Typography>
        </Box>
        <Box sx={{ width: 1, textAlign: 'center' }}>
          <Typography variant="h6">1</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Not Started
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

export default OnTimePerformanceCard;
