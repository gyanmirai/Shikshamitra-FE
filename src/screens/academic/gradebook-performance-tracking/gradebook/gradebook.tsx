'use client';

import type { Dayjs } from 'dayjs';
import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import React, { useState, useEffect, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import Academic from 'src/screens/student/studentProfile/academic';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Button, Checkbox, MenuItem, MenuList, Typography } from '@mui/material';

import ViewResult from './component/viewResult';
import AssignGrade from './component/assignGradePopup';

export interface TStudentGrade {
  id: string;
  studentName: string;
  assignments: string;
  subject: string;
  grade: string;
  feedback: string;
  weightedAverage: string;
  status: string;
  submissionDate: Dayjs | null;
}

export const dummyData = [
  {
    id: '1',
    studentName: 'John Smith',
    assignments: 'Math Quiz 1',
    subject: 'Mathematics',
    grade: 'A',
    feedback: 'Well done!',
    weightedAverage: '85%',
    status: 'Submitted',
    submissionDate: dayjs('2024-10-25'),
  },
  {
    id: '2',
    studentName: 'Emma Wilson',
    assignments: 'Science Project',
    subject: 'Science',
    grade: 'B+',
    feedback: 'Good effort!',
    weightedAverage: '92%',
    status: 'Pending',
    submissionDate: dayjs('2024-10-28'),
  },
  {
    id: '3',
    studentName: 'Michael Brown',
    assignments: 'English Essay',
    subject: 'English',
    grade: 'B',
    feedback: 'Needs improvement in structure.',
    weightedAverage: '75%',
    status: 'Overdue',
    submissionDate: dayjs('2024-10-20'),
  },
  {
    id: '4',
    studentName: 'Sarah Davis',
    assignments: 'Math Homework',
    subject: 'Mathematics',
    grade: 'A-',
    feedback: 'Great work!',
    weightedAverage: '88%',
    status: 'Submitted',
    submissionDate: dayjs('2024-10-27'),
  },
  {
    id: '5',
    studentName: 'James Johnson',
    assignments: 'Science Quiz',
    subject: 'Science',
    grade: 'A',
    feedback: 'Excellent!',
    weightedAverage: '87%',
    status: 'Submitted',
    submissionDate: dayjs('2024-10-24'),
  },
  {
    id: '6',
    studentName: 'Olivia Martinez',
    assignments: 'History Presentation',
    subject: 'History',
    grade: 'B+',
    feedback: 'Good research!',
    weightedAverage: '82%',
    status: 'Pending',
    submissionDate: dayjs('2024-10-30'),
  },
  {
    id: '7',
    studentName: 'William Anderson',
    assignments: 'Geography Report',
    subject: 'Geography',
    grade: '',
    feedback: '',
    weightedAverage: '78%',
    status: 'Not Submitted',
    submissionDate: null, // No submission
  },
  {
    id: '8',
    studentName: 'Sophia Thomas',
    assignments: 'Computer Science Project',
    subject: 'Computer Science',
    grade: 'A+',
    feedback: 'Outstanding work!',
    weightedAverage: '95%',
    status: 'Submitted',
    submissionDate: dayjs('2024-10-22'),
  },
];

