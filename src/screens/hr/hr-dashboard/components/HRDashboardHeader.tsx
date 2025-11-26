import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Stack, Avatar, TextField, Typography, InputAdornment } from '@mui/material';

const HRDashboardHeader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 3,
      p: 2,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 'var(--shadows-1)',
    }}
  >
    <Typography variant="h4" fontWeight="bold">
      HR Dashboard
    </Typography>

    <Stack direction="row" spacing={3} alignItems="center">
      <TextField
        placeholder="Search Employee"
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: 300 }}
      />

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Admin
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Profile
          </Typography>
        </Box>
      </Stack>
    </Stack>
  </Box>
);

export default HRDashboardHeader;
