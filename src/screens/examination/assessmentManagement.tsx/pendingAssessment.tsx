import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useFormik } from 'formik';
import { PDFViewer } from '@react-pdf/renderer';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Button,
  MenuList,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CertificateDocument } from 'src/templates/student-certificates/bonofied-certificate-1';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface TAssessment {
  id: number;
  className: string;
  division: string;
  subject: string;
  assesmentTitle: string;
  examName?: string;
  assignmentName?: string;
  grade: string;
  remarks: string;
  status: string;
}

const assessments: TAssessment[] = [
  {
    id: 1,
    className: '10th Grade',
    division: 'A',
    subject: 'Mathematics',
    assesmentTitle: 'Mid-Term Exam',
    examName: 'Mid-Term Exam',
    grade: 'B',
    remarks: 'Needs improvement in algebra.',
    status: 'Completed',
  },
  {
    id: 2,
    className: '11th Grade',
    division: 'B',
    subject: 'Physics',
    assesmentTitle: 'Final Exam',
    examName: 'Final Exam',
    grade: 'A',
    remarks: 'Excellent performance in theoretical concepts.',
    status: 'Completed',
  },
  {
    id: 3,
    className: '9th Grade',
    division: 'C',
    subject: 'English',
    assesmentTitle: 'Weekly Assignment',
    assignmentName: 'Essay Writing',
    grade: 'A-',
    remarks: 'Good creativity but minor grammatical errors.',
    status: 'Under Review',
  },
  {
    id: 4,
    className: '12th Grade',
    division: 'D',
    subject: 'Chemistry',
    assesmentTitle: 'Lab Assessment',
    examName: 'Lab Practical',
    grade: 'A+',
    remarks: 'Outstanding practical skills and accuracy.',
    status: 'Completed',
  },
  {
    id: 5,
    className: '10th Grade',
    division: 'E',
    subject: 'History',
    assesmentTitle: 'Project Submission',
    assignmentName: 'Historical Timeline',
    grade: 'Pending',
    remarks: 'Awaiting submission.',
    status: 'Pending',
  },
  {
    id: 6,
    className: '8th Grade',
    division: 'F',
    subject: 'Biology',
    assesmentTitle: 'Unit Test 1',
    examName: 'Unit Test 1',
    grade: 'B+',
    remarks: 'Good understanding of plant anatomy.',
    status: 'Completed',
  },
];

