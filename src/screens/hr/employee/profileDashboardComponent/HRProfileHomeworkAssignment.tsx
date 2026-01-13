import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Button, Typography } from '@mui/material';

const homeworks = [
  {
    title: 'Addition and Subtraction Practice',
    subject: 'Mathematics',
    className: '6',
    division: 'A',
    dueDate: '26-07-2025',
    type: 'homework',
    status: 0,
  },
  {
    title: 'Science Project: Plants',
    subject: 'Science',
    className: '6',
    division: 'B',
    dueDate: '27-07-2025',
    type: 'assignment',
    status: 0,
  },
  {
    title: 'English Essay Writing',
    subject: 'English',
    className: '7',
    division: 'C',
    dueDate: '28-07-2025',
    type: 'homework',
    status: 0,
  },
  {
    title: 'History Timeline Assignment',
    subject: 'History',
    className: '5',
    division: 'A',
    dueDate: '29-07-2025',
    type: 'assignment',
    status: 0,
  },
  {
    title: 'Geometry Shapes Homework',
    subject: 'Mathematics',
    className: '8',
    division: 'D',
    dueDate: '30-07-2025',
    type: 'homework',
    status: 0,
  },
];

const StudentHomeworkAssignments = () => (
  <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="h6" mb={2}>
        Homework & Assignments
      </Typography>
      <Button size="small" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}>
        View All Homework & Assignments
      </Button>
    </Box>

    <Stack spacing={1.5}>
      {homeworks.slice(0, 4).map((item, index) => (
        <HomeworkAssignmentCard key={index} {...item} />
      ))}
    </Stack>
  </Card>
);

export default StudentHomeworkAssignments;

interface HomeworkAssignmentCardProps {
  title: string;
  subject: string;
  className: string; // or number, depending on your app
  division: string;
  dueDate: string; // e.g., '26-07-2025', consider Date type if needed
  type: string; // e.g., 'View Details'
  status: number; // used for ScheduleExamStatus lookup
}

const HomeworkAssignmentCard: React.FC<HomeworkAssignmentCardProps> = ({
  title,
  subject,
  className,
  division,
  dueDate,
  type,
  status,
}) => (
  <Card
    sx={{
      p: 2,
      borderRadius: 1.5,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: 'none',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        bgcolor: 'background.neutral',
        borderColor: 'primary.light',
        cursor: 'pointer',
      },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1.5,
          bgcolor: 'primary.lighter',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon="fluent:book-24-filled" width={24} />
      </Box>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Iconify icon="solar:calendar-date-bold" width={14} />
          {dueDate} &bull; {subject}
        </Typography>
      </Box>
    </Stack>

    <Label
      variant="soft"
      color={type === 'homework' ? 'primary' : 'info'}
      sx={{ textTransform: 'uppercase', fontSize: 11 }}
    >
      {type}
    </Label>
  </Card>
);
