import { Box } from '@mui/material';
import React, { useState } from 'react';
import CustomSelect from 'src/components/custom-select';

// Mock data to mimic the structure found in SubjectPassFailChart
const CLASSES = [
  { id: 'all', name: 'All' },
  { id: 'class-5', name: 'Class 5' },
  { id: 'class-6', name: 'Class 6' },
  { id: 'class-7', name: 'Class 7' },
  { id: 'class-8', name: 'Class 8' },
  { id: 'class-9', name: 'Class 9' },
  { id: 'class-10', name: 'Class 10' },
  { id: 'class-11', name: 'Class 11' },
  { id: 'class-12', name: 'Class 12' },
];

const DIVISIONS = [
  { id: 'all', name: 'All' },
  { id: 'A', name: 'A' },
  { id: 'B', name: 'B' },
  { id: 'C', name: 'C' },
  { id: 'D', name: 'D' },
];

const ClassDivisionFilter = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDivision, setSelectedDivision] = useState('all');

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <CustomSelect
        options={CLASSES}
        label="Class"
        value={selectedClass}
        onChange={(val) => setSelectedClass(val as string)}
        labelKey="name"
        valueKey="id"
        formControlProps={{ sx: { minWidth: '90px' } }}
      />
      <CustomSelect
        options={DIVISIONS}
        label="Division"
        value={selectedDivision}
        onChange={(val) => setSelectedDivision(val as string)}
        labelKey="name"
        valueKey="id"
        formControlProps={{ sx: { minWidth: '90px' } }}
        disabled={!selectedClass}
      />
    </Box>
  );
};

export default ClassDivisionFilter;
