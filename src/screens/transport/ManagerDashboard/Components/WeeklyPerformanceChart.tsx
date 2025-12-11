import { useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import { Box, Card, Stack, CardHeader, Typography } from '@mui/material';

const WeeklyPerformanceChart = () => {
  const theme = useTheme();

  const series = [{ name: 'On-Time %', data: [78, 85, 92, 90, 87, 95, 88] }];
  const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const chartOptions = useChart({
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    xaxis: {
      categories,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
    colors: [theme.palette.success.main],
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Weekly On-Time Performance" />

      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <Chart type="line" series={series} options={chartOptions} height={320} />
      </Box>

      <Stack direction="row" justifyContent="space-around" sx={{ p: 2, textAlign: 'center' }}>
        <Box>
          <Typography variant="h6">88%</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Weekly Average
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6">Wednesday</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Best Day
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6">Monday</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Worst Day
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

export default WeeklyPerformanceChart;
