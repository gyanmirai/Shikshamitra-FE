import { Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const UtilizationByClassChart = () => {
  const series = [{ name: 'Students', data: [35, 42, 50, 48, 55, 60, 52, 40, 45, 50, 48, 46] }];
  const categories = [
    'Class 1',
    'Class 2',
    'Class 3',
    'Class 4',
    'Class 5',
    'Class 6',
    'Class 7',
    'Class 8',
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
  ];

  const chartOptions = useChart({
    chart: { stacked: false },
    xaxis: { categories },
    colors: ['#00B8D9'],
    tooltip: {
      y: {
        formatter: (value: number) => `${value} Students`,
        title: { formatter: () => '' },
      },
    },
  });

  return (
    <Card id="TR_PRINCIPAL_CHART_UTILIZATION_CLASS" sx={{ height: '100%' }}>
      <CardHeader title="Student Utilization by Class" />
      <Chart type="bar" series={series} options={chartOptions} height={320} />
    </Card>
  );
};

export default UtilizationByClassChart;
