import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import { useState } from 'react';
import { Box } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

// Sample Data (Class → Subject → Division-wise Marks)
type ResultDataType = {
  [className: string]: { [subject: string]: { [division: string]: number } };
};

const resultData: ResultDataType = {
  '5': {
    Math: { A: 85, B: 82, C: 80 },
    Science: { A: 88, B: 85, C: 80 },
    English: { A: 80, B: 78, C: 79 },
    SS: { A: 80, B: 78, C: 79 },
  },
  '10': {
    Math: { A: 85, B: 82, C: 80 },
    Science: { A: 88, B: 85, C: 80 },
    English: { A: 80, B: 78, C: 79 },
    SS: { A: 80, B: 78, C: 79 },
  },
  '12': {
    Math: { A: 80, B: 85, C: 82 },
    Physics: { A: 85, B: 81, C: 82 },
    Chemistry: { A: 76, B: 79, C: 78 },
    SS: { A: 80, B: 78, C: 79 },
  },
};

type Props = CardProps & { title?: string; subheader?: string };

export function AnalyticsClassResults({ title, subheader, ...other }: Props) {
  const theme = useTheme();
  const [selectedClass, setSelectedClass] = useState<string>('5');

  // Extract class options
  const classOptions = Object.keys(resultData).map((cls) => ({ value: cls, label: cls }));

  const subjects =
    selectedClass && resultData[selectedClass] ? Object.keys(resultData[selectedClass]) : [];
  const divisions =
    selectedClass && subjects.length > 0 && resultData[selectedClass][subjects[0]]
      ? Object.keys(resultData[selectedClass][subjects[0]])
      : [];

  const chartSeries =
    selectedClass && subjects.length
      ? divisions.map((division) => ({
          name: `Div ${division}`, // Label for each division
          data: subjects.map((subject) => resultData[selectedClass]?.[subject]?.[division] ?? 0),
        }))
      : [];

  const chartOptions: ChartOptions = useChart({
    colors: [
      hexAlpha(theme.vars.palette.primary.dark, 0.8),
      hexAlpha(theme.vars.palette.warning.main, 0.8),
      hexAlpha(theme.vars.palette.error.main, 0.8),
    ],
    stroke: { width: 2, colors: ['transparent'] },
    xaxis: { categories: subjects },
    legend: { show: true },
    tooltip: { y: { formatter: (value: number) => `${value}` } },
  });

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" pr="20px" pt="10px">
        <CardHeader title={title} subheader={subheader} />
        {classOptions.length > 0 && (
          <CustomSelect
            label="Select Class"
            options={classOptions}
            onChange={(e) => setSelectedClass(e as string)}
            value={selectedClass}
            formControlProps={{ sx: { width: '100%', maxWidth: '200px' } }}
          />
        )}
      </Box>

      {/* Bar Chart */}
      {selectedClass && subjects.length > 0 && (
        <Chart
          type="bar"
          series={chartSeries}
          options={chartOptions}
          height={364}
          loadingProps={{ sx: { p: 2.5 } }}
          sx={{ py: 2.5, pl: 1, pr: 2.5 }}
        />
      )}
    </Box>
  );
}
