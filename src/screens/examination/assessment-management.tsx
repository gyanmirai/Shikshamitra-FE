'use client';

import type { Dayjs } from 'dayjs';
import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { PDFViewer } from '@react-pdf/renderer';
import React, { useState, useEffect, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Button,
  Switch,
  MenuList,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  DialogContent,
  FormHelperText,
  DialogContentText,
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
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface TAssessment {
  id: number;
  className: string;
  division: string;
  subject: string;
  assessmentType: string;
  assesmentTitle: string;
  examName?: string;
  assignmentName?: string;
  createDate: Dayjs | null;
  dueDate: Dayjs | null;
  publish: boolean;
  status: string;
}

const assessments: TAssessment[] = [
  {
    id: 1,
    className: '10th Grade',
    division: 'A',
    subject: 'Mathematics',
    assessmentType: 'Exam',
    assesmentTitle: 'Mid-Term Exam',
    examName: 'Mid-Term Exam',
    createDate: dayjs('2024-01-01'),
    dueDate: dayjs('2024-01-15'),
    publish: true,
    status: 'Completed',
  },
  {
    id: 2,
    className: '11th Grade',
    division: 'B',
    subject: 'Physics',
    assessmentType: 'Exam',
    assesmentTitle: 'Final Exam',
    examName: 'Final Exam',
    createDate: dayjs('2024-02-01'),
    dueDate: dayjs('2024-02-20'),
    publish: true,
    status: 'Completed',
  },
  {
    id: 3,
    className: '9th Grade',
    division: 'C',
    subject: 'English',
    assessmentType: 'Assignment',
    assesmentTitle: 'Weekly Assignment',
    assignmentName: 'Essay Writing',
    createDate: dayjs('2024-01-10'),
    dueDate: dayjs('2024-01-17'),
    publish: true,
    status: 'Under Review',
  },
  {
    id: 4,
    className: '12th Grade',
    division: 'D',
    subject: 'Chemistry',
    assessmentType: 'Exam',
    assesmentTitle: 'Lab Assessment',
    examName: 'Lab Practical',
    createDate: dayjs('2024-03-05'),
    dueDate: dayjs('2024-03-10'),
    publish: true,
    status: 'Completed',
  },
  {
    id: 5,
    className: '10th Grade',
    division: 'E',
    subject: 'History',
    assessmentType: 'Assignment',
    assesmentTitle: 'Project Submission',
    assignmentName: 'Historical Timeline',
    createDate: dayjs('2024-04-01'),
    dueDate: dayjs('2024-04-15'),
    publish: true,
    status: 'Pending',
  },
  {
    id: 6,
    className: '8th Grade',
    division: 'F',
    subject: 'Biology',
    assessmentType: 'Exam',
    assesmentTitle: 'Unit Test 1',
    examName: 'Unit Test 1',
    createDate: dayjs('2024-01-20'),
    dueDate: dayjs('2024-01-30'),
    publish: true,
    status: 'Completed',
  },
];

const AssessmentManagement = (props: TabComponentType) => {
  const [assessmentData, setAssessmentData] = useState<TAssessment[]>(assessments);
  const { searchParams, setSearchParams } = props;
  const [selectedAssessment, setSelectedAssessment] = useState<TAssessment | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const classes = searchParams?.classId ? searchParams?.classId : '';

  const submissionDialog = useBoolean();
  const newAssesmentDialog = useBoolean();
  const confirmPublishDialog = useBoolean();

  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    value: boolean;
  } | null>(null);

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

  const handleCloseDialog = () => {
    newAssesmentDialog.onFalse();
    setIsEdit(false);
    setSelectedAssessment(null);
    confirmPublishDialog.onFalse();
    submissionDialog.onFalse();
  };

  const handleSubmit = (values: TAssessment) => {
    console.log('values---', values);

    if (isEdit) {
      setAssessmentData(
        assessmentData.map((assessment) => (assessment.id === values.id ? values : assessment))
      );
    } else {
      setAssessmentData([...assessmentData, values]);
    }
    handleCloseDialog();
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, value } = pendingStatusChange;
      setAssessmentData((prevSubject) =>
        prevSubject.map((assessment) =>
          assessment.id === id ? { ...assessment, publish: value } : assessment
        )
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {(row.status === 'Pending' || row.status === 'Under Review') && (
            <MenuItem
              onClick={() => {
                submissionDialog.onTrue();
              }}
            >
              <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
              Enter Marks
            </MenuItem>
          )}
          {row.status === 'Completed' && (
            <MenuItem
              onClick={() => {
                //   submissionDialog.onTrue();
              }}
            >
              <Iconify icon="material-symbols:upload" sx={{ height: '16px', width: '16px' }} />
              Publish Result
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [submissionDialog]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Assessment Management"
        links={[
          { name: 'Examination and Assessment' },
          { name: 'Examination' },
          { name: 'Assessment Management' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              newAssesmentDialog.onTrue();
            }}
            startIcon={<Add />}
          >
            Assessment
          </Button>
        }
      />
      <Box
        display="flex"
        gap={2}
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box display="flex" gap={2}>
          <CustomSelect
            label="Class"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              setSearchParams?.({
                classId: val as string,
              });
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            value={classes}
            formControlProps={{
              sx: { width: '100%', minWidth: '150px' },
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
              setDivision(val as string);
            }}
            formControlProps={{
              sx: { width: '100%', minWidth: '150px' },
            }}
          />
        </Box>
      </Box>

      <CustomizableTable
        tableId="assessment-management-table"
        columns={[
          { id: 'className', label: 'Class' },
          { id: 'division', label: 'Division' },
          { id: 'subject', label: 'Subject Name', minWidth: '150px', align: 'left' },
          { id: 'assesmentTitle', label: 'Assessment Title', minWidth: '200px', align: 'left' },
          { id: 'examName', label: 'Exam Name', minWidth: '150px', align: 'left' },
          { id: 'assessmentType', label: 'Assessment Type', minWidth: '200px', align: 'left' },
          { id: 'assignmentName', label: 'Assignment Name', minWidth: '200px', align: 'left' },
          {
            id: 'publish',
            label: 'Publish',
            render: (value: boolean, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  size="small"
                  checked={value}
                  onChange={() => {
                    setPendingStatusChange({
                      id: row.id, // Use row.id instead of undefined 'id'
                      value: !value,
                    });
                    confirmPublishDialog.onTrue();
                  }}
                />
              </Box>
            ),
          },
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
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {
                    newAssesmentDialog.onTrue();
                    setIsEdit(true);
                  }}
                  handleEditClick={() => {}}
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

      <CustomDialog
        maxWidth="md"
        open={newAssesmentDialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? `Edit ${selectedAssessment?.assesmentTitle}` : `Create Assessment`}
      >
        <AddNewAssessment data={selectedAssessment} onSubmit={handleSubmit} isEdit={isEdit} />
      </CustomDialog>

      <CustomDialog
        title="Confirm Publication"
        open={confirmPublishDialog.value}
        handleClose={confirmPublishDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure to {pendingStatusChange?.value === true ? 'Publish' : 'Unpublish'} this
            Assessment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default AssessmentManagement;

interface AddNewAssessmentProps {
  onSubmit: (values: TAssessment) => void;
  data: TAssessment | null;
  isEdit: boolean;
}

const AddNewAssessment: React.FC<AddNewAssessmentProps> = ({ onSubmit, data, isEdit }) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [classes, setClasses] = useState<string>(data?.className || '');
  const [division, setDivision] = useState<string>(data?.division || '');
  const [divisionOptions, setDivisionOptions] = useState<any[]>([]);

  const formik = useFormik({
    initialValues: {
      className: data?.className || '',
      division: data?.division || '',
      subject: data?.subject || '',
      assesmentTitle: data?.assesmentTitle || '',
      assessmentType: data?.assessmentType || '',
      examName: data?.examName || '',
      assignmentName: data?.assignmentName || '',
      createDate: data?.createDate ? dayjs(data?.createDate) : dayjs(),
      dueDate: data?.dueDate ? dayjs(data?.dueDate) : null,
      publish: data?.publish || false,
      status: data?.status || '',
    },
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(),
        status: data?.status || 'Pending',
      });
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CustomSelect
                options={classData?.items || []}
                value={classes}
                onChange={(val) => {
                  const selectedClass = classData?.items?.find((i: any) => i.id === val);
                  formik.setFieldValue('className', selectedClass?.name || '');
                  setClasses(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                label="Class"
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {formik.touched.className && formik.errors.className && (
                <FormHelperText error>{formik.errors.className}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Division"
                disabled={!classes}
                labelKey="name"
                valueKey="name"
                options={divisionOptions}
                value={division}
                onChange={(val) => {
                  formik.setFieldValue('division', val);
                  setDivision(val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'math', label: 'Mathematics' },
                  { value: 'science', label: 'Science' },
                  { value: 'history', label: 'History' },
                  { value: 'english', label: 'English' },
                ]}
                value={formik.values.subject}
                onChange={(val) => formik.setFieldValue('subject', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Assesment Title"
                name="assesmentTitle"
                value={formik.values.assesmentTitle}
                onChange={formik.handleChange}
                error={formik.touched.assesmentTitle && Boolean(formik.errors.assesmentTitle)}
                helperText={formik.touched.assesmentTitle && formik.errors.assesmentTitle}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Assessment Type"
                options={[
                  { value: 'exam', label: 'Exam' },
                  { value: 'assignment', label: 'Assignment' },
                ]}
                value={formik.values.assessmentType}
                onChange={(val) => formik.setFieldValue('assessmentType', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            {formik.values.assessmentType === 'exam' && (
              <Grid item xs={12} md={6}>
                <CustomSelect
                  label="Exam Name"
                  options={[
                    { value: 'Mid Exam', label: 'Mid Exam' },
                    { value: 'Final', label: 'Final' },
                  ]}
                  value={formik.values.examName}
                  onChange={(val) => formik.setFieldValue('examName', val)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
            )}

            {formik.values.assessmentType === 'assignment' && (
              <Grid item xs={12} md={6}>
                <CustomSelect
                  label="Assignment Name"
                  options={[
                    { value: 'Ass1', label: 'Ass1' },
                    { value: 'Ass2', label: 'Ass2' },
                  ]}
                  value={formik.values.assignmentName}
                  onChange={(val) => formik.setFieldValue('assignmentName', val)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date"
                value={formik.values.createDate}
                onChange={(val) => {
                  formik.setFieldValue('createDate', val);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.createDate && Boolean(formik.errors.createDate),
                  },
                }}
                disablePast
              />
              {formik.touched.createDate && formik.errors.createDate && (
                <FormHelperText error>{String(formik.errors.createDate)}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Due Date"
                value={formik.values.dueDate}
                onChange={(val) => {
                  formik.setFieldValue('dueDate', val);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.dueDate && Boolean(formik.errors.dueDate),
                  },
                }}
                disablePast
              />
              {formik.touched.dueDate && formik.errors.dueDate && (
                <FormHelperText error>{String(formik.errors.dueDate)}</FormHelperText>
              )}
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              variant="contained"
              onClick={() => {
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  formik.setFieldValue('publish', false);
                  formik.handleSubmit();
                }}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={() => {
                  formik.setFieldValue('publish', true);
                  formik.handleSubmit();
                }}
              >
                Publish
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};

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
    status: 'Pending',
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
    status: 'Pending',
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
    grade: '',
    feedback: '',
    weightedAverage: '87%',
    status: 'Pending',
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

  const handleBulkGradeAssignment = (values: { grade: string; feedback: string }) => {
    setTableData((prevData) =>
      prevData.map((student) =>
        selectedStudents.includes(student.id)
          ? { ...student, grade: values.grade, feedback: values.feedback }
          : student
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
          tableId="student-submissions"
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
          <AssignGrade
            isBulk={false}
            data={selectedStudent}
            onSubmit={handleSingleGradeAssignment}
          />
        </CustomDialog>

        <CustomDialog
          open={bulkGradeDialog.value}
          handleClose={bulkGradeDialog.onFalse}
          title={`Assign Grade to ${selectedStudents.length} Students`}
        >
          <AssignGrade isBulk onSubmit={handleBulkGradeAssignment} />
        </CustomDialog>
      </Scrollbar>
    </Box>
  );
};

interface AssignGradeProps {
  isBulk: boolean;
  data?: any;
  onSubmit: (values: { grade: string; feedback: string }) => void;
}

const AssignGrade: React.FC<AssignGradeProps> = ({ isBulk, data, onSubmit }: AssignGradeProps) => {
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
        <Scrollbar
          sx={{ p: 2, bgcolor: 'background.neutral', height: !isBulk ? '500px' : '200px' }}
        >
          {!isBulk && (
            <PDFViewer width="100%" height="600">
              <CertificateDocument />
            </PDFViewer>
          )}
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
