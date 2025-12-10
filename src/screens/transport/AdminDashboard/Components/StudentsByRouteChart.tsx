import { Card, CardHeader } from '@mui/material';
import { Chart, useChart } from 'src/components/chart';

const StudentsByRouteChart = () => {
  const series = [{ name: 'Students', data: [40, 55, 32, 70, 48, 61] }];
  const categories = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'];

  const chartOptions = useChart({
    chart: { stacked: false },
    xaxis: { categories },
    colors: ['#00B8D9'],
    tooltip: {
      y: {
        formatter: (value: number) => `${value} Students`,
        title: { formatter: () => '' }, // ✨ no “Students:” label
      },
    },
  });

  return (
    <Card id="TR_ADMIN_CHART_STUDENTS_BY_ROUTE" sx={{ height: '100%' }}>
      <CardHeader title="Students Assigned by Route" />
      <Chart type="bar" series={series} options={chartOptions} height={320} />
    </Card>
  );
};

export default StudentsByRouteChart;
