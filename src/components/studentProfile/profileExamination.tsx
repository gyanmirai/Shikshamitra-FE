import type { CardProps } from '@mui/material';

import { useState, useCallback } from 'react';

import {
  Box,
  Card,
  Grid,
  Stack,
  Alert,
  alpha,
  Divider,
  useTheme,
  CardHeader,
  Typography,
} from '@mui/material';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import { Iconify } from '../iconify';
import CustomSelect from '../custom-select';
import CustomizableTable from '../customizabaleTable';
import { Chart, useChart, ChartSelect, ChartLegends } from '../chart';

import type { ChartOptions } from '../chart';

const ProfileExamination = () => {
  // Get the current theme from MUI
  const theme = useTheme();

  // State to track the selected year for data series
  const [selectedSeries, setSelectedSeries] = useState('2024');

  // Callback handler for updating the selected series
  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);

  return (
    <>
      <Alert variant="outlined" severity="warning">
        You need to increase your performance in Mathematics. Focus on improving your scores in this
        subject.
      </Alert>
      <Card sx={{ py: 3, textAlign: 'center', typography: 'h4' }}>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        >
          <Stack width={1}>
            87.5%
            <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
              Current Percentage
            </Box>
          </Stack>

          <Stack width={1}>
            90%-95%
            <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
              Predicted Percentage
            </Box>
          </Stack>

          <Stack width={1}>
            <Box position="relative" display="flex" justifyContent="center">
              <Iconify
                icon="humbleicons:certificate"
                sx={{
                  height: '70px',
                  width: '70px',
                  color: 'primary.main',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
              <Typography
                component="div"
                sx={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  fontSize: '100px',
                  fontWeight: 'bold',
                }}
              >
                A
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <EcommerceYearlySales
            title="Academic Trends"
            subheader=""
            selectedSeries={selectedSeries}
            handleChangeSeries={handleChangeSeries}
            sx={{ height: '100%' }}
            chart={{
              categories: ['01/01', '07/02', '09/03', '01/04'],
              series: [
                {
                  name: '2024',
                  data: [
                    {
                      name: 'English',
                      data: [10, 41, 35, 51],
                    },
                    {
                      name: 'Mathematics',
                      data: [10, 34, 13, 56],
                    },
                    {
                      name: 'Gujarati',
                      data: [70, 40, 30, 55],
                    },
                    {
                      name: 'Hindi',
                      data: [90, 84, 63, 56],
                    },
                  ],
                },
                {
                  name: '2023',
                  data: [
                    {
                      name: 'English',
                      data: [51, 35, 41, 10],
                    },
                    {
                      name: 'Mathematics',
                      data: [56, 13, 34, 10],
                    },
                    {
                      name: 'Gujarati',
                      data: [58, 39, 45, 18],
                    },
                    {
                      name: 'Hindi',
                      data: [52, 18, 39, 40],
                    },
                  ],
                },
              ],
              colors: [
                theme.palette.primary.main,
                theme.palette.warning.main,
                theme.palette.success.main,
                theme.palette.error.main,
              ],
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Subject Wise Marks</Typography>
              <CustomSelect
                label="Exam"
                options={[
                  { value: 'math', label: 'Math' },
                  { value: 'science', label: 'Science' },
                  { value: 'english', label: 'English' },
                ]}
                value=""
                onChange={(val) => {
                  // Handle subject selection
                }}
                formControlProps={{
                  sx: { width: '200px', size: 'small' },
                }}
              />
            </Box>

            <AnalyticsWebsiteVisits
              title=""
              chart={{
                categories: [
                  'Mathematics',
                  'Science',
                  'English',
                  'Gujarati',
                  'Social Science',
                  'JAVA',
                  'C++',
                ],
                series: [{ name: 'Subjects', data: [43, 33, 22, 37, 18, 35, 27] }],
                colors: [alpha(theme.palette.primary.dark, 0.8)],
              }}
              sx={{ height: '100%' }}
            />
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Previous Exams</Typography>
            <CustomizableTable
              tableId="previous-exams-table"
              searchFieldProps={{
                placeholder: 'Search by Exam Name, Percentage, Remarks...',
                label: 'Search by Exam Name, Percentage, Remarks...',
                sx: {
                  maxWidth: '400px',
                  width: '100%',
                },
              }}
              columns={[
                { id: 'examName', label: 'Exam Name', minWidth: '160px', align: 'left' },
                {
                  id: 'marks',
                  label: 'Subjects',
                  minWidth: '200px',
                  render: (val, row) => (
                    <>
                      {Object.entries(row.marks).map(([key, value]: any) => (
                        <Typography key={key} variant="subtitle2">
                          {key} : {value}
                        </Typography>
                      ))}
                    </>
                  ),
                },
                {
                  id: 'percentage',
                  label: 'Percentage',
                  minWidth: '120px',
                  filterType: 'number',
                },
                {
                  id: 'remarks',
                  label: 'Remarks',
                  minWidth: '160px',
                },
              ]}
              data={[
                {
                  examName: 'Mid Term',
                  marks: { english: 75, math: 85, science: 80, history: 90 },
                  percentage: '82%',
                  remarks: 'Good Performance',
                },
                {
                  examName: 'Final Exam',
                  marks: { english: 60, math: 70, science: 65, history: 75 },
                  percentage: '68%',
                  remarks: 'Needs Improvement',
                },
                {
                  examName: 'Unit Test 1',
                  marks: { english: 88, math: 92, science: 89, history: 87 },
                  percentage: '89%',
                  remarks: 'Excellent',
                },
                {
                  examName: 'Unit Test 2',
                  marks: { english: 70, math: 75, science: 72, history: 78 },
                  percentage: '74%',
                  remarks: 'Satisfactory',
                },
              ]}
            />{' '}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Upcoming Exams</Typography>
              <Typography variant="h6">Exam Name : ABC Exam</Typography>
            </Box>
            <CustomizableTable
              isFilter={false}
              isPagination={false}
              isScrollbar={false}
              isShowedDense={false}
              isSearch={false}
              tableId="upcoming-exams-table"
              searchFieldProps={{
                placeholder: 'Search by Subject Name, Exam Date, Exam Time...',
                label: 'Search by Subject Name, Exam Date, Exam Time...',
                sx: {
                  maxWidth: '400px',
                  width: '100%',
                },
              }}
              columns={[
                { id: 'subjectName', label: 'Subject Name', minWidth: '160px', align: 'left' },
                {
                  id: 'examDate',
                  label: 'Exam Date',
                },
                {
                  id: 'examTime',
                  label: 'Exam Time',
                },
                {
                  id: 'examDuration',
                  label: 'Exam Duration',
                },
                {
                  id: 'totalMarks',
                  label: 'Total Marks',
                  filterType: 'number',
                },
                {
                  id: 'passingMarks',
                  label: 'Passing Marks',
                  filterType: 'number',
                },
              ]}
              data={[
                {
                  subjectName: 'Mathematics',
                  examDate: '2025-03-15',
                  examTime: '10:00 AM',
                  examDuration: '2 Hours',
                  totalMarks: 100,
                  passingMarks: 35,
                },
                {
                  subjectName: 'Science',
                  examDate: '2025-03-17',
                  examTime: '11:00 AM',
                  examDuration: '2.5 Hours',
                  totalMarks: 80,
                  passingMarks: 30,
                },
                {
                  subjectName: 'English',
                  examDate: '2025-03-19',
                  examTime: '09:30 AM',
                  examDuration: '2 Hours',
                  totalMarks: 100,
                  passingMarks: 40,
                },
                {
                  subjectName: 'Social Studies',
                  examDate: '2025-03-21',
                  examTime: '12:00 PM',
                  examDuration: '3 Hours',
                  totalMarks: 90,
                  passingMarks: 35,
                },
                {
                  subjectName: 'Computer Science',
                  examDate: '2025-03-23',
                  examTime: '02:00 PM',
                  examDuration: '1.5 Hours',
                  totalMarks: 70,
                  passingMarks: 25,
                },
              ]}
            />{' '}
          </Card>
        </Grid>
      </Grid>
    </>
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
