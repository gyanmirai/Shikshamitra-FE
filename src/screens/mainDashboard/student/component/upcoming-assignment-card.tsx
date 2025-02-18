import React from 'react';

import { Assignment } from '@mui/icons-material';
import { Box, Card, Typography, CardContent } from '@mui/material'; // Example icon, replace if needed

// Define the Assignment Interface
interface AssignmentItem {
  name: string;
  dueDate: string;
}

// Define Props for UpcomingAssignmentCard
interface UpcomingAssignmentCardProps {
  assignments: AssignmentItem[];
}

const UpcomingAssignmentCard: React.FC<UpcomingAssignmentCardProps> = ({ assignments }) => (
  <Card sx={{ minWidth: 300, p: 2 }}>
    <Typography variant="h6" mb={2}>
      Upcoming Assignments
    </Typography>
    <CardContent sx={{ p: 0 }}>
      {assignments.slice(0, 4).map((assignment, index) => (
        <Box key={index} display="flex" alignItems="center" justifyContent="space-between" p={1}>
          <Box display="flex" alignItems="center">
            <Assignment sx={{ fontSize: 30, color: 'primary.main', mr: 1 }} />
            <Box>
              <Typography fontSize={16} fontWeight="bold">
                {assignment.name}
              </Typography>
              <Typography fontSize={14} color="textSecondary">
                Due: {assignment.dueDate}
              </Typography>
            </Box>
          </Box>
        </Box>
      ))}
    </CardContent>
  </Card>
);

export default UpcomingAssignmentCard;
