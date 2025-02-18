import React, { useState } from 'react';

import { useTheme } from '@mui/material/styles';
import { Box, CardHeader } from '@mui/material';

import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';

import { EcommerceSaleByGender } from 'src/sections/overview/e-commerce/ecommerce-sale-by-gender';

type StudentDataType = {
  [studentName: string]: {
    [subject: string]: number;
  };
};

// Sample Data (Student → Subject-wise Marks)
const studentData: StudentDataType = {
  'Jeet Patel': { Math: 85, Science: 78, English: 90, History: 65, Geography: 72 },
  'Rohan Sharma': { Math: 55, Science: 60, English: 70, History: 80, Geography: 88 },
  'Ananya Gupta': { Math: 92, Science: 85, English: 88, History: 91, Geography: 86 },
  'Meera Singh': { Math: 75, Science: 80, English: 78, History: 68, Geography: 70 },
};

// Calculate Class Average for each subject
const calculateClassAverage = (subject: string) => {
  const total = Object.values(studentData).reduce((sum, student) => sum + student[subject], 0);
  return total / Object.keys(studentData).length;
};

const getBarColor = (score: number) => {
  if (score >= 80) return '#4CAF50'; // Green (Good)
  if (score >= 60) return '#FFC107'; // Yellow (Average)
  return '#F44336'; // Red (Poor)
};

// StudentPerformanceChart Component
export const StudentPerformanceChart = () => {
  const theme = useTheme();
  const [selectedStudent, setSelectedStudent] = useState<string>('Jeet Patel');

  const onStudentChange = (e: string) => {
    setSelectedStudent(e);
  };

  const studentOptions = Object.keys(studentData).map((name) => ({
    value: name,
    label: name,
  }));

  const subjects = Object.keys(studentData[selectedStudent] || {});
  const scores = subjects.map((subject) => studentData[selectedStudent][subject]);

  // Calculate Class Average for each subject
  const classAverages = subjects.map((subject) => calculateClassAverage(subject));

  // Chart Series with Student Marks and Class Average
  const chartSeries = [
    { name: 'Marks', data: scores },
    { name: 'Class Average', data: classAverages },
  ];

  // Class average color should always be the same (blue)
  const chartColors = [
    ...scores.map(getBarColor), // Dynamic colors for student marks
    '#2196F3', // Static blue color for class average
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 2, colors: ['transparent'] },
    xaxis: { categories: subjects },
    tooltip: {
      y: { formatter: (value: number) => `${value} Marks` },
    },
    plotOptions: {
      bar: {
        distributed: true, // Assigns different colors to each bar
        borderRadius: 6,
      },
    },
  });

  // Calculate Discipline and Attendance based on student's performance
  const calculateDiscipline = () => {
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return averageScore >= 75 ? 75 : averageScore; // Higher marks = Better Discipline
  };

  const calculateAttendance = () => {
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return averageScore >= 60 ? 50 : 25; // Attendance based on average performance
  };

  // Calculate the discipline and attendance values dynamically
  const discipline = calculateDiscipline();
  const attendance = calculateAttendance();

  const ecommerceChart = {
    series: [
      { label: 'Discipline', value: discipline },
      { label: 'Attendance', value: attendance },
    ],
    colors: [
      [theme.palette.success.light, theme.palette.success.main],
      [theme.palette.warning.light, theme.palette.warning.main],
    ],
  };

  return (
    <Box display="flex" justifyContent="space-between">
      <Box flex={8}>
        <Box display="flex" alignItems="center" justifyContent="space-between" pr="20px" pt="10px">
          <CardHeader title="Student Performance" subheader="Subject-wise Marks Analysis" />
          <CustomSelect
            label="Select Student"
            options={studentOptions}
            onChange={(e) => onStudentChange(e as string)}
            value={selectedStudent}
            formControlProps={{ sx: { width: '100%', maxWidth: '200px' } }}
          />
        </Box>

        {/* Bar Chart */}
        <Chart
          type="bar"
          series={chartSeries}
          options={chartOptions}
          height={350}
          loadingProps={{ sx: { p: 2.5 } }}
          sx={{ py: 2.5, pl: 1, pr: 2.5 }}
        />
      </Box>
      <Box flex={4}>
        <EcommerceSaleByGender
          title="Discipline and Attendance"
          total={100}
          chart={ecommerceChart}
        />
      </Box>
    </Box>
  );
};
