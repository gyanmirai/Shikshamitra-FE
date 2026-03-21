import type { BoxProps } from '@mui/material/Box';

import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import { motion, type MotionProps } from 'framer-motion';
import { useResponsive } from 'src/hooks/useResponsive';

import { varContainer } from './variants';

// ----------------------------------------------------------------------

export type MotionViewportProps = BoxProps &
  MotionProps & {
    disableAnimate?: boolean;
  };

export const MotionViewport = forwardRef<HTMLDivElement, MotionViewportProps>(
  ({ children, disableAnimate = true, ...other }, ref) => {
    const smDown = useResponsive('down', 'sm');

    const disabled = smDown && disableAnimate;

    const props = disabled
      ? {}
      : {
          component: motion.div,
          initial: 'initial',
          whileInView: 'animate',
          variants: varContainer(),
          viewport: { once: true, amount: 0.3 },
        };

    return (
      <Box ref={ref} {...props} {...other}>
        {children}
      </Box>
    );
  }
);
