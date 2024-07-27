import React from 'react';

import { Box, TextField, InputAdornment } from '@mui/material';

import { Iconify } from '../iconify';

const StudentSearch: React.FC<{ handleChange: (value: string) => void; value: string }> = ({
  handleChange,
  value = '',
}) => {
  const handleOnChange = (e: any) => {
    handleChange(e.target.value);
  };

  return (
    <Box sx={{ display: 'flex', mb: 1, gap: 1, alignItems: 'center' }}>
      <TextField
        placeholder="Search..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          ),
        }}
        size="small"
        value={value}
        onChange={handleOnChange}
        sx={{ '& input': { fontSize: '12px' } }}
      />
    </Box>
  );
};

export default StudentSearch;
