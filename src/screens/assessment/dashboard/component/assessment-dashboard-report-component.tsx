import { Box, Typography, alpha, useTheme, } from '@mui/material'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import { DatePicker } from '@mui/x-date-pickers'
import { title } from 'process'
import React from 'react'
import CustomSelect from 'src/components/custom-select'
import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report'
import { AnalyticsWebsiteVisits } from 'src/screens/student/enrollment/dashboard'

const AssessmentDashboardReportComponent = () => {
  const theme = useTheme();
  return (
    <Box>

      <Typography component="span" variant="h6" gutterBottom>
        Reports Section
      </Typography>

      <Box display="flex" flexDirection="row" gap={3} sx={{ pt: "20px", pb: "20px" }} >
        <CustomSelect
          label="Class"
          options={[]}
          value=""
          onChange={() => { }}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
        <CustomSelect
          label="Subject"
          options={[]}
          value=""
          onChange={() => { }}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
        <CustomSelect
          label="Division"
          options={[]}
          value=""
          onChange={() => { }}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
        <DatePicker
          label="To Date"
          format="DD-MM-YYYY"
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="End Date"
          format="DD-MM-YYYY"
          slotProps={{ textField: { size: 'small' } }}
        />


      </Box>
      <Grid2 container spacing={3}>
        <Grid2 xs={12} md={6}>
          <AnalyticsWebsiteVisits
            title="Distribution of grades"
            //   subheader="(+43%) than last year"
            chart={{
              categories: ['Maths', 'Physics', 'Chemistry',],
              series: [

                { name: 'A', data: [43, 33, 22,] },
                { name: 'B', data: [51, 70, 47,] },
                { name: 'C', data: [0, 67, 47,] },
              ],
              colors: [
                alpha(theme.palette.primary.dark, 0.8),
                alpha(theme.palette.warning.main, 0.8),
                alpha(theme.palette.error.main, 0.8),
              ],
            }}
            sx={{ height: '100%' }}
          />
        </Grid2>

        <Grid2 xs={12} md={6}>
          <PerformanceOverTime
            id="demo-for-assessment-report"
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
                  name: 'Maths',
                  data: [10, 41, 35, 51, 49, 62, 69, 91, 35, 51, 49, 12],
                },
                {
                  name: 'Science',
                  data: [49, 51, 35, 10, 41, 35, 51, 49, 62, 69, 91, 12],
                },
              ],
              options: {
                legend: {
                  show: true,
                  position: 'top',
                },
              },
            }}
            sx={{ height: '100%', boxShadow: 'none' }}
          />
        </Grid2>
      </Grid2>



    </Box>
  )
}

export default AssessmentDashboardReportComponent