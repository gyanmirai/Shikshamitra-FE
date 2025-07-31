import type { CardProps } from '@mui/material';
import type { IExamFormValues } from 'src/screens/examination/scheduleExam/type';

import { useState, useCallback } from 'react';

import { Card, useTheme, CardHeader } from '@mui/material';

import examTableData from 'src/json/examination/examTableData.json';
import ScheduledExamTable from 'src/screens/examination/scheduleExam/components/scheduleExamTable';

import { Chart, useChart, ChartSelect, ChartLegends } from '../chart';

import type { ChartOptions } from '../chart';

const ProfileExamination = () => {
  // Get the current theme from MUI
  const theme = useTheme();
  // State to store all exam data, initialized with data from JSON
  const [examData, setExamData] = useState<IExamFormValues[]>(examTableData);
  // State to track the selected year for data series
  const [selectedSeries, setSelectedSeries] = useState('2024');

  // Callback handler for updating the selected series
  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);

  return (
    <ScheduledExamTable
      isScheduleExamButton={false}
      isAction={false}
      onDelete={(data) => {
        // setSelectedExam(data);
        // deleteDialog.onTrue();
      }}
      // openDialog={open}
      // setOpenDialog={setOpen}
      // editData={selectedExam}
      // setEditData={setSelectedExam}
      data={examData}
      onViewTimetable={(data) => {
        // viewTimeDialog.onTrue();
        // setSelectedExam(data);
      }}
    />
  );
};

export default ProfileExamination;

type Props = CardProps & {
  title?: string;
  subheader?: string;
  selectedSeries: string;
  handleChangeSeries: (value: string) => void;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ChartOptions;
  };
};

export function EcommerceYearlySales({
  title,
  subheader,
  chart,
  selectedSeries,
  handleChangeSeries,
  ...other
}: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  const currentSeries = chart.series.find((i) => i.name === selectedSeries);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <ChartSelect
            options={chart.series.map((item) => item.name)}
            value={selectedSeries}
            onChange={handleChangeSeries}
          />
        }
        sx={{ mb: 3 }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={chart.series[0].data.map((item) => item.name)}
        // values={[fShortenNumber(1234), fShortenNumber(6789)]}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart
        type="area"
        series={currentSeries?.data}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
