import React from 'react';
import { AppCurrentDownload } from 'src/sections/overview/app/app-current-download';

const PrincipalHouseDistribution = () => (
  <AppCurrentDownload
    title="House Distribution"
    chart={{
      series: [
        { label: 'Green House', value: 142 },
        { label: 'Blue House', value: 138 },
        { label: 'Red House', value: 145 },
        { label: 'Yellow House', value: 135 },
      ],
      colors: [
        '#4caf50', // Green
        '#2196f3', // Blue
        '#f44336', // Red
        '#ff9800', // Orange
      ],
    }}
    sx={{ height: '100%' }}
  />
);

export default PrincipalHouseDistribution;
