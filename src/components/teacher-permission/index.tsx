'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';

const TeacherPermission = ({ children }: { children: React.ReactNode }) => {
  const { employee } = useSelector((state: any) => state.auth);
  const role = employee?.role?.name;

  if (role === 'Teacher') return <View403 />;
  return children;
};

export default TeacherPermission;
