'use client';

import React from 'react';

import { Box, Step, Stepper, useTheme, StepLabel } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

interface CustomStepperProps {
  steps: string[];
  activeStep: number;
}

const CustomStepper: React.FC<CustomStepperProps> = ({ steps, activeStep }) => (
  <Box sx={{ width: '100%' }}>
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((label, index) => (
        <Step key={label} sx={{ '& svg': { height: '30px', width: '30px' } }}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  </Box>
);

export default CustomStepper;

const SVGComponent = ({ active, index, ...props }: any) => {
  const theme = useTheme();

  return (
    <svg
      width="60px"
      height="60px"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      style={{ fill: active ? varAlpha(theme.palette.primary.mainChannel) : 'transparent' }}
    >
      <title>label-solid</title>
      <g id="Layer_2" data-name="Layer 2">
        <g id="invisible_box" data-name="invisible box">
          <rect width="48" height="48" fill="none" />
        </g>
        <g id="icons_Q2" data-name="icons Q2">
          <path
            style={{ strokeWidth: '1px', stroke: theme.palette.primary.main }}
            d="M33.5,9H4a2,2,0,0,0-2,2V37a2,2,0,0,0,2,2H33.5a.9.9,0,0,0,.8-.4L45.6,25.2a2.1,2.1,0,0,0,0-2.4L34.3,9.4a.9.9,0,0,0-.8-.4Z"
          />
        </g>
      </g>
      <text
        x="45%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill={active ? theme.palette.common.white : theme.palette.primary.main}
        fontSize={12}
        fontWeight="bold"
      >
        {index + 1}
      </text>
    </svg>
  );
};
