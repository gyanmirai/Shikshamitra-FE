import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

const VehicleStatusSummaryChart = () => {
  const series = [18, 2, 2]; // Good, Inactive, Maintenance

  const chartOptions = useChart({
    labels: ['Good', 'Inactive', 'Maintenance'],
    stroke: { colors: ['background.paper'] },
    colors: ['#00AB55', '#FF4842', '#FFC107'],
    legend: { floating: true, horizontalAlign: 'center' },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `${value} Vehicles`,
        title: { formatter: () => '' },
      },
    },
    plotOptions: { pie: { donut: { labels: { show: false } } } },
  });

  return (
    <Card id="TR_PRINCIPAL_CHART_VEHICLE_STATUS" sx={{ height: '100%' }}>
      <CardHeader title="Vehicle Status Summary" />
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

export default VehicleStatusSummaryChart;
