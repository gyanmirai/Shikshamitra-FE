import * as yup from 'yup';
import React, { useState } from 'react';

import { CheckBox } from '@mui/icons-material';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { Box, Button, MenuList, MenuItem, TextField, FormControlLabel } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

const ScheduleExam = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={dialog.onTrue}>
          New Exam
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'class', label: 'Class' },
          { id: 'subjectName', label: 'Subject Name' },
          { id: 'examName', label: 'Exam Name' },
          { id: 'marksEntry', label: 'Marks Entry' },
          { id: 'grade', label: 'Grade' },
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
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={[
          {
            class: '10th Grade',
            subjectName: 'Mathematics',
            examName: 'Mid-Term Exam',
            marksEntry: '50/100',
            grade: 'B',
            status: 'Completed',
            action: 'View',
          },
          {
            class: '11th Grade',
            subjectName: 'Physics',
            examName: 'Final Exam',
            marksEntry: '85/100',
            grade: 'A',
            status: 'Completed',
            action: 'View',
          },
          {
            class: '9th Grade',
            subjectName: 'English',
            examName: 'Quiz 1',
            marksEntry: '18/20',
            grade: 'A-',
            status: 'Pending',
            action: 'Edit',
          },
          {
            class: '12th Grade',
            subjectName: 'Chemistry',
            examName: 'Lab Test',
            marksEntry: '28/30',
            grade: 'A+',
            status: 'Pending',
            action: 'Review',
          },
          {
            class: '10th Grade',
            subjectName: 'History',
            examName: 'Term Paper',
            marksEntry: 'Not Available',
            grade: 'Pending',
            status: 'Scheduled',
            action: 'Cancel',
          },
        ]}
      />
      <CustomDialog
        maxWidth="lg"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="New Timetable"
      >
        <TimetableForm />
      </CustomDialog>
    </Box>
  );
};

export default ScheduleExam;

const SelectClassAndSubject = () => (
  <Box display="flex" gap={2}>
    <CustomSelect
      options={[]}
      label="Select Class"
      name="class"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
    <CustomSelect
      options={[]}
      label="Select Subject"
      name="subject"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
  </Box>
);

const SelectDateAndTime = () => (
  <Box display="flex" gap={2}>
    <DatePicker
      label="Select Date"
      format="DD-MM-YYYY"
      slotProps={{ textField: { size: 'small' } }}
    />
    <DateTimePicker
      label="Select Date & Time"
      format="HH:mm"
      views={['hours', 'minutes']}
      slotProps={{ textField: { size: 'small' } }}
    />
  </Box>
);

const AssignInvigilators = () => (
  <Box display="flex" gap={2}>
    <CustomSelect
      options={[]}
      label="teacher"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
    <CustomSelect
      options={[]}
      label="teacher availability status"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
  </Box>
);

const InputEvaluationCriteria = () => (
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

const allTimetableSteps = [
  SelectClassAndSubject,
  SelectDateAndTime,
  AssignInvigilators,
  InputEvaluationCriteria,
];

const TimetableForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <CustomStepperWithFormik
      initialValues={{}}
      steps={[
        'Select Class & Subject',
        'Select Date & Time',
        'Assign Invigilators',
        'Input Evaluation Criteria',
      ]}
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
            <StepComponent />
          </Box>
        );
      }}
    />
  );
};
