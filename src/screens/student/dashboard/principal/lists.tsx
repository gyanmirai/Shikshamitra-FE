import { Iconify } from 'src/components/iconify';
import { Box, Grid, Card, Stack, Button, Avatar, CardHeader, Typography } from '@mui/material';

const topPerformers = [
  {
    id: 1,
    name: 'Aarav Patel',
    class: 'Class 5',
    score: '98%',
    avatarUrl: '/assets/images/avatars/avatar_4.jpg',
  },
  {
    id: 2,
    name: 'Ishita Sharma',
    class: 'Class 4',
    score: '97%',
    avatarUrl: '/assets/images/avatars/avatar_5.jpg',
  },
  {
    id: 3,
    name: 'Rohan Gupta',
    class: 'Class 5',
    score: '96%',
    avatarUrl: '/assets/images/avatars/avatar_6.jpg',
  },
];

const studentLeaveRequests = [
  {
    id: 1,
    name: 'Aarav Sharma',
    class: 'Class 5A',
    leaveType: 'Medical Leave',
    reason: 'Fever',
    date: 'Today',
    status: 'Approved',
    statusColor: 'success.main',
    statusBg: 'success.lighter',
    avatarUrl: '/assets/images/avatars/avatar_7.jpg',
  },
  {
    id: 2,
    name: 'Diya Patel',
    class: 'Class 4B',
    leaveType: 'Casual Leave',
    reason: 'Family Function',
    date: 'Today',
    status: 'Rejected',
    statusColor: 'error.main',
    statusBg: 'error.lighter',
    avatarUrl: '/assets/images/avatars/avatar_8.jpg',
  },
  {
    id: 3,
    name: 'Rahul Gupta',
    class: 'Class 3C',
    leaveType: 'Sick Leave',
    reason: 'Doctor Appointment',
    date: 'Today',
    status: 'Approved',
    statusColor: 'success.main',
    statusBg: 'success.lighter',
    avatarUrl: '/assets/images/avatars/avatar_9.jpg',
  },
];

const PrincipalLists = () => (
  <Grid container spacing={1}>
    {/* Top Performers */}
    <Grid size={{ xs: 12, md: 6 }}>
      <Card>
        <CardHeader
          title="Top Performers"
          action={
            <Button
              size="small"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            >
              View all
            </Button>
          }
        />
        <Stack spacing={1} sx={{ p: 1 }}>
          {topPerformers.map((student) => (
            <Box
              key={student.id}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={student.avatarUrl} alt={student.name} />
                <Box>
                  <Typography variant="subtitle2">{student.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {student.class}
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
                {student.score}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Card>
    </Grid>

    {/* Approved/Rejected Leave Today */}
    <Grid size={{ xs: 12, md: 6 }}>
      <Card>
        <CardHeader
          title="Approved/Rejected Leave Today"
          subheader="Student leave requests for today"
          action={
            <Button
              size="small"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            >
              View All Requests
            </Button>
          }
        />
        <Stack spacing={2} sx={{ p: 3 }}>
          {studentLeaveRequests.map((request) => (
            <Box
              key={request.id}
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
                <Avatar src={request.avatarUrl} alt={request.name} />
                <Box>
                  <Typography variant="subtitle2">{request.name}</Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
                  >
                    {request.class}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: request.statusBg,
                        color: request.statusColor,
                        fontWeight: 'bold',
                      }}
                    >
                      {request.status}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {request.leaveType} | {request.reason}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Iconify
                icon={request.status === 'Approved' ? 'mdi:check-circle' : 'mdi:close-circle'}
                width={20}
                sx={{ color: request.statusColor }}
              />
            </Box>
          ))}
        </Stack>
      </Card>
    </Grid>
  </Grid>
);

export default PrincipalLists;