const Gradebook = (props: TabComponentType) => {
  const { searchParams, setSearchParams } = props;

  const classes = searchParams?.classId ? searchParams?.classId : '';

  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [subject, setSubject] = useState(searchParams?.subject ? searchParams?.subject : '');
  const [assignmentType, setAssignmentType] = useState(
    searchParams?.assignmentType ? searchParams?.assignmentType : ''
  );
  const [assignmentTitle, setAssignmentTitle] = useState(
    searchParams?.assigngmentTitle ? searchParams?.assigngmentTitle : ''
  );
  const [selectedStudent, setSelectedStudent] = useState<TStudentGrade | null>(null);
  const [tableData, setTableData] = useState<TStudentGrade[]>(dummyData);
  const [showTable, setShowTable] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const dialog = useBoolean();
  const bulkGradeDialog = useBoolean();
  const viewResultDialog = useBoolean();
  const viewProfile = useBoolean();

  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

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
    if (
      searchParams?.classId &&
      searchParams?.subject &&
      searchParams?.assignmentType &&
      searchParams?.assigngmentTitle
    ) {
      setShowTable(true);
    }
  }, [
    classData,
    classes,
    searchParams?.assigngmentTitle,
    searchParams?.assignmentType,
    searchParams?.classId,
    searchParams?.subject,
    setSearchParams,
  ]);

  const handleCloseDialog = () => {
    viewResultDialog.onFalse();
    setSelectedStudent(null);
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  const handleBulkGradeAssignment = (values: { grade: string }) => {
    setTableData((prevData) =>
      prevData.map((student) =>
        selectedStudents.includes(student.id) ? { ...student, grade: values.grade } : student
      )
    );
    bulkGradeDialog.onFalse();
    setSelectedStudents([]);
  };

  const handleSingleGradeAssignment = (values: { grade: string; feedback: string }) => {
    setTableData((prevData) =>
      prevData.map((student) =>
        student.id === selectedStudent?.id
          ? { ...student, grade: values.grade, feedback: values.feedback }
          : student
      )
    );
    dialog.onFalse();
    setSelectedStudent(null);
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.grade === 'Assign Grade' ? (
            <MenuItem>
              <Iconify icon="mingcute:notification-fill" sx={{ height: '16px', width: '16px' }} />
              Remind To Teacher
            </MenuItem>
          ) : (
            <MenuItem>
              <Iconify icon="material-symbols:upload" sx={{ height: '16px', width: '16px' }} />
              Upload to Student
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              viewResultDialog.onTrue();
              setSelectedStudent(row);
            }}
          >
            {' '}
            <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
            View Result
          </MenuItem>

          <MenuItem
            onClick={() => {
              viewProfile.onTrue();
            }}
          >
            {' '}
            <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
            View Profile
          </MenuItem>
        </MenuList>
      </>
    ),
    [viewProfile, viewResultDialog]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Gradebook"
        links={[
          { name: 'Academics' },
          { name: 'Gradebook And Performace Tracking' },
          { name: 'Gradebook' },
        ]}
      />
      <Box display="flex" gap={1} flexWrap="wrap" alignItems="center" mb={3}>
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
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
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
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
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
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
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
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
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
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          disabled={!classes || !division || !subject || !assignmentType || !assignmentTitle}
          onClick={() => {
            setShowTable(true);
          }}
        >
          Show Assignment
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="mdi:pencil" />}
          disabled={selectedStudents.length === 0}
          onClick={bulkGradeDialog.onTrue}
        >
          Bulk Grade ({selectedStudents.length} selected)
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="material-symbols:upload" />}
          disabled={selectedStudents.length === 0}
          onClick={() => {}}
        >
          Upload Grade to Students
        </Button>
      </Box>
      {showTable && (
        <CustomizableTable
          tableId="gradebook-table"
          columns={[
            {
              id: 'select',
              label: 'Select',
              render: (value, row) => (
                <Checkbox
                  checked={selectedStudents.includes(row.id)}
                  onChange={() => handleSelectStudent(row.id)}
                />
              ),
            },
            { id: 'studentName', label: 'Student Name' },
            { id: 'assignments', label: 'Assignments' },
            {
              id: 'submissionDate',
              label: 'Submission Date',
              render: (value, row) => (
                <Typography fontSize="12px" gutterBottom>
                  {dayjs(value).format('DD MMM YYYY')}
                </Typography>
              ),
            },
            {
              id: 'subject',
              label: 'Subject',
              render: (value, row) => (
                <Typography fontSize="12px" gutterBottom>
                  {dayjs(value).format('DD MMM YYYY')}
                </Typography>
              ),
            },
            {
              id: 'grade',
              label: 'Grade',
              render: (value, row) => {
                const getChipColor = (grade: string) => {
                  if (!grade) return 'default';
                  const gradeValue = grade.toUpperCase();
                  if (['A+', 'A', 'A-'].includes(gradeValue)) return 'success';
                  if (['B+', 'B', 'B-'].includes(gradeValue)) return 'primary';
                  if (['C+', 'C', 'C-'].includes(gradeValue)) return 'warning';
                  if (gradeValue === 'D') return 'info';
                  if (gradeValue === 'F') return 'error';
                  return 'default';
                };

                return (
                  <Chip
                    key={value}
                    label={value || 'Assign Grade'}
                    size="small"
                    variant="outlined"
                    color={getChipColor(value)}
                    onClick={() => {
                      dialog.onTrue();
                      setSelectedStudent(row as TStudentGrade);
                    }}
                    sx={{
                      cursor: 'pointer',
                      ...((!value || value === 'Assign Grade') && {
                        color: 'text.primary',
                        borderColor: 'text.primary',
                      }),
                    }}
                  />
                );
              },
            },
            {
              id: 'feedback',
              label: 'Feedback',
              render: (value, row) =>
                value === '' ? (
                  <Typography variant="subtitle2" color="textSecondary">
                    -
                  </Typography>
                ) : (
                  <Typography variant="caption" gutterBottom>
                    {value}
                  </Typography>
                ),
            },
            { id: 'weightedAverage', label: 'Weighted Average' },
            {
              id: 'actions',
              label: 'Actions',
              isSort: false,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={(prop) => actions({ ...prop, row })}
                    placement="right-top"
                  />
                );
              },
            },
          ]}
          data={tableData}
        />
      )}

      <CustomDialog
        open={dialog.value}
        handleClose={() => {
          dialog.onFalse();
        }}
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

      <CustomDialog
        maxWidth="sm"
        open={viewResultDialog.value}
        handleClose={handleCloseDialog}
        title={`${selectedStudent?.studentName} details`}
      >
        <ViewResult student={selectedStudent} />
      </CustomDialog>

      <CustomDialog
        maxWidth="lg"
        open={viewProfile.value}
        handleClose={() => {
          viewProfile.onFalse();
        }}
        title="Student Profile"
      >
        <Box sx={{ p: 2 }}>
          <Scrollbar sx={{ height: '600px' }}>
            <Academic />
          </Scrollbar>
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default Gradebook;
