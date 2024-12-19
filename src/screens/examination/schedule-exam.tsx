import type { Dayjs } from 'dayjs';

import * as yup from 'yup';
import React, { useState } from 'react';

import { Add, CheckBox } from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Radio,
  Button,
  MenuList,
  MenuItem,
  TextField,
  RadioGroup,
  Typography,
  DialogContent,
  DialogActions,
  FormHelperText,
  FormControlLabel,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
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
  const [examData, setExamData] = useState(initialExamData);
  const dialog = useBoolean();
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<Add />} onClick={dialog.onTrue}>
          Create Exam
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'class', label: 'Class' },
          { id: 'subjectName', label: 'Subject Name' },
          { id: 'examType', label: 'Exam Type' },
          { id: 'examName', label: 'Exam Name' },
          { id: 'examDate', label: 'Exam Date' },
          { id: 'examTime', label: 'Exam Time' },
          { id: 'examDuration', label: 'Exam Duration' },
          { id: 'totalMarks', label: 'Total Marks' },
          {
            id: 'status',
            label: 'Status',
            render: (value) => (
              <Label color={value === 'Pending' ? 'warning' : 'success'}>{value}</Label>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          //   modal.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                        View Details
                      </MenuItem>
                      {row.status === 'Pending' && (
                        <>
                          <MenuItem
                            onClick={() => {
                              //   confirm.onTrue();
                              popover.onClose();
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <Iconify
                              icon="solar:trash-bin-trash-bold"
                              sx={{ height: '16px', width: '16px' }}
                            />
                            Delete
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              //   modal.onTrue();
                              popover.onClose();
                            }}
                          >
                            <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                            Edit
                          </MenuItem>
                        </>
                      )}
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={examData}
      />
      <CustomDialog
        maxWidth="md"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="Create Exam"
      >
        <NewExamForm />
      </CustomDialog>
    </Box>
  );
};

export default ScheduleExam;

const SelectExam = ({ formik }: any) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [isAllClassesSelected, setIsAllClassesSelected] = useState(
    formik.values?.className?.length === classData?.items?.length
  );

  const handleClass = (selectedValues: string[]) => {
    const allClassesValues = classData?.items?.map((org: any) => org.name);
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      if (isAllClassesSelected) {
        formik.setFieldValue('className', []);
      } else {
        formik.setFieldValue('className', allClassesValues);
      }
      setIsAllClassesSelected(!isAllClassesSelected);
    } else {
      formik.setFieldValue('className', selectedValues);
      setIsAllClassesSelected(selectedValues.length === allClassesValues.length);
    }
  };

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
            options={[
              {
                id: isAllClassesSelected ? 'deselectAll' : 'all',
                name: isAllClassesSelected ? 'Deselect All' : 'All',
              },
              ...(classData?.items || []),
            ]}
            value={formik.values.className}
            onChange={(val) => {
              handleClass(val as string[]);
            }}
            label="Class"
            isLoading={isLoading}
            multiple
            labelKey="name"
            valueKey="name"
            formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
          />
          {formik.touched.className && formik.errors.className && (
            <FormHelperText error>{formik.errors.className}</FormHelperText>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomSelect
            options={[
              { value: 'Math', label: 'Math' },
              { value: 'English', label: 'English' },
              { value: 'Science', label: 'Science' },
            ]}
            value={formik.values.subject}
            onChange={(val) => {
              formik.setFieldValue('subject', val);
            }}
            label="Subject"
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

const ExamDetails = ({ formik }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <DatePicker
          label="Exam Date"
          name="examDate"
          value={formik.values.examDate}
          format="DD/MM/YYYY"
          onChange={(newValue) => formik.setFieldValue('examDate', newValue)}
          slotProps={{
            textField: {
              sx: { width: '100%', minWidth: '200px' },
              size: 'small',
              helperText: formik.touched.examDate && (formik.errors.examDate as string),
              error: formik.touched.examDate && Boolean(formik.errors.examDate),
            },
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <DatePicker
          label="Exam Time"
          name="examTime"
          value={formik.values.examTime}
          format="HH:mm"
          onChange={(newValue) => formik.setFieldValue('examTime', newValue)}
          slotProps={{
            textField: {
              sx: { width: '100%', minWidth: '200px' },
              size: 'small',
              helperText: formik.touched.examTime && (formik.errors.examTime as string),
              error: formik.touched.examTime && Boolean(formik.errors.examTime),
            },
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Exam Duration"
          name="surveyTitle"
          value={formik.values.surveyTitle}
          onChange={formik.handleChange}
          error={formik.touched.surveyTitle && Boolean(formik.errors.surveyTitle)}
          helperText={formik.touched.surveyTitle && formik.errors.surveyTitle}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Total Marks"
          name="totalMarks"
          value={formik.values.totalMarks}
          onChange={formik.handleChange}
          error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
          helperText={formik.touched.totalMarks && formik.errors.totalMarks}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Exam Description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
          size="small"
          multiline
          rows={3}
        />
      </Grid>
    </Grid>
  </Box>
);

const SelectDateAndTime = ({ scheduledExams }: any) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const conflictExamDialog = useBoolean();

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    date && checkConflict(date, selectedTime);
  };

  const handleDateTimeChange = (time: Dayjs | null) => {
    setSelectedTime(time);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    time && checkConflict(selectedDate, time);
  };

  const checkConflict = (date: Dayjs | null, time: Dayjs | null) => {
    if (date && time) {
      const dateStr = date.format('DD-MM-YYYY');
      const timeStr = time.format('HH:mm');

      const conflictingExam = scheduledExams.find(
        (
          exam: any // need to change type according data from db
        ) => exam.date === dateStr && exam.time === timeStr
      );
      if (conflictingExam) {
        console.log('conflict in exam');
        conflictExamDialog.onTrue();
      }
    }
  };

  const handleCloseDialog = () => {
    setSelectedTime(null);
    setSelectedDate(null);
    conflictExamDialog.onFalse();
  };

  return (
    <Box display="flex" gap={2}>
      <DatePicker
        label="Select Date"
        format="DD-MM-YYYY"
        slotProps={{ textField: { size: 'small' } }}
        value={selectedDate}
        onChange={handleDateChange}
      />
      <TimePicker
        label="Select Time"
        format="HH:mm"
        value={selectedTime}
        onChange={handleDateTimeChange}
        views={['hours', 'minutes']}
        slotProps={{ textField: { size: 'small' } }}
      />
      <CustomDialog
        title="Popup"
        open={conflictExamDialog.value}
        handleClose={handleCloseDialog}
        maxWidth="md"
      >
        <DialogContent>
          <DialogContentText>There is another exam on this date and time</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            Ok
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

const EvaluationCriteria = ({ formik }: any) => {
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

const AssignTeachers = ({ formik }: any) => (
  <Box display="flex" flexDirection="column" gap={2}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <CustomSelect
          options={[]}
          label="Teachers"
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
        />
      </Grid>
    </Grid>
  </Box>
);

const Exams = [
  { subject: 'Mathematics', date: '15-10-2024', time: '10:00' },
  { subject: 'Physics', date: '15-10-2024', time: '14:00' },
];

const NewExamForm = () => {
  const [activeStep, setActiveStep] = useState(0);
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
      initialValues={{
        examType: '',
        examName: '',
        className: [],
        subject: '',
        examDate: null,
        examTime: null,
        examDuration: 0,
        totalMarks: 0,
        passingMarks: 0,
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
