import React from 'react';

import { useTheme } from '@mui/material';

import { EcommerceYearlySales } from 'src/sections/overview/e-commerce/ecommerce-yearly-sales';

const StudentStrengthClassWise = () => {
  const theme = useTheme();

  return (
    <EcommerceYearlySales
      title="Class Wise Strength"
      subheader="Academic Year 2025"
      chart={{
        categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        series: [
          {
            name: '2024',
            data: [
              {
                name: 'Students',
                data: [45, 38, 52, 63, 75, 82, 95, 105, 125, 88, 72, 65],
              },
            ],
          },
          {
            name: '2025',
            data: [
              {
                name: 'Students',
                data: [55, 48, 62, 73, 85, 92, 105, 115, 135, 98, 82, 75],
              },
            ],
          },
        ],
        colors: [theme.palette.success.main],
      }}
      sx={{ height: '100%', boxShadow: 'var(--shadows-2)' }}
      isShowChartLegend={false}
    />
  );
};

export default StudentStrengthClassWise;
