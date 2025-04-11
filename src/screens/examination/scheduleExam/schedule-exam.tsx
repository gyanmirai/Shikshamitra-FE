'use client';

import type { FormikProps } from 'formik';
import type { Standards } from 'src/types/school';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Grid,
  Radio,
  Button,
  TextField,
  RadioGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import { validationSchema } from './validationSchema';

import type { TSubjectDetail, TExamFormValues } from './type';
import type { TabComponentType } from '../../hr/leave-request';

const initialExamData = [
  {
    id: 1, // Unique ID for each row (optional if not required by the table)
    class: '10',
    subjectName: 'Mathematics',
    examType: 'Unit Test',
    examName: 'Maths Unit Test - Chapter 1',
    examDate: '2024-12-20',
    examTime: '10:00 AM',
    examDuration: '2 Hours',
    totalMarks: 50,
    status: 'Pending',
  },
  {
    id: 2,
    class: '9',
    subjectName: 'Science',
    examType: 'Mid-term Exam',
    examName: 'Science Mid-Term Examination',
    examDate: '2024-12-22',
    examTime: '12:00 PM',
    examDuration: '3 Hours',
    totalMarks: 100,
    status: 'Completed',
  },
  {
    id: 3,
    class: '8',
    subjectName: 'History',
    examType: 'Final Exam',
    examName: 'History Final Exam',
    examDate: '2024-12-25',
    examTime: '9:00 AM',
    examDuration: '2.5 Hours',
    totalMarks: 80,
    status: 'Pending',
  },
  {
    id: 4,
    class: '11',
    subjectName: 'Physics',
    examType: 'Practical Exam',
    examName: 'Physics Practical - Semester 1',
    examDate: '2024-12-18',
    examTime: '1:00 PM',
    examDuration: '1.5 Hours',
    totalMarks: 30,
    status: 'Completed',
  },
];

const ScheduleExam = (props: TabComponentType) => {
  // State to manage exam data with initial values
  const [examData, setExamData] = useState(initialExamData);
  // Custom hook to manage URL search parameters - controls form visibility
  // const [params, setParams] = useSearchParam({ isForm: 'false' });
  const [open, setOpen] = useState(false);
  // Boolean state for dialog control
  const dialog = useBoolean();

  // Dynamic breadcrumb navigation links based on current view (form or list)
  const links = open
    ? [
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Examination', href: '/academic/examinationDashboard' },
        { name: 'Schedule Exam' },
        { name: 'Exam Form' },
      ]
    : [
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Examination', href: '/academic/examinationDashboard' },
        { name: 'Schedule Exam' },
      ];
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Schedule Exam"
        description={
          open
            ? 'Create or update exam details, including the exam title, date, duration, and assigned subjects. Easily manage exam schedules and make adjustments as needed.'
            : 'View and manage all scheduled exams, including exam details, assigned subjects, and timings. Add new exams, update existing ones, or remove them as necessary.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={open ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              open
                ? () => {
                    setOpen(false);
                  }
                : () => {
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Scheudle Exam'}
          </Button>
        }
      />
      {open ? (
        <Card>
          <NewExamForm
            // onSubmit={handleSubmit}
            onClose={() => {
              setOpen(false);
            }}
          />
        </Card>
      ) : (
        <CustomizableTable
          tableId="schedule-exam-table"
          columns={[
            { id: 'class', label: 'Class', align: 'left', minWidth: 250 },
            { id: 'subjectName', label: 'Subject Name', align: 'left', minWidth: 250 },
            { id: 'examType', label: 'Exam Type', align: 'left', minWidth: 250 },
            { id: 'examName', label: 'Exam Name', align: 'left', minWidth: 250 },
            { id: 'examDate', label: 'Exam Date', align: 'left', minWidth: 250 },
            { id: 'examTime', label: 'Exam Time', align: 'left', minWidth: 250 },
            { id: 'examDuration', label: 'Exam Duration', align: 'left', minWidth: 250 },
            { id: 'totalMarks', label: 'Total Marks', align: 'left', minWidth: 250 },
            {
              id: 'status',
              label: 'Status',
              align: 'left',
              minWidth: 250,
              render: (value) => (
                <Label color={value === 'Pending' ? 'warning' : 'success'}>{value}</Label>
              ),
            },
            {
              id: 'action',
              label: 'Actions',
              isSort: false,
              sticky: true,
              isFilter: false,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    placement="right-top"
                    showThreeDots={false}
                    showViewIcon
                    showDeleteIcon
                    showEditIcon
                    handleDeleteClick={() => {}}
                    handleEditClick={() => {}}
                    handleViewClick={() => {}}
                  />
                );
              },
            },
          ]}
          data={[]}
        />
      )}
    </Box>
  );
};

export default ScheduleExam;

