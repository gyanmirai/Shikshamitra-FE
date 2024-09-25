import * as yup from 'yup';
import React, { useState } from 'react';

import { Box, Button, Switch, FormControlLabel } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

const NewTimetable = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={dialog.onTrue}>
          New Timetable
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'subjectName', label: 'Subject Name' },
          { id: 'assignTeacher', label: 'Assign Teacher' },
          { id: 'roomAssign', label: 'Room Assign' },
        ]}
        data={[
          { subjectName: 'Math', assignTeacher: 'Mr. Smith', roomAssign: 'Room 101' },
          { subjectName: 'English', assignTeacher: 'Ms. Johnson', roomAssign: 'Room 102' },
          { subjectName: 'Science', assignTeacher: 'Dr. Brown', roomAssign: 'Room 103' },
          { subjectName: 'History', assignTeacher: 'Mr. Davis', roomAssign: 'Room 104' },
          { subjectName: 'Geography', assignTeacher: 'Ms. Wilson', roomAssign: 'Room 105' },
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

export default NewTimetable;

const CreateNewTimetable = () => (
  <CustomSelect
    options={[]}
    label="Select Class"
    name="class"
    value=""
    onChange={() => {}}
    formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
  />
);

const AddSubject = () => (
  <CustomSelect
    options={[]}
    label="Select Subject"
    name="class"
    value=""
    onChange={() => {}}
    formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
  />
);

const AssignTeacher = () => (
  <CustomSelect
    options={[]}
    label="assign teacher"
    name="class"
    value=""
    onChange={() => {}}
    formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
  />
);

const RoomAllocation = () => (
  <Box>
    <CustomSelect
      options={[]}
      label="list of available rooms"
      name="class"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
    &nbsp;
    <FormControlLabel control={<Switch />} label="Auto Assign" />
  </Box>
);

const SetRecurrence = () => (
  <Box>
    <CustomSelect
      options={[]}
      label="Frequency Selection"
      name="class"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
    &nbsp;
    <FormControlLabel control={<Switch />} label="Weekly" />
  </Box>
);

const allTimetableSteps = [
  CreateNewTimetable,
  AddSubject,
  AssignTeacher,
  RoomAllocation,
  SetRecurrence,
];

const TimetableForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <CustomStepperWithFormik
      initialValues={{}}
      steps={[
        'Create New Timetable',
        'Add Subject',
        'Assign Teacher',
        'Room Allocation',
        'Set Recurrence',
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
