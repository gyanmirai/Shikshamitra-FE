import type { MotionProps } from 'framer-motion';
import type { BoxProps } from '@mui/material/Box';

import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import { motion } from 'framer-motion';

import { varContainer } from './variants';

// ----------------------------------------------------------------------

export type MotionContainerProps = BoxProps &
  MotionProps & {
    animate?: boolean;
    action?: boolean;
  };

export const MotionContainer = forwardRef<HTMLDivElement, MotionContainerProps>(
  ({ animate, action = false, children, ...other }, ref) => {
    const commonProps = {
      ref,
      component: motion.div,
      variants: varContainer(),
      initial: action ? false : 'initial',
      animate: action ? (animate ? 'animate' : 'exit') : 'animate',
      exit: action ? undefined : 'exit',
      ...other,
    };

    return <Box {...commonProps}>{children}</Box>;
  }
);
