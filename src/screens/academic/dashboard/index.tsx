'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Add } from '@mui/icons-material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Button, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { AppAreaInstalled } from 'src/screens/hr/dashboard/app-area-installed';
import { CourseHoursSpent } from 'src/screens/hr/dashboard/course-hours-spent';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { CalendarView } from 'src/sections/calendar/view';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const AcademicDashboardScreen = () => {
  const [classes1, setClasses1] = useState<string>('');
  const [classes2, setClasses2] = useState<string>('');
  const [classes3, setClasses3] = useState<string>('');
  const [classes4, setClasses4] = useState<string>('');
  const [classes5, setClasses5] = useState<string>('');
  const [classes6, setClasses6] = useState<string>('');

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const router = useRouter();
  return (
    <Box>
      <Grid2 container spacing={3}>
        <Grid2 xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography component="span" variant="h6" gutterBottom color="primary.main">
                Student Enrollment
              </Typography>
              <CustomSelect
                label="class"
                options={classData?.items || []}
                value={classes1}
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  setClasses1(val as string);
                }}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Scrollbar sx={{ mt: 1.5, height: '190px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                  }}
                >
                  {[
                    'Class 10-30',
                    'Class 9-25',
                    'ABC',
                    'XYZ',
                    'PQR',
                    'MNO',
                    'JPO',
                    'ABC',
                    'LMP',
                    'UTT',
                  ].map((exam, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                        {exam}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Scrollbar>
            </Box>
          </Card>
        </Grid2>
        <Grid2 xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography component="span" variant="h6" gutterBottom color="warning.main">
                Assignments Overview
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Scrollbar sx={{ mt: 1.5, height: '190px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                  }}
                >
                  {[
                    'Created-10',
                    'Submitted-8',
                    'Pending-2',
                    'ABC',
                    'XYZ',
                    'PQR',
                    'MNO',
                    'JPO',
                    'ABC',
                    'LMP',
                    'UTT',
                  ].map((exam, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                        {exam}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Scrollbar>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => router.push('/academic/homework-assignment-management')}
              >
                View Full Assignment
              </Button>
            </Box>
          </Card>
        </Grid2>

        <Grid2 xs={12}>
          <Typography component="span" variant="h6" gutterBottom>
            Class Timetable Management
          </Typography>
          <Button startIcon={<Add />} variant="contained" sx={{ marginLeft: '750px' }}>
            Add Class
          </Button>
          <CalendarView />
        </Grid2>
        <Grid2 xs={12}>
          <Typography component="span" variant="h6" gutterBottom>
            Assignments Management
          </Typography>
          <Button variant="contained" sx={{ marginLeft: '700px' }}>
            Create New Assignment
          </Button>
          <CustomizableTable
            columns={[
              { id: 'assignmentTitle', label: 'Assignment Title' },
              { id: 'class', label: 'Class' },
              { id: 'dueDate', label: 'Due Date' },
              {
                id: 'status',
                label: 'Status',
                render(value, row) {
                  return (
                    <Label
                      variant="soft"
                      color={
                        value === 'Pending'
                          ? 'warning'
                          : value === 'Overdue'
                            ? 'error'
                            : value === 'Submitted'
                              ? 'success'
                              : 'default'
                      }
                    >
                      {value}
                    </Label>
                  );
                },
              },
            ]}
            data={[
              {
                assignmentTitle: 'Assignment 1',
                class: 'Class 1',
                dueDate: '2021-01-01',
                status: 'Pending',
              },
              {
                assignmentTitle: 'Assignment 2',
                class: 'Course 2',
                dueDate: '2021-01-01',
                status: 'Submitted',
              },
              {
                assignmentTitle: 'Assignment 3',
                class: 'Course 3',
                dueDate: '2021-01-01',
                status: 'Overdue',
              },
              {
                assignmentTitle: 'Assignment 2',
                class: 'Course 2',
                dueDate: '2021-01-01',
                status: 'Submitted',
              },
              {
                assignmentTitle: 'Assignment 1',
                class: 'Class 1',
                dueDate: '2021-01-01',
                status: 'Pending',
              },
            ]}
          />
        </Grid2>
        <Grid2 xs={12} md={6}>
          <Card
            sx={{
              display: 'flex',
              p: 3,
              height: '100%',
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography component="span" variant="h6">
                  Exam Schedule
                </Typography>
                <Button variant="contained">Create New Exam</Button>
              </Box>
              <Scrollbar sx={{ height: '290px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                    mt: 2,
                  }}
                >
                  {[
                    'Subject - Math',
                    'Date - 01-01-2024',
                    'Teacher - XYZ',
                    'ABC',
                    'XYZ',
                    'PQR',
                    'MNO',
                    'JPO',
                    'ABC',
                    'LMP',
                    'UTT',
                    'SER',
                    'JHG',
                    'SWE',
                    'GFR',
                  ].map((exam, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                        {exam}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Scrollbar>
            </Box>
          </Card>
        </Grid2>
        <Grid2 xs={12} md={6}>
          <Card sx={{ p: 3, alignItems: 'center' }}>
            <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
              <CustomSelect
                label="Class"
                options={classData?.items || []}
                value={classes2}
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  setClasses2(val as string);
                }}
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
              data={[
                {
                  classObject: '10/Math',
                  averageScore: 50,
                  topPerformer: 'XYZ',
                  failingStudents: 50,
                },
                {
                  classObject: '9/Math',
                  averageScore: 40,
                  topPerformer: 'ABC',
                  failingStudents: 50,
                },
                {
                  classObject: '11/Math',
                  averageScore: 60,
                  topPerformer: 'XYZP',
                  failingStudents: 50,
                },
                {
                  classObject: '14/Math',
                  averageScore: 80,
                  topPerformer: 'PQR',
                  failingStudents: 60,
                },
              ]}
            />
          </Card>
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
            sx={{ height: '100%' }}
          />
        </Grid2>
        <Grid2 xs={12} md={6}>
          <Card
            sx={{
              alignItems: 'center',
              p: 3,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
              <CustomSelect
                options={classData?.items || []}
                value={classes3}
                onChange={(val) => {
                  setClasses3(val as string);
                }}
                label="Class"
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
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
          </Card>
        </Grid2>
        <Grid2 xs={12}>
          <Typography component="span" variant="h6" gutterBottom>
            Reports & Analytics
          </Typography>
        </Grid2>
        <Grid2 xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography component="span" variant="h6" gutterBottom color="warning.main">
                Class Performance
              </Typography>
              <CustomSelect
                label="class"
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                options={classData?.items || []}
                value={classes4}
                onChange={(val) => {
                  setClasses4(val as string);
                }}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Scrollbar sx={{ mt: 1.5, height: '120px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                  }}
                >
                  {[
                    'Math is Excellent',
                    'English is weak',
                    'ABC',
                    'XYZ',
                    'PQR',
                    'MNO',
                    'JPO',
                    'ABC',
                    'LMP',
                    'UTT',
                  ].map((exam, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                        {exam}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Scrollbar>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              justifyContent="flex-end"
              sx={{ mt: 2 }}
            >
              <Button variant="contained" size="small" color="primary">
                PDF
              </Button>
              <Button variant="contained" size="small" color="error">
                CSV
              </Button>
            </Box>
          </Card>
        </Grid2>
        <Grid2 xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography component="span" variant="h6" gutterBottom color="error.main">
                Attendance Report
              </Typography>
              <CustomSelect
                label="class"
                options={classData?.items || []}
                value={classes5}
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  setClasses5(val as string);
                }}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Scrollbar sx={{ mt: 1.5, height: '120px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                  }}
                >
                  {['Attendance 80 %', 'ABC', 'XYZ', 'PQR', 'MNO', 'JPO', 'ABC', 'LMP', 'UTT'].map(
                    (exam, index) => (
                      <Box component="li" key={index} sx={{ mb: 1 }}>
                        <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                          {exam}
                        </Button>
                      </Box>
                    )
                  )}
                </Box>
              </Scrollbar>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              justifyContent="flex-end"
              sx={{ mt: 2 }}
            >
              <Button variant="contained" size="small" color="primary">
                PDF
              </Button>
              <Button variant="contained" size="small" color="error">
                CSV
              </Button>
            </Box>
          </Card>
        </Grid2>
        <Grid2 xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.success.mainChannel, 0.1),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography component="span" variant="h6" gutterBottom color="success.main">
                Exam Result
              </Typography>
              <CustomSelect
                label="class"
                options={classData?.items || []}
                value={classes6}
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  setClasses6(val as string);
                }}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Box component="ul" sx={{ pl: 2, listStyleType: 'disc' }}>
                <Scrollbar sx={{ mt: 1.5, height: '300px' }}>
                  <Box
                    component="ul"
                    sx={{
                      listStyle: 'none',
                      padding: 0,
                    }}
                  >
                    {[
                      'Pass - 20',
                      'Fail - 05',
                      'ABC',
                      'XYZ',
                      'PQR',
                      'MNO',
                      'JPO',
                      'ABC',
                      'LMP',
                      'UTT',
                    ].map((exam, index) => (
                      <Box component="li" key={index} sx={{ mb: 1 }}>
                        <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                          {exam}
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Scrollbar>
              </Box>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              justifyContent="flex-end"
              sx={{ mt: 2 }}
            >
              <Button variant="contained" size="small" color="primary">
                Scorecards
              </Button>
              <Button variant="contained" size="small" color="error">
                Grade Distribution
              </Button>
            </Box>
          </Card>
        </Grid2>
        <Grid2 xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.1),
            }}
          >
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
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default AcademicDashboardScreen;
