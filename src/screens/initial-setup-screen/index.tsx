'use client';

import React from 'react';

import { Box, Paper, styled, Container } from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useUpdateTenantMutation } from 'src/redux/tenant/tenantApi';

import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import WelcomeScreen from './welcom-screen';
import LogoSignature from './logo-signature';
import InstituteSetup from './institute-setup';
import { validationSchema } from './validation-schema';
import { FormSlider } from '../student/enrollment/register/register-form';

/**
 * Array of step titles for the setup process
 */
const steps = ['Welcome screen', 'Basic Information', 'Institute Setup'];

/**
 * Component that renders different setup screens based on active step
 * @param props - Component props containing activeStep
 * @returns Appropriate component for the current step
 */
const CurrentComponent = (props: any): any => {
  const { activeStep } = props;
  if (activeStep === 0) {
    return <WelcomeScreen {...props} />;
  }
  if (activeStep === 1) {
    return <LogoSignature {...props} />;
  }
  if (activeStep === 2) {
    return <InstituteSetup {...props} />;
  }
  return null;
};

/**
 * Main component for initial setup workflow
 */
const InitialSetupScreen = () => {
  /**
   * State to track current step in setup process
   */
  const [activeStep, setActiveStep] = React.useState(0);

  /**
   * Mutation hook for updating tenant information
   */
  const [updateTenant, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateTenantMutation,
    popupConfig: {
      success: true,
      successMessage: 'Tenant Updated Successfully',
    },
  });

  /**
   * Object containing edit data for the form
   */
  const editData: any = {};

  /**
   * Initial values for each step of the setup process
   */
  const initialvalues: { [key: number]: any } = {
    0: {},
    1: {
      instituteName: editData?.name || '',
      instituteLogo: editData?.extraProperties?.Logo || null,
      instituteBanner: editData?.extraProperties?.Banner || null,
      addressLine1: editData?.extraProperties?.Address1 || '',
      addressLine2: editData?.extraProperties?.Address2 || '',
      addressLine3: editData?.extraProperties?.Address3 || '',
      city: editData?.extraProperties?.City ? { name: editData?.extraProperties?.City } : undefined,
      stateProvince: editData?.extraProperties?.State
        ? {
            name: editData?.extraProperties?.State?.name,
            isoCode: editData?.extraProperties?.State?.isoCode,
          }
        : undefined,
      zipPostalCode: editData?.extraProperties?.PostalCode || '',
      country: editData?.extraProperties?.Country
        ? {
            name: editData?.extraProperties?.Country?.name,
            isoCode: editData?.extraProperties?.Country?.isoCode,
          }
        : undefined,
      contactNumber: editData?.extraProperties?.ContactNumber || '',
      emailAddress: editData?.adminEmailAddress || '',
      password: '',
      principleSign: editData?.extraProperties?.PrincipleSign || null,
    },
    2: {},
  };

  return (
    <Box sx={{ bgcolor: 'background.neutral' }}>
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100dvh',
          flexDirection: 'column',
        }}
      >
        <CustomStepperWithFormik
          onStepClick={(index) => {
            // if (editData) {
            //   setActiveStep(index);
            // }
          }}
          scrollbarHeight="90%"
          initialValues={initialvalues[activeStep]}
          steps={steps}
          activeStep={activeStep}
          handleBack={() => {
            setActiveStep(activeStep - 1);
          }}
          validationSchema={validationSchema[activeStep]}
          handleNext={async (isLastStep, values, formik, setIsLoading) => {
            setIsLoading(true);
            try {
              if (!isLastStep) {
                setActiveStep(activeStep + 1);
              }
            } finally {
              setIsLoading(false);
            }
          }}
          renderItem={({ activeStep: step, formik, isBackClick }: any) => (
            <Box p={2} height="90%" width="100%">
              <FormSlider step={step} steps={steps} isBackClick={isBackClick}>
                <Paper
                  elevation={6}
                  sx={{
                    padding: 2,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {CurrentComponent?.({ formik, activeStep }) || <> </>}
                </Paper>
              </FormSlider>
            </Box>
          )}
        />
      </Container>
    </Box>
  );
};

export default InitialSetupScreen;

/**
 * Styled component for custom step icon in stepper
 */
const ColorlibStepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.grey[400],
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    background: theme.palette.primary.main,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    background: theme.palette.primary.main,
  }),
}));
