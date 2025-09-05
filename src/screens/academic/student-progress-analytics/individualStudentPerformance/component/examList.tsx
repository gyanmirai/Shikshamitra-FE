'use client';

import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Tooltip, Typography, CardContent } from '@mui/material';

type ExamStatus = 'Completed' | 'Upcoming' | 'In Progress';

interface Exam {
  name: string;
  status: ExamStatus;
  date: string;
  subject: string;
  teacherFeedback?: string;
}

// Sample exam data
const examsData: Exam[] = [
  {
    name: 'Midterm Mathematics',
    status: 'Completed',
    date: '2024-02-15',
    subject: 'Mathematics',
    teacherFeedback: 'Excellent performance',
  },
  {
    name: 'Science Practical',
    status: 'In Progress',
    date: '2024-02-20',
    subject: 'Science',
  },
  {
    name: 'English Literature Quiz',
    status: 'Upcoming',
    date: '2024-03-01',
    subject: 'English',
  },
];

// Helper function to get status color
const getExamColor = (status: string) => {
  const statusColors = {
    Completed: '#2E8B57', // green
    Upcoming: '#FFA500', // orange
    'In Progress': '#4169E1', // royal blue
  };
  return statusColors[status as keyof typeof statusColors] || 'inherit';
};

const ExamsList = () => {
  const theme = useTheme();
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  return (
    <Card
      sx={{
        borderRadius: 2,
        backgroundColor:
          theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
        height: '100%',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Exams List
          </Typography>
        </Box>
        <Box>
          <Scrollbar sx={{ height: '200px' }}>
            {examsData.map((exam, index) => (
              <Tooltip
                key={index}
                title={
                  <Box>
                    <Typography variant="body2">
                      <strong>Date:</strong> {exam.date}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: getExamColor(exam.status),
                        fontWeight: 'bold',
                      }}
                    >
                      Status: {exam.status}
                    </Typography>
                    {exam.teacherFeedback && (
                      <Typography variant="body2">
                        <strong>Teacher Feedback:</strong> {exam.teacherFeedback}
                      </Typography>
                    )}
                  </Box>
                }
                placement="right"
                arrow
              >
                <Card
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    borderLeft: `4px solid ${getExamColor(exam.status)}`,
                    '&:hover': {
                      boxShadow: theme.shadows[3],
                    },
                  }}
                  onClick={() => setSelectedExam(exam)}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: theme.spacing(1.5, 2),
                    }}
                  >
                    <Box>
                      <Typography variant="body2">{exam.name}</Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: getExamColor(exam.status),
                        fontWeight: 'bold',
                      }}
                    >
                      {exam.status}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            ))}
          </Scrollbar>
        </Box>

        {/* Optional: Detailed View Modal or Card */}
        {selectedExam && (
          <Card
            sx={{
              mt: 2,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedExam.name} Details
              </Typography>
              <Typography variant="body1">
                <strong>Subject:</strong> {selectedExam.subject}
              </Typography>
              <Typography variant="body1">
                <strong>Date:</strong> {selectedExam.date}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: getExamColor(selectedExam.status),
                  fontWeight: 'bold',
                }}
              >
                Status: {selectedExam.status}
              </Typography>
              {selectedExam.teacherFeedback && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Teacher Feedback:</strong> {selectedExam.teacherFeedback}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamsList;
