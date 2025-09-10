import * as React from 'react';
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';

const steps = ['Attendance', 'Salary'];

export default function StepsForPayroll() {
  const completedSteps = [true, false]; // Step 1 is completed, Step 2 is not
  const disabledSteps = [false, true];
  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={1} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label} completed={completedSteps[index]} disabled={disabledSteps[index]}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
