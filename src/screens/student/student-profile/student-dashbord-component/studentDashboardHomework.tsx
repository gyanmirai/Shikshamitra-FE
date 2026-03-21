import React, { useState } from 'react';
// import { useRouter } from 'src/routes/hooks';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Card, Stack, Button, CardHeader, Typography, CircularProgress } from '@mui/material';

// ----------------------------------------------------------------------

const homeworks = [
  {
    id: 1,
    title: 'Algebra Problem Set 3',
    subject: 'Mathematics',
    dueDate: '15-02-2026',
    displayDate: '15-02-2026',
    time: '11:59 PM',
    status: 'Pending',
    type: 'Assignment',
  },
  {
    id: 2,
    title: 'Lab Report: Photosynthesis',
    subject: 'Science',
    dueDate: '10-02-2026',
    displayDate: '10-02-2026',
    time: '10:00 AM',
    status: 'Submitted',
    type: 'Lab Report',
  },
  {
    id: 3,
    title: 'Shakespeare Essay Draft',
    subject: 'English',
    dueDate: '05-02-2026',
    displayDate: '05-02-2026',
    time: '04:00 PM',
    status: 'Overdue',
    type: 'Essay',
  },
  {
    id: 4,
    title: 'World War II Timeline',
    subject: 'History',
    dueDate: '20-02-2026',
    displayDate: '20-02-2026',
    time: '09:00 AM',
    status: 'Pending',
    type: 'Project',
  },
  {
    id: 5,
    title: 'World War II Timeline',
    subject: 'History',
    dueDate: '20-02-2026',
    displayDate: '20-02-2026',
    time: '09:00 AM',
    status: 'Pending',
    type: 'Project',
  },
];

const StudentHomeworkAssignments = () => {
  // const router = useRouter(); // Unused
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [openViewAll, setOpenViewAll] = useState(false);

  // Mock navigation or action
  const handleItemClick = (id: number) => {
    setLoadingId(id);
    // Simulate navigation format
    setTimeout(() => {
      setLoadingId(null);
      // router.push(studentPaths.homework.details(id));
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Overdue':
        return 'error';
      default:
        return 'info';
    }
  };

  // Define columns for the table
  const columns: any[] = [
    { id: 'title', label: 'Homework', align: 'left' },
    { id: 'subject', label: 'Subject', align: 'left' },
    {
      id: 'displayDate',
      label: 'Due Date',
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
      id: 'status',
      label: 'Status',
      align: 'left',
      render: (value: string) => (
        <Label variant="soft" color={getStatusColor(value)}>
          {value}
        </Label>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      align: 'left',
      render: (value: string) => (
        <Label variant="soft" color="info">
          {value}
        </Label>
      ),
    },
  ];

  return (
    <>
      <Card
        sx={{
          boxShadow: (theme) => theme.shadows[2],
          borderRadius: 2,
          height: 480,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardHeader
          title="Homework & Assignments"
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
          sx={{ pb: 0, flexShrink: 0, mt: -1, ml: -1, mb: 2 }}
        />

        <Scrollbar sx={{ p: 1, flexGrow: 1 }}>
          <Stack spacing={1}>
            {homeworks.map((item) => (
              <Box
                key={item.id}
                onClick={() => handleItemClick(item.id)}
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
                {loadingId === item.id && (
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
                    bgcolor: `${getStatusColor(item.status)}.main`,
                    flexShrink: 0,
                  }}
                />

                <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.925rem' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {item.subject}
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
                      <Iconify icon="mdi:calendar-clock-outline" width={16} sx={{ mr: 0.5 }} />
                      {item.displayDate}
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
                      <Iconify icon="mdi:clock-outline" width={16} sx={{ mr: 0.5 }} />
                      {item.time}
                    </Box>
                    <Label variant="soft" color={getStatusColor(item.status)}>
                      {item.status}
                    </Label>
                  </Stack>
                </Box>
              </Box>
            ))}
          </Stack>
        </Scrollbar>
      </Card>

      <CustomDialog
        open={openViewAll}
        handleClose={() => setOpenViewAll(false)}
        title="Homework & Assignments"
        maxWidth="lg"
      >
        <CustomizableTable
          columns={columns}
          data={homeworks}
          tableId="homework-assignments-table"
          isSearch={false}
          isFilter={false}
          isPagination={false}
          wrapperProps={{ sx: { height: '60vh' }, padding: 1 }}
        />
      </CustomDialog>
    </>
  );
};

export default StudentHomeworkAssignments;
