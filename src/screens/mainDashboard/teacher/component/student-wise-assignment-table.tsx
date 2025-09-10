import React from 'react';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';

const StudentWiseAssignmentTable = () => {
  const studentAssignments = [
    {
      name: 'John',
      subject: 'Math',
      status: 'Submitted',
      lastSubmissionDate: '2025-02-15',
      assignmentName: 'Algebra Homework',
    },
    {
      name: 'Emma',
      subject: 'Science',
      status: 'Pending',
      lastSubmissionDate: '',
      assignmentName: 'Physics Lab Report',
    },
    {
      name: 'Liam',
      subject: 'English',
      status: 'Late',
      lastSubmissionDate: '2025-02-10',
      assignmentName: 'Essay on Shakespeare',
    },
    {
      name: 'John',
      subject: 'Math',
      status: 'Submitted',
      lastSubmissionDate: '2025-02-15',
      assignmentName: 'Algebra Homework',
    },
    {
      name: 'Emma',
      subject: 'Science',
      status: 'Pending',
      lastSubmissionDate: '',
      assignmentName: 'Physics Lab Report',
    },
    {
      name: 'Liam',
      subject: 'English',
      status: 'Late',
      lastSubmissionDate: '2025-02-10',
      assignmentName: 'Essay on Shakespeare',
    },
    {
      name: 'John',
      subject: 'Math',
      status: 'Submitted',
      lastSubmissionDate: '2025-02-15',
      assignmentName: 'Algebra Homework',
    },
    {
      name: 'Emma',
      subject: 'Science',
      status: 'Pending',
      lastSubmissionDate: '',
      assignmentName: 'Physics Lab Report',
    },
    {
      name: 'Liam',
      subject: 'English',
      status: 'Late',
      lastSubmissionDate: '2025-02-10',
      assignmentName: 'Essay on Shakespeare',
    },
    {
      name: 'John',
      subject: 'Math',
      status: 'Submitted',
      lastSubmissionDate: '2025-02-15',
      assignmentName: 'Algebra Homework',
    },
    {
      name: 'Emma',
      subject: 'Science',
      status: 'Pending',
      lastSubmissionDate: '',
      assignmentName: 'Physics Lab Report',
    },
    {
      name: 'Liam',
      subject: 'English',
      status: 'Late',
      lastSubmissionDate: '2025-02-10',
      assignmentName: 'Essay on Shakespeare',
    },
    {
      name: 'Liam',
      subject: 'English',
      status: 'Late',
      lastSubmissionDate: '2025-02-10',
      assignmentName: 'Essay on Shakespeare',
    },
    {
      name: 'John',
      subject: 'Math',
      status: 'Submitted',
      lastSubmissionDate: '2025-02-15',
      assignmentName: 'Algebra Homework',
    },
    {
      name: 'Emma',
      subject: 'Science',
      status: 'Pending',
      lastSubmissionDate: '',
      assignmentName: 'Physics Lab Report',
    },
    {
      name: 'Liam',
      subject: 'English',
      status: 'Late',
      lastSubmissionDate: '2025-02-10',
      assignmentName: 'Essay on Shakespeare',
    },
    {
      name: 'John',
      subject: 'Math',
      status: 'Submitted',
      lastSubmissionDate: '2025-02-15',
      assignmentName: 'Algebra Homework',
    },
    {
      name: 'Emma',
      subject: 'Science',
      status: 'Pending',
      lastSubmissionDate: '',
      assignmentName: 'Physics Lab Report',
    },
    {
      name: 'Liam',
      subject: 'English',
      status: 'Late',
      lastSubmissionDate: '2025-02-10',
      assignmentName: 'Essay on Shakespeare',
    },
  ];
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Late':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <CustomizableTable
      tableId="student-wise-assignment-table"
      columns={[
        { id: 'name', label: 'Student Name' },
        { id: 'subject', label: 'Subject' },
        { id: 'lastSubmissionDate', label: 'Submission Date' },
        { id: 'assignmentName', label: 'Assignment Name' },
        {
          id: 'status',
          label: 'Status',
          render(value, row) {
            return <Label color={getStatusColor(value)}>{value}</Label>;
          },
        },
      ]}
      data={studentAssignments}
    />
  );
};

export default StudentWiseAssignmentTable;
