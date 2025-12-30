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
      sx={{
        '& .Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: 'error.main !important',
        },
        '& .Mui-disabled.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: 'error.main !important',
        },
        '& .MuiOutlinedInput-root.Mui-disabled.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: 'error.main !important',
        },
        '& .Mui-error .MuiInputLabel-root': {
          color: 'error.main !important',
        },
        '& .Mui-error.Mui-disabled .MuiInputLabel-root': {
          color: 'error.main !important',
        },
        '& .MuiInputLabel-root.Mui-disabled.Mui-error': {
          color: 'error.main !important',
        },
        '& .Mui-error .MuiFormHelperText-root': {
          color: 'error.main !important',
        },
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
