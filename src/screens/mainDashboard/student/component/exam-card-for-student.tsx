import React from 'react';

import { Box, Card, Typography, CardContent } from '@mui/material'; // Example icon, replace if needed
import { Iconify } from 'src/components/iconify';

// Define the Exam Interface
interface Exam {
  subject: string;
  date: string;
  class: string;
  room: string;
}

// Define Props for UpcomingExamCard
interface UpcomingExamCardProps {
  exams: Exam[];
}

const UpcomingExamCard: React.FC<UpcomingExamCardProps> = ({ exams }) => (
  <Card sx={{ height: '100%', p: 2 }}>
    <Typography variant="h6" mb={2}>
      Upcoming Exams
    </Typography>
    <CardContent sx={{ p: 0 }}>
      {exams.slice(0, 4).map((exam, index) => (
        <Box key={index} display="flex" alignItems="center" justifyContent="space-between" p={1}>
          <Box display="flex" alignItems="center">
            <Iconify
              icon="healthicons:i-exam-multiple-choice2x-outline"
              height={44}
              width={44}
              color="#c6892c"
              mr="8px"
            />

            <Box>
              <Typography fontSize={16} fontWeight="bold">
                {exam.subject}
              </Typography>
              <Typography fontSize={14} color="textSecondary">
                {exam.date} - {exam.class} - Room {exam.room}
              </Typography>
            </Box>
          </Box>
        </Box>
      ))}
    </CardContent>
  </Card>
);

export default UpcomingExamCard;
