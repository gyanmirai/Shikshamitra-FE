import React from 'react';
import TeacherPermission from 'src/components/teacher-permission';

const ReportLayout = ({ children }: any) => <TeacherPermission>{children}</TeacherPermission>;

export default ReportLayout;
