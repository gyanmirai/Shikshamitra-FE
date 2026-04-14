import React from 'react';
import TeacherPermission from 'src/components/teacher-permission';

const AttendanceImportHistoryLayout = ({ children }: any) => (
  <TeacherPermission>{children}</TeacherPermission>
);

export default AttendanceImportHistoryLayout;
