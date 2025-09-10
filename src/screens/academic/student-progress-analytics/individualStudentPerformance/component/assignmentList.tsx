'use client';

import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Tooltip, Typography, CardContent } from '@mui/material';

type AssignmentStatus = 'pending' | 'submitted' | 'overdue' | 'in-progress';

interface Assignment {
  name: string;
  subject: string;
  status: AssignmentStatus;
  dueDate: string;
}

const subjects = [
  {
    name: 'Mathematics',
    assignments: [
      {
        name: 'Algebra Worksheet',
        subject: 'Mathematics',
        status: 'pending',
        dueDate: '2024-02-15',
      },
      {
        name: 'Geometry Problem Set',
        subject: 'Mathematics',
        status: 'submitted',
        dueDate: '2024-02-10',
      },
    ],
  },
  {
    name: 'Science',
    assignments: [
      {
        name: 'Biology Lab Report',
        subject: 'Science',
        status: 'in-progress',
        dueDate: '2024-02-20',
      },
      {
        name: 'Chemistry Experiment',
        subject: 'Science',
        status: 'overdue',
        dueDate: '2024-02-05',
      },
    ],
  },
  {
    name: 'English',
    assignments: [
      { name: 'Essay Writing', subject: 'English', status: 'submitted', dueDate: '2024-02-12' },
    ],
  },
];

// Helper function to get status color
const getAssignmentColor = (status: string) => {
  const statusColors = {
    pending: '#FFA500', // orange
    submitted: '#2E8B57', // green
    overdue: '#DC143C', // red
    'in-progress': '#4169E1', // royal blue
  };
  return statusColors[status as keyof typeof statusColors] || 'inherit';
};

const AssignmentsList = () => {
  const [hoveredAssignment, setHoveredAssignment] = useState<Assignment | null>(null);
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 2,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? theme.vars.palette.grey[800]
            : theme.vars.palette.grey[100],
        height: '100%',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="subtitle1">Assignments List</Typography>
        </Box>
        <Box>
          <Scrollbar sx={{ height: '200px' }}>
            {subjects.map((subject, subjectIndex) => (
              <Box key={subjectIndex} mb={2}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                  {subject.name}
                </Typography>
                {subject.assignments.map((assignment, assignmentIndex) => (
                  <Tooltip
                    key={assignmentIndex}
                    title={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ color: getAssignmentColor(assignment.status), fontWeight: 'bold' }}
                        >
                          Status: {assignment.status.toUpperCase()}
                        </Typography>
                        <Typography variant="body2">Due Date: {assignment.dueDate}</Typography>
                      </Box>
                    }
                    placement="right"
                    arrow
                    slotProps={{
                      tooltip: {
                        sx: {
                          color: theme.palette.mode === 'dark' ? 'white' : 'black',
                          backgroundColor: theme.palette.mode === 'dark' ? 'black' : '#FAF9F6',
                        },
                      },
                    }}
                  >
                    <Card
                      sx={{
                        mb: 1,
                        cursor: 'pointer',
                        borderLeft: `4px solid ${getAssignmentColor(assignment.status)}`,
                        '&:hover': { boxShadow: theme.shadows[3] },
                      }}
                    >
                      <CardContent
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: theme.spacing(1.5, 2),
                        }}
                      >
                        <Typography variant="body2">{assignment.name}</Typography>
                      </CardContent>
                    </Card>
                  </Tooltip>
                ))}
              </Box>
            ))}
          </Scrollbar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssignmentsList;
