import { Box, Card, CardHeader } from '@mui/material';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

const RouteTypeChart = () => {
  const series = [5, 5, 2]; // Pickup, Drop, Both

  const chartOptions = useChart({
    labels: ['Pickup', 'Drop', 'Both'],
    stroke: {
      colors: ['background.paper'],
    },
    legend: {
      floating: true,
      position: 'bottom',
      horizontalAlign: 'center',
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `${value} Routes`,
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
  });

  return (
    <Card id="TR_MGR_CHART_ROUTE_TYPE" sx={{ height: '100%' }}>
      <CardHeader title="Routes by Type" />
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

export default RouteTypeChart;
