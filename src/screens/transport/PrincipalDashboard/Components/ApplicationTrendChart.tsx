import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

const ApplicationTrendChart = () => {
  const series = [12, 18, 22, 15, 28, 26, 30, 24, 20, 19, 21, 25];
  const labels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const chartOptions = useChart({
    labels,
    colors: ['#00AB55'],
    dataLabels: { enabled: false },
    stroke: { width: 3 },
    tooltip: {
      y: { formatter: (v: number) => `${v} Applications` },
    },
  });

  return (
    <Card id="TR_PRINCIPAL_CHART_APPLICATION_TREND" sx={{ height: '100%' }}>
      <CardHeader title="Monthly Transport Applications Trend" />
      <Box sx={{ mx: 3 }} dir="ltr">
        <Chart
          type="line"
          series={[{ name: 'Applications', data: series }]}
          options={chartOptions}
          height={280}
        />
        <ChartLegends
          labels={labels}
          colors={['#00AB55']}
          sx={{ p: 3, justifyContent: 'center', display: 'none' }}
        />
      </Box>
    </Card>
  );
};

export default ApplicationTrendChart;
