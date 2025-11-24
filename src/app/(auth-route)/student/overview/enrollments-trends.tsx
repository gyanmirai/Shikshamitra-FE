import { useTheme } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import { fCurrency } from 'src/utils/format-number';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import { Box, Card, CardHeader, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

const EnrollmentsTrends = () => {
  const [selectedClass, setSelectedClass] = useState('1');
  // const [divisionOptions, setDivisionOptions] = useState([]);

  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  useEffect(() => {
    if (classData?.items?.length && !selectedClass) {
      setSelectedClass(classData.items[0].name); // Assuming name is the ID
    }
  }, [classData, selectedClass]);

  return (
    <AttendanceGraph
      title="Enrollment Trends"
      classId={selectedClass}
      onClassChange={(value) => {
        setSelectedClass(value);
      }}
      classOptions={classData?.items || []}
      chart={{
        seriesByClass: {
          '1': {
            categories: [
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
            ],
            data: [{ name: '', data: [24, 41, 35, 151, 49, 151, 49, 151, 49, 151, 49, 151] }],
          },
          '2': {
            categories: [
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
            ],
            data: [{ name: '', data: [83, 112, 119, 88, 103, 112, 90, 111, 88, 103, 112, 105] }],
          },
        },
      }}
      sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}
    />
  );
};

export default EnrollmentsTrends;

type Props3 = {
  title: string;
  subheader?: string;
  chart: {
    seriesByClass: {
      [classId: string]: { categories: string[]; data: { name: string; data: number[] }[] };
    };
  };
  classId: string;
  classOptions: any[]; // Array of classes for dropdown
  onClassChange: (value: any) => void;
  sx?: any;
};

export function AttendanceGraph({
  title,
  subheader,
  chart,
  classId,
  classOptions,
  onClassChange,
  ...other
}: Props3) {
  const theme = useTheme();

  // const [selectedClass, setSelectedClass] = useState('');

  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // const [selectedSeries, setSelectedSeries] = useState(selectedSeriesName || 'Yearly');

  const currentSeries = chart.seriesByClass[classId];

  const chartOptions = useChart({
    stroke: { width: 2, colors: ['transparent'] },
    colors: [theme.palette.primary.main],
    xaxis: { categories: currentSeries?.categories || [] },
    tooltip: { y: { formatter: (value: number) => fCurrency(value) } },
  });

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <CustomSelect
            label="Class"
            name="className"
            size="small"
            options={classOptions}
            labelKey="name"
            valueKey="name"
            value={classId}
            onChange={onClassChange}
            formControlProps={{ sx: { minWidth: 200 } }}
          />
        }
      />

      {/* <ChartLegends
          colors={chartOptions?.colors}
          labels={chart.series[0].data.map((item) => item.name)}
          sublabels={[`+${fPercent(43)}`, `+${fPercent(3)}`, `+${fPercent(8)}`]}
          values={[fCurrency(6789), fCurrency(1234), fCurrency(1012)]}
          sx={{ px: 3, gap: 3 }}
        /> */}

      {currentSeries ? (
        <Chart
          type="bar"
          series={currentSeries.data}
          options={chartOptions}
          height={320}
          loadingProps={{ sx: { p: 2.5 } }}
          sx={{ py: 2.5, pl: 1, pr: 2.5 }}
        />
      ) : (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No data available for selected class.
          </Typography>
        </Box>
      )}
    </Card>
  );
}
