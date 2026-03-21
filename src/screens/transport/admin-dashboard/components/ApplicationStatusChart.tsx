import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

const ApplicationStatusChart = () => {
  const series = [60, 10, 20, 10]; // Approved, Rejected, Pending, Hold

  const chartOptions = useChart({
    labels: ['Approved', 'Rejected', 'Pending', 'Hold'],
    stroke: { colors: ['background.paper'] },
    colors: ['#00AB55', '#FF4842', '#FFC107', '#546E7A'],
    legend: { floating: true, horizontalAlign: 'center' },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `${value}%`,
        title: { formatter: (name: string) => `${name}` },
      },
    },
    plotOptions: { pie: { donut: { labels: { show: false } } } },
  });

  return (
    <Card id="TR_ADMIN_CHART_APPLICATION_STATUS" sx={{ height: '100%' }}>
      <CardHeader title="Transport Application Approval Ratio" />
      <Box sx={{ mx: 3 }} dir="ltr">
        <Chart type="pie" series={series} options={chartOptions} height={280} />
        <ChartLegends
          labels={chartOptions?.labels}
          colors={chartOptions?.colors}
          sx={{ p: 3, justifyContent: 'center' }}
        />
      </Box>
    </Card>
  );
};

export default ApplicationStatusChart;
