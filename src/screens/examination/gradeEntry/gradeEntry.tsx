'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState, useCallback } from 'react';

import { Box, Button, MenuList, MenuItem } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AssignGrade from './components/assignGradeForm';
import GradeEntryTable from './components/GradeEntryTable';

import type { IStudentExamGradeEntry } from './type';
import type { TabComponentType } from '../../hr/leave-request';

const studentExamGradeEntries: IStudentExamGradeEntry[] = [
  {
    id: '1',
    studentName: 'Aarav Sharma',
    assignments: 'Assignment 1, Assignment 2',
    subject: 'Mathematics',
    marks: 78,
    totalMarks: 100,
    grade: 'B+',
    feedback: 'Good understanding of concepts, needs to improve accuracy.',
    weightedAverage: '78%',
    status: 1, // e.g., 1 = Submitted
  },
  {
    id: '2',
    studentName: 'Kiara Mehta',
    assignments: 'Assignment 1, Quiz 1',
    subject: 'Science',
    marks: 92,
    totalMarks: 100,
    grade: 'A',
    feedback: 'Excellent performance.',
    weightedAverage: '92%',
    status: 1,
  },
  {
    id: '3',
    studentName: 'Dev Patel',
    assignments: 'Assignment 1',
    subject: 'English',
    marks: 65,
    totalMarks: 100,
    grade: 'C+',
    feedback: 'Needs to improve vocabulary and grammar.',
    weightedAverage: '65%',
    status: 0, // e.g., 0 = Not Submitted / Pending
  },
  {
    id: '4',
    studentName: 'Ishita Reddy',
    assignments: 'Project, Assignment 2',
    subject: 'Social Studies',
    marks: 85,
    totalMarks: 100,
    grade: 'A-',
    feedback: 'Well-researched answers and neat presentation.',
    weightedAverage: '85%',
    status: 1,
  },
  {
    id: '5',
    studentName: 'Rohan Gupta',
    assignments: 'Assignment 3, Quiz 2',
    subject: 'Computer Science',
    marks: 98,
    totalMarks: 100,
    grade: 'A+',
    feedback: 'Outstanding work and logical approach.',
    weightedAverage: '98%',
    status: 1,
  },
];

