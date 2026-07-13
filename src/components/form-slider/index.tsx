'use client';

import type { BoxProps } from '@mui/material';

import { useRef } from 'react';
import { Box, Slide } from '@mui/material';

type FormSliderProps = {
  step: number;
  steps: readonly unknown[];
  children: React.ReactElement;
  isBackClick: boolean;
  containerProps?: BoxProps;
};

export const FormSlider = ({
  step,
  steps,
  children,
  isBackClick,
  containerProps = {},
}: FormSliderProps) => {
  const { sx = {}, ...props } = containerProps;
  const containerRef = useRef<HTMLElement>(null);

  return (
    <Box ref={containerRef} sx={{ p: 2, height: '100%', ...sx }} {...props}>
      {steps.map(
        (_, index) =>
          index === step && (
            <Slide
              in
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
