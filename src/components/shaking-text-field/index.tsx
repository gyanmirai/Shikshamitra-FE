'use client';

import type { BoxProps } from '@mui/material';

import { Box } from '@mui/material';
import { motion } from 'framer-motion';

export default function ShakingTextField({
  error = false,
  children,
  ...props
}: {
  error?: boolean;
  children?: React.ReactNode;
} & BoxProps) {
  return (
    <Box
      component={motion.div}
      initial={{ x: 0 }}
      animate={error ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ width: '100%', ...(props.sx || {}) }}
      {...props}
    >
      {children}
    </Box>
  );
}
