import React from 'react';
import TeacherPermission from 'src/components/teacher-permission';

const AttendanceImportHistoryLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => <TeacherPermission>{children}</TeacherPermission>;

export default AttendanceImportHistoryLayout;
