'use client';

import CustomizableTable from 'src/components/customizabaleTable';

export const StudentSubjectPerformace = () => (
  <CustomizableTable
    tableId="student-subject-performance"
    columns={[
      { id: 'subject', label: 'Subject' },
      { id: 'studentGrade', label: 'Student Grade' },
      { id: 'classAverage', label: 'Class Average' },
    ]}
    data={[
      { subject: 'Math', studentGrade: 'A', classAverage: 'B+' },
      { subject: 'Science', studentGrade: 'B', classAverage: 'B' },
      { subject: 'English', studentGrade: 'B+', classAverage: 'A-' },
      { subject: 'History', studentGrade: 'A-', classAverage: 'B' },
      { subject: 'Physics', studentGrade: 'B+', classAverage: 'B+' },
    ]}
  />
);