const GradeEntry = (props: TabComponentType) => {
  // Dialog control for showing/hiding modal
  const dialog = useBoolean();
  // Search parameters from URL and function to update them
  const { searchParams, setSearchParams } = props;
  // Selected class ID from search params
  const [classes, setClasses] = useState('');

  // Selected division/section ID
  const [division, setDivision] = useState('');
  // Available divisions/sections for selected class
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  // Selected subject for grade entry
  const [subject, setSubject] = useState(searchParams?.subject ? searchParams?.subject : '');
  // Type of assignment (quiz, test, homework etc)
  const [assignmentType, setAssignmentType] = useState(
    searchParams?.assignmentType ? searchParams?.assignmentType : ''
  );
  // Title of the selected assignment
  const [assignmentTitle, setAssignmentTitle] = useState(
    searchParams?.assigngmentTitle ? searchParams?.assigngmentTitle : ''
  );
  // Query to fetch class data
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Currently selected student for grade entry
  const [selectedStudent, setSelectedStudent] = useState<IStudentExamGradeEntry | null>(null);
  // Table data containing student grades and information
  const [tableData, setTableData] = useState<IStudentExamGradeEntry[]>(studentExamGradeEntries);
  // Array of selected student IDs for bulk grade assignment
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Dialog control for viewing student submission
  const viewSubmissionDialog = useBoolean();
  // Dialog control for bulk grade assignment
  const bulkGradeDialog = useBoolean();

  /**
   * Handles selection/deselection of a student for bulk grade assignment
   * @param studentId - The ID of the student to toggle selection
   */
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  /**
   * Assigns the same grade to multiple selected students
   * @param values - Object containing the grade to assign
   */
  const handleBulkGradeAssignment = (values: { grade: string }) => {
    setTableData((prevData) =>
      prevData.map((student) =>
        selectedStudents.includes(student.id) ? { ...student, grade: values.grade } : student
      )
    );
    bulkGradeDialog.onFalse();
    setSelectedStudents([]);
  };

  /**
   * Assigns grade and feedback to a single selected student
   * @param values - Object containing grade and feedback to assign
   */
  const handleSingleGradeAssignment = (values: { grade: string; feedback: string }) => {
    setTableData((prevData) =>
      prevData.map((student) =>
        student.id === selectedStudent?.id
          ? { ...student, grade: values.grade, feedback: values.feedback }
          : student
      )
    );
    handleCloseDialog();
  };

  /**
   * Closes all dialogs and resets selected student state
   */
  const handleCloseDialog = () => {
    setSelectedStudent(null);
    viewSubmissionDialog.onFalse();
    dialog.onFalse();
    bulkGradeDialog.onFalse();
  };

  const actions = useCallback(
    ({ popover, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.status === 0 && (
            <MenuItem
              onClick={() => {
                viewSubmissionDialog.onTrue();
                setSelectedStudent(row);
                popover.onClose();
              }}
            >
              {' '}
              <Iconify icon="mdi:arrow-right-bold" sx={{ height: '16px', width: '16px' }} />
              Assign Grade
            </MenuItem>
          )}

          {row.status === 1 && (
            <MenuItem
              onClick={() => {
                popover.onClose();
                //   viewSubmissionDialog.onTrue();
                //   setSelectedStudent(row);
              }}
            >
              {' '}
              <Iconify icon="mdi:pen" sx={{ height: '16px', width: '16px' }} />
              Edit Grade
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [viewSubmissionDialog]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Grade Entry"
        links={[
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Examination', href: '/academic/examinationDashboard' },
          { name: 'Grade Entry' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:edit" />}
              disabled={selectedStudents.length === 0}
              onClick={bulkGradeDialog.onTrue}
              sx={{ mr: 1 }}
            >
              Bulk Grade ({selectedStudents.length} selected)
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="material-symbols:upload" />}
              onClick={() => {}}
            >
              Publish Marks
            </Button>
          </>
        }
      />
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={3}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            // formik.setFieldValue('class', selectedClass?.name || '');
            setClasses(selectedClass.id);
            setDivisionOptions(selectedClass?.divisions || []);
          }}
          value={classes}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          label="Division"
          disabled={!classes}
          labelKey="name"
          valueKey="id"
          options={divisionOptions}
          value={division}
          onChange={(val) => {
            // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
            // formik.setFieldValue('division', selectedDivision?.name || '');
            setDivision(val as string);
          }}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          label="Subject"
          disabled={!division}
          options={[
            { value: 'math', label: 'Mathematics' },
            { value: 'science', label: 'Science' },
            { value: 'english', label: 'English' },
          ]}
          onChange={(val) => {
            setSubject(val as string);
          }}
          value={subject}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          label="Exam Type"
          disabled={!subject}
          options={[
            { value: 'mid', label: 'Mid' },
            { value: 'practical', label: 'Practical' },
            { value: 'final', label: 'Final' },
          ]}
          onChange={(val) => {
            setAssignmentType(val as string);
          }}
          value={assignmentType}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          label="Exam Title"
          disabled={!assignmentType}
          options={[
            { value: 'Chapter 1 Quiz', label: 'Chapter 1 Quiz' },
            { value: 'Chapter 2 Quiz', label: 'Chapter 2 Quiz' },
            { value: 'Chapter 3 Quiz', label: 'Chapter 3 Quiz' },
            { value: 'Assignment 1', label: 'Assignment 1' },
            { value: 'Assignment 2', label: 'Assignment 2' },
            { value: 'Quiz 3', label: 'Quiz 3' },
            { value: 'Lab Report', label: 'Lab Report' },
          ]}
          onChange={(val) => {
            setAssignmentTitle(val as string);
          }}
          value={assignmentTitle}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
      </Box>
      <GradeEntryTable
        data={tableData}
        selectedStudents={selectedStudents}
        handleSelectStudent={handleSelectStudent}
        actions={actions}
      />

      <CustomDialog
        open={viewSubmissionDialog.value}
        handleClose={handleCloseDialog}
        title="Assign Grade"
      >
        <AssignGrade data={selectedStudent} />
      </CustomDialog>

      <CustomDialog
        open={bulkGradeDialog.value}
        handleClose={bulkGradeDialog.onFalse}
        title={`Assign Grade to ${selectedStudents.length} Students`}
      >
        <AssignGrade />
      </CustomDialog>
    </Box>
  );
};

export default GradeEntry;
