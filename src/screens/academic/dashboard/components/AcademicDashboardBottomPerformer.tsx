import React from 'react';

import { TopPerformer } from 'src/screens/student/enrollment/entrance-exam/dashboard';

const AcademicDashboardBottomPerformer = () => (
  <TopPerformer
    title="Bottom Performer"
    sx={{ height: '100%' }}
    list={[
      {
        id: '1',
        name: 'Kumar Rahul Dev',
        avatarUrl: '/static/images/avatars/avatar_1.png',
        totalMarks: 0,
      },
      {
        id: '2',
        name: 'Sharma Priya Raj',
        avatarUrl: '/static/images/avatars/avatar_2.png',
        totalMarks: 0,
      },
      {
        id: '3',
        name: 'Patel Amit Kumar',
        avatarUrl: '/static/images/avatars/avatar_3.png',
        totalMarks: 0,
      },
    ]}
  />
);

export default AcademicDashboardBottomPerformer;
