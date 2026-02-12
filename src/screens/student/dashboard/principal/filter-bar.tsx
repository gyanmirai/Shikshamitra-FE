import type { SelectChangeEvent } from '@mui/material';

import React, { useState } from 'react';
import { Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const FilterBar = () => {
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDivision, setSelectedDivision] = useState('All');

  const handleClassChange = (event: SelectChangeEvent) => {
    setSelectedClass(event.target.value);
  };

  const handleDivisionChange = (event: SelectChangeEvent) => {
    setSelectedDivision(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows?.z1 || 1,
      }}
    >
      <Box sx={{ display: 'flex', gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Class</InputLabel>
          <Select value={selectedClass} label="Class" onChange={handleClassChange}>
            <MenuItem value="All">All Classes</MenuItem>
            <MenuItem value="10">Class 10</MenuItem>
            <MenuItem value="9">Class 9</MenuItem>
            <MenuItem value="8">Class 8</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Division</InputLabel>
          <Select value={selectedDivision} label="Division" onChange={handleDivisionChange}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default FilterBar;
