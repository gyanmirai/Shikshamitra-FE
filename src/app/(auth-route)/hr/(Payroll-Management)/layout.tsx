import React from 'react';

import TeacherPermission from 'src/components/teacher-permission';

const PayrollManagementLayout = ({ children }: any) => (
  <TeacherPermission>{children}</TeacherPermission>
);

export default PayrollManagementLayout;
