import React from 'react';
import { Box, Card, Typography } from '@mui/material';

import SubjectPerformanceItem from './subjectPerformanceCard';

const subjectPerformances = [
  { subject: 'Mathemetics', percentage: 92, grade: 'A+', color: '#00C49F' },
  { subject: 'English', percentage: 79, grade: 'B+', color: '#00B8D9' },
  { subject: 'Science', percentage: 88, grade: 'A', color: '#9C27B0' },
  { subject: 'Social Science', percentage: 89, grade: 'A', color: '#FFA500' },
  { subject: 'Hindi', percentage: 68, grade: 'B', color: '#FF5630' },
];

const SubjectPerformanceCards = () => (
  <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Typography variant="h6" mb={3}>
      Subject Wise Performance
    </Typography>
    <Box>
      {subjectPerformances.map((item, index) => (
        <SubjectPerformanceItem key={index} {...item} />
      ))}
    </Box>
  </Card>
);

export default SubjectPerformanceCards;
