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
  <Grid container spacing={1}>
    {/* Upcoming Entrance Exam */}
    <Grid size={{ xs: 12 }}>
      <Card sx={{ boxShadow: (theme) => theme.shadows[2], borderRadius: 2 }}>
        <CardHeader
          title="Upcoming Entrance Exam"
          titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
          action={
            <Button
              size="small"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
              sx={{ fontWeight: 600, color: 'text.secondary' }}
            >
              View all
            </Button>
          }
          sx={{ pb: 0 }}
        />
        <Stack spacing={2.5} sx={{ p: 3 }}>
          {upcomingExams.map((exam) => (
            <Box
              key={exam.id}
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 56,
                  height: 56,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  flexShrink: 0,
                }}
              >
                <Iconify icon="mdi:calendar-clock" width={24} sx={{ color: 'primary.main' }} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontSize: '0.925rem' }}>
                  {exam.details}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                      typography: 'caption',
                    }}
                  >
                    <Iconify icon="mdi:clock-outline" width={16} sx={{ mr: 0.5 }} />
                    {exam.time}
                  </Box>
                  <Box
                    sx={{ width: 4, height: 4, bgcolor: 'text.disabled', borderRadius: '50%' }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                      typography: 'caption',
                    }}
                  >
                    <Iconify icon="mdi:calendar-blank-outline" width={16} sx={{ mr: 0.5 }} />
                    {exam.date}
                  </Box>
                </Stack>
              </Box>
            </Box>
          ))}
        </Stack>
      </Card>
    </Grid>

    {/* Student Enrollment */}
    <Grid size={{ xs: 12 }}>
      <Card sx={{ boxShadow: (theme) => theme.shadows[2], borderRadius: 2 }}>
        <CardHeader
          title="Student Enrollment"
          subheader="New students joining the school"
          titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
          subheaderTypographyProps={{ variant: 'body2', sx: { mt: 0.5 } }}
          action={
            <Button
              size="small"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
              sx={{ fontWeight: 600, color: 'text.secondary' }}
            >
              View All
            </Button>
          }
          sx={{ pb: 0 }}
        />
        <Stack spacing={2} sx={{ p: 3 }}>
          {studentEnrollment.map((student) => (
            <Box
              key={student.id}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.light',
                  bgcolor: (theme) => theme.palette.action.hover,
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={student.avatarUrl}
                  alt={student.name}
                  sx={{ width: 48, height: 48, boxShadow: (theme) => theme.customShadows?.z8 || 1 }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {student.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      mt: 0.5,
                      gap: 1,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ bgcolor: 'action.selected', px: 0.75, py: 0.25, borderRadius: 0.5 }}
                    >
                      {student.class}
                    </Box>
                    <span>•</span>
                    <span>{student.section}</span>
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Label
                      color={
                        student.status === 'Enrolled'
                          ? 'success'
                          : student.status === 'In Progress'
                            ? 'info'
                            : 'warning'
                      }
                      variant="soft"
                    >
                      {student.status}
                    </Label>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {student.enrollmentDate}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Iconify icon="mdi:chevron-right" width={20} sx={{ color: 'text.disabled' }} />
            </Box>
          ))}
        </Stack>
      </Card>
    </Grid>
  </Grid>
);

export default AdminLists;
