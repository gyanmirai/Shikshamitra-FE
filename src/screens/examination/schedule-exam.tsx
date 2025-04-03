'use client';

import type { Division, Standards } from 'src/types/school';

import dayjs from 'dayjs';
import * as yup from 'yup';
import React, { useState } from 'react';

import { Add, CheckBox } from '@mui/icons-material';
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
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import type { TabComponentType } from '../hr/leave-request';

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
  const [params, setParams] = useSearchParam({ isForm: 'false' });

  // Boolean state for dialog control
  const dialog = useBoolean();

  // Dynamic breadcrumb navigation links based on current view (form or list)
  const links =
    params.isForm === 'true'
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
          params.isForm === 'true'
            ? 'Create or update exam details, including the exam title, date, duration, and assigned subjects. Easily manage exam schedules and make adjustments as needed.'
            : 'View and manage all scheduled exams, including exam details, assigned subjects, and timings. Add new exams, update existing ones, or remove them as necessary.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={params.isForm === 'true' ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              params.isForm === 'true'
                ? () => {
                    setParams({ isForm: 'false' });
                  }
                : () => {
                    setParams({ isForm: 'true' });
                  }
            }
          >
            {params.isForm === 'true' ? 'Back' : 'Scheudle Exam'}
          </Button>
        }
      />
      {params.isForm === 'true' ? (
        <Card>
          <NewExamForm
            // onSubmit={handleSubmit}
            onClose={() => {
              setParams({ isForm: 'false' });
            }}
          />
        </Card>
      ) : (
        <CustomizableTable
          tableId="schedule-exam-table"
          columns={[
            { id: 'class', label: 'Class' },
            { id: 'subjectName', label: 'Subject Name', align: 'left', minWidth: '180px' },
            { id: 'examType', label: 'Exam Type', align: 'left', minWidth: '180px' },
            { id: 'examName', label: 'Exam Name', align: 'left', minWidth: '180px' },
            { id: 'examDate', label: 'Exam Date', align: 'left', minWidth: '180px' },
            { id: 'examTime', label: 'Exam Time', align: 'left', minWidth: '180px' },
            { id: 'examDuration', label: 'Exam Duration', align: 'left', minWidth: '200px' },
            { id: 'totalMarks', label: 'Total Marks', align: 'left', minWidth: '200px' },
            {
              id: 'status',
              label: 'Status',
              render: (value) => (
                <Label color={value === 'Pending' ? 'warning' : 'success'}>{value}</Label>
              ),
            },
            {
              id: 'action',
              label: 'Actions',
              isSort: false,
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

const SelectExam = ({ formik }: any) => {
  // Fetch class data using custom hook and handle loading state
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // State to store and manage division options for selected class
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
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
          />
          {formik.touched.examType && formik.errors.examType && (
            <FormHelperText error>{formik.errors.examType}</FormHelperText>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
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
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            options={classData?.items}
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              formik.setFieldValue('className', val as string);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            label="Class"
            isLoading={isLoading}
            labelKey="name"
            valueKey="id"
            value={formik.values.className}
            formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
          />
          {formik.touched.className && formik.errors.className && (
            <FormHelperText error>{formik.errors.className}</FormHelperText>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Division"
            labelKey="name"
            valueKey="id"
            multiple
            options={divisionOptions}
            value={formik.values.divisions}
            onChange={(val) => {
              formik.setFieldValue('divisions', val as string[]);
            }}
            formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
          />
          {formik.touched.divisions && formik.errors.divisions && (
            <FormHelperText error>{formik.errors.divisions}</FormHelperText>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomSelect
            options={[
              { value: 'Math', label: 'Math' },
              { value: 'English', label: 'English' },
              { value: 'Science', label: 'Science' },
            ]}
            value={formik.values.subjects.map((sub: any) => sub.subjectName)} // Extract names
            onChange={(val) => {
              const updatedSubjects = val.map((subject) => ({
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
          />
          {formik.touched.subject && formik.errors.subject && (
            <FormHelperText error>{formik.errors.subject}</FormHelperText>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

const ExamDetails = ({ formik }: any) => {
  // State to track exam schedules for subjects - currently not being used
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
        { id: 'subjectName', label: 'Subject Name', minWidth: '160px', align: 'left' },
        {
          id: 'examDate',
          label: 'Exam Date',
          render(value, row) {
            return (
              <DatePicker
                value={value ? dayjs(value) : null}
                onChange={(newTime) => {}}
                slotProps={{ textField: { size: 'small' } }}
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
                value={value ? dayjs(value) : null}
                onChange={(newTime) => {}}
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
                onChange={(newTime) => {}}
                slotProps={{ textField: { size: 'small' } }}
              />
            );
          },
        },
        {
          id: 'totalMarks',
          label: 'Total Marks',
          render(value, row) {
            return <TextField value={value} onChange={(newTime) => {}} size="small" />;
          },
        },
        {
          id: 'passingMarks',
          label: 'Passing Marks',
          render(value, row) {
            return <TextField value={value} onChange={(newTime) => {}} size="small" />;
          },
        },
      ]}
      data={examSchedules}
    />
  );
};

const EvaluationCriteria = ({ formik }: any) => {
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

const InputEvaluationCriteria = ({ formik }: any) => (
  <Box display="flex" flexDirection="column" gap={2}>
    <Box display="flex" gap={2} flexWrap="wrap">
      <TextField label="Organization Name" size="small" />
      <CustomSelect
        options={[]}
        label="grading schema"
        name="gradingSchema"
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
      />
      <CustomSelect
        options={[]}
        label="Class"
        name="class"
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
      />
    </Box>
    <FormControlLabel
      sx={{ pl: 1 }}
      control={<CheckBox />}
      label="schedule this exam across multiple classes"
    />
    <Box display="flex" gap={2} flexWrap="wrap">
      <TextField label="Additional Notes" size="small" multiline rows={3} />
    </Box>
  </Box>
);

const AssignTeachers = ({ formik }: any) => {
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

const NewExamForm = ({ onClose }: any) => {
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
        subjects: [
          {
            subjectName: '',
            examDate: null,
            examTime: null,
            examDuration: null,
            totalMarks: 0,
            passingMarks: 0,
            invigilationTeacher: '',
            teacher: '',
          },
        ],
        description: '',
      }}
      steps={['Select Exam Type', 'Exam Details', 'Evaluation Criteria', 'Assign Teacher & Review']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      // validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      validationSchema={yup.object().shape({})}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }: any) => {
        const StepComponent = allTimetableSteps[step];
        return (
          <Box p={2}>
            <StepComponent formik={formik} />
          </Box>
        );
      }}
    />
  );
};
