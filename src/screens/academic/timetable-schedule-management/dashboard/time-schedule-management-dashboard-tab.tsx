import { Box, Button, } from '@mui/material'
import Grid2 from '@mui/material/Unstable_Grid2'
import React from 'react'
import CustomSelect from 'src/components/custom-select'
import ScrollableCard from 'src/screens/examination/dashboard/component/custom-scrollable-card'
import { CalendarView } from 'src/sections/calendar/view'

const TimeScheduleManagementDashboardTab = () => {
  const UpcomingScheduleAlerts: string[] = ["10-10-2024 9:00 PM , Teacher - John Doe , Room No.- 101", "10-10-2024 9:00 PM , Teacher - John Doe , Room No.- 101", "10-10-2024 9:00 PM , Teacher - John Doe , Room No.- 101"]
  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexDirection="row" gap={3}>

          <CustomSelect
            label="Organization"
            options={[]}
            value=""
            onChange={() => { }}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <CustomSelect
            label="Class"
            options={[]}
            value=""
            onChange={() => { }}
            formControlProps={{ sx: { minWidth: 120 } }}
          />
        </Box>
        <Box>
          <Button variant="contained" onClick={() => { }}>
            Create New Timetable
          </Button>
        </Box>



      </Box>
      <CalendarView />
      <Grid2 container spacing={3}>

        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard filterLabel='Subject' showFilter={true} title="Upcoming Schedule Alerts" content={UpcomingScheduleAlerts} />
        </Grid2>
        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard showFilter={false} title="Upcoming Schedule Alerts" content={UpcomingScheduleAlerts} />
        </Grid2>
      </Grid2>
      <Grid2 container spacing={3}>


        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard showFilter={false} title="Timetable conflicts" content={UpcomingScheduleAlerts} />
        </Grid2>
        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard showFilter={false} title="Pending approvals" content={UpcomingScheduleAlerts} />
        </Grid2>
      </Grid2>

    </>
  )
}

export default TimeScheduleManagementDashboardTab