import * as yup from 'yup';
import React, { useState } from 'react';

import {
  Box,
  Card,
  List,
  Button,
  ListItem,
  TextField,
  Typography,
  CardContent,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

const Course = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" color="info" onClick={dialog.onTrue}>
          Create New Course
        </Button>
        <Button variant="contained" color="primary">
          View Course Details
        </Button>
        <Button variant="contained" color="secondary">
          Add Content
        </Button>
        <Button variant="contained" color="warning">
          View Assignment
        </Button>
        <Button variant="contained" color="success">
          Student Performance
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Mathematics 101
              </Typography>
              <CustomSelect
                formControlProps={{ sx: { maxWidth: 150, width: '100%' } }}
                options={[]}
                value=""
                onChange={() => {}}
                label="Class"
              />
            </Box>
            <List>
              <ListItem>
                <Iconify icon="mdi:dot" sx={{ mr: 1 }} />
                Teacher Name - Mr. Smith
              </ListItem>
              <ListItem>
                <Iconify icon="mdi:dot" sx={{ mr: 1 }} />
                Class - 10
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <CustomSelect
                formControlProps={{ sx: { maxWidth: 150, width: '100%' } }}
                options={[]}
                value=""
                onChange={() => {}}
                label="Class"
              />
            </Box>
            <List>
              <ListItem>
                {' '}
                <Iconify icon="mdi:dot" sx={{ mr: 1 }} />
                New Assignment Posted
              </ListItem>
              <ListItem>
                {' '}
                <Iconify icon="mdi:dot" sx={{ mr: 1 }} />
                Quiz Published
              </ListItem>
              <ListItem>
                {' '}
                <Iconify icon="mdi:dot" sx={{ mr: 1 }} />3 New Discussions
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>

      <CustomDialog
        maxWidth="lg"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="Create New Course"
      >
        <CourseForm />
      </CustomDialog>
    </Box>
  );
};

export default Course;

const CourseDetails = () => (
  <Box display="flex" gap={2}>
    <TextField size="small" label="Course Name" name="courseName" />
    <TextField size="small" label="Course Description" name="courseDescription" />
    <CustomSelect
      options={[]}
      label="Grade Level"
      name="gradeLevel"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 250, width: '100%' } }}
    />
  </Box>
);

const AssignTeacher = () => (
  <Box>
    <CustomSelect
      options={[]}
      label="Select Teacher"
      name="teacher"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 250, width: '100%' } }}
    />
  </Box>
);

const AddContent = () => (
  <Box>
    <Upload />
  </Box>
);

const SetLearningGoals = () => (
  <Box>
    <TextField
      size="small"
      label="Define learning objectives for this course"
      name="learningGoals"
      multiline
      rows={4}
      fullWidth
    />
    <Button startIcon={<Iconify icon="mdi:plus" />} variant="contained" color="primary">
      {' '}
      Add Another Goal
    </Button>
  </Box>
);

const allStep = [CourseDetails, AssignTeacher, AddContent, SetLearningGoals];

const CourseForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <CustomStepperWithFormik
      initialValues={{}}
      steps={['Course Details', 'Assign Teacher(s)', 'Add Content', 'Set Learning Goals']}
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
        const StepComponent = allStep[step];
        return (
          <Box p={2}>
            <StepComponent />
          </Box>
        );
      }}
    />
  );
};