const PendingAssessment = (props: TabComponentType) => {
  const [assessmentData, setAssessmentData] = useState<TAssessment[]>(assessments);
  const { searchParams, setSearchParams } = props;

  const classes = searchParams?.classId ? searchParams?.classId : '';
  const submissionDialog = useBoolean();

  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const modal = useBoolean();
  const uploadModal = useBoolean();
  const gradeScalingModal = useBoolean();

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

  return (
    <Box>
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
      </Box>
      <CustomizableTable
        columns={[
          { id: 'class', label: 'Class' },
          { id: 'subject', label: 'Subject Name' },
          { id: 'assessmentTitle', label: 'Assessment Title' },
          { id: 'examName', label: 'Exam Name' },
          { id: 'assignmentName', label: 'Assignment Name' },
          {
            id: 'status',
            label: 'Status',
            render(value: any, row: any) {
              return (
                <Label
                  color={
                    value === 'Completed'
                      ? 'primary'
                      : value === 'Pending'
                        ? 'error'
                        : value === 'Under Review'
                          ? 'secondary'
                          : 'default'
                  }
                >
                  {value}
                </Label>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      {row.status === 'Pending' ||
                        (row.status === 'Under Review' && (
                          <MenuItem
                            onClick={() => {
                              submissionDialog.onTrue();
                            }}
                          >
                            <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                            Enter Marks
                          </MenuItem>
                        ))}
                      <MenuItem
                        onClick={() => {
                          //   submissionDialog.onTrue();
                        }}
                      >
                        <Iconify
                          icon="material-symbols:upload"
                          sx={{ height: '16px', width: '16px' }}
                        />
                        Publish Result
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={assessmentData}
      />

      <CustomDialog
        title="View Student Submission"
        open={submissionDialog.value}
        handleClose={submissionDialog.onFalse}
        maxWidth="md"
      >
        <StudentSubmissions />
      </CustomDialog>
    </Box>
  );
};

export default PendingAssessment;

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
    status: 'Submitted',
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

const StudentSubmissions = () => {
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [tableData, setTableData] = useState<StudentGrade[]>(dummyData);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const dialog = useBoolean();
  const viewSubmissionDialog = useBoolean();
  const bulkGradeDialog = useBoolean();

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

  const handleCloseDialog = () => {
    setSelectedStudent(null);
    viewSubmissionDialog.onFalse();
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mdi:pencil" />}
          disabled={selectedStudents.length === 0}
          onClick={bulkGradeDialog.onTrue}
        >
          Bulk Grade ({selectedStudents.length} selected)
        </Button>
      </Box>

      <Scrollbar sx={{ p: 2, height: '500px' }}>
        <CustomizableTable
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
              id: 'status',
              label: 'Status',
              render: (value, row) => (
                <Label
                  color={
                    value === 'Submitted'
                      ? 'primary'
                      : value === 'Pending'
                        ? 'warning'
                        : value === 'Overdue'
                          ? 'error'
                          : 'default'
                  }
                >
                  {value}
                </Label>
              ),
            },
            {
              id: 'action',
              label: 'Action',
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={() => (
                      <MenuList>
                        {row.status === 'Pending' && (
                          <MenuItem
                            onClick={() => {
                              viewSubmissionDialog.onTrue();
                              setSelectedStudent(row);
                            }}
                          >
                            {' '}
                            <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                            View Submission
                          </MenuItem>
                        )}

                        {row.status === 'Submitted' && (
                          <MenuItem onClick={() => {}}>
                            {' '}
                            <Iconify icon="mdi:pen" sx={{ height: '16px', width: '16px' }} />
                            Edit
                          </MenuItem>
                        )}
                        {/* {row.grade === 'Assign Grade' ? (
                        <MenuItem>
                          <Iconify
                            icon="mingcute:notification-fill"
                            sx={{ height: '16px', width: '16px' }}
                          />
                          Remind To Teacher
                        </MenuItem>
                      ) : (
                        <MenuItem>
                          <Iconify
                            icon="material-symbols:upload"
                            sx={{ height: '16px', width: '16px' }}
                          />
                          Upload to Student
                        </MenuItem>
                      )} */}
                        {/* <MenuItem
                        onClick={() => {
                          viewResultDialog.onTrue();
                          setSelectedStudent(row);
                        }}
                      >
                        {' '}
                        <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                        View Result
                      </MenuItem> */}

                        {/* <MenuItem
                        onClick={() => {
                          viewProfile.onTrue();
                        }}
                      >
                        {' '}
                        <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                        View Profile
                      </MenuItem> */}
                      </MenuList>
                    )}
                  />
                );
              },
            },
          ]}
          data={tableData}
        />

        <CustomDialog
          open={viewSubmissionDialog.value}
          handleClose={handleCloseDialog}
          title="Assign Grade"
          maxWidth="md"
        >
          <AssignGrade data={selectedStudent} onSubmit={handleSingleGradeAssignment} />
        </CustomDialog>

        <CustomDialog
          open={bulkGradeDialog.value}
          handleClose={bulkGradeDialog.onFalse}
          title={`Assign Grade to ${selectedStudents.length} Students`}
          maxWidth="md"
        >
          <AssignGrade onSubmit={handleBulkGradeAssignment} />
        </CustomDialog>
      </Scrollbar>
    </Box>
  );
};

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
      console.log('values in component ---', values);

      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2} p={1}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <PDFViewer width="100%" height="600">
            <CertificateDocument />
          </PDFViewer>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
              <TextField
                placeholder="Detailed Feedback"
                multiline
                rows={3}
                fullWidth
                name="feedback"
                value={formik.values.feedback}
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
