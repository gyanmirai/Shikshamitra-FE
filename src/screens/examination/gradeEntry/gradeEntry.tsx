'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';

import { Box, Button, MenuList, MenuItem } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AssignGrade from './components/assignGradeForm';
import GradeEntryTable from './components/GradeEntryTable';

import type { IStudentExamGradeEntry } from './type';
import type { TabComponentType } from '../../hr/leave-request';

const studentExamGradeEntries: IStudentExamGradeEntry[] = [
  {
    id: '1',
    GrNo: '2024001',
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
    GrNo: '2024002',
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
    GrNo: '2024003',
    studentName: 'Dev Patel',
    assignments: 'Assignment 1',
    subject: 'English',
    marks: 0,
    totalMarks: 100,
    grade: '',
    feedback: '',
    weightedAverage: '65%',
    status: 0, // e.g., 0 = Not Submitted / Pending
  },
  {
    id: '4',
    GrNo: '2024004',
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
    GrNo: '2024005',
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

  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClass] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');

  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClass(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  // Currently selected student for grade entry
  const [selectedStudent, setSelectedStudent] = useState<IStudentExamGradeEntry | null>(null);
  // Table data containing student grades and information
  const [tableData, setTableData] = useState<IStudentExamGradeEntry[]>(studentExamGradeEntries);
  // Array of selected student IDs for bulk grade assignment
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Dialog control for viewing student submission
  const viewSubmissionDialog = useBoolean();
  // Dialog control for viewing student submission
  const publishMarksDialog = useBoolean();
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

  // Get the changes status from the confirm popup redux state
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Redux dispatch function for triggering actions
  const dispatch = useDispatch();

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
  };

  /**
   * Closes all dialogs and resets selected student state
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setSelectedStudent(null);
      viewSubmissionDialog.onFalse();
      dialog.onFalse();
      bulkGradeDialog.onFalse();
    } else if (!isChanges) {
      setSelectedStudent(null);
      viewSubmissionDialog.onFalse();
      dialog.onFalse();
      bulkGradeDialog.onFalse();
    }
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
                popover.onClose();
              }}
            >
              {' '}
              <Iconify icon="mdi:arrow-right-bold" sx={{ height: '16px', width: '16px' }} />
              Assign Marks
            </MenuItem>
          )}

          {row.status === 1 && (
            <MenuItem
              onClick={() => {
                popover.onClose();
                viewSubmissionDialog.onTrue();
                setSelectedStudent(row);
              }}
            >
              {' '}
              <Iconify icon={GlobalIcons.edit} sx={{ height: '16px', width: '16px' }} />
              Update Marks
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
        heading="Record Marks"
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Examination', href: '/academic/scheduleExam' },
          { name: 'Record Marks' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="material-symbols:upload" />}
            onClick={() => {
              publishMarksDialog.onTrue();
            }}
          >
            Publish Marks
          </Button>
        }
      />
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={3}>
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
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
        handleClose={() => {
          viewSubmissionDialog.onFalse();
          setSelectedStudent(null);
        }}
        title="Assign Marks"
      >
        <AssignGrade data={selectedStudent} onClose={handleClose} />
      </CustomDialog>

      <CustomDialog
        open={bulkGradeDialog.value}
        handleClose={bulkGradeDialog.onFalse}
        title={`Assign Grade to ${selectedStudents.length} Students`}
      >
        <AssignGrade />
      </CustomDialog>

      <ConfirmDialog
        open={publishMarksDialog.value}
        onClose={() => {
          publishMarksDialog.onFalse();
          // setSelectedExam(null);
        }}
        title="Publish"
        content="Are you sure you want to Publish Marks ?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              // handleDelete(selectedExam?.id);
            }}
          >
            Publish
          </Button>
        }
      />
    </Box>
  );
};

export default GradeEntry;
