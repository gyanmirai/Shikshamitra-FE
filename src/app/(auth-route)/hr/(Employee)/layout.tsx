import React from 'react';

import TeacherPermission from 'src/components/teacher-permission';

const EmployeeLayout = ({ children }: any) => <TeacherPermission>{children}</TeacherPermission>;

export default EmployeeLayout;
