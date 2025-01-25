'use client';

import type React from 'react';

import { useSelector } from 'react-redux';

const EmployeeLayout = ({ children }: { children: React.ReactNode }) => {
  const { userInfo } = useSelector((store: any) => store.user);

  // if (userInfo?.employee?.role?.name === 'Teacher') {
  //   return <Typography>You are not authorized to access this page</Typography>;
  // }
  return children;
};

export default EmployeeLayout;
