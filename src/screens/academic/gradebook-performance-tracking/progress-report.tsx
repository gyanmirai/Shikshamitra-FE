import React from 'react';

import { Search } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Grid,
  Button,
  useTheme,
  TextField,
  Typography,
  CardHeader,
  InputAdornment,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { AppCurrentDownload } from 'src/screens/hr/dashboard/app-current-download';
import {
  AnalyticsCurrentVisits,
  AnalyticsWebsiteVisits,
} from 'src/screens/student/enrollment/dashboard';

import { Label } from 'src/components/label';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
// import { EcommerceYearlySales } from 'src/components/studentProfile/academicDashboard';

const ProgressReport = () => (
  <Box>
    <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={3}>
      <CustomSelect
        label="Class"
        options={[
          { value: 'class1', label: 'Class 1' },
          { value: 'class2', label: 'Class 2' },
          { value: 'class3', label: 'Class 3' },
        ]}
        onChange={() => {}}
        value=""
        formControlProps={{
          sx: { width: '100%', maxWidth: '200px' },
        }}
      />

      <CustomSelect
        label="Assignment Type"
        options={[
          { value: 'homework', label: 'Homework' },
          { value: 'quiz', label: 'Quiz' },
          { value: 'exam', label: 'Exam' },
        ]}
        onChange={() => {}}
        value=""
        formControlProps={{
          sx: { width: '100%', maxWidth: '200px' },
        }}
      />
      <CustomSelect
        label="Grading Scale Assignment"
        options={[
          { value: 'name', label: 'Student Name' },
          { value: 'grade', label: 'Grade' },
          { value: 'date', label: 'Date' },
        ]}
        value=""
        onChange={() => {}}
        formControlProps={{
          sx: { width: '100%', maxWidth: '200px' },
        }}
      />
      <DatePicker
        label="Start Date"
        slotProps={{
          textField: {
            sx: { width: '100%', maxWidth: '200px' },
            size: 'small',
          },
        }}
      />
      <DatePicker
        label="End Date"
        slotProps={{
          textField: {
            sx: { width: '100%', maxWidth: '200px' },
            size: 'small',
          },
        }}
      />
      <Button variant="contained">Generate Report</Button>
    </Box>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <AnalyticsWebsiteVisits
          title="Performance by Assignment"
          chart={{
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
            series: [{ name: '', data: [43, 33, 22, 37, 67, 68, 37, 24, 55, 43, 33, 22] }],
          }}
          sx={{ boxShadow: 'var(--shadows-2)', height: '100%' }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Subject Performance</Typography>
            <CustomSelect
              label="subject"
              options={[
                { value: 'Math', label: 'Math' },
                { value: 'Science', label: 'Science' },
                { value: 'ENG', label: 'ENG' },
              ]}
              onChange={() => {}}
              value=""
              formControlProps={{
                sx: { width: '100%', maxWidth: '200px' },
              }}
            />
          </Box>
          <AnalyticsCurrentVisits
            title=""
            chart={{
              series: [
                { label: 'Math', value: 3500 },
                { label: 'Science', value: 2500 },
                { label: 'ENG', value: 1500 },
                { label: 'Gujarati', value: 500 },
              ],
            }}
            sx={{ height: '100%', boxShadow: 'none' }}
          />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Performance Over Time</Typography>
            <CustomSelect
              label="Monthly"
              options={[
                { value: 'Monthly', label: 'Monthly' },
                { value: 'Weekly', label: 'Weekly' },
              ]}
              onChange={() => {}}
              value=""
              formControlProps={{
                sx: { width: '100%', maxWidth: '200px' },
              }}
            />
          </Box>
          <PerformanceOverTime
            id="demo__4"
            //   title="Performance Over Time"
            //   subheader="(+43%) than last year"
            chart={{
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
              series: [
                {
                  name: '',
                  data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                },
              ],
            }}
            sx={{ height: '100%', boxShadow: 'none' }}
          />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Individual Student Reports
        </Typography>
        <Card sx={{ p: 3, boxShadow: 'var(--shadows-2)', borderRadius: '12px' }}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search Student"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover': {
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                  },
                },
                mb: 3,
              }}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <DatePicker
                label="Start Date"
                slotProps={{
                  textField: {
                    sx: { width: '100%', maxWidth: '200px' },
                    size: 'small',
                  },
                }}
              />
              &nbsp;
              <DatePicker
                label="End Date"
                slotProps={{
                  textField: {
                    sx: { width: '100%', maxWidth: '200px' },
                    size: 'small',
                  },
                }}
              />
            </Box>
            <CustomSelect
              label="Assignment Type"
              options={[
                { value: 'All', label: 'All' },
                { value: 'Homework', label: 'Homework' },
                { value: 'Quiz', label: 'Quiz' },
                { value: 'Exam', label: 'Exam' },
              ]}
              onChange={() => {}}
              value=""
              formControlProps={{
                sx: {
                  width: '200px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    height: '40px',
                  },
                },
              }}
            />
          </Box>

          <Card
            sx={{
              p: 3,
              mb: 3,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              borderRadius: '12px',
              maxWidth: '300px',
              width: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.success.mainChannel, 0.3),
            }}
          >
            <Typography variant="h5" fontWeight="bold" mb={2}>
              Overall Grades
            </Typography>
            <Typography variant="h3" color="primary" fontWeight="bold">
              A+
            </Typography>
          </Card>
        </Card>
        <CustomizableTable
          columns={[
            { id: 'assignmentName', label: 'Assignment Name' },
            { id: 'grade', label: 'Grade' },
            { id: 'teacherComment', label: 'Teacher Comment' },
            {
              id: 'completionStatus',
              label: 'Completion Status',
              render(value, row) {
                return <Label color={value === 'Completed' ? 'success' : 'warning'}>{value}</Label>;
              },
            },
          ]}
          data={[
            {
              assignmentName: 'Math Quiz 1',
              grade: 'A',
              teacherComment: 'Excellent work!',
              completionStatus: 'Completed',
            },
            {
              assignmentName: 'Science Project',
              grade: 'B+',
              teacherComment: 'Good effort, room for improvement',
              completionStatus: 'Completed',
            },
            {
              assignmentName: 'English Essay',
              grade: 'A-',
              teacherComment: 'Well-written, minor grammatical errors',
              completionStatus: 'Completed',
            },
            {
              assignmentName: 'History Presentation',
              grade: 'B',
              teacherComment: 'Informative, but could use more depth',
              completionStatus: 'Completed',
            },
            {
              assignmentName: 'Art Portfolio',
              grade: 'A+',
              teacherComment: 'Outstanding creativity!',
              completionStatus: 'Completed',
            },
          ]}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Performance Over Time</Typography>
            <CustomSelect
              label="Monthly"
              options={[
                { value: 'Monthly', label: 'Monthly' },
                { value: 'Weekly', label: 'Weekly' },
              ]}
              onChange={() => {}}
              value=""
              formControlProps={{
                sx: { width: '100%', maxWidth: '200px' },
              }}
            />
          </Box>
          <PerformanceOverTime
            id="demo__4"
            //   title="Performance Over Time"
            //   subheader="(+43%) than last year"
            chart={{
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
              series: [
                {
                  name: '',
                  data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                },
              ],
            }}
            sx={{ height: '100%', boxShadow: 'none' }}
          />
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <AppCurrentDownload
          title="Grade Distribution"
          chart={{
            series: [
              { label: 'A', value: 12244 },
              { label: 'B', value: 53345 },
              { label: 'C', value: 44313 },
              { label: 'D', value: 4313 },
            ],
          }}
        />
        <Box p={2}>
          <Button variant="contained" color="success">
            Download as PDF
          </Button>
          &nbsp;
          <Button variant="contained" color="error">
            Download as CSV
          </Button>
        </Box>
      </Grid>
    </Grid>
  </Box>
);

export default ProgressReport;

export function PerformanceOverTime({ title, subheader, chart, ...other }: any) {
  const theme = useTheme();

  // const [selectedSeries, setSelectedSeries] = useState('2023');

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  // const handleChangeSeries = useCallback((newValue: string) => {
  //   setSelectedSeries(newValue);
  // }, []);

  // const currentSeries = chart.series.find((i) => i.name === selectedSeries);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        //   action={
        //     <ChartSelect
        //       options={chart.series.map((item) => item.name)}
        //       value={selectedSeries}
        //       onChange={handleChangeSeries}
        //     />
        //   }
        sx={{ mb: 3 }}
      />

      <Chart
        type="area"
        series={chart.series}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
