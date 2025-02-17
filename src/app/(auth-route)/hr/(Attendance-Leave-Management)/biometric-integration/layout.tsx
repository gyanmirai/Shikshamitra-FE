import React from 'react';

import TeacherPermission from 'src/components/teacher-permission';

const BiometricIntegrationLayout = ({ children }: any) => (
  <TeacherPermission>{children}</TeacherPermission>
);

export default BiometricIntegrationLayout;
