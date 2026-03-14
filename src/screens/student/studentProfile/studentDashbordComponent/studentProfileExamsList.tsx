import React, { useState } from 'react';
// import { useRouter } from 'src/routes/hooks';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Stack, Button, CardHeader, Typography, CircularProgress } from '@mui/material';

// ----------------------------------------------------------------------

const upcomingExams = [
  {
    id: 1,
    time: '09:00 AM - 10:30 AM',
    date: '15-01-2025',
    displayDate: '15-01-2025',
    details: 'Mathematics Final Exam',
    type: 'Final',
    status: 'Completed',
    room: 'Room 302',
  },
  {
    id: 2,
    time: '10:00 AM - 11:30 AM',
    date: '10-06-2025',
    displayDate: '10-06-2025',
    details: 'Science Placement Test',
    type: 'Entrance',
    status: 'Scheduled',
    room: 'Lab 1',
  },
  {
    id: 3,
    time: '11:00 AM - 12:30 PM',
    date: '12-06-2025',
    displayDate: '12-06-2025',
    details: 'English Proficiency',
    type: 'Internal',
    status: 'Scheduled',
    room: 'Hall A',
  },
  {
    id: 4,
    time: '09:00 AM - 12:00 PM',
    date: '15-06-2025',
    displayDate: '15-06-2025',
    details: 'Gujarati Literature',
    type: 'Final',
    status: 'Scheduled',
    room: 'Room 105',
  },
];

const StudentExamsList = () => {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [openViewAll, setOpenViewAll] = useState(false);

  // Mock navigation or action
  const handleItemClick = (id: number) => {
    setLoadingId(id);
    // Simulate navigation format
    setTimeout(() => {
      setLoadingId(null);
      // router.push(studentPaths.enrollment.entranceExam);
    }, 500);
  };

  // Define columns for the table
  const columns: any[] = [
    { id: 'details', label: 'Exam Name', align: 'left' },
    {
      id: 'displayDate',
      label: 'Date',
      align: 'left',
      render: (value: string) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{value}</Box>
      ),
    },
    {
      id: 'time',
      label: 'Time',
      align: 'left',
      render: (value: string) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{value}</Box>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      align: 'left',
      render: (value: string) => (
        <Label
          variant="soft"
          color={value === 'Entrance' ? 'info' : value === 'Internal' ? 'primary' : 'warning'}
        >
          {value}
        </Label>
      ),
    },
    { id: 'room', label: 'Room', align: 'left' },
    {
      id: 'status',
      label: 'Status',
      align: 'left',
      filterType: 'enum',
      enumOptions: [
        { label: 'Scheduled', value: 'Scheduled' },
        { label: 'Completed', value: 'Completed' },
      ],
      render: (value: string) => (
        <Label variant="soft" color={value === 'Completed' ? 'success' : 'warning'}>
          {value}
        </Label>
      ),
    },
  ];

  return (
    <Card
      sx={{
        borderRadius: 2,
        height: 480,
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <CardHeader
        title="Upcoming & Recent Exams"
        titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
        action={
          <Button
            size="small"
            color="inherit"
            onClick={() => setOpenViewAll(true)}
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            View all
          </Button>
        }
        sx={{ pb: 0, flexShrink: 0, mt: -1, ml: -1, mb: 2 }} // Adjusted spacing to match Admin layout
      />

      <Scrollbar sx={{ p: 1, flexGrow: 1, mb: 2 }}>
        <Stack spacing={1}>
          {upcomingExams.map((exam) => (
            <Box
              key={exam.id}
              onClick={() => handleItemClick(exam.id)}
              sx={{
                p: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
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
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(2px)',
                    borderRadius: 1.5,
                  }}
                >
                  <CircularProgress size={24} color="primary" />
                </Box>
              )}

              {/* Status Bar */}
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
                      {exam.room}
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
                  <Label
                    variant="soft"
                    color={
                      exam.type === 'Entrance'
                        ? 'info'
                        : exam.type === 'Internal'
                          ? 'primary'
                          : 'warning'
                    }
                  >
                    {exam.type}
                  </Label>
                </Stack>
              </Box>
            </Box>
          ))}
        </Stack>
      </Scrollbar>

      <CustomDialog
        open={openViewAll}
        handleClose={() => setOpenViewAll(false)}
        title="Upcoming & Recent Exams"
        maxWidth="lg"
      >
        <CustomizableTable
          columns={columns}
          data={upcomingExams} // Use correct data source
          tableId="upcoming-exams-table"
          isSearch={false}
          isFilter
          isPagination={false}
          wrapperProps={{ sx: { height: '60vh' }, padding: 1 }}
        />
      </CustomDialog>
    </Card>
  );
};

export default StudentExamsList;
