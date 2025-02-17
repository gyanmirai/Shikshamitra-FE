import React from 'react';

import TeacherPermission from 'src/components/teacher-permission';

const AttendanceReportLayout = ({ children }: any) => (
  <TeacherPermission>{children}</TeacherPermission>
);

export default AttendanceReportLayout;
