import type { ICourse } from 'src/screens/academic/course-management/courseProgress/type';

import React, { useState } from 'react';
import { Box, Card, Stack, Divider, Typography, CircularProgress } from '@mui/material';
import courseProgressTableData from 'src/json/academic/syllabus/courseProgressTableData.json';
import CourseProgressComponent from 'src/screens/classManagement/courseProgress/courseProgress';

import type { ISubject, ISubjectCardProps } from './type';

const subjectsProgress: ISubject[] = [
  { id: 1, subjectName: 'Mathematics', progress: 20 },
  { id: 2, subjectName: 'Science', progress: 45 },
  { id: 3, subjectName: 'English', progress: 90 },
  { id: 4, subjectName: 'History', progress: 70 },
  { id: 5, subjectName: 'Geography', progress: 60 },
  { id: 6, subjectName: 'Physics', progress: 75 },
  { id: 7, subjectName: 'Chemistry', progress: 85 },
  { id: 8, subjectName: 'Biology', progress: 55 },
  { id: 9, subjectName: 'Computer Science', progress: 95 },
  { id: 10, subjectName: 'Economics', progress: 50 },
];

const SubjectPerformance = () => {
  // State to track the currently selected subject and its details
  const [courses, setCourses] = useState<any[]>(courseProgressTableData);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);

  // Handler for when a course card is selected
  const handleCardDetails = (course: ICourse) => {
    setSelectedCourse(course);
  };
  return (
    <Box>
      {/* <CourseCardsGrid courses={courses} handleCardDetails={handleCardDetails} /> */}
      <CourseProgressComponent courseData={courses} isAction={false} />
    </Box>
  );
};

export default SubjectPerformance;

const SubjectCard: React.FC<ISubjectCardProps> = ({
  selectedSubject,
  subjectId,
  subjectName,
  progress,
}) => (
  <Card
    elevation={3}
    sx={{
      py: 2,
      textAlign: 'center',
      typography: 'h4',
      maxWidth: '250px',
      width: '100%',
      border:
        subjectId === selectedSubject?.id
          ? '3px solid #1a1a1a' // Darker border when selected
          : '2px solid #e0e0e0', // Initial light border
      transition: 'all 0.2s ease',
      boxShadow: subjectId === selectedSubject?.id ? '0 0 0 2px rgba(0, 0, 0, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#757575', // Medium gray for hover state
      },
      cursor: 'pointer',
    }}
  >
    <Stack
      direction="row"
      divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
    >
      <Stack width={1}>
        <Box fontSize="14px" display="flex" flexDirection="column" justifyContent="center">
          <Typography variant="h6" gutterBottom>
            {subjectName}
          </Typography>
          <Box position="relative" mr={2}>
            <CircularProgress
              variant="determinate"
              value={progress}
              size={50}
              thickness={2}
              color={progress < 30 ? 'error' : progress < 50 ? 'warning' : 'success'}
            />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="caption" component="div">
                {progress}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </Stack>
    </Stack>
  </Card>
);