const SelectExam = (props: FormikProps<TExamFormValues>) => {
  const formik = props;
  // Fetch class data using custom hook and handle loading state
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  console.log('formik vakue----', formik.values);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ShakingTextField error={!!(formik.touched.examType && formik.errors.examType) || false}>
            <CustomSelect
              options={[
                { value: 'Mid', label: 'Mid' },
                { value: 'Practical', label: 'Practical' },
                { value: 'Final', label: 'Final' },
              ]}
              value={formik.values.examType}
              onChange={(val) => {
                formik.setFieldValue('examType', val);
              }}
              label="Exam Type"
              isLoading={isLoading}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={!!(formik.touched.examType && formik.errors.examType)}
              helperText={
                formik.touched.examType && formik.errors.examType
                  ? formik.errors.examType
                  : undefined
              }
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <ShakingTextField error={!!(formik.touched.examName && formik.errors.examName) || false}>
            <TextField
              fullWidth
              label="Exam Name"
              name="examName"
              value={formik.values.examName}
              onChange={formik.handleChange}
              error={formik.touched.examName && Boolean(formik.errors.examName)}
              helperText={formik.touched.examName && formik.errors.examName}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <ShakingTextField
            error={!!(formik.touched.className && formik.errors.className) || false}
          >
            <CustomSelect
              options={classData?.items}
              onChange={(val) => {
                formik.setFieldValue('className', val as string);
              }}
              label="Class"
              isLoading={isLoading}
              labelKey="name"
              valueKey="id"
              value={formik.values.className}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={!!(formik.touched.className && formik.errors.className)}
              helperText={
                formik.touched.className && formik.errors.className
                  ? formik.errors.className
                  : undefined
              }
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <ShakingTextField
            error={!!(formik.touched.divisions && formik.errors.divisions) || false}
          >
            <CustomSelect
              label="Division"
              labelKey="name"
              valueKey="id"
              multiple
              options={
                classData?.items.find((i: Standards) => i.id === formik.values.className)
                  ?.divisions || []
              }
              value={formik.values.divisions}
              onChange={(val) => {
                formik.setFieldValue('divisions', val as string[]);
              }}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={!!(formik.touched.divisions && formik.errors.divisions)}
              helperText={
                Array.isArray(formik.errors.divisions)
                  ? formik.errors.divisions.join(', ')
                  : (formik.touched.divisions && formik.errors.divisions) || undefined
              }
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <ShakingTextField error={!!(formik.touched.subjects && formik.errors.subjects) || false}>
            <CustomSelect
              options={[
                { value: 'Math', label: 'Math' },
                { value: 'English', label: 'English' },
                { value: 'Science', label: 'Science' },
              ]}
              value={formik.values.subjects.map((sub: TSubjectDetail) => sub.subjectName)} // Extract names
              onChange={(val) => {
                const updatedSubjects = val.map((subject, index) => ({
                  id: index,
                  subjectName: subject,
                  examDate: null,
                  examTime: null,
                  examDuration: 0,
                  totalMarks: 0,
                  passingMarks: 0,
                  teacher: '',
                  invigilationTeacher: '',
                }));
                formik.setFieldValue('subjects', updatedSubjects);
              }}
              multiple
              label="Subjects"
              isLoading={isLoading}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={!!(formik.touched.subjects && formik.errors.subjects)}
              helperText={
                formik.touched.subjects && formik.errors.subjects
                  ? Array.isArray(formik.errors.subjects)
                    ? formik.errors.subjects.join(', ') // Join array into a single string
                    : formik.errors.subjects // Directly use the string
                  : undefined
              }
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </Box>
  );
};

