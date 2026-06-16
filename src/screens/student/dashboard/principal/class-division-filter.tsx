import { Box } from '@mui/material';
import React, { useState } from 'react';
import CustomSelect from 'src/components/custom-select';

const CLASSES = [{ id: 'all', name: 'All' }];

const DIVISIONS = [{ id: 'all', name: 'All' }];

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
