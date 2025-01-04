import * as Yup from 'yup';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Slide, TextField } from '@mui/material';

import { UploadAvatar } from 'src/components/upload';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import {
  allFields,
  bankDetailsInitialValues,
  familyFieldsInitialValues,
  generalFieldsInitialValues,
  medicalFieldsInitialValues,
  documentFieldsInitialValues,
  additionalDetailsInitialValues,
  CommunicationFieldsInitialValues,
  previousSchoolFieldsInitialValues,
} from './register-fields';

import type { FieldsType } from './register-fields';

const steps = [
  'General',
  'Documents',
  'Family Information',
  'Communication',
  // 'Account Detail',
  'Additional Details',
  'Medical Records',
  'Previous School Details',
  'Parents Bank Details',
];

const RegisterForm = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <CustomStepperWithFormik
      onStepClick={(index) => setActiveStep(index)}
      scrollbarHeight="100%"
      initialValues={{
        ...generalFieldsInitialValues(),
        ...documentFieldsInitialValues(),
        ...familyFieldsInitialValues(),
        ...CommunicationFieldsInitialValues(),
        ...additionalDetailsInitialValues(),
        ...medicalFieldsInitialValues(),
        ...previousSchoolFieldsInitialValues(),
        ...bankDetailsInitialValues(),
      }}
      steps={steps}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validationSchema={Yup.object({
        name: Yup.string(),
      })}
      handleNext={(isLastStep, values) => {
        if (isLastStep) return;

        setActiveStep(activeStep + 1);
      }}
      renderItem={({ activeStep: step, formik, isBackClick }: any) => (
        <FormSlider step={step} steps={steps} isBackClick={isBackClick}>
          <Box display="flex" gap={2}>
            {step === 0 && (
              <Box flexGrow={1} display="flex" alignItems="center">
                <UploadAvatar
                  maxSize={3145728}
                  onDrop={(acceptedFiles: File[]) => {
                    const value = acceptedFiles[0];
                    formik.setFieldValue('photo', value);
                  }}
                  value={formik.values.photo}
                  error={formik.touched.photo && Boolean(formik.errors.photo)}
                />
              </Box>
            )}
            <Grid container spacing={2}>
              {allFields[step].map((field: FieldsType) => (
                <Grid item xs={3} md={3} key={field.name} {...(field.gridProps || {})}>
                  {field.renderComp ? (
                    field.renderComp({ formik, field })
                  ) : field.type === 'date' ? (
                    <DatePicker
                      label={field.label}
                      name={field.name}
                      value={formik.values[field.name]}
                      format="DD/MM/YYYY"
                      onChange={(newValue) => formik.setFieldValue(field.name, newValue)}
                      slotProps={{
                        textField: {
                          placeholder: field.placeholder,
                          fullWidth: true,
                          size: 'small',
                          helperText: formik.touched[field.name] && formik.errors[field.name],
                          error: formik.touched[field.name] && Boolean(formik.errors[field.name]),
                        },
                      }}
                    />
                  ) : (
                    <TextField
                      key={field.name}
                      type={field.type}
                      size="small"
                      label={field.label}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formik.values[field.name]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                      helperText={formik.touched[field.name] && formik.errors[field.name]}
                      fullWidth
                      // sx={{ maxWidth: '200px', width: '100%', ...(field?.sx || {}) }}
                      {...(field?.otherProps || {})}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        </FormSlider>
      )}
    />
  );
};

export default RegisterForm;

const FormSlider = ({
  step,
  steps: allStep,
  children,
  isBackClick,
}: {
  step: number;
  steps: any[];
  children?: any;
  isBackClick: boolean;
}) => {
  const containerRef = React.useRef<HTMLElement>(null);
  return (
    <Box ref={containerRef} sx={{ p: 2, height: '100%' }}>
      {allStep.map(
        (_, index) =>
          index === step && (
            <Slide
              in={index === step}
              container={containerRef.current}
              direction={isBackClick ? 'right' : 'left'}
              key={index}
            >
              {children}
            </Slide>
          )
      )}
    </Box>
  );
};
