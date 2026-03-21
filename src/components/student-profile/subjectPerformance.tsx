import type { ICourse } from 'src/screens/academic/course-management/course-progress/type';

import { Box } from '@mui/material';
import React, { useState } from 'react';
import courseProgressTableData from 'src/json/academic/syllabus/courseProgressTableData.json';
import CourseProgressComponent from 'src/screens/class-management/course-progress/courseProgress';

import type { ISubject } from './type';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [courses] = useState<any[]>(courseProgressTableData);
  const [, setSelectedCourse] = useState<ICourse | null>(null);

  // Handler for when a course card is selected
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCardDetails = (course: ICourse) => {
    setSelectedCourse(course);
  };
  return (
    <Box>
      {/* <CourseCardsGrid courses={courses} handleCardDetails={handleCardDetails} /> */}
      <CourseProgressComponent courseData={courses} isAction={false} layout="vertical" />
    </Box>
  );
};

export default SubjectPerformance;
