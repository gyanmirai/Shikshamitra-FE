import type { BoxProps } from '@mui/material';

import { memo } from 'react';

import { Box } from '@mui/material';

const SchoolIllustration = ({ sx, ...other }: BoxProps) => (
  <Box
    component="svg"
    width="100%"
    height="100%"
    viewBox="0 0 500 400"
    xmlns="http://www.w3.org/2000/svg"
    sx={sx}
    {...other}
  >
    {/* School Building */}
    <rect
      x="100"
      y="150"
      width="300"
      height="200"
      fill="#f5f5f5"
      stroke="#2196f3"
      strokeWidth="2"
    />
    <path d="M80 150 L250 50 L420 150" fill="#2196f3" />

    {/* Windows */}
    <rect x="130" y="180" width="60" height="80" fill="#bbdefb" stroke="#1976d2" strokeWidth="2" />
    <rect x="220" y="180" width="60" height="80" fill="#bbdefb" stroke="#1976d2" strokeWidth="2" />
    <rect x="310" y="180" width="60" height="80" fill="#bbdefb" stroke="#1976d2" strokeWidth="2" />

    {/* Door */}
    <rect x="220" y="280" width="60" height="70" fill="#1976d2" />
    <circle cx="265" cy="315" r="3" fill="#ffffff" />

    {/* Steps */}
    <rect x="200" y="350" width="100" height="10" fill="#90caf9" />
    <rect x="190" y="360" width="120" height="10" fill="#90caf9" />

    {/* Trees */}
    <circle cx="80" cy="300" r="30" fill="#4caf50" />
    <rect x="75" y="300" width="10" height="40" fill="#795548" />

    <circle cx="420" cy="300" r="30" fill="#4caf50" />
    <rect x="415" y="300" width="10" height="40" fill="#795548" />

    {/* Sun */}
    <circle cx="50" cy="50" r="30" fill="#ffd700" />

    {/* Clouds */}
    <path
      d="M300 80 Q320 60 340 80 Q360 60 380 80 Q380 100 360 100 Q340 120 320 100 Q300 100 300 80"
      fill="#ffffff"
      stroke="#e0e0e0"
      strokeWidth="2"
    />
    <path
      d="M100 100 Q120 80 140 100 Q160 80 180 100 Q180 120 160 120 Q140 140 120 120 Q100 120 100 100"
      fill="#ffffff"
      stroke="#e0e0e0"
      strokeWidth="2"
    />
  </Box>
);

export default memo(SchoolIllustration);
