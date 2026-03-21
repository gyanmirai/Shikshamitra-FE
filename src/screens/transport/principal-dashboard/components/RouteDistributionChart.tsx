import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

const RouteDistributionChart = () => {
  const series = [10, 8, 6]; // Pickup, Drop, Both

  const chartOptions = useChart({
    labels: ['Pickup', 'Drop', 'Both'],
    stroke: { colors: ['background.paper'] },
    colors: ['#00B8D9', '#FF8F00', '#7CB342'],
    legend: { floating: true, horizontalAlign: 'center' },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `${value} Routes`,
        title: { formatter: () => '' },
      },
    },
    plotOptions: { pie: { donut: { labels: { show: false } } } },
  });

  return (
    <Card id="TR_PRINCIPAL_CHART_ROUTE_DISTRIBUTION" sx={{ height: '100%' }}>
      <CardHeader title="Route Distribution (Pickup / Drop / Both)" />
      <Box sx={{ mx: 3 }} dir="ltr">
        <Chart type="donut" series={series} options={chartOptions} height={280} />
        <ChartLegends
          labels={chartOptions?.labels}
          colors={chartOptions?.colors}
          sx={{ p: 3, justifyContent: 'center' }}
        />
      </Box>
    </Card>
  );
};

export default RouteDistributionChart;
