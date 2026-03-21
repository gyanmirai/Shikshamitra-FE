import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import { studentPaths } from 'src/constants/student-menu';
import CustomizableTable from 'src/components/customizable-table';
import {
  Box,
  Card,
  Grid,
  Stack,
  Avatar,
  Button,
  MenuItem,
  TextField,
  CardHeader,
  Typography,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
// ----------------------------------------------------------------------

const upcomingExams = [
  {
    id: 1,
    time: '9:00AM - 10:00AM',
    date: '2025-06-10T09:00:00', // ISO format for countdown
    displayDate: '10-07-2026',
    details: 'Mathematics Entrance Exam',
    type: 'Entrance',
    status: 'Scheduled',
    students: 101,
  },
  {
    id: 2,
    time: '10:00AM - 11:00AM',
    date: '2025-06-10T10:00:00',
    displayDate: '10-07-2026',
    details: 'Science Placement Test',
    type: 'Internal',
    status: 'Scheduled',
    students: 102,
  },
  {
    id: 3,
    time: '11:00AM - 12:00PM',
    date: '2025-06-10T11:00:00',
    displayDate: '10-07-2026',
    details: 'English Proficiency',
    type: 'Entrance',
    status: 'Completed',
    students: 103,
  },
  {
    id: 4,
    time: '11:00AM - 12:00PM',
    date: '2025-06-10T11:00:00',
    displayDate: '10-07-2026',
    details: 'English Proficiency',
    type: 'Entrance',
    status: 'Completed',
    students: 103,
  },
];

// Countdown Helper

// ----------------------------------------------------------------------

const studentEnrollment = [
  {
    id: 1,
    name: 'Aarav Kumar',
    class: 'Class 5',
    section: 'Division A',
    enrollmentDate: '06-06-2025',
    status: 'Documents Pending',
    avatarUrl: '/assets/images/avatars/avatar_1.jpg',
  },
  {
    id: 2,
    name: 'Ananya Sharma',
    class: 'Class 3',
    section: 'Division B',
    enrollmentDate: '05-06-2025',
    status: 'Enrolled',
    avatarUrl: '/assets/images/avatars/avatar_2.jpg',
  },
  {
    id: 3,
    name: 'Rohan Patel',
    class: 'Class 4',
    section: 'Division A',
    enrollmentDate: '04-06-2025',
    status: 'In Progress',
    avatarUrl: '/assets/images/avatars/avatar_3.jpg',
  },
  {
    id: 4,
    name: 'Ishaan Gupta',
    class: 'Class 2',
    section: 'Division C',
    enrollmentDate: '03-06-2025',
    status: 'Rejected',
    avatarUrl: '/assets/images/avatars/avatar_4.jpg',
  },
];

export enum EntranceExamStatusType {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
}

export const EntranceExamStatusOptions = [
  {
    label: 'Scheduled',
    value: EntranceExamStatusType.Scheduled,
  },
  {
    label: 'Completed',
    value: EntranceExamStatusType.Completed,
  },
];

export const EntranceExamStatusTypeColors = {
  [EntranceExamStatusType.Scheduled]: 'warning',
  [EntranceExamStatusType.Completed]: 'success',
};

const AdminLists = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openViewAll, setOpenViewAll] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const [loadingId, setLoadingId] = useState<number | null>(null);

  const examColumns: any[] = [
    { id: 'details', label: 'Exam Name', align: 'left' },
    { id: 'displayDate', label: 'Date', align: 'left', type: 'date', filterType: 'date' },
    { id: 'time', label: 'Time', align: 'left', filterType: 'time' },
    {
      id: 'type',
      label: 'Type',
      align: 'left',
      render: (value: string) => (
        <Label variant="soft" color={value === 'Entrance' ? 'info' : 'warning'}>
          {value}
        </Label>
      ),
    },
    { id: 'students', label: 'Registered', align: 'left' },
    {
      id: 'status',
      label: 'Status',
      align: 'left',
      filterType: 'enum',
      enumOptions: EntranceExamStatusOptions,
      render: (value: string) => (
        <Label variant="soft" color={value === 'Completed' ? 'success' : 'warning'}>
          {value}
        </Label>
      ),
    },
  ];

  const filteredEnrollments = studentEnrollment.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          sx={{
            borderRadius: 2,
            height: 480,
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
              transition: 'all 0.3s ease-in-out',
            },
          }}
        >
          <CardHeader
            title="Upcoming & Recent Exams"
            titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            action={
              <Button
                size="small"
                onClick={() => setOpenViewAll(true)}
                color="inherit"
                endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
                sx={{ fontWeight: 600, color: 'text.secondary' }}
              >
                View all
              </Button>
            }
            sx={{ pb: 0, flexShrink: 0, mt: -1, ml: -1 }}
          />

          <Scrollbar sx={{ p: 1, flexGrow: 1 }}>
            <Stack spacing={1} sx={{ pb: 1 }}>
              {upcomingExams.map((exam) => (
                <Box
                  key={exam.id}
                  onClick={() => {
                    setLoadingId(exam.id);
                    router.push(studentPaths.enrollment.entranceExam);
                  }}
                  sx={{
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    position: 'relative',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'transparent',
                      bgcolor: 'background.neutral',
                      transform: 'scale(1.02)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loadingId === exam.id && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (t) => t.vars.palette.background.paper,
                        opacity: 0.8,
                        backdropFilter: 'blur(2px)',
                        borderRadius: 1.5,
                      }}
                    >
                      <CircularProgress size={24} color="primary" />
                    </Box>
                  )}
                  <Box
                    sx={{
                      width: 4,
                      height: 48,
                      borderRadius: 0.5,
                      bgcolor: exam.status === 'Completed' ? 'success.main' : 'warning.main',
                      flexShrink: 0,
                    }}
                  />

                  <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontSize: '0.925rem' }}>
                          {exam.details}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {exam.students} Students Registered
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mt: 1, flexWrap: 'wrap' }}
                    >
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
                        {exam.displayDate}
                      </Box>
                      <Label variant="soft" color={exam.type === 'Entrance' ? 'info' : 'warning'}>
                        {exam.type}
                      </Label>
                    </Stack>
                  </Box>

                  {/* Eye Icon positioned at top-right */}
                </Box>
              ))}
            </Stack>
          </Scrollbar>
        </Card>
      </Grid>

      {/* Student Enrollment */}
      <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
        <Card
          sx={{
            boxShadow: theme.shadows[2],
            borderRadius: 2,
            height: 480,
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
              transition: 'all 0.3s ease-in-out',
            },
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 3, pb: 2, flexShrink: 0 }}
          >
            <CardHeader
              title="Student Enrollment"
              subheader="Recent applications"
              sx={{ p: 0, width: '100%', mb: { xs: 2, sm: 0 }, mt: -1, ml: -1 }}
            />

            <Stack direction="row" spacing={1} sx={{ width: 350, flexShrink: 0 }}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:magnify" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                size="small"
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setStatusFilter(e.target.value)
                }
                sx={{ width: 130, flexShrink: 0 }}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Enrolled">Enrolled</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Documents Pending">Pending</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
            </Stack>
          </Stack>

          <Scrollbar sx={{ pt: 0, flexGrow: 1 }}>
            <Stack spacing={1} sx={{ p: 1 }}>
              {filteredEnrollments.map((student) => (
                <Box
                  key={student.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'transparent',
                      bgcolor: 'background.neutral',
                      transform: 'scale(1.02)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={student.avatarUrl}
                      alt={student.name}
                      sx={{ width: 48, height: 48 }}
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
                    </Box>
                  </Stack>

                  <Stack alignItems="flex-end" spacing={0.5}>
                    <Label
                      color={
                        student.status === 'Enrolled'
                          ? 'success'
                          : student.status === 'In Progress'
                            ? 'info'
                            : student.status === 'Rejected'
                              ? 'error'
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
              ))}

              {filteredEnrollments.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography>No students found</Typography>
                </Box>
              )}
            </Stack>
          </Scrollbar>
        </Card>
      </Grid>

      <CustomDialog
        open={openViewAll}
        handleClose={() => setOpenViewAll(false)}
        title="Upcoming & Recent Exams"
        maxWidth="lg"
      >
        <CustomizableTable
          columns={examColumns}
          data={upcomingExams}
          tableId="upcoming-exams-table"
          isSearch={false}
          isFilter
          isPagination={false}
          wrapperProps={{ sx: { height: '60vh' }, padding: 1 }}
        />
      </CustomDialog>
    </Grid>
  );
};

export default AdminLists;
