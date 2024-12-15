import React from 'react';

import EnrollmentDashboardScreen from 'src/screens/student/enrollment/dashboard';

const EnrollmentDashboard = ({ session }: any) => {
  console.log('EnrollmentDashboard', session);
  return <EnrollmentDashboardScreen />;
};

export default EnrollmentDashboard;
