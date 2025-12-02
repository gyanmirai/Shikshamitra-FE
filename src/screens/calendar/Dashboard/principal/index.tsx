'use client';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { DashboardCard } from 'src/components/dashboard-card';
import { AppCurrentDownload } from 'src/sections/overview/app/app-current-download';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { AnalyticsConversionRates } from 'src/sections/overview/analytics/analytics-conversion-rates';
import { CommunicationTrendChart } from 'src/screens/communication/dashboard/components/CommunicationTrendChart';
import {
  Box,
  Grid,
  Card,
  Chip,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  CardContent,
} from '@mui/material';

// Mock data for Principal Dashboard

// KPI Card Data
const TODAY_IMPORTANT_EVENTS = 5;
const UPCOMING_ACADEMIC_EVENTS = 12;
const TOTAL_HOLIDAYS = 25;

// Chart Data - Academic vs Non-Academic Events (Donut Chart)
const ACADEMIC_VS_NON_ACADEMIC_DATA = [
  { label: 'Academic', value: 65 },
  { label: 'Non-Academic', value: 35 },
];

// Student Participation Trend (Line Chart)
const getLast6Months = () => {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months;
};

const STUDENT_PARTICIPATION_DATA = {
  categories: getLast6Months(),
  series: [{ name: 'Student Participation', data: [320, 380, 420, 450, 480, 500] }],
};

// Holiday Distribution Chart (Bar Chart)
const HOLIDAY_DISTRIBUTION_DATA = {
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [{ name: 'Holidays', data: [2, 1, 3, 2, 1, 0, 1, 2, 3, 4, 2, 4] }],
};

// Weekly Event Density (Bar Chart)
const WEEKLY_EVENT_DENSITY_DATA = {
  categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  series: [{ name: 'Events', data: [8, 12, 10, 15, 9] }],
};

// List Data
const TODAY_SCHEDULE_DATA = [
  { id: 1, time: '09:00 AM', event: 'Morning Assembly', importance: 'High' },
  { id: 2, time: '10:30 AM', event: 'Principal Meeting with HODs', importance: 'High' },
  { id: 3, time: '02:00 PM', event: 'School Inspection', importance: 'Medium' },
  { id: 4, time: '04:00 PM', event: 'Parent Committee Meeting', importance: 'Medium' },
];

const TEACHER_EVENT_REQUESTS = [
  {
    id: 1,
    teacher: 'Sarah Williams',
    eventType: 'Field Trip',
    date: '2024-12-18',
    status: 'Pending',
  },
  {
    id: 2,
    teacher: 'Robert Brown',
    eventType: 'Quiz Competition',
    date: '2024-12-20',
    status: 'Pending',
  },
  {
    id: 3,
    teacher: 'Emily Davis',
    eventType: 'Science Fair',
    date: '2024-12-22',
    status: 'Approved',
  },
];

const UPCOMING_HOLIDAYS_DATA = [
  { id: 1, name: 'Christmas', type: 'Public Holiday', date: '2024-12-25', audience: 'All' },
  { id: 2, name: 'New Year', type: 'Public Holiday', date: '2025-01-01', audience: 'All' },
  {
    id: 3,
    name: 'Winter Break',
    type: 'Academic Break',
    date: '2024-12-26 - 2025-01-05',
    audience: 'Students',
  },
];

const GROUP_ACTIVITIES_DATA = [
  {
    id: 1,
    group: 'Grade 12 Students',
    upcomingEvent: 'Board Exam Prep',
    lastActivity: '2024-11-28',
  },
  { id: 2, group: 'Drama Club', upcomingEvent: 'Annual Play', lastActivity: '2024-11-30' },
  {
    id: 3,
    group: 'Debate Team',
    upcomingEvent: 'Inter-School Competition',
    lastActivity: '2024-12-01',
  },
];

const PrincipalDashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* A. DASHBOARD CARDS (KPIs) */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DashboardCard
            title="Important Events"
            value={TODAY_IMPORTANT_EVENTS}
            icon="mdi:star-circle"
            color="primary.main"
            bgColor="primary.lighter"
            description="Today"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DashboardCard
            title="Academic Events"
            value={UPCOMING_ACADEMIC_EVENTS}
            icon="mdi:school"
            color="info.main"
            bgColor="info.lighter"
            description="Next 10 Days"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DashboardCard
            title="Total Holidays"
            value={TOTAL_HOLIDAYS}
            icon="mdi:calendar-blank"
            color="success.main"
            bgColor="success.lighter"
            description="Academic Year"
          />
        </Grid>
      </Grid>

      {/* B. CHARTS SECTION */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Student Participation Trend */}
        <Grid size={{ xs: 12, md: 8 }}>
          <CommunicationTrendChart
            title="Student Participation Trend (Monthly)"
            chart={{
              categories: STUDENT_PARTICIPATION_DATA.categories,
              series: STUDENT_PARTICIPATION_DATA.series,
            }}
          />
        </Grid>

        {/* Academic vs Non-Academic Events */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AppCurrentDownload
            title="Academic vs Non-Academic"
            chart={{
              series: ACADEMIC_VS_NON_ACADEMIC_DATA,
              colors: [theme.palette.primary.main, theme.palette.info.main],
            }}
          />
        </Grid>

        {/* Holiday Distribution Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <AnalyticsConversionRates
            title="Holiday Distribution (Monthly)"
            chart={{
              categories: HOLIDAY_DISTRIBUTION_DATA.categories,
              series: HOLIDAY_DISTRIBUTION_DATA.series,
              colors: [theme.palette.success.main],
            }}
          />
        </Grid>

        {/* Weekly Event Density */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticsWebsiteVisits
            title="Weekly Event Density"
            chart={{
              categories: WEEKLY_EVENT_DENSITY_DATA.categories,
              series: WEEKLY_EVENT_DENSITY_DATA.series,
              colors: [theme.palette.warning.main],
            }}
          />
        </Grid>
      </Grid>

      {/* C. LISTS / TABLES SECTION */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Today's Schedule List */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Today&apos;s Schedule
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>Importance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TODAY_SCHEDULE_DATA.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <strong>{item.time}</strong>
                      </TableCell>
                      <TableCell>{item.event}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.importance}
                          size="small"
                          color={item.importance === 'High' ? 'error' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Teacher Event Request List */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Teacher Event Requests
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Teacher Name</TableCell>
                    <TableCell>Event Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TEACHER_EVENT_REQUESTS.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.teacher}</TableCell>
                      <TableCell>{request.eventType}</TableCell>
                      <TableCell>{request.date}</TableCell>
                      <TableCell>
                        <Chip
                          label={request.status}
                          size="small"
                          color={request.status === 'Approved' ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Holidays List */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Upcoming Holidays
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Holiday Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Audience</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {UPCOMING_HOLIDAYS_DATA.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell>
                        <strong>{holiday.name}</strong>
                      </TableCell>
                      <TableCell>
                        <Chip label={holiday.type} size="small" color="info" variant="outlined" />
                      </TableCell>
                      <TableCell>{holiday.date}</TableCell>
                      <TableCell>{holiday.audience}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Group Activities Snapshot */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Group Activities Snapshot
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Group Name</TableCell>
                    <TableCell>Upcoming Event</TableCell>
                    <TableCell>Last Activity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {GROUP_ACTIVITIES_DATA.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <strong>{group.group}</strong>
                      </TableCell>
                      <TableCell>{group.upcomingEvent}</TableCell>
                      <TableCell>
                        <Chip
                          label={group.lastActivity}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PrincipalDashboard;
