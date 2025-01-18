'use client';

import type React from 'react';

import { useSelector } from 'react-redux';

// import TeacherDashboard from 'src/screens/hr/dashboard/teacher-dashboard';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { userInfo } = useSelector((store: any) => store.user);

  // if (userInfo?.employee?.role?.name === 'Teacher') {
  //   return <TeacherDashboard employee={userInfo.employee} />;
  // }
  return children;
};

export default Layout;
