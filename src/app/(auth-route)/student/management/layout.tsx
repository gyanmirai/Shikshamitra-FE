import React from 'react';
import TeacherPermission from 'src/components/teacher-permission';

const StudentManagement = ({ children }: any) => <TeacherPermission>{children}</TeacherPermission>;

export default StudentManagement;
