'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState, useEffect, useCallback } from 'react';

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

export const dummyData: IStudentExamGradeEntry[] = [
  {
    id: '1',
    studentName: 'John Smith',
    assignments: 'Math Quiz 1',
    subject: 'Mathematics',
    grade: 'A',
    feedback: 'Excellent',
    weightedAverage: '85%',
    status: 'Assigned',
  },
  {
    id: '2',
    studentName: 'Emma Wilson',
    assignments: 'Science Project',
    subject: 'Science',
    grade: '',
    feedback: '',
    weightedAverage: '92%',
    status: 'Pending',
  },
  {
    id: '3',
    studentName: 'Michael Brown',
    assignments: 'English Essay',
    subject: 'English',
    grade: 'C',
    feedback: 'Need Improvement',
    weightedAverage: '75%',
    status: 'Assigned',
  },
  {
    id: '4',
    studentName: 'Sarah Davis',
    assignments: 'Math Homework',
    subject: 'Mathematics',
    grade: '',
    feedback: '',
    weightedAverage: '88%',
    status: 'Pending',
  },
  {
    id: '5',
    studentName: 'James Johnson',
    assignments: 'Science Quiz',
    subject: 'Science',
    grade: 'B',
    feedback: 'Good',
    weightedAverage: '87%',
    status: 'Assigned',
  },
];

const GradeEntry = (props: TabComponentType) => {
  // Dialog control for showing/hiding modal
  const dialog = useBoolean();
  // Search parameters from URL and function to update them
  const { searchParams, setSearchParams } = props;
  // Selected class ID from search params
  const classes = searchParams?.classId ? searchParams?.classId : '';

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
  const [tableData, setTableData] = useState<IStudentExamGradeEntry[]>(dummyData);
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

  /**
   * Effect to handle class and division selection logic
   * When class data changes or selected class changes:
   * - Updates division options based on selected class
   * - Sets default division to first available division
   * - Sets URL params for first class if no class selected
   */
  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData?.items, classes, setSearchParams]);

  const actions = useCallback(
    ({ popover, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.status === 'Pending' && (
            <MenuItem
              onClick={() => {
                viewSubmissionDialog.onTrue();
                setSelectedStudent(row);
              }}
            >
              {' '}
              <Iconify icon="mdi:arrow-right-bold" sx={{ height: '16px', width: '16px' }} />
              Assign Grade
            </MenuItem>
          )}

          {row.status === 'Assigned' && (
            <MenuItem
              onClick={() => {
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
              startIcon={<Iconify icon="mdi:pencil" />}
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
            setSearchParams?.({
              classId: val as string,
            });

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
        <AssignGrade data={selectedStudent} onSubmit={handleSingleGradeAssignment} />
      </CustomDialog>

      <CustomDialog
        open={bulkGradeDialog.value}
        handleClose={bulkGradeDialog.onFalse}
        title={`Assign Grade to ${selectedStudents.length} Students`}
      >
        <AssignGrade onSubmit={handleBulkGradeAssignment} />
      </CustomDialog>
    </Box>
  );
};

export default GradeEntry;
