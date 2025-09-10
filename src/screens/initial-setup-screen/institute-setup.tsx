import type {
  Board,
  Medium,
  Division,
  Standards,
  AcademicYear,
  Organization,
} from 'src/types/school';

import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import {
  Box,
  Step,
  Card,
  Stack,
  Button,
  Stepper,
  StepLabel,
  Typography,
  CardContent,
} from '@mui/material';

import ClassSetup from './components/class-setup';
import DivisionSetup from './components/division-setup';
import OrganizationSetup from './components/organization-setup';
import AcademicYearSetup from './components/academic-year-setup';
import EducationBoardSetup from './components/education-board-setup';
import EducationMediumSetup from './components/education-medium-setup';

interface InstituteSetupValues {
  academicYear: Partial<AcademicYear>;
  board: Partial<Board>;
  medium: Partial<Medium>;
  organization: Partial<Organization>;
  class: Partial<Standards>;
  division: Partial<Division>;
}

const validationSchema = Yup.object().shape({
  academicYear: Yup.object().shape({
    name: Yup.string().required('Academic year name is required'),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date()
      .required('End date is required')
      .min(Yup.ref('startDate'), 'End date must be after start date'),
  }),
  board: Yup.object().shape({
    name: Yup.string().required('Board name is required'),
  }),
  medium: Yup.object().shape({
    name: Yup.string().required('Medium name is required'),
  }),
  organization: Yup.object().shape({
    name: Yup.string().required('Medium name is required'),
  }),
  class: Yup.object().shape({
    name: Yup.string().required('Class name is required'),
  }),
  division: Yup.object().shape({
    name: Yup.string().required('Division name is required'),
  }),
});

const initialValues: InstituteSetupValues = {
  academicYear: {
    name: '',
    startDate: '',
    endDate: '',
  },
  board: {
    name: '',
  },
  medium: {
    name: '',
  },
  organization: {
    name: '',
  },
  class: {
    name: '',
  },
  division: {
    name: '',
  },
};

const steps = [
  'Academic Year',
  'Education Board',
  'Education Medium',
  'Organization',
  'Class Setup',
  'Division Setup',
];

const StepContent = React.memo(({ step, formik }: { step: number; formik: any }) => {
  const props = {
    values: formik.values,
    errors: formik.errors,
    touched: formik.touched,
    handleChange: formik.handleChange,
    handleBlur: formik.handleBlur,
    setFieldValue: formik.setFieldValue,
  };

  switch (step) {
    case 0:
      return <AcademicYearSetup {...props} />;
    case 1:
      return <EducationBoardSetup {...props} />;
    case 2:
      return <EducationMediumSetup {...props} />;
    case 3:
      return <OrganizationSetup {...props} />;
    case 4:
      return <ClassSetup {...props} />;
    case 5:
      return <DivisionSetup {...props} />;
    default:
      return null;
  }
});

const InstituteSetup = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleSubmit = async (values: InstituteSetupValues) => {
    console.log('Form submitted:', values);
    // Handle form submission here
  };

  const handleNext = (formik: any) => {
    const currentStepFields = Object.keys(formik.errors);
    const isCurrentStepValid = !currentStepFields.some((field) => {
      if (activeStep === 0 && field === 'academicYear') return formik.errors[field];
      if (activeStep === 1 && field === 'board') return formik.errors[field];
      if (activeStep === 2 && field === 'medium') return formik.errors[field];
      if (activeStep === 3 && field === 'organization') return formik.errors[field];
      if (activeStep === 4 && field === 'class') return formik.errors[field];
      if (activeStep === 5 && field === 'division') return formik.errors[field];
      return false;
    });

    if (isCurrentStepValid) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      formik.validateForm();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 5 }}>
            Institute Setup
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {(formik) => (
              <Form>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Box sx={{ mt: 4 }}>
                  {activeStep === steps.length ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ mt: 2, mb: 1 }}>
                        All steps completed - Institute setup is finished
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <StepContent step={activeStep} formik={formik} />
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ mt: 3, mb: 1, justifyContent: 'space-between' }}
                      >
                        <Button
                          variant="contained"
                          disabled={activeStep === 0}
                          onClick={handleBack}
                          size="small"
                        >
                          Back
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => {
                            if (activeStep === steps.length - 1) {
                              formik.handleSubmit();
                            } else {
                              handleNext(formik);
                            }
                          }}
                        >
                          {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                      </Stack>
                    </>
                  )}
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InstituteSetup;
