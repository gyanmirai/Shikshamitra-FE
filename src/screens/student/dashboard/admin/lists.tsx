import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Card, Stack, Button, Avatar, CardHeader, Typography } from '@mui/material';

const upcomingExams = [
  {
    id: 1,
    time: '9:00 to 10:00',
    date: 'June 10, 2024',
    details: 'Exam for 101 Students 20',
  },
  {
    id: 2,
    time: '10:00 to 11:00',
    date: 'June 10, 2024',
    details: 'Exam for 102 Students 20',
  },
  {
    id: 3,
    time: '11:00 to 12:00',
    date: 'June 10, 2024',
    details: 'Exam for 103 Students 20',
  },
];

const studentEnrollment = [
  {
    id: 1,
    name: 'Aarav Kumar',
    class: 'Class 5',
    section: 'Section A',
    enrollmentDate: '06-06-2024',
    status: 'Documents Pending',
    avatarUrl: '/assets/images/avatars/avatar_1.jpg',
    statusColor: 'warning.main',
    statusBg: 'warning.lighter',
  },
  {
    id: 2,
    name: 'Ananya Sharma',
    class: 'Class 3',
    section: 'Section B',
    enrollmentDate: '05-06-2024',
    status: 'Enrolled',
    avatarUrl: '/assets/images/avatars/avatar_2.jpg',
    statusColor: 'success.main',
    statusBg: 'success.lighter',
  },
  {
    id: 3,
    name: 'Rohan Patel',
    class: 'Class 4',
    section: 'Section A',
    enrollmentDate: '04-06-2024',
    status: 'In Progress',
    avatarUrl: '/assets/images/avatars/avatar_3.jpg',
    statusColor: 'info.main',
    statusBg: 'info.lighter',
  },
];

const AdminLists = () => (
  <Grid container spacing={3}>
    {/* Upcoming Entrance Exam */}
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardHeader
          title="Upcoming Entrance Exam"
          action={
            <Button
              size="small"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            >
              View all upcoming exams
            </Button>
          }
        />
        <Stack spacing={2} sx={{ p: 3 }}>
          {upcomingExams.map((exam) => (
            <Box
              key={exam.id}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="subtitle2">{exam.time}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Date: {exam.date} - {exam.details}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Card>
    </Grid>

    {/* Student Enrollment */}
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardHeader
          title="Student Enrollment"
          subheader="New students joining the school"
          action={
            <Button
              size="small"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            >
              View All Students
            </Button>
          }
        />
        <Stack spacing={2} sx={{ p: 3 }}>
          {studentEnrollment.map((student) => (
            <Box
              key={student.id}
              sx={{
                p: 2,
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={student.avatarUrl} alt={student.name} />
                <Box>
                  <Typography variant="subtitle2">{student.name}</Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
                  >
                    {student.class} - {student.section}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Label
                      color={
                        student.status === 'Enrolled'
                          ? 'success'
                          : student.status === 'In Progress'
                            ? 'info'
                            : 'warning'
                      }
                    >
                      {student.status}
                    </Label>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Enrolled: {student.enrollmentDate}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Iconify
                icon="mdi:account-school-outline"
                width={20}
                sx={{ color: 'text.secondary' }}
              />
            </Box>
          ))}
        </Stack>
      </Card>
    </Grid>
  </Grid>
);

export default AdminLists;
