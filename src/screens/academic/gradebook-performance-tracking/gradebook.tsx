'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useFormik } from 'formik';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Grid,
  Chip,
  Button,
  Checkbox,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import Academic from 'src/screens/student/studentProfile/academic';
import { DetailRow } from 'src/screens/communication/announcement/schoolWiseAnnounsement';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export interface StudentGrade {
  id: string;
  studentName: string;
  assignments: string;
  subject: string;
  grade: string;
  feedback: string;
  weightedAverage: string;
  status: string;
}

export const dummyData = [
  {
    id: '1',
    studentName: 'John Smith',
    assignments: 'Math Quiz 1',
    subject: 'Mathematics',
    grade: '',
    feedback: '',
    weightedAverage: '85%',
    status: 'Submitted',
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
    grade: '',
    feedback: '',
    weightedAverage: '75%',
    status: 'Overdue',
  },
  {
    id: '4',
    studentName: 'Sarah Davis',
    assignments: 'Math Homework',
    subject: 'Mathematics',
    grade: '',
    feedback: '',
    weightedAverage: '88%',
    status: 'Submitted',
  },
  {
    id: '5',
    studentName: 'James Johnson',
    assignments: 'Science Quiz',
    subject: 'Science',
    grade: '',
    feedback: '',
    weightedAverage: '87%',
    status: 'Submitted',
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
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [tableData, setTableData] = useState<StudentGrade[]>(dummyData);
  const [showTable, setShowTable] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const dialog = useBoolean();
  const bulkGradeDialog = useBoolean();
  const viewResultDialog = useBoolean();
  const viewProfile = useBoolean();

  const { data: classData, isLoading } = useQueryAndMutation({
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
        heading="Gradebook"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Gradebook And Performace Tracking' },
          { name: 'Gradebook' },
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
              render: (value, row: any) => (
                <Checkbox
                  checked={selectedStudents.includes(row.id)}
                  onChange={() => handleSelectStudent(row.id)}
                />
              ),
            },
            { id: 'studentName', label: 'Student Name' },
            { id: 'assignments', label: 'Assignments' },
            { id: 'subject', label: 'Subject' },
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
                      setSelectedStudent(row);
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

interface AssignGradeProps {
  data?: any;
  onSubmit: (values: { grade: string; feedback: string }) => void;
}

const AssignGrade: React.FC<AssignGradeProps> = ({ data, onSubmit }: AssignGradeProps) => {
  const formik = useFormik({
    initialValues: {
      grade: data?.grade || '',
      feedback: data?.feedback || '',
    },
    onSubmit(values) {
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A', label: 'A' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B', label: 'B' },
                  { value: 'B-', label: 'B-' },
                  { value: 'C+', label: 'C+' },
                  { value: 'C', label: 'C' },
                  { value: 'C-', label: 'C-' },
                  { value: 'D', label: 'D' },
                  { value: 'F', label: 'F' },
                ]}
                label="Grade"
                name="grade"
                value={formik.values.grade}
                onChange={(val) => {
                  formik.setFieldValue('grade', val);
                }}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                error={formik.touched.grade && Boolean(formik.errors.grade)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                placeholder="Detailed Feedback"
                multiline
                rows={3}
                fullWidth
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

interface ViewResultProps {
  student: StudentGrade | null;
}

const ViewResult: React.FC<ViewResultProps> = ({ student }) => (
  <Box sx={{ p: 2 }}>
    <Scrollbar sx={{ height: '300px' }}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="ph:student-fill" className="text-gray-500 w-6 h-6" />
        <Typography variant="h6" className="font-semibold">
          {student?.studentName}
        </Typography>
      </Box>
      <hr className="border-gray-200" />

      <DetailRow
        label="Subject"
        icon="material-symbols:subject"
        value={
          <Typography variant="body2" className="text-gray-700">
            {student?.subject}
          </Typography>
        }
      />

      <DetailRow
        label="Assignment"
        icon="material-symbols:assignment"
        value={
          <Typography variant="body2" className="text-gray-700">
            {student?.assignments}
          </Typography>
        }
      />

      <DetailRow
        label="Grade"
        icon="material-symbols:grade"
        value={
          <Typography variant="body2" className="text-gray-700">
            {student?.grade}
          </Typography>
        }
      />

      <DetailRow
        label="Weighted Average"
        icon="hugeicons:chart-average"
        value={
          <Typography variant="body2" className="text-gray-700">
            {student?.weightedAverage}
          </Typography>
        }
      />
    </Scrollbar>
  </Box>
);
