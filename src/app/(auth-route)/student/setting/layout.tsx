import React from 'react';

import TeacherPermission from 'src/components/teacher-permission';

const StudentSetting = ({ children }: any) => <TeacherPermission>{children}</TeacherPermission>;

export default StudentSetting;
