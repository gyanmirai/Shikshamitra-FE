'use client';

import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Button, Typography } from '@mui/material';

import { AppAreaInstalled } from 'src/screens/hr/dashboard/app-area-installed';
import { CourseHoursSpent } from 'src/screens/hr/dashboard/course-hours-spent';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { CalendarView } from 'src/sections/calendar/view';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const AcademicDashboardScreen = () => (
  <Box>
    <Grid2 container spacing={3}>
      <Grid2 xs={12} md={6} lg={6} xl={4}>
        <Card sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Student Enrollment
            </Typography>
            <CustomSelect
              label="class"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box component="ul" sx={{ pl: 2, listStyleType: 'disc' }}>
              <Box component="li">Total Students: 150</Box>
              <Box component="li">New Enrollments: 25</Box>
              <Box component="li">Pending Applications: 10</Box>
            </Box>
          </Box>
        </Card>
      </Grid2>
      <Grid2 xs={12} md={6} lg={6} xl={4}>
        <Card sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Assignments Overview
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box component="ul" sx={{ pl: 2, listStyleType: 'disc' }}>
              <Box component="li">Created - 10</Box>
              <Box component="li">Submitted - 8</Box>
              <Box component="li">Pending - 2 </Box>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="contained" size="small">
              View Full Assignment
            </Button>
          </Box>
        </Card>
      </Grid2>
      <Grid2 xs={12} md={6} lg={6} xl={4}>
        <Card sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Exam Schedule
            </Typography>
            <CustomSelect
              label="Subject"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box component="ul" sx={{ pl: 2, listStyleType: 'disc' }}>
              <Box component="li">Upcoming Exams</Box>
              <Box component="li">Math (Sep 20 2024)</Box>
              <Box component="li">Science (Sep 21 2024</Box>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="contained" size="small">
              View Exam Schedule
            </Button>
          </Box>
        </Card>
      </Grid2>
      <Grid2 xs={12}>
        <Typography component="span" variant="h6" gutterBottom>
          Class Timetable Management
        </Typography>
        <CalendarView />
      </Grid2>
      <Grid2 xs={12}>
        <Typography component="span" variant="h6" gutterBottom>
          Assignments Management
        </Typography>
        <CustomizableTable
          columns={[
            { id: 'assignmentTitle', label: 'Assignment Title' },
            { id: 'class', label: 'Class' },
            { id: 'dueDate', label: 'Due Date' },
            { id: 'status', label: 'Status' },
          ]}
          data={[]}
        />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <Card sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Exam Schedule
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box component="ul" sx={{ pl: 2, listStyleType: 'disc' }}>
              <Box component="li">Subject - Math</Box>
              <Box component="li">Date - 01-01-2024</Box>
              <Box component="li">Teacher - XYZ</Box>
            </Box>
          </Box>
        </Card>
      </Grid2>
      <Grid2 xs={12} md={6}>
        <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
          <CustomSelect
            label="Class"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 120 } }}
          />
          <CustomSelect
            label="Subject"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 120 } }}
          />
          <CustomSelect
            label="Teacher"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 120 } }}
          />
        </Box>
        <CustomizableTable
          columns={[
            { id: 'classObject', label: 'Class/Object' },
            { id: 'averageScore', label: 'Average Score' },
            { id: 'topPerformer', label: 'Top Performer' },
            { id: 'failingStudents', label: 'Failing Students' },
          ]}
          data={[]}
        />
      </Grid2>
      <Grid2 xs={12}>
        <Typography component="span" variant="h6" gutterBottom>
          Student Performance Analytics
        </Typography>
      </Grid2>
      <Grid2 xs={12} md={6}>
        <AppAreaInstalled
          title="Subjects"
          //   subheader="(+43%) than last year"
          selectSeries="class1"
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
                name: 'class1',
                data: [
                  { name: 'Math', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                  { name: 'English', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                  { name: 'Gujarati', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                ],
              },
              {
                name: 'class2',
                data: [
                  { name: 'Math', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                  { name: 'English', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                  { name: 'Gujarati', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                ],
              },
              {
                name: 'Class3',
                data: [
                  { name: 'Math', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                  { name: 'English', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                  { name: 'Gujarati', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                ],
              },
            ],
          }}
        />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
          <CustomSelect
            options={[]}
            value=""
            onChange={() => {}}
            label="Class"
            formControlProps={{ sx: { minWidth: 120 } }}
          />
          <CustomSelect
            options={[]}
            value=""
            onChange={() => {}}
            label="Subject"
            formControlProps={{ sx: { minWidth: 120 } }}
          />
        </Box>
        <AnalyticsCurrentVisits
          title="Class Wise Performance"
          chart={{
            series: [
              { label: 'Science', value: 35 },
              { label: 'Maths', value: 25 },
              { label: 'English', value: 15 },
              { label: 'Gujarati', value: 50 },
            ],
          }}
          sx={{ boxShadow: 'none' }}
        />
      </Grid2>
      <Grid2 xs={12}>
        <Typography component="span" variant="h6" gutterBottom>
          Reports & Analytics
        </Typography>
      </Grid2>
      <Grid2 xs={12} md={6} lg={6} xl={4}>
        <Card sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Class Performance
            </Typography>
            <CustomSelect
              label="class"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box component="ul" sx={{ pl: 2, listStyleType: 'disc' }}>
              <Box component="li">Math is excellence</Box>
              <Box component="li">Eng is Weak</Box>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="contained" size="small" color="primary">
              PDF
            </Button>
            <Button variant="contained" size="small" color="error">
              CSV
            </Button>
          </Box>
        </Card>
      </Grid2>
      <Grid2 xs={12} md={6} lg={6} xl={4}>
        <Card sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Attendance Report
            </Typography>
            <CustomSelect
              label="class"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box component="ul" sx={{ pl: 2, listStyleType: 'disc' }}>
              <Box component="li">Attendance - 85%</Box>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="contained" size="small" color="primary">
              PDF
            </Button>
            <Button variant="contained" size="small" color="error">
              CSV
            </Button>
          </Box>
        </Card>
      </Grid2>
      <Grid2 xs={12} md={6} lg={6} xl={4}>
        <Card sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" variant="h6" gutterBottom>
              Exam Result
            </Typography>
            <CustomSelect
              label="class"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box component="ul" sx={{ pl: 2, listStyleType: 'disc' }}>
              <Box component="li">Pass - 20</Box>
              <Box component="li">Fail - 05</Box>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="contained" size="small" color="primary">
              Scorecards
            </Button>
            <Button variant="contained" size="small" color="error">
              Grade Distribution
            </Button>
          </Box>
        </Card>
      </Grid2>
      <Grid2 xs={12} md={6} lg={6} xl={4}>
        <CourseHoursSpent
          title="Performance Trend"
          selected="Class1"
          chart={{
            series: [
              {
                name: 'Class1',
                categories: ['Eng', 'GUj', 'Hin', 'Maths', 'Sci'],
                data: [{ data: [10, 41, 35, 151, 49] }],
              },
              {
                name: 'Class2',
                categories: ['Eng', 'GUj', 'Hin', 'Maths', 'Sci'],
                data: [{ data: [83, 112, 119, 88, 103] }],
              },
              {
                name: 'Class3',
                categories: ['Eng', 'GUj', 'Hin', 'Maths', 'Sci'],
                data: [{ data: [24, 72, 64, 96, 76] }],
              },
            ],
          }}
        />
      </Grid2>
    </Grid2>
  </Box>
);

export default AcademicDashboardScreen;
