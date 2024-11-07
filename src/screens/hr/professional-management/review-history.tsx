import React from 'react';

import { Search } from '@mui/icons-material';
import { Box, TextField, InputAdornment } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

import { CourseHoursSpent } from 'src/sections/overview/course/course-hours-spent';

const ReviewHistory = () => (
  <Box>
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        placeholder="Search by department or performance period."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{
          backgroundColor: 'background.paper',
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />
    </Box>
    <CustomizableTable
      columns={[
        { id: 'date', label: 'Date' },
        { id: 'reviewer', label: 'Reviewer' },
        { id: 'overallRating', label: 'Overall Rating' },
      ]}
      data={[
        { id: 1, date: '2023-01-15', reviewer: 'John Smith', overallRating: 4.5 },
        { id: 2, date: '2023-03-22', reviewer: 'Sarah Johnson', overallRating: 4.8 },
        { id: 3, date: '2023-06-10', reviewer: 'Michael Brown', overallRating: 4.2 },
        { id: 4, date: '2023-09-05', reviewer: 'Emily Davis', overallRating: 4.6 },
        { id: 5, date: '2023-12-18', reviewer: 'David Wilson', overallRating: 4.3 },
      ]}
    />

    <CourseHoursSpent
      title="Performance trends"
      chart={{
        series: [
          {
            name: 'Weekly',
            categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
            data: [{ data: [10, 41, 35, 151, 49] }],
          },
          {
            name: 'Monthly',
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            data: [{ data: [83, 112, 119, 88, 103, 112, 114, 108, 93] }],
          },
          {
            name: 'Yearly',
            categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
            data: [{ data: [24, 72, 64, 96, 76, 41] }],
          },
        ],
      }}
      sx={{ my: 2 }}
    />
  </Box>
);

export default ReviewHistory;
