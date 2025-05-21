'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AssignGrade from './homeworkCreation/component/assignGradeForm';
import { dummyData } from '../gradebook-performance-tracking/gradebook/gradebook';
import { StudentSubmissions } from './homeworkCreation/component/studentSubmission';

import type { TStudentGrade } from '../gradebook-performance-tracking/gradebook/gradebook';

const GradingAndFeedback = (props: TabComponentType) => {
  // Dialog state for modal/popup control
  const dialog = useBoolean();
  const { searchParams, setSearchParams } = props;
  const [selectedStudents, setSelectedStudents] = useState<TStudentGrade[]>([]);

  // Get classId from search params or empty string
  const classes = searchParams?.classId ? searchParams?.classId : '';

  // State for division selection and options
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  // States for subject and assignment filters
  const [subject, setSubject] = useState(searchParams?.subject ? searchParams?.subject : '');
  const [assignmentType, setAssignmentType] = useState(
    searchParams?.assignmentType ? searchParams?.assignmentType : ''
  );
  const [assignmentTitle, setAssignmentTitle] = useState(
    searchParams?.assigngmentTitle ? searchParams?.assigngmentTitle : ''
  );

  const [tableData, setTableData] = useState<TStudentGrade[]>(dummyData); // move this here

  // Dialog control for bulk grade assignment
  const bulkGradeDialog = useBoolean();

  // Fetch class data using custom query hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Effect to handle initial class and division setup
  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        // If class is selected, set its divisions
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        // If no class selected, set first class and its divisions
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

  /**
   * Updates the selected students array with the provided student grade data
   * @param data Array of student grade objects to be set as selected
   */
  const handleBulkUpdate = (data: TStudentGrade[]) => {
    setSelectedStudents(data);
  };

  /**
   * Handles assigning grades to multiple selected students in bulk
   * @param values Object containing the grade to assign
   */
  const handleBulkGradeAssignment = (values: { grade: string }) => {
    setTableData((prevData) =>
      prevData.map((student) =>
        selectedStudents?.includes(student) ? { ...student, grade: values.grade } : student
      )
    );
    bulkGradeDialog.onFalse();
    handleBulkUpdate?.([]);
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Grading And Feedback"
        description="Grading and feedback allow teachers to evaluate student performance and provide constructive feedback on assignments, quizzes, and exams."
        links={[
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Homework And Assignment', href: 'academic/homeworkDashboard' },
          { name: 'Grading And Feedback' },
        ]}
        sx={{ px: 1, mb: 2 }}
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
          label="Assignment Type"
          disabled={!subject}
          options={[
            { value: 'homework', label: 'Homework' },
            { value: 'quiz', label: 'Quiz' },
            { value: 'exam', label: 'Exam' },
          ]}
          onChange={(val) => {
            setAssignmentType(val as string);
          }}
          value={assignmentType}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          label="Assignment Title"
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
        <Box ml="auto">
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mdi:pencil" />}
            disabled={selectedStudents?.length === 0}
            onClick={bulkGradeDialog.onTrue}
          >
            Bulk Grade ({selectedStudents?.length} selected)
          </Button>
        </Box>
      </Box>
      <StudentSubmissions
        selectedStudents={selectedStudents}
        handleBulkUpdate={handleBulkUpdate}
        tableData={tableData}
        setTableData={setTableData}
      />
      <CustomDialog
        open={bulkGradeDialog.value}
        handleClose={bulkGradeDialog.onFalse}
        title={`Assign Grade to ${selectedStudents?.length} Students`}
        maxWidth="md"
      >
        <AssignGrade onSubmit={handleBulkGradeAssignment} />
      </CustomDialog>
    </Box>
  );
};

export default GradingAndFeedback;
