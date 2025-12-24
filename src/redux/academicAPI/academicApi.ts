import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const academicApi = createApi({
  reducerPath: 'academicApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/`, // adjust base path as needed
  }),
  tagTypes: [
    'Subject',
    'Division',
    'Standard',
    'AcademicYear',
    'Medium',
    'MediumStage',
    'CourseProgress',
    'ElectiveGroup',
    'SubjectAssignment',
    'Chapter',
    'Assignment',
    'AssignmentSubmissions',
    'AssignmentType',
    'Homework',
    'HomeworkSubmissions',
    'HomeworkType',
    'Exam',
    'CurriculumFile',
  ],
  endpoints: () => ({}), // inject endpoints later
});