const ExamDetails = (props: FormikProps<TExamFormValues>) => {
  // State to track exam schedules for subjects - currently not being used
  const formik = props;
  const [examSchedules, setExamSchedules] = useState(formik.values.subjects);
  console.log('formik exam error---', formik.values);
  return (
    <CustomizableTable
      isFilter={false}
      isPagination={false}
      isScrollbar={false}
      isShowedDense={false}
      isSearch={false}
      tableId="examschedule-table"
      columns={[
        { id: 'subjectName', label: 'Subject Name', minWidth: '160px', align: 'left' },
        {
          id: 'examDate',
          label: 'Exam Date',
          render(value, row) {
            return (
              <DatePicker
                value={value ? dayjs(value) : null}
                format="DD-MM-YYYY"
                onChange={(newTime) => {
                  const updatedSchedules = [...examSchedules];
                  updatedSchedules[row.id].examDate = newTime;
                  setExamSchedules(updatedSchedules);
                }}
              />
            );
          },
        },
        {
          id: 'examTime',
          label: 'Exam Time',
          render(value, row) {
            return (
              <TimePicker
                format="HH:mm"
                value={value ? dayjs(value) : null}
                onChange={(newTime) => {
                  const updatedSchedules = [...examSchedules];
                  updatedSchedules[row.id].examTime = newTime;
                  setExamSchedules(updatedSchedules);
                }}
                slotProps={{ textField: { size: 'small' } }}
              />
            );
          },
        },
        {
          id: 'examDuration',
          label: 'Exam Duration',
          render(value, row) {
            return (
              <TimePicker
                value={value ? dayjs(value) : null}
                format="HH:mm"
                onChange={(newTime) => {
                  const updatedSchedules = [...examSchedules];
                  updatedSchedules[row.id].examDuration = newTime;
                  setExamSchedules(updatedSchedules);
                }}
                slotProps={{ textField: { size: 'small' } }}
              />
            );
          },
        },
        {
          id: 'totalMarks',
          label: 'Total Marks',
          render(value, row) {
            return (
              <TextField
                value={value}
                type="number"
                onChange={(e) => {
                  const updatedSchedules = [...examSchedules];
                  updatedSchedules[row.id].totalMarks = Number(e.target.value);
                  setExamSchedules(updatedSchedules);
                }}
                size="small"
              />
            );
          },
        },
        {
          id: 'passingMarks',
          label: 'Passing Marks',
          render(value, row) {
            return (
              <TextField
                value={value}
                type="number"
                onChange={(e) => {
                  const updatedSchedules = [...examSchedules];
                  updatedSchedules[row.id].passingMarks = Number(e.target.value);
                  setExamSchedules(updatedSchedules);
                }}
                size="small"
              />
            );
          },
        },
      ]}
      data={examSchedules}
    />
  );
};
const EvaluationCriteria = (props: FormikProps<TExamFormValues>) => {
  const formik = props;
  // State to track whether to use predefined or custom rubric
  const [rubricType, setRubricType] = useState<'predefined' | 'custom'>('predefined');
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Rubric Selection
          </Typography>
          <RadioGroup
            row
            value={rubricType}
            onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
          >
            <FormControlLabel value="predefined" control={<Radio />} label="Predefined Rubric" />
            <FormControlLabel value="custom" control={<Radio />} label="Custom Rubric" />
          </RadioGroup>
        </Grid>
        <Grid item xs={12} md={6}>
          {rubricType === 'predefined' ? (
            <CustomSelect
              options={[]}
              label="Predefined Rubrics"
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
            />
          ) : (
            <Button variant="contained" startIcon={<Add />}>
              Create New Rubric
            </Button>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

const AssignTeachers = (props: FormikProps<TExamFormValues>) => {
  const formik = props;
  // State to store exam schedules based on selected subjects
  const [examSchedules, setExamSchedules] = useState(formik.values.subjects);

  return (
    <CustomizableTable
      isFilter={false}
      isPagination={false}
      isScrollbar={false}
      isShowedDense={false}
      isSearch={false}
      tableId="examschedule-table"
      columns={[
        { id: 'subjectName', label: 'Subject Name' },
        {
          id: 'teacher',
          label: 'Teacher',
          render(value, row) {
            return (
              <CustomSelect
                options={[]}
                label="Teacher"
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: '180px', width: '100%' } }}
              />
            );
          },
        },
        {
          id: 'invigilationTeacher',
          label: 'Invigilation Teacher',
          render(value, row) {
            return (
              <CustomSelect
                options={[]}
                label="Invigilation Teachers"
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: '180px', width: '100%' } }}
              />
            );
          },
        },
      ]}
      data={examSchedules}
    />
  );
};

// Mock data for scheduled exams with subject, date and time information
const Exams = [
  { subject: 'Mathematics', date: '15-10-2024', time: '10:00' },
  { subject: 'Physics', date: '15-10-2024', time: '14:00' },
];

const NewExamForm = ({ onClose }: { onClose: () => void }) => {
  // Active step for stepper navigation
  const [activeStep, setActiveStep] = useState(0);
  // List of scheduled exams with subject, date and time information
  const [scheduledExams, setScheduledExams] = useState(Exams);

  const allTimetableSteps = [
    SelectExam,
    ExamDetails,
    // () => <SelectDateAndTime scheduledExams={scheduledExams} />,
    EvaluationCriteria,
    AssignTeachers,
  ];

  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={{
        examType: '',
        examName: '',
        className: '',
        divisions: [],
        subjects: [],
        description: '',
      }}
      steps={['Select Exam Type', 'Exam Details', 'Evaluation Criteria', 'Assign Teacher & Review']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      // validationSchema={yup.object().shape({})}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }) => {
        const StepComponent = allTimetableSteps[step];
        return (
          <Box p={2}>
            <StepComponent {...formik} />
          </Box>
        );
      }}
    />
  );
};
