import { Box, Card, Typography } from '@mui/material'
import Grid2 from '@mui/material/Unstable_Grid2'
import React from 'react'
import CustomSelect from 'src/components/custom-select'
import ScrollableCard from './custom-scrollable-card'
import { CalendarView } from 'src/sections/calendar/view'

const ExaminationDashboardOverviewComponent = () => {
  const pendingExams = [
    '08 Subject Managed',
    '05 Subject Pending',
    // '03 Subject in Progress',
    // '08 Subject Managed',
    // '05 Subject Pending',
    // '03 Subject in Progress',
    // '08 Subject Managed',
    // '05 Subject Pending',
    // '03 Subject in Progress',
    // '08 Subject Managed',
    // '05 Subject Pending',
    // '03 Subject in Progress',
    // Add more items as needed
  ];

  const totalExams = ["6"]

  return (
    <Box>
      <Box display="flex" flexDirection="row" gap={3} sx={{ pb: "20px", pt: "20px" }}>
        <CustomSelect
          label="Organization"
          options={[]}
          value=""
          onChange={() => { }}
          formControlProps={{ sx: { minWidth: 150 } }}
        />
        <CustomSelect
          label="Class"
          options={[]}
          value=""
          onChange={() => { }}
          formControlProps={{ sx: { minWidth: 120 } }}
        />

      </Box>
      <Grid2 container spacing={3}>
        <Grid2 xs={12} md={6} lg={6} >
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography component="span" variant="h6" gutterBottom>
              Total Number of Scheduled Exams

            </Typography>

            <Box display="flex" alignItems="flex-center">
              <Typography sx={{ fontSize: '25px', lineHeight: '25px', pr: 1, pt: "5px" }} gutterBottom>
                •
              </Typography>
              <Typography sx={{ fontSize: '25px' }} gutterBottom> 30
              </Typography>
            </Box>
          </Card>
          {/* <ScrollableCard fontSize='30px' showFilter = {false} title="Total Number of Scheduled Exams" content={totalExams} />         */}

        </Grid2>
        <Grid2 xs={12} md={6} lg={6} >
          <ScrollableCard showFilter={true} title="Upcoming Exams" content={pendingExams} />        </Grid2>
      </Grid2>
      <Grid2 container spacing={3}>
        <Grid2 xs={12} md={6} lg={6} >
          <ScrollableCard showFilter={false} title="Completed Exams" content={pendingExams} />

        </Grid2>
        <Grid2 xs={12} md={6} lg={6} >
          <ScrollableCard showFilter={false} title="Pending Exams" content={pendingExams} />        </Grid2>
      </Grid2>


      <Box display="flex" flexDirection="row" gap={3} sx={{ pb: "20px", pt: "20px" }}>
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


      </Box>
      <Grid2 lg={12}>
        <CalendarView />
      </Grid2>

    </Box>


  )
}

export default ExaminationDashboardOverviewComponent