import React from 'react';
import { Box } from '@mui/material';
import CourseProgressComponent from 'src/screens/classManagement/courseProgress/courseProgress';

const SubjectPerformance = () => (
  <Box>
    <CourseProgressComponent courseData={[]} isAction={false} layout="vertical" />
  </Box>
);

export default SubjectPerformance;
