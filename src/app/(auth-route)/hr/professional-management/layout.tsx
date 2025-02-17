import React from 'react';

import TeacherPermission from 'src/components/teacher-permission';

const ProfessionalManagementLayout = ({ children }: any) => (
  <TeacherPermission>{children}</TeacherPermission>
);

export default ProfessionalManagementLayout;
