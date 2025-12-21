import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const classManagementApi = createApi({
  reducerPath: 'classManagementApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/`, // keep same base url
  }),
  tagTypes: [
    'Class',
    'Division',
    'Standard',
    'Teacher',
    'Student',
    'Room',
    'Timetable',
    'StudentElectiveAssignment',
    'SubjectProgress',
    'ClassTeacherAssignment',
    'TeacherAssignment',
  ],
  endpoints: () => ({}), // endpoints will be injected in other files
});
