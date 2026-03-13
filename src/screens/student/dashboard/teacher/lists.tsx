import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Grid, Card, Stack, Button, Avatar, CardHeader, Typography } from '@mui/material';

const upcomingExams = [
  {
    id: 1,
    subject: 'Mathematics',
    date: 'June 15, 2024',
    time: '9:00 AM - 11:00 AM',
    class: 'Class 5A',
    status: 'Scheduled',
  },
  {
    id: 2,
    subject: 'Science',
    date: 'June 18, 2024',
    time: '10:00 AM - 12:00 PM',
    class: 'Class 5A',
    status: 'Scheduled',
  },
  {
    id: 3,
    subject: 'English',
    date: 'June 20, 2024',
    time: '9:00 AM - 11:00 AM',
    class: 'Class 5A',
    status: 'Scheduled',
  },
];

const absentStudents = [
  {
    id: 1,
    name: 'Rahul Verma',
    class: 'Class 5A',
    reason: 'Sick Leave',
    date: 'Today',
    status: 'Absent',
    statusColor: 'error.main',
    statusBg: 'error.lighter',
    avatarUrl: '/assets/images/avatars/avatar_10.jpg',
  },
  {
    id: 2,
    name: 'Priya Singh',
    class: 'Class 5A',
    reason: 'Family Function',
    date: 'Today',
    status: 'Leave',
    statusColor: 'warning.main',
    statusBg: 'warning.lighter',
    avatarUrl: '/assets/images/avatars/avatar_11.jpg',
  },
  {
    id: 3,
    name: 'Amit Kumar',
    class: 'Class 5A',
    reason: 'Unknown',
    date: 'Today',
    status: 'Absent',
    statusColor: 'error.main',
    statusBg: 'error.lighter',
    avatarUrl: '/assets/images/avatars/avatar_12.jpg',
  },
];

const TeacherLists = () => {
  const [openExamsDialog, setOpenExamsDialog] = useState(false);
  const [openStudentsDialog, setOpenStudentsDialog] = useState(false);
  // Table columns for exams
  const examColumns: any[] = [
    { id: 'subject', label: 'Subject', align: 'left' },
    { id: 'date', label: 'Date', align: 'left' },
    { id: 'time', label: 'Time', align: 'left' },
    { id: 'class', label: 'Class', align: 'left' },
    {
      id: 'status',
      label: 'Status',
      align: 'left',
      render: (value: string) => (
        <Label variant="soft" color={value === 'Completed' ? 'success' : 'warning'}>
          {value}
        </Label>
      ),
    },
  ];

  // Table columns for absent students
  const studentColumns: any[] = [
    {
      id: 'name',
      label: 'Student Name',
      align: 'left',
      render: (value: string, row: any) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={row.avatarUrl} alt={value} sx={{ width: 40, height: 40 }} />
          <Typography variant="subtitle2">{value}</Typography>
        </Stack>
      ),
    },
    { id: 'class', label: 'Class', align: 'left' },
    { id: 'reason', label: 'Reason', align: 'left' },
    { id: 'date', label: 'Date', align: 'left' },
    {
      id: 'status',
      label: 'Status',
      align: 'left',
      render: (value: string) => (
        <Label variant="soft" color={value === 'Absent' ? 'error' : 'warning'}>
          {value}
        </Label>
      ),
    },
  ];

  return (
    <>
      <Grid container spacing={1}>
        {/* Upcoming Exams */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Upcoming Exams"
              action={
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setOpenExamsDialog(true)}
                  endIcon={
                    <Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />
                  }
                >
                  View all exams
                </Button>
              }
            />
            <Stack spacing={2} sx={{ p: 1 }}>
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
                    <Typography variant="subtitle2">{exam.subject}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {exam.date} | {exam.time}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {exam.class}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Absent Students */}
        <Grid size={{ xs: 12 }} sx={{ mb: 1 }}>
          <Card>
            <CardHeader
              title="Absent Students Today"
              subheader="Track student attendance"
              action={
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setOpenStudentsDialog(true)}
                  endIcon={
                    <Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />
                  }
                >
                  View All
                </Button>
              }
            />
            <Stack spacing={2} sx={{ p: 1 }}>
              {absentStudents.map((student) => (
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
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Label color={student.status === 'Absent' ? 'error' : 'warning'}>
                          {student.status}
                        </Label>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {student.reason}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Iconify
                    icon="eva:person-delete-outline"
                    width={20}
                    sx={{ color: 'error.main' }}
                  />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Exams Dialog */}
      <CustomDialog
        open={openExamsDialog}
        handleClose={() => setOpenExamsDialog(false)}
        title="Upcoming Exams"
        maxWidth="lg"
      >
        <CustomizableTable
          columns={examColumns}
          data={upcomingExams}
          tableId="upcoming-exams-table"
          isSearch={false}
          isFilter={false}
          isPagination={false}
          wrapperProps={{ sx: { height: '60vh' }, padding: 1 }}
        />
      </CustomDialog>

      {/* Absent Students Dialog */}
      <CustomDialog
        open={openStudentsDialog}
        handleClose={() => setOpenStudentsDialog(false)}
        title="Absent Students Today"
        maxWidth="lg"
      >
        <CustomizableTable
          columns={studentColumns}
          data={absentStudents}
          tableId="absent-students-table"
          isSearch={false}
          isFilter={false}
          isPagination={false}
          wrapperProps={{ sx: { height: '60vh' }, padding: 1 }}
        />
      </CustomDialog>
    </>
  );
};

export default TeacherLists;
