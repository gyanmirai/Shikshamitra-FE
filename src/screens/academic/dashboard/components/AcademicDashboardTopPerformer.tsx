import React from 'react';
import { TopPerformer } from 'src/screens/student/enrollment/entrance-exam/dashboard';

const AcademicDashboardTopPerformer = () => (
  <TopPerformer
    title="Top Performer"
    sx={{ height: '100%' }}
    list={[
      {
        id: '1',
        name: 'Simon Jayvion Michael',
        avatarUrl: '/static/images/avatars/avatar_1.png',
        totalMarks: 95,
      },
      {
        id: '2',
        name: 'Obrien Lucian James',
        avatarUrl: '/static/images/avatars/avatar_2.png',
        totalMarks: 92,
      },
      {
        id: '3',
        name: 'Bredy Deja Rose',
        avatarUrl: '/static/images/avatars/avatar_3.png',
        totalMarks: 88,
      },
    ]}
  />
);

export default AcademicDashboardTopPerformer;
