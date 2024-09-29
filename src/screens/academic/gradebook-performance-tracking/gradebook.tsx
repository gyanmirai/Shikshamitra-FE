import React from 'react';

import { Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const Gradebook = () => (
  <Box>
    <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={3}>
      <CustomSelect
        label="Class"
        options={[
          { value: 'class1', label: 'Class 1' },
          { value: 'class2', label: 'Class 2' },
          { value: 'class3', label: 'Class 3' },
        ]}
        onChange={() => {}}
        value=""
        formControlProps={{
          sx: { width: '100%', maxWidth: '200px' },
        }}
      />
      <CustomSelect
        label="Subject"
        options={[
          { value: 'math', label: 'Mathematics' },
          { value: 'science', label: 'Science' },
          { value: 'english', label: 'English' },
        ]}
        onChange={() => {}}
        value=""
        formControlProps={{
          sx: { width: '100%', maxWidth: '200px' },
        }}
      />
      <CustomSelect
        label="Assignment Type"
        options={[
          { value: 'homework', label: 'Homework' },
          { value: 'quiz', label: 'Quiz' },
          { value: 'exam', label: 'Exam' },
        ]}
        onChange={() => {}}
        value=""
        formControlProps={{
          sx: { width: '100%', maxWidth: '200px' },
        }}
      />
      <CustomSelect
        label="Sort By"
        options={[
          { value: 'name', label: 'Student Name' },
          { value: 'grade', label: 'Grade' },
          { value: 'date', label: 'Date' },
        ]}
        value=""
        onChange={() => {}}
        formControlProps={{
          sx: { width: '100%', maxWidth: '200px' },
        }}
      />
      <DatePicker
        label="Start Date"
        slotProps={{
          textField: {
            sx: { width: '100%', maxWidth: '200px' },
            size: 'small',
          },
        }}
      />
      <DatePicker
        label="End Date"
        slotProps={{
          textField: {
            sx: { width: '100%', maxWidth: '200px' },
            size: 'small',
          },
        }}
      />
    </Box>
    <CustomizableTable
      columns={[
        { id: 'studentName', label: 'Student Name' },
        { id: 'assignments', label: 'Assignments' },
        { id: 'grade', label: 'Grade' },
        { id: 'weightedAverage', label: 'Weighted Average' },
        { id: 'action', label: 'Action' },
      ]}
      data={[]}
    />
  </Box>
);

export default Gradebook;
