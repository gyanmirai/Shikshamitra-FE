'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Button,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AssignGrade from './components/assignGradeForm';
import GradeEntryTable from './components/GradeEntryTable';

import type { IStudentExamGradeEntry } from './type';
import type { TabComponentType } from '../../hr/leave-request';

const studentExamGradeEntries: IStudentExamGradeEntry[] = [
  {
    id: '1',
    rollNo: '2024001',
    studentName: 'Sharma Aarav Rajesh',
    subject: 'Mathematics',
    examType: 'mid_term',
    examName: 'Mid Term',
    marks: null,
    totalMarks: 100,
    grade: '',
    feedback: '',
    weightedAverage: '0%',
    status: 0, // Pending marks and feedback assignment
  },
  {
    id: '2',
    rollNo: '2024002',
    studentName: 'Patel Riya Amit',
    subject: 'Mathematics',
    examType: 'mid_term',
    examName: 'Mid Term',
    marks: 82,
    totalMarks: 100,
    grade: 'A-',
    feedback: 'Excellent problem-solving skills. Keep up the good work!',
    weightedAverage: '82%',
    status: 1, // Marks and feedback assigned
  },
  {
    id: '3',
    rollNo: '2024003',
    studentName: 'Kumar Arjun Suresh',
    subject: 'Mathematics',
    examType: 'mid_term',
    examName: 'Mid Term',
    marks: null,
    totalMarks: 100,
    grade: '',
    feedback: '',
    weightedAverage: '0%',
    status: 0, // Pending marks and feedback assignment
  },
  {
    id: '4',
    rollNo: '2024004',
    studentName: 'Shah Meera Rajesh',
    subject: 'Mathematics',
    examType: 'mid_term',
    examName: 'Mid Term',
    marks: 88,
    totalMarks: 100,
    grade: 'A',
    feedback: 'Strong grasp of concepts. Work on time management.',
    weightedAverage: '88%',
    status: 1, // Marks and feedback assigned
  },
  {
    id: '5',
    rollNo: '2024005',
    studentName: 'Joshi Aditya Prakash',
    subject: 'Mathematics',
    examType: 'mid_term',
    examName: 'Mid Term',
    marks: null,
    totalMarks: 100,
    grade: '',
    feedback: '',
    weightedAverage: '0%',
    status: 0, // Pending marks and feedback assignment
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
      viewSubmissionDialog.onFalse();
      setSelectedStudent(null);
      dialog.onFalse();
      bulkGradeDialog.onFalse();
    } else if (!isChanges) {
      viewSubmissionDialog.onFalse();
      setSelectedStudent(null);
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
                setSelectedStudent(row);
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
        description="Enter and manage student examination marks and grades"
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
            disabled={!assignmentTitle}
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              publishMarksDialog.onTrue();
            }}
            title="Publish marks to make them visible to students"
          >
            Publish Marks
          </Button>
        }
      />
      <Box
        display="flex"
        sx={{
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          my: 2,
          p: 1,
          gap: 2,
        }}
      >
        {' '}
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
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
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
        />
        <CustomTooltip placement="top" title={assignmentTitle && `${assignmentTitle}`}>
          <Autocomplete
            disabled={!subject}
            options={[
              // Unit Test titles
              { value: 'unit_test_1', label: 'Unit Test 1', type: 'unit_test' },
              { value: 'unit_test_2', label: 'Unit Test 2', type: 'unit_test' },
              // Mid Term titles
              { value: 'mid_term_theory', label: 'Mid Term Theory', type: 'mid_term' },
              { value: 'mid_term_mcq', label: 'Mid Term MCQ', type: 'mid_term' },
              // Final Term titles
              { value: 'final_term_theory', label: 'Final Term Theory', type: 'final_term' },
              { value: 'final_term_mcq', label: 'Final Term MCQ', type: 'final_term' },
              // Practical titles
              { value: 'lab_practical_1', label: 'Lab Practical 1', type: 'practical' },
              { value: 'lab_practical_2', label: 'Lab Practical 2', type: 'practical' },
              // Project titles
              { value: 'project_1', label: 'Project Work 1', type: 'project' },
              { value: 'project_2', label: 'Project Work 2', type: 'project' },
              // Assignment titles
              { value: 'assignment_1', label: 'Assignment 1', type: 'assignment' },
              { value: 'assignment_2', label: 'Assignment 2', type: 'assignment' },
            ].filter((option) => !assignmentType || option.type === assignmentType)}
            getOptionLabel={(option: any) => option.label || ''}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            value={
              [
                { value: 'unit_test_1', label: 'Unit Test 1', type: 'unit_test' },
                { value: 'unit_test_2', label: 'Unit Test 2', type: 'unit_test' },
                { value: 'mid_term_theory', label: 'Mid Term Theory', type: 'mid_term' },
                { value: 'mid_term_mcq', label: 'Mid Term MCQ', type: 'mid_term' },
                { value: 'final_term_theory', label: 'Final Term Theory', type: 'final_term' },
                { value: 'final_term_mcq', label: 'Final Term MCQ', type: 'final_term' },
                { value: 'lab_practical_1', label: 'Lab Practical 1', type: 'practical' },
                { value: 'lab_practical_2', label: 'Lab Practical 2', type: 'practical' },
                { value: 'project_1', label: 'Project Work 1', type: 'project' },
                { value: 'project_2', label: 'Project Work 2', type: 'project' },
                { value: 'assignment_1', label: 'Assignment 1', type: 'assignment' },
                { value: 'assignment_2', label: 'Assignment 2', type: 'assignment' },
              ].find((opt) => opt.value === assignmentTitle) || null
            }
            onChange={(event, newValue) => {
              setAssignmentTitle(newValue?.value || '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Exam Title"
                size="small"
                fullWidth
                sx={{ minWidth: '248px', width: '100%' }}
              />
            )}
          />
        </CustomTooltip>
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
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedStudent ? 'Update Marks' : 'Assign Marks'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedStudent
                  ? 'You can modify the existing marks, grades and feedback for this student.'
                  : 'You can enter marks, assign grades and provide feedback for this student.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
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
        content={
          <>
            Are you sure you want to publish marks <strong>{assignmentTitle}</strong>?`
          </>
        }
        action={
          <Button
            variant="contained"
            size="small"
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
