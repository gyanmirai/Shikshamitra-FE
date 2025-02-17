import React from 'react';

import TeacherPermission from 'src/components/teacher-permission';

const AttendanceSettingLayout = ({ children }: any) => (
  <TeacherPermission>{children}</TeacherPermission>
);

export default AttendanceSettingLayout;
