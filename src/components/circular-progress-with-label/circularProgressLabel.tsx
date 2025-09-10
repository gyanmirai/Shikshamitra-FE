import type { CircularProgressProps } from '@mui/material/CircularProgress';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

const CircularProgressLabel = ({ value, ...props }: CircularProgressProps & { value: number }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <CircularProgress variant="determinate" {...props} />
    <Box
      sx={{
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="caption"
        component="div"
        sx={{ color: 'text.secondary' }}
      >{`${Math.round(value)}%`}</Typography>
    </Box>
  </Box>
);

export default CircularProgressLabel;
